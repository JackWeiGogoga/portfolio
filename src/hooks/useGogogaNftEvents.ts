import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useConnection } from "wagmi";
import {
  MintedEvent,
  UseNftsReturn,
  NftSortBy,
  Nft,
  NftMetadata,
} from "@/types";
import { GOGOGA_NFT_ADDRESS } from "@/config/contracts";

/**
 * 使用 The Graph Subgraph 获取 NFT Minted 事件
 *
 * 优势对比 Etherscan API：
 * - ✅ 更高的免费额度（100,000 查询/月 vs 5 请求/秒的限流）
 * - ✅ 单次 GraphQL 查询获取所有数据（无需多次请求）
 * - ✅ 更快的查询速度（专为区块链数据优化）
 * - ✅ 灵活的过滤和排序（在查询层面完成）
 * - ✅ 实时自动索引新区块
 * - ✅ 内置支持 Transfer 和 Burn 事件追踪
 * - ✅ 无需处理事件解码（Subgraph 已处理）
 *
 * 使用方法：
 * 1. 按照 subgraph/README.md 部署 Subgraph
 * 2. 在 .env 文件中添加：VITE_SUBGRAPH_URL=your_subgraph_url
 */

// Subgraph 配置
const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL;

// 缓存配置
const CACHE_DURATION = 30000; // 缓存有效期（毫秒），比 Etherscan 短一些，因为查询更快

interface CacheEntry {
  events: MintedEvent[];
  timestamp: number;
}

