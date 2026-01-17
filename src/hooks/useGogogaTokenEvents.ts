import { useEffect, useState, useRef, useCallback } from "react";
import {
  GOGOGA_TOKEN_ADDRESS,
  GOGOGA_TOKEN_SALE_ADDRESS,
} from "@/config/contracts";

/**
 * 使用 The Graph Subgraph 获取 Gogoga Token 的购买记录和转账记录
 *
 * 优势对比 Etherscan API：
 * - ✅ 更高的免费额度（100,000 查询/月 vs 5 请求/秒的限流）
 * - ✅ 单次 GraphQL 查询获取所有数据（无需多次请求）
 * - ✅ 更快的查询速度（专为区块链数据优化）
 * - ✅ 灵活的过滤和排序（在查询层面完成）
 * - ✅ 实时自动索引新区块
 * - ✅ 无需处理事件解码（Subgraph 已处理）
 * - ✅ 不需要 Etherscan API Key
 *
 * 使用方法：
 * 1. 按照 subgraph/README.md 部署 Subgraph
 * 2. 在 .env 文件中添加：VITE_SUBGRAPH_URL=your_subgraph_url
 */

// Subgraph 配置
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL;

// 缓存配置
const CACHE_DURATION = 30000; // 缓存有效期（毫秒）

export interface PurchaseEvent {
  buyer: `0x${string}`;
  ethAmount: bigint;
  tokenAmount: bigint;
  timestamp: number;
  blockNumber: bigint;
  transactionHash: string;
}

export interface TransferEvent {
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  blockNumber: bigint;
  transactionHash: string;
  timestamp?: number;
}

interface CacheEntry<T> {
  events: T[];
  timestamp: number;
}

