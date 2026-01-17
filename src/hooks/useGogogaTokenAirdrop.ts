import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contracts } from "@/config/contracts";
import { useConnection } from "wagmi";
import { formatUnits } from "viem";

// 读取空投信息
export const useAirdropInfo = () => {
  const { data: airdropInfoData, refetch } = useReadContract({
    ...contracts.gogogaTokenAirdrop,
    functionName: "getAirdropInfo",
  });

  const airdropInfo = airdropInfoData as
    | [string, string, bigint, bigint, bigint, bigint, bigint, boolean, boolean]
    | undefined;

  return {
    tokenAddress: airdropInfo?.[0] as string | undefined,
    merkleRoot: airdropInfo?.[1] as string | undefined,
    startTime: airdropInfo?.[2] ? Number(airdropInfo[2]) : undefined,
    endTime: airdropInfo?.[3] ? Number(airdropInfo[3]) : undefined,
    totalClaimed: airdropInfo?.[4] ? formatUnits(airdropInfo[4], 18) : "0",
    totalClaimedRaw: airdropInfo?.[4] as bigint | undefined,
    totalClaimCount: airdropInfo?.[5] ? Number(airdropInfo[5]) : 0,
    remainingBalance: airdropInfo?.[6] ? formatUnits(airdropInfo[6], 18) : "0",
    remainingBalanceRaw: airdropInfo?.[6] as bigint | undefined,
    isPaused: airdropInfo?.[7] as boolean | undefined,
    isActive: airdropInfo?.[8] as boolean | undefined,
    refetch,
  };
};

// 读取用户领取状态
export const useClaimStatus = (address?: string) => {
  const { data: claimStatusData, refetch } = useReadContract({
    ...contracts.gogogaTokenAirdrop,
    functionName: "getClaimStatus",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const claimStatus = claimStatusData as [boolean, bigint] | undefined;

  return {
    hasClaimed: claimStatus?.[0] || false,
    claimedAmount: claimStatus?.[1] ? formatUnits(claimStatus[1], 18) : "0",
    claimedAmountRaw: claimStatus?.[1] as bigint | undefined,
    refetch,
  };
};

// 检查是否可以领取
export const useCanClaim = (
  account?: string,
  amount?: string,
  merkleProof?: string[]
) => {
  const { data: canClaimData } = useReadContract({
    ...contracts.gogogaTokenAirdrop,
    functionName: "canClaim",
    args:
      account && amount && merkleProof
        ? [account, BigInt(amount), merkleProof as `0x${string}`[]]
        : undefined,
    query: {
      enabled: !!account && !!amount && !!merkleProof,
    },
  });

  const canClaimResult = canClaimData as [boolean, string] | undefined;

  return {
    canClaim: canClaimResult?.[0] || false,
    reason: canClaimResult?.[1] || "",
  };
};

// 领取空投
export const useClaimAirdrop = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = (amount: string, merkleProof: string[]) => {
    writeContract({
      ...contracts.gogogaTokenAirdrop,
      functionName: "claim",
      args: [BigInt(amount), merkleProof as `0x${string}`[]],
    });
  };

  return {
    claim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// 检查是否是 owner
export const useIsAirdropOwner = () => {
  const { address } = useConnection();
  const { data: owner } = useReadContract({
    ...contracts.gogogaTokenAirdrop,
    functionName: "owner",
  });

  return {
    isOwner:
      address && owner
        ? address.toLowerCase() === (owner as string).toLowerCase()
        : false,
    owner: owner as string,
  };
};

// Owner: 更新 Merkle Root
export const useUpdateMerkleRoot = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updateMerkleRoot = (newMerkleRoot: string) => {
    writeContract({
      ...contracts.gogogaTokenAirdrop,
      functionName: "updateMerkleRoot",
      args: [newMerkleRoot as `0x${string}`],
    });
  };

  return {
    updateMerkleRoot,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: Pause/Unpause
export const useAirdropPause = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const pause = () => {
    writeContract({
      ...contracts.gogogaTokenAirdrop,
      functionName: "pause",
    });
  };

  const unpause = () => {
    writeContract({
      ...contracts.gogogaTokenAirdrop,
      functionName: "unpause",
    });
  };

  return {
    pause,
    unpause,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 提取未领取的代币
export const useWithdrawUnclaimedTokens = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdrawUnclaimedTokens = () => {
    writeContract({
      ...contracts.gogogaTokenAirdrop,
      functionName: "withdrawUnclaimedTokens",
    });
  };

  return {
    withdrawUnclaimedTokens,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};
