import { useEffect, useState, useRef, useCallback } from "react";
import { decodeEventLog, parseAbiItem, keccak256, toHex } from "viem";
import { FundedEvent } from "@/types";
import { CHAIN_ID } from "@/config/constants";

/**
 * 使用 Etherscan API 获取 Funded 事件
 *
 * 优势：
 * - ✅ 一次请求获取所有历史事件（无需遍历区块）
 * - ✅ 查询速度快（<1秒）
 * - ✅ 无区块范围限制
 * - ✅ 完全免费（5 请求/秒）
 *
 * 使用方法：
 * 1. 在 .env 文件中添加：VITE_ETHERSCAN_API_KEY=your_api_key
 * 2. 从 https://etherscan.io/apis 免费获取 API Key
 */

// Etherscan API 配置
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL =
  import.meta.env.VITE_ETHERSCAN_API_URL || "https://api.etherscan.io/v2/api";

// 缓存配置
const CACHE_DURATION = 60000; // 缓存有效期（毫秒）

// Funded 事件签名
const FUNDED_EVENT_ABI = parseAbiItem(
  "event Funded(address indexed backer, uint256 indexed tierIndex, uint256 amount, uint256 totalContribution)"
);

// 计算事件的 topic0（事件签名哈希）
const FUNDED_EVENT_TOPIC0 = keccak256(
  toHex("Funded(address,uint256,uint256,uint256)")
);

interface CacheEntry {
  events: FundedEvent[];
  timestamp: number;
}

interface EtherscanLogResult {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
}

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanLogResult[] | string;
}

export function useFundEventsEtherscan(
  campaignAddress: `0x${string}` | undefined,
  initialPageSize: number = 10
) {
  const [allEvents, setAllEvents] = useState<FundedEvent[]>([]); // 所有事件
  const [displayedEvents, setDisplayedEvents] = useState<FundedEvent[]>([]); // 当前显示的事件
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

      // 检查 API Key
      if (!ETHERSCAN_API_KEY) {
        const error = new Error(
          "Etherscan API Key not configured. Please add VITE_ETHERSCAN_API_KEY to your .env file. Get your free API key at https://etherscan.io/apis"
        );
        console.error("❌", error.message);
        setError(error);
        return;
      }

      const now = Date.now();
      const cacheKey = `${campaignAddress}`;

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
        // 构建 Etherscan API URL
        const url = new URL(ETHERSCAN_API_URL);
        url.searchParams.append("chainid", CHAIN_ID.toString());
        url.searchParams.append("module", "logs");
        url.searchParams.append("action", "getLogs");
        url.searchParams.append("address", campaignAddress);
        url.searchParams.append("topic0", FUNDED_EVENT_TOPIC0);
        url.searchParams.append("fromBlock", "0");
        url.searchParams.append("toBlock", "latest");
        url.searchParams.append("apikey", ETHERSCAN_API_KEY);

        const response = await fetch(url.toString(), {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: EtherscanResponse = await response.json();

        // 检查 API 响应状态
        if (data.status === "0") {
          // status = "0" 可能表示没有找到日志，或者 API 错误
          if (data.message === "No records found") {
            setAllEvents([]);
            setDisplayedEvents([]);
            setHasMore(false);
            // 缓存空结果
            cacheRef.current.set(cacheKey, {
              events: [],
              timestamp: now,
            });
            return;
          } else {
            throw new Error(data.message || "Etherscan API error");
          }
        }

        // 确保 result 是数组
        if (!Array.isArray(data.result)) {
          throw new Error("Unexpected API response format");
        }

        // 解码事件
        const decodedEvents: FundedEvent[] = data.result.map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: [FUNDED_EVENT_ABI],
              data: log.data as `0x${string}`,
              topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
            });

            return {
              backer: decoded.args.backer,
              tierIndex: decoded.args.tierIndex,
              amount: decoded.args.amount,
              totalContribution: decoded.args.totalContribution,
              blockNumber: BigInt(log.blockNumber),
              transactionHash: log.transactionHash,
              timestamp: parseInt(log.timeStamp, 16), // Etherscan 返回的是十六进制时间戳
            };
          } catch (decodeError) {
            console.error("❌ Failed to decode event:", decodeError, log);
            throw decodeError;
          }
        });

        // 按区块号降序排序（最新的在前）
        const sortedEvents = decodedEvents.sort((a, b) =>
          Number(b.blockNumber - a.blockNumber)
        );

        // 更新缓存
        cacheRef.current.set(cacheKey, {
          events: sortedEvents,
          timestamp: now,
        });

        // 设置所有事件
        setAllEvents(sortedEvents);

        // 初始显示第一页
        const firstPage = sortedEvents.slice(0, pageSize);
        setDisplayedEvents(firstPage);
        setCurrentPage(1);
        setHasMore(sortedEvents.length > pageSize);
      } catch (err: unknown) {
        // 忽略被取消的请求
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("❌ Failed to fetch events from Etherscan:", err);

        // 处理常见错误
        let errorMessage = "Failed to fetch events";
        if (err instanceof Error) {
          if (err.message.includes("API key")) {
            errorMessage =
              "Invalid Etherscan API key. Please check your .env configuration.";
          } else if (err.message.includes("rate limit")) {
            errorMessage =
              "Etherscan API rate limit exceeded. Please try again later.";
          } else {
            errorMessage = err.message;
          }
        }

        setError(new Error(errorMessage));
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

    // 模拟加载延迟（可选，让用户看到加载状态）
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

    // 清理函数：取消进行中的请求
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