interface GraphQLPurchaseEvent {
  id: string;
  buyer: string;
  ethAmount: string;
  tokenAmount: string;
  timestamp: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface GraphQLTransferEvent {
  id: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface GraphQLResponse {
  data?: {
    tokenPurchaseEvents?: GraphQLPurchaseEvent[];
    tokenTransferEvents?: GraphQLTransferEvent[];
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * GraphQL 查询变量类型
 */
interface GraphQLVariables {
  buyer?: string;
  address?: string;
}

/**
 * 执行 GraphQL 查询
 */
async function fetchGraphQL<T>(
  query: string,
  variables: GraphQLVariables = {},
  signal?: AbortSignal
): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new Error(
      "Subgraph URL not configured. Please add VITE_SUBGRAPH_URL to your .env file. Follow the deployment guide in subgraph/README.md"
    );
  }

  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: GraphQLResponse = await response.json();

  if (result.errors) {
    throw new Error(
      `GraphQL error: ${result.errors.map((e) => e.message).join(", ")}`
    );
  }

  return result.data as T;
}

/**
 * GraphQL 查询：获取所有购买事件
 */
const PURCHASE_EVENTS_QUERY = `
  query GetPurchaseEvents {
    tokenPurchaseEvents(
      first: 1000
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      buyer
      ethAmount
      tokenAmount
      timestamp
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

/**
 * GraphQL 查询：获取与特定地址相关的转账事件
 * 注意：分别查询发送和接收，然后在客户端合并
 */
const USER_SENT_TRANSFERS_QUERY = `
  query GetUserSentTransfers($address: Bytes!) {
    tokenTransferEvents(
      first: 500
      orderBy: blockTimestamp
      orderDirection: desc
      where: {
        from: $address
      }
    ) {
      id
      from
      to
      value
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

const USER_RECEIVED_TRANSFERS_QUERY = `
  query GetUserReceivedTransfers($address: Bytes!) {
    tokenTransferEvents(
      first: 500
      orderBy: blockTimestamp
      orderDirection: desc
      where: {
        to: $address
      }
    ) {
      id
      from
      to
      value
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

/**
 * Hook: 获取购买记录（使用 Subgraph）
 */
export function usePurchaseEvents(initialPageSize: number = 10) {
  const [allEvents, setAllEvents] = useState<PurchaseEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<PurchaseEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<PurchaseEvent>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEvents = useCallback(
    async (forceRefresh = false) => {
      if (!GOGOGA_TOKEN_SALE_ADDRESS) {
        setAllEvents([]);
        setDisplayedEvents([]);
        return;
      }

      const now = Date.now();
      const cacheKey = `purchase_${GOGOGA_TOKEN_SALE_ADDRESS}`;

      // 检查缓存
      if (!forceRefresh) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          setAllEvents(cached.events);
          const firstPage = cached.events.slice(0, pageSize);
          setDisplayedEvents(firstPage);
          setCurrentPage(1);
          setHasMore(cached.events.length > pageSize);
          return;
        }
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        // 执行 GraphQL 查询
        const data = await fetchGraphQL<{
          tokenPurchaseEvents: GraphQLPurchaseEvent[];
        }>(PURCHASE_EVENTS_QUERY, {}, abortControllerRef.current.signal);

        if (
          !data.tokenPurchaseEvents ||
          data.tokenPurchaseEvents.length === 0
        ) {
          setAllEvents([]);
          setDisplayedEvents([]);
          setHasMore(false);
          cacheRef.current.set(cacheKey, {
            events: [],
            timestamp: now,
          });
          return;
        }

        // 转换 GraphQL 数据为 PurchaseEvent 格式
        const purchaseEvents: PurchaseEvent[] = data.tokenPurchaseEvents.map(
          (event) => ({
            buyer: event.buyer as `0x${string}`,
            ethAmount: BigInt(event.ethAmount),
            tokenAmount: BigInt(event.tokenAmount),
            timestamp: parseInt(event.timestamp),
            blockNumber: BigInt(event.blockNumber),
            transactionHash: event.transactionHash,
          })
        );

        // 更新缓存
        cacheRef.current.set(cacheKey, {
          events: purchaseEvents,
          timestamp: now,
        });

        setAllEvents(purchaseEvents);
        const firstPage = purchaseEvents.slice(0, pageSize);
        setDisplayedEvents(firstPage);
        setCurrentPage(1);
        setHasMore(purchaseEvents.length > pageSize);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("❌ Failed to fetch purchase events from Subgraph:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch purchase events")
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const nextPageEvents = allEvents.slice(startIndex, endIndex);

      setDisplayedEvents((prev) => [...prev, ...nextPageEvents]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(endIndex < allEvents.length);
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, currentPage, pageSize, allEvents]);

  useEffect(() => {
    fetchEvents();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEvents]);

  return {
    events: displayedEvents,
    totalEvents: allEvents.length,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch: fetchEvents,
  };
}

/**
 * Hook: 获取转账记录（使用 Subgraph）
 */
export function useTransferEvents(
  address?: `0x${string}`,
  initialPageSize: number = 10
) {
  const [allEvents, setAllEvents] = useState<TransferEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<TransferEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<TransferEvent>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEvents = useCallback(
    async (forceRefresh = false) => {
      if (!GOGOGA_TOKEN_ADDRESS || !address) {
        setAllEvents([]);
        setDisplayedEvents([]);
        return;
      }

      const now = Date.now();
      const cacheKey = `transfer_${GOGOGA_TOKEN_ADDRESS}_${address}`;

      // 检查缓存
      if (!forceRefresh) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          setAllEvents(cached.events);
          const firstPage = cached.events.slice(0, pageSize);
          setDisplayedEvents(firstPage);
          setCurrentPage(1);
          setHasMore(cached.events.length > pageSize);
          return;
        }
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const addressLower = address.toLowerCase();

        // 并行查询发送和接收的转账事件
        const [sentData, receivedData] = await Promise.all([
          fetchGraphQL<{ tokenTransferEvents: GraphQLTransferEvent[] }>(
            USER_SENT_TRANSFERS_QUERY,
            { address: addressLower },
            abortControllerRef.current!.signal
          ),
          fetchGraphQL<{ tokenTransferEvents: GraphQLTransferEvent[] }>(
            USER_RECEIVED_TRANSFERS_QUERY,
            { address: addressLower },
            abortControllerRef.current!.signal
          ),
        ]);

        // 合并并去重
        const allGraphQLEvents = [
          ...(sentData.tokenTransferEvents || []),
          ...(receivedData.tokenTransferEvents || []),
        ];

        const uniqueEventsMap = new Map<string, GraphQLTransferEvent>();
        for (const event of allGraphQLEvents) {
          uniqueEventsMap.set(event.id, event);
        }

        // 转换并排序
        const transferEvents: TransferEvent[] = Array.from(
          uniqueEventsMap.values()
        )
          .map((event) => ({
            from: event.from as `0x${string}`,
            to: event.to as `0x${string}`,
            value: BigInt(event.value),
            blockNumber: BigInt(event.blockNumber),
            transactionHash: event.transactionHash,
            timestamp: parseInt(event.blockTimestamp),
          }))
          .sort((a, b) => Number(b.blockNumber - a.blockNumber));

        if (transferEvents.length === 0) {
          setAllEvents([]);
          setDisplayedEvents([]);
          setHasMore(false);
          cacheRef.current.set(cacheKey, {
            events: [],
            timestamp: now,
          });
          return;
        }

        // 更新缓存
        cacheRef.current.set(cacheKey, {
          events: transferEvents,
          timestamp: now,
        });

        setAllEvents(transferEvents);
        const firstPage = transferEvents.slice(0, pageSize);
        setDisplayedEvents(firstPage);
        setCurrentPage(1);
        setHasMore(transferEvents.length > pageSize);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("❌ Failed to fetch transfer events from Subgraph:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch transfer events")
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [address, pageSize]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const nextPageEvents = allEvents.slice(startIndex, endIndex);

      setDisplayedEvents((prev) => [...prev, ...nextPageEvents]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(endIndex < allEvents.length);
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, currentPage, pageSize, allEvents]);

  useEffect(() => {
    fetchEvents();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEvents]);

  return {
    events: displayedEvents,
    totalEvents: allEvents.length,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch: fetchEvents,
  };
}
