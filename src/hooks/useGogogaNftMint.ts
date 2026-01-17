import { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { contracts, GOGOGA_NFT_ADDRESS } from "@/config/contracts";
import { Nft, NftMetadata } from "@/types";

// ERC721 标准 Transfer 事件签名
// keccak256("Transfer(address,address,uint256)")
const TRANSFER_EVENT_SIGNATURE =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// 零地址，用于判断 mint 操作
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * 从交易 receipt 中解析 Transfer 事件，获取 mint 的 tokenId
 *
 * ERC721 mint 时会触发 Transfer(address(0), to, tokenId) 事件
 * 这比解析自定义 Minted 事件更可靠，因为 Transfer 是标准事件
 */
function parseMintedEvent(
  logs: readonly {
    address: `0x${string}`;
    data: `0x${string}`;
    topics: readonly `0x${string}`[];
  }[]
): { tokenId: bigint; to: `0x${string}` } | null {
  for (const log of logs) {
    // 检查是否来自目标合约
    if (log.address.toLowerCase() !== GOGOGA_NFT_ADDRESS.toLowerCase()) {
      continue;
    }

    // 检查是否是 Transfer 事件
    if (
      log.topics[0]?.toLowerCase() !== TRANSFER_EVENT_SIGNATURE.toLowerCase()
    ) {
      continue;
    }

    // Transfer 事件格式：Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    // topics[0] = 事件签名
    // topics[1] = from 地址 (indexed)
    // topics[2] = to 地址 (indexed)
    // topics[3] = tokenId (indexed)

    if (log.topics.length < 4) {
      continue;
    }

    const fromAddress = `0x${log.topics[1]?.slice(26)}`.toLowerCase();
    const toAddress = `0x${log.topics[2]?.slice(26)}` as `0x${string}`;
    const tokenId = BigInt(log.topics[3] || "0");

    // 检查是否是 mint 操作（from 是零地址）
    if (fromAddress === ZERO_ADDRESS.toLowerCase()) {
      return { tokenId, to: toAddress };
    }
  }

  return null;
}

/**
 * Helper function to extract error message from unknown error type
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

/**
 * Mint 结果类型，包含新 NFT 信息用于乐观更新
 */
export interface MintResult {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
  newNft?: Nft; // 新增：用于乐观更新
}

/**
 * Hook for minting NFT
 */
export function useMintNft() {
  const [isPending, setIsPending] = useState(false);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  // Mint custom NFT with custom IPFS URI
  const mintCustom = async (
    mintPrice: bigint,
    customURI: string,
    metadata?: NftMetadata
  ): Promise<MintResult> => {
    setIsPending(true);

    try {
      // 1. 发送交易
      const hash = await writeContractAsync({
        ...contracts.gogogaNft,
        functionName: "mintCustom",
        args: [customURI],
        value: mintPrice,
      });

      // 2. 等待交易确认（重要！）
      let newNft: Nft | undefined;
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1, // 等待1个区块确认
        });

        // 3. 从 receipt 中解析出 tokenId 用于乐观更新
        const mintedEvent = parseMintedEvent(receipt.logs);
        if (mintedEvent) {
          newNft = {
            tokenId: mintedEvent.tokenId,
            owner: mintedEvent.to,
            tokenURI: customURI,
            metadata,
          };
        }
      }

      return { success: true, hash, newNft };
    } catch (error: unknown) {
      console.error("Mint error:", error);
      const errorMessage = getErrorMessage(error);
      return { success: false, error: errorMessage };
    } finally {
      setIsPending(false);
    }
  };

  // Mint preset NFT (uses baseURI)
  const mintPreset = async (mintPrice: bigint): Promise<MintResult> => {
    setIsPending(true);

    try {
      // 1. 发送交易
      const hash = await writeContractAsync({
        ...contracts.gogogaNft,
        functionName: "mintPreset",
        value: mintPrice,
      });

      // 2. 等待交易确认（重要！）
      let newNft: Nft | undefined;
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1, // 等待1个区块确认
        });

        // 3. 从 receipt 中解析出 tokenId
        const mintedEvent = parseMintedEvent(receipt.logs);
        if (mintedEvent) {
          // 对于 preset NFT，我们需要获取 tokenURI
          // 简单起见，这里先不加载 metadata，让用户刷新后加载
          newNft = {
            tokenId: mintedEvent.tokenId,
            owner: mintedEvent.to,
            tokenURI: "", // preset 的 tokenURI 由合约的 baseURI 决定
            metadata: undefined,
          };
        }
      }

      return { success: true, hash, newNft };
    } catch (error: unknown) {
      console.error("Mint error:", error);
      const errorMessage = getErrorMessage(error);
      return { success: false, error: errorMessage };
    } finally {
      setIsPending(false);
    }
  };

  return {
    mintPreset,
    mintCustom,
    isPending,
  };
}

/**
 * Hook for batch minting NFT (owner only)
 */
export function useBatchMintNft() {
  const [isPending, setIsPending] = useState(false);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const batchMintPreset = async (to: `0x${string}`, quantity: number) => {
    setIsPending(true);

    try {
      // 1. 发送交易
      const hash = await writeContractAsync({
        ...contracts.gogogaNft,
        functionName: "batchMintPreset",
        args: [to, BigInt(quantity)],
      });

      // 2. 等待交易确认
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      return { success: true, hash };
    } catch (error: unknown) {
      console.error("Batch mint error:", error);
      const errorMessage = getErrorMessage(error);
      return { success: false, error: errorMessage };
    } finally {
      setIsPending(false);
    }
  };

  return {
    batchMintPreset,
    isPending,
  };
}

/**
 * Hook for burning NFT
 */
export function useBurnNft() {
  const [isPending, setIsPending] = useState(false);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const burn = async (tokenId: bigint) => {
    setIsPending(true);

    try {
      // 1. 发送交易
      const hash = await writeContractAsync({
        ...contracts.gogogaNft,
        functionName: "burn",
        args: [tokenId],
      });

      // 2. 等待交易确认
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      return { success: true, hash };
    } catch (error: unknown) {
      console.error("Burn error:", error);
      const errorMessage = getErrorMessage(error);
      return { success: false, error: errorMessage };
    } finally {
      setIsPending(false);
    }
  };

  return {
    burn,
    isPending,
  };
}