interface GraphQLMintEvent {
  id: string;
  tokenId: string;
  to: string;
  tokenURI: string | null;
  eventType: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface GraphQLNFT {
  id: string;
  tokenId: string;
  owner: string;
  tokenURI: string | null;
  mintedAt: string;
  mintedBy: string;
  transactionHash: string;
  isBurned: boolean;
}

interface GraphQLResponse {
  data?: {
    mintEvents?: GraphQLMintEvent[];
    nfts?: GraphQLNFT[];
  };
  errors?: Array<{
    message: string;
  }>;
}

/**
 * GraphQL 查询变量类型
 */
interface GraphQLVariables {
  owner?: string;
}

/**
 * GraphQL 查询：获取所有 mint 事件
 */
const MINT_EVENTS_QUERY = `
  query GetMintEvents($owner: Bytes) {
    mintEvents(
      first: 1000
      orderBy: blockTimestamp
      orderDirection: desc
      where: $owner ? { to: $owner } : {}
    ) {
      id
      tokenId
      to
      tokenURI
      eventType
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

/**
 * GraphQL 查询：获取所有 NFT
 */
const ALL_NFTS_QUERY = `
  query GetAllNFTs {
    nfts(
      first: 1000
      orderBy: mintedAt
      orderDirection: desc
      where: {
        isBurned: false
      }
    ) {
      id
      tokenId
      owner
      tokenURI
      mintedAt
      mintedBy
      transactionHash
      isBurned
    }
  }
`;

/**
 * GraphQL 查询：获取特定用户的 NFT
 */
const USER_NFTS_QUERY = `
  query GetUserNFTs($owner: Bytes!) {
    nfts(
      first: 1000
      orderBy: mintedAt
      orderDirection: desc
      where: {
        owner: $owner
        isBurned: false
      }
    ) {
      id
      tokenId
      owner
      tokenURI
      mintedAt
      mintedBy
      transactionHash
      isBurned
    }
  }
`;

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
 * Hook to get NFT mint events using The Graph Subgraph
 */
export function useNftMintEvents(options?: { myNftsOnly?: boolean }) {
  const { address: userAddress } = useConnection();
  const [allEvents, setAllEvents] = useState<MintedEvent[]>([]);
  const [events, setEvents] = useState<MintedEvent[]>([]);
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

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);

      try {
        // 构建查询变量
        const variables: GraphQLVariables = {};
        if (options?.myNftsOnly && userAddress) {
          variables.owner = userAddress.toLowerCase();
        }

        // 执行 GraphQL 查询
        const data = await fetchGraphQL<{
          mintEvents: GraphQLMintEvent[];
        }>(MINT_EVENTS_QUERY, variables, abortController.signal);

        if (!data.mintEvents || data.mintEvents.length === 0) {
          setAllEvents([]);
          setEvents([]);
          cacheRef.current.set(cacheKey, {
            events: [],
            timestamp: now,
          });
          return;
        }

        // 转换 GraphQL 数据为 MintedEvent 格式
        const mintEvents: MintedEvent[] = data.mintEvents.map((event) => ({
          to: event.to as `0x${string}`,
          tokenId: BigInt(event.tokenId),
          blockNumber: BigInt(event.blockNumber),
          transactionHash: event.transactionHash as `0x${string}`,
          timestamp: parseInt(event.blockTimestamp),
          tokenURI: event.tokenURI || undefined,
        }));

        // 更新缓存
        cacheRef.current.set(cacheKey, {
          events: mintEvents,
          timestamp: now,
        });

        setAllEvents(mintEvents);
        setEvents(mintEvents);
      } catch (err: unknown) {
        // 忽略被取消的请求
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("❌ Failed to fetch NFT events from Subgraph:", err);

        let errorMessage = "Failed to fetch NFT events from Subgraph";
        if (err instanceof Error) {
          errorMessage = err.message;
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
 * Hook to get NFT list with metadata using The Graph Subgraph
 *
 * 相比 Etherscan 版本的改进：
 * - ✅ 直接从 Subgraph 获取 owner 信息（无需调用 ownerOf）
 * - ✅ 自动过滤已 burn 的 NFT
 * - ✅ 无需担心 RPC 调用的速率限制
 * - ✅ 更快的数据加载速度
 */
export function useNfts(options?: {
  search?: string;
  sortBy?: NftSortBy;
  myNftsOnly?: boolean;
}): UseNftsReturn & { addOptimisticNft: (nft: Nft) => void } {
  const { search, sortBy, myNftsOnly } = options || {};
  const { address: userAddress } = useConnection();

  const [nfts, setNfts] = useState<Nft[]>([]);
  const [optimisticNfts, setOptimisticNfts] = useState<Nft[]>([]); // 乐观更新的 NFT
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 乐观添加新 NFT（用于 mint 后立即显示）
  const addOptimisticNft = useCallback((nft: Nft) => {
    console.log("📥 addOptimisticNft called with:", nft);
    setOptimisticNfts((prev) => {
      // 避免重复添加
      if (prev.some((n) => n.tokenId === nft.tokenId)) {
        console.log("⚠️ NFT already exists in optimistic list, skipping");
        return prev;
      }
      console.log(
        "✅ Adding NFT to optimistic list, new count:",
        prev.length + 1
      );
      return [nft, ...prev];
    });
  }, []);

  // 直接从 Subgraph 获取 NFT 数据（包含 owner 信息）
  const fetchNfts = useCallback(async () => {
    if (!GOGOGA_NFT_ADDRESS) {
      setNfts([]);
      return;
    }

    if (myNftsOnly && !userAddress) {
      setNfts([]);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      // 根据条件选择不同的查询
      let data: { nfts: GraphQLNFT[] };

      if (myNftsOnly && userAddress) {
        // 查询用户的 NFT
        data = await fetchGraphQL<{
          nfts: GraphQLNFT[];
        }>(
          USER_NFTS_QUERY,
          { owner: userAddress.toLowerCase() },
          abortController.signal
        );
      } else {
        // 查询所有 NFT
        data = await fetchGraphQL<{
          nfts: GraphQLNFT[];
        }>(ALL_NFTS_QUERY, {}, abortController.signal);
      }

      if (!data.nfts || data.nfts.length === 0) {
        setNfts([]);
        return;
      }

      // 并发获取所有 metadata（限制并发数）
      const CONCURRENT_LIMIT = 5;
      const enrichedNfts: Nft[] = [];

      for (let i = 0; i < data.nfts.length; i += CONCURRENT_LIMIT) {
        if (abortController.signal.aborted) break;

        const batch = data.nfts.slice(i, i + CONCURRENT_LIMIT);
        const batchResults = await Promise.all(
          batch.map(async (nft) => {
            try {
              const metadata = nft.tokenURI
                ? await fetchMetadata(nft.tokenURI)
                : undefined;

              return {
                tokenId: BigInt(nft.tokenId),
                owner: nft.owner as `0x${string}`,
                tokenURI: nft.tokenURI || "",
                metadata,
              };
            } catch (error) {
              console.error(`Error enriching NFT #${nft.tokenId}:`, error);
              return {
                tokenId: BigInt(nft.tokenId),
                owner: nft.owner as `0x${string}`,
                tokenURI: nft.tokenURI || "",
                metadata: undefined,
              };
            }
          })
        );

        enrichedNfts.push(...batchResults);
      }

      if (!abortController.signal.aborted) {
        setNfts(enrichedNfts);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      console.error("❌ Failed to fetch NFTs from Subgraph:", err);

      let errorMessage = "Failed to fetch NFTs from Subgraph";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(new Error(errorMessage));
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [myNftsOnly, userAddress]);

  useEffect(() => {
    fetchNfts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNfts]);

  // 当 Subgraph 数据更新后，清理已经同步的乐观 NFT
  useEffect(() => {
    if (optimisticNfts.length > 0 && nfts.length > 0) {
      const subgraphTokenIds = new Set(nfts.map((n) => n.tokenId.toString()));
      const remainingOptimistic = optimisticNfts.filter(
        (n) => !subgraphTokenIds.has(n.tokenId.toString())
      );
      if (remainingOptimistic.length !== optimisticNfts.length) {
        setOptimisticNfts(remainingOptimistic);
      }
    }
  }, [nfts, optimisticNfts]);

  // 合并乐观 NFT 和 Subgraph NFT，并应用过滤和排序
  const processedNfts = useMemo(() => {
    // 合并：乐观 NFT 在前，Subgraph 数据在后（去重）
    const subgraphTokenIds = new Set(nfts.map((n) => n.tokenId.toString()));
    const uniqueOptimistic = optimisticNfts.filter(
      (n) => !subgraphTokenIds.has(n.tokenId.toString())
    );

    // 根据 myNftsOnly 过滤乐观 NFT
    const filteredOptimistic =
      myNftsOnly && userAddress
        ? uniqueOptimistic.filter(
            (n) => n.owner.toLowerCase() === userAddress.toLowerCase()
          )
        : uniqueOptimistic;

    let result = [...filteredOptimistic, ...nfts];

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
          // 乐观 NFT 已在前面，Subgraph 已按 mintedAt 降序
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
  }, [nfts, optimisticNfts, search, sortBy, myNftsOnly, userAddress]);

  return {
    nfts: processedNfts,
    totalCount: processedNfts.length,
    isLoading,
    error,
    refetch: fetchNfts,
    addOptimisticNft,
  };
}
