import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useConnection, usePublicClient } from "wagmi";
import { decodeEventLog, parseAbiItem, keccak256, toHex } from "viem";
import {
  MintedEvent,
  UseNftsReturn,
  NftSortBy,
  Nft,
  NftMetadata,
} from "@/types";
import { GOGOGA_NFT_ADDRESS, gogogaNftABI } from "@/config/contracts";
import { CHAIN_ID } from "@/config/constants";

/**
 * 使用 Etherscan API 获取 NFT Minted 事件
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

// 开发环境配置：避免 React 严格模式双重渲染导致的限流
const IS_DEV = import.meta.env.DEV;
const DEV_INITIAL_DELAY = 1000; // 开发环境初始延迟（毫秒），避免并发请求
const REQUEST_DELAY = 500; // 请求间延迟（毫秒），确保不超过每秒3次限制

// Minted 事件签名（合约现在有两个不同的 mint 事件）
const PRESET_MINTED_EVENT_ABI = parseAbiItem(
  "event PresetMinted(address indexed to, uint256 indexed tokenId)"
);

const CUSTOM_MINTED_EVENT_ABI = parseAbiItem(
  "event CustomMinted(address indexed to, uint256 indexed tokenId, string tokenURI)"
);

// 计算事件的 topic0（事件签名哈希）
const PRESET_MINTED_TOPIC0 = keccak256(toHex("PresetMinted(address,uint256)"));
const CUSTOM_MINTED_TOPIC0 = keccak256(
  toHex("CustomMinted(address,uint256,string)")
);

interface CacheEntry {
  events: MintedEvent[];
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

/**
 * Hook to get NFT mint events using Etherscan API
 */
