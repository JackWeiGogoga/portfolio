import { useEffect, useState, useRef, useCallback } from "react";
import { FundedEvent } from "@/types";

/**
 * 使用 The Graph Subgraph 获取 Funded 事件
 *
 * 优势对比 Etherscan API：
 * - ✅ 更高的免费额度（100,000 查询/月 vs 5 请求/秒的限流）
 * - ✅ 单次 GraphQL 查询获取所有数据（无需多次请求）
 * - ✅ 更快的查询速度（专为区块链数据优化）
 * - ✅ 灵活的过滤和排序（在查询层面完成）
 * - ✅ 不需要 Etherscan API Key
 * - ✅ 支持动态创建的合约（通过 Data Source Templates）
 *
 * 使用方法：
 * 1. 按照 subgraph/README.md 部署 Subgraph
 * 2. 在 .env 文件中添加：VITE_SUBGRAPH_URL=your_subgraph_url
 */

// Subgraph 配置
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL;

// 缓存配置
const CACHE_DURATION = 60000; // 缓存有效期（毫秒）

interface CacheEntry {
  events: FundedEvent[];
  timestamp: number;
}

interface GraphQLFundedEvent {
  id: string;
  backer: string;
  tierIndex: string;
  amount: string;
  totalContribution: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  campaign: {
    id: string;
    address: string;
  };
}

interface GraphQLResponse {
  data?: {
    fundedEvents?: GraphQLFundedEvent[];
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * 执行 GraphQL 查询
 */
async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
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
 * GraphQL 查询：获取特定众筹活动的 Funded 事件
 */
const FUNDED_EVENTS_QUERY = `
  query GetFundedEvents($campaignId: ID!) {
    fundedEvents(
      first: 1000
      orderBy: blockTimestamp
      orderDirection: desc
      where: { campaign: $campaignId }
    ) {
      id
      backer
      tierIndex
      amount
      totalContribution
      blockNumber
      blockTimestamp
      transactionHash
      campaign {
        id
        address
      }
    }
  }
`;

export function useFundEventsSubgraph(
  campaignAddress: `0x${string}` | undefined,
  initialPageSize: number = 10
) {
  const [allEvents, setAllEvents] = useState<FundedEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<FundedEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEvents = useCallback(
    async (forceRefresh = false) => {
      if (!campaignAddress) {
        setAllEvents([]);
        setDisplayedEvents([]);
        return;
      }

      const now = Date.now();
      // Subgraph 中 Campaign 的 ID 是小写的合约地址
      const campaignId = campaignAddress.toLowerCase();
      const cacheKey = campaignId;

      // 检查缓存（除非强制刷新）
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
        const data = await fetchGraphQL<{ fundedEvents: GraphQLFundedEvent[] }>(
          FUNDED_EVENTS_QUERY,
          { campaignId },
          abortControllerRef.current.signal
        );

        if (!data.fundedEvents || data.fundedEvents.length === 0) {
          setAllEvents([]);
          setDisplayedEvents([]);
          setHasMore(false);
          cacheRef.current.set(cacheKey, {
            events: [],
            timestamp: now,
          });
          return;
        }

        // 转换 GraphQL 数据为 FundedEvent 格式
        const fundedEvents: FundedEvent[] = data.fundedEvents.map((event) => ({
          backer: event.backer as `0x${string}`,
          tierIndex: BigInt(event.tierIndex),
          amount: BigInt(event.amount),
          totalContribution: BigInt(event.totalContribution),
          blockNumber: BigInt(event.blockNumber),
          transactionHash: event.transactionHash,
          timestamp: parseInt(event.blockTimestamp),
        }));

        // 更新缓存
        cacheRef.current.set(cacheKey, {
          events: fundedEvents,
          timestamp: now,
        });

        // 设置所有事件
        setAllEvents(fundedEvents);

        // 初始显示第一页
        const firstPage = fundedEvents.slice(0, pageSize);
        setDisplayedEvents(firstPage);
        setCurrentPage(1);
        setHasMore(fundedEvents.length > pageSize);
      } catch (err: unknown) {
        // 忽略被取消的请求
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("❌ Failed to fetch events from Subgraph:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch events")
        );
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [campaignAddress, pageSize]
  );

  // 加载更多
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
