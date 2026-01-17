import { useEffect, useState, useRef, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { FundedEvent } from "@/types";

/**
 * 配置参数
 *
 * 最佳实践建议：
 * 1. 对于生产环境，强烈推荐使用 The Graph (https://thegraph.com/)
 *    - 创建 subgraph 索引合约事件
 *    - 提供高性能的 GraphQL API
 *    - 支持复杂查询和排序
 *
 * 2. 或使用增强型 RPC 服务：
 *    - Alchemy Enhanced APIs
 *    - QuickNode
 *    - Moralis
 *
 * 3. 当前实现适用于：
 *    - 开发/测试阶段
 *    - 小规模应用
 *    - 无后端服务的场景
 */
const BLOCK_RANGE = 1000n; // 每次查询的区块范围（根据 RPC 限制调整）
const MAX_BLOCKS_TO_SCAN = 10000n; // 最大扫描区块数（防止无限查询）
const TARGET_EVENT_COUNT = 10; // 目标获取的事件数量
const CACHE_DURATION = 60000; // 缓存有效期（毫秒）
const REQUEST_DELAY = 500; // 请求之间的延迟（毫秒），避免触发速率限制
const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY = 1000; // 重试延迟（毫秒）

interface CacheEntry {
  events: FundedEvent[];
  timestamp: number;
}

export function useFundEvents(campaignAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<FundedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchEvents = useCallback(
    async (forceRefresh = false) => {
      if (!campaignAddress || !publicClient) {
        setEvents([]);
        return;
      }

      const now = Date.now();

      // 检查缓存（除非强制刷新）
      if (!forceRefresh) {
        const cached = cacheRef.current.get(campaignAddress);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          setEvents(cached.events);
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
        const latestBlock = await publicClient.getBlockNumber();
        const allEvents: FundedEvent[] = [];
        let toBlock = latestBlock;
        let scannedBlocks = 0n;

        // 分批次向前扫描区块，直到找到足够的事件
        while (
          allEvents.length < TARGET_EVENT_COUNT &&
          scannedBlocks < MAX_BLOCKS_TO_SCAN &&
          toBlock > 0n
        ) {
          const fromBlock =
            toBlock - BLOCK_RANGE > 0n ? toBlock - BLOCK_RANGE : 0n;

          // 带重试的请求函数
          let logs;
          let retryCount = 0;
          while (retryCount < MAX_RETRIES) {
            try {
              logs = await publicClient.getLogs({
                address: campaignAddress,
                event: parseAbiItem(
                  "event Funded(address indexed backer, uint256 indexed tierIndex, uint256 amount, uint256 totalContribution)"
                ),
                fromBlock,
                toBlock,
              });
              break; // 请求成功，跳出重试循环
            } catch (err) {
              // 检查是否是 429 错误
              const is429Error =
                err instanceof Error &&
                (err.message.includes("429") ||
                  err.message.includes("rate limit") ||
                  err.message.includes("too many requests"));

              if (is429Error && retryCount < MAX_RETRIES - 1) {
                retryCount++;
                console.warn(
                  `⚠️ Rate limit hit, retrying (${retryCount}/${MAX_RETRIES})...`
                );
                await sleep(RETRY_DELAY * retryCount); // 指数退避
                continue;
              }
              throw err; // 非 429 错误或重试次数用尽，抛出错误
            }
          }

          if (!logs) {
            throw new Error("Failed to fetch logs after retries");
          }

          if (logs.length > 0) {
            // 优化：批量获取唯一的区块信息（避免重复请求）
            const uniqueBlockNumbers = [
              ...new Set(logs.map((log) => log.blockNumber)),
            ];
            const blocks = await Promise.all(
              uniqueBlockNumbers.map((bn) =>
                publicClient.getBlock({ blockNumber: bn })
              )
            );

            // 创建区块号到区块的映射
            const blockMap = new Map(blocks.map((b) => [b.number, b]));

            // 构建事件对象
            const eventsWithTimestamp = logs.map((log) => {
              const block = blockMap.get(log.blockNumber)!;
              return {
                backer: log.args.backer!,
                tierIndex: log.args.tierIndex!,
                amount: log.args.amount!,
                totalContribution: log.args.totalContribution!,
                blockNumber: log.blockNumber,
                transactionHash: log.transactionHash,
                timestamp: Number(block.timestamp),
              };
            });

            allEvents.push(...eventsWithTimestamp);

            // 如果已经找到足够的事件，可以提前结束
            if (allEvents.length >= TARGET_EVENT_COUNT) {
              break;
            }
          }

          // 更新扫描范围
          scannedBlocks += toBlock - fromBlock;
          toBlock = fromBlock - 1n;

          // 如果已经扫描到创世区块，停止
          if (fromBlock === 0n) {
            break;
          }

          // 在下一次循环前添加延迟，避免触发速率限制
          if (allEvents.length < TARGET_EVENT_COUNT && toBlock > 0n) {
            await sleep(REQUEST_DELAY);
          }
        }

        // 按区块号降序排序（最新的在前），取前 TARGET_EVENT_COUNT 条
        const sortedEvents = allEvents
          .sort((a, b) => Number(b.blockNumber - a.blockNumber))
          .slice(0, TARGET_EVENT_COUNT);

        // 更新缓存
        cacheRef.current.set(campaignAddress, {
          events: sortedEvents,
          timestamp: now,
        });

        setEvents(sortedEvents);
      } catch (err: unknown) {
        // 忽略被取消的请求
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("❌ Failed to fetch fund events:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [campaignAddress, publicClient]
  );

  useEffect(() => {
    fetchEvents();

    // 清理函数：取消进行中的请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}