export function useNftMintEvents(options?: { myNftsOnly?: boolean }) {
  const { address: userAddress } = useConnection();
  const [allEvents, setAllEvents] = useState<MintedEvent[]>([]); // 所有事件
  const [events, setEvents] = useState<MintedEvent[]>([]); // 当前显示的事件
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEvents = useCallback(
    async (forceRefresh = false) => {
      if (!GOGOGA_NFT_ADDRESS) {
        setEvents([]);
        setAllEvents([]);
        return;
      }

      // If myNftsOnly is true but user not connected, return empty
      if (options?.myNftsOnly && !userAddress) {
        setEvents([]);
        setAllEvents([]);
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

      const cacheKey = options?.myNftsOnly
        ? `${GOGOGA_NFT_ADDRESS}-${userAddress}`
        : GOGOGA_NFT_ADDRESS;
      const now = Date.now();

      // 检查缓存（除非强制刷新）
      if (!forceRefresh) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
          setAllEvents(cached.events);
          setEvents(cached.events);
          return;
        }
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController 并保存到局部变量，避免竞态条件
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);

      // 开发环境：添加随机延迟，避免 React 严格模式双重渲染导致的限流
      if (IS_DEV) {
        // 为 My NFTs 添加额外延迟，避免与 All NFTs 请求冲突
        const baseDelay = options?.myNftsOnly ? DEV_INITIAL_DELAY * 0.6 : 0;
        const randomDelay =
          baseDelay + Math.random() * (DEV_INITIAL_DELAY * 0.4);

        await new Promise((resolve) => setTimeout(resolve, randomDelay));

        // 检查请求是否已被取消
        if (abortController.signal.aborted) {
          return;
        }
      }

      try {
        // 需要同时获取两种事件：PresetMinted 和 CustomMinted
        // 由于 Etherscan API 可以使用 OR 操作符，我们可以一次请求获取两种事件
        const buildUrl = (topic0: string) => {
          const url = new URL(ETHERSCAN_API_URL);
          url.searchParams.append("chainid", CHAIN_ID.toString());
          url.searchParams.append("module", "logs");
          url.searchParams.append("action", "getLogs");
          url.searchParams.append("address", GOGOGA_NFT_ADDRESS);
          url.searchParams.append("topic0", topic0);

          // If myNftsOnly, add topic1 filter for user address
          if (options?.myNftsOnly && userAddress) {
            // topic1 is the 'to' address (indexed parameter)
            // Need to pad address to 32 bytes
            const paddedAddress = userAddress
              .toLowerCase()
              .replace("0x", "")
              .padStart(64, "0");
            url.searchParams.append("topic1", `0x${paddedAddress}`);
            url.searchParams.append("topic0_1_opr", "and");
          }

          url.searchParams.append("fromBlock", "0");
          url.searchParams.append("toBlock", "latest");
          url.searchParams.append("apikey", ETHERSCAN_API_KEY);

          return url.toString();
        };

        // 串行请求两种事件，避免超过 API 速率限制
        const presetUrl = buildUrl(PRESET_MINTED_TOPIC0);

        const presetResponse = await fetch(presetUrl, {
          signal: abortController.signal,
        });

        if (!presetResponse.ok) {
          throw new Error(`HTTP error! status: ${presetResponse.status}`);
        }

        const presetData: EtherscanResponse = await presetResponse.json();

        // 添加延迟以符合速率限制（每秒 3 次 = 约 500ms 间隔）
        await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY));

        // 检查请求是否已被取消
        if (abortController.signal.aborted) {
          return;
        }

        const customUrl = buildUrl(CUSTOM_MINTED_TOPIC0);

        const customResponse = await fetch(customUrl, {
          signal: abortController.signal,
        });

        if (!customResponse.ok) {
          throw new Error(`HTTP error! status: ${customResponse.status}`);
        }

        const customData: EtherscanResponse = await customResponse.json();

        // 处理 PresetMinted 事件
        const presetLogs: EtherscanLogResult[] =
          presetData.status === "1" && Array.isArray(presetData.result)
            ? presetData.result
            : [];

        // 处理 CustomMinted 事件
        const customLogs: EtherscanLogResult[] =
          customData.status === "1" && Array.isArray(customData.result)
            ? customData.result
            : [];

        const totalEvents = presetLogs.length + customLogs.length;

        if (totalEvents === 0) {
          setAllEvents([]);
          setEvents([]);
          // 缓存空结果
          cacheRef.current.set(cacheKey, {
            events: [],
            timestamp: now,
          });
          return;
        }

        // 解码 PresetMinted 事件
        const presetEvents: MintedEvent[] = presetLogs.map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: [PRESET_MINTED_EVENT_ABI],
              data: log.data as `0x${string}`,
              topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
            });

            return {
              to: decoded.args.to,
              tokenId: decoded.args.tokenId,
              blockNumber: BigInt(log.blockNumber),
              transactionHash: log.transactionHash,
              timestamp: parseInt(log.timeStamp, 16),
            };
          } catch (decodeError) {
            console.error(
              "❌ Failed to decode PresetMinted event:",
              decodeError,
              log
            );
            throw decodeError;
          }
        });

        // 解码 CustomMinted 事件
        const customEvents: MintedEvent[] = customLogs.map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: [CUSTOM_MINTED_EVENT_ABI],
              data: log.data as `0x${string}`,
              topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
            });

            return {
              to: decoded.args.to,
              tokenId: decoded.args.tokenId,
              blockNumber: BigInt(log.blockNumber),
              transactionHash: log.transactionHash,
              timestamp: parseInt(log.timeStamp, 16),
              tokenURI: decoded.args.tokenURI, // CustomMinted 事件包含 tokenURI
            };
          } catch (decodeError) {
            console.error(
              "❌ Failed to decode CustomMinted event:",
              decodeError,
              log
            );
            throw decodeError;
          }
        });

        // 合并两种事件
        const decodedEvents: MintedEvent[] = [...presetEvents, ...customEvents];

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
        setEvents(sortedEvents);
      } catch (err: unknown) {
        // 忽略被取消的请求
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("❌ Failed to fetch NFT events from Etherscan:", err);

        // 处理常见错误
        let errorMessage = "Failed to fetch NFT events";
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
    [options?.myNftsOnly, userAddress]
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

  return {
    events,
    totalEvents: allEvents.length,
    isLoading,
    error,
    refetch: (forceRefresh = true) => fetchEvents(forceRefresh),
  };
}

/**
 * Fetch NFT metadata from tokenURI
 */
async function fetchMetadata(
  tokenURI: string
): Promise<NftMetadata | undefined> {
  try {
    // 处理 IPFS URI
    let url = tokenURI;
    if (tokenURI.startsWith("ipfs://")) {
      // 使用公共 IPFS 网关
      url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch metadata from ${url}: ${response.status}`);
      return undefined;
    }

    const metadata: NftMetadata = await response.json();

    // 处理 metadata 中的 IPFS 图片链接
    if (metadata.image?.startsWith("ipfs://")) {
      metadata.image = metadata.image.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
    }

    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata from ${tokenURI}:`, error);
    return undefined;
  }
}

/**
 * Hook to get NFT list from mint events with metadata
 */
export function useNfts(options?: {
  search?: string;
  sortBy?: NftSortBy;
  myNftsOnly?: boolean;
}): UseNftsReturn {
  // Destructure options to avoid memoization issues with nested property access
  const { search, sortBy, myNftsOnly } = options || {};

  const {
    events,
    isLoading: isLoadingEvents,
    error,
    refetch,
  } = useNftMintEvents({
    myNftsOnly,
  });

  const publicClient = usePublicClient();
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch tokenURI and metadata for each NFT
  useEffect(() => {
    if (!events.length) {
      setNfts([]);
      return;
    }

    let isCancelled = false;

    async function enrichNfts() {
      setIsLoadingMetadata(true);

      try {
        const enrichedNfts: Nft[] = [];

        // 串行处理每个 NFT，避免超过 API 速率限制
        for (const event of events) {
          if (isCancelled) break;

          try {
            // 0. 检查 NFT 是否还存在（未被 burn）
            // 通过调用 ownerOf 检查，如果 NFT 被 burn 会 revert
            if (publicClient && GOGOGA_NFT_ADDRESS) {
              try {
                const owner = await publicClient.readContract({
                  address: GOGOGA_NFT_ADDRESS,
                  abi: gogogaNftABI,
                  functionName: "ownerOf",
                  args: [event.tokenId],
                });

                // 如果 myNftsOnly 模式，需要验证当前 owner 是否是 event.to
                // 因为 NFT 可能已经被转移了
                const currentOwner = owner as `0x${string}`;

                // 1. 获取 tokenURI（如果事件中没有）
                let tokenURI = event.tokenURI || "";
                if (!tokenURI) {
                  tokenURI = (await publicClient.readContract({
                    address: GOGOGA_NFT_ADDRESS,
                    abi: gogogaNftABI,
                    functionName: "tokenURI",
                    args: [event.tokenId],
                  })) as string;
                }

                // 添加延迟以符合速率限制（每秒 3 次 = 约 350ms 间隔）
                await new Promise((resolve) => setTimeout(resolve, 350));

                // 2. 获取 metadata
                const metadata = tokenURI
                  ? await fetchMetadata(tokenURI)
                  : undefined;

                enrichedNfts.push({
                  tokenId: event.tokenId,
                  owner: currentOwner,
                  tokenURI,
                  metadata,
                });

                // 添加延迟以符合速率限制
                if (metadata) {
                  await new Promise((resolve) => setTimeout(resolve, 350));
                }
              } catch {
                // ownerOf revert 表示 NFT 已被 burn，跳过这个 NFT
                // 不添加到列表中
              }
            } else {
              // 如果没有 publicClient，保留原来的逻辑
              const tokenURI = event.tokenURI || "";
              const metadata = tokenURI
                ? await fetchMetadata(tokenURI)
                : undefined;

              enrichedNfts.push({
                tokenId: event.tokenId,
                owner: event.to,
                tokenURI,
                metadata,
              });
            }
          } catch (error) {
            console.error(`Error enriching NFT #${event.tokenId}:`, error);
            // 出错时不添加这个 NFT
          }
        }

        if (!isCancelled) {
          setNfts(enrichedNfts);
        }
      } catch (error) {
        console.error("Error enriching NFTs:", error);
        if (!isCancelled) {
          // Fallback: return NFTs without metadata
          setNfts(
            events.map((event) => ({
              tokenId: event.tokenId,
              owner: event.to,
              tokenURI: event.tokenURI || "",
              metadata: undefined,
            }))
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMetadata(false);
        }
      }
    }

    enrichNfts();

    return () => {
      isCancelled = true;
    };
  }, [events, publicClient]);

  // Apply filters and sorting
  const processedNfts = useMemo(() => {
    let result = [...nfts];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((nft) =>
        nft.tokenId.toString().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "newest":
          // Keep the order from events (already sorted by newest)
          break;
        case "oldest":
          result = result.reverse();
          break;
        case "tokenId":
          result = result.sort((a, b) => Number(a.tokenId - b.tokenId));
          break;
      }
    }

    return result;
  }, [nfts, search, sortBy]);

  return {
    nfts: processedNfts,
    totalCount: processedNfts.length,
    isLoading: isLoadingEvents || isLoadingMetadata,
    error,
    refetch: (forceRefresh = true) => refetch(forceRefresh),
  };
}
