import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contracts } from "@/config/contracts";
import { useConnection } from "wagmi";
import { formatUnits } from "viem";

// 读取 Faucet 信息
export const useFaucetInfo = () => {
  const { data: faucetInfoData, refetch } = useReadContract({
    ...contracts.gogogaTokenFaucet,
    functionName: "getFaucetInfo",
  });

  const faucetInfo = faucetInfoData as
    | [string, string, number, bigint, bigint, bigint, bigint, bigint, boolean]
    | undefined;

  return {
    tokenAddress: faucetInfo?.[0] as string | undefined,
    tokenSymbol: faucetInfo?.[1] as string | undefined,
    tokenDecimals: faucetInfo?.[2] as number | undefined,
    faucetBalance: faucetInfo?.[3]
      ? formatUnits(faucetInfo[3], faucetInfo[2] || 18)
      : "0",
    faucetBalanceRaw: faucetInfo?.[3] as bigint | undefined,
    requestAmount: faucetInfo?.[4]
      ? formatUnits(faucetInfo[4], faucetInfo[2] || 18)
      : "0",
    requestAmountRaw: faucetInfo?.[4] as bigint | undefined,
    cooldownTime: faucetInfo?.[5] ? Number(faucetInfo[5]) : 0,
    maxClaimPerAddress: faucetInfo?.[6]
      ? formatUnits(faucetInfo[6], faucetInfo[2] || 18)
      : "0",
    maxClaimPerAddressRaw: faucetInfo?.[6] as bigint | undefined,
    totalDistributed: faucetInfo?.[7]
      ? formatUnits(faucetInfo[7], faucetInfo[2] || 18)
      : "0",
    totalDistributedRaw: faucetInfo?.[7] as bigint | undefined,
    isPaused: faucetInfo?.[8] as boolean | undefined,
    refetch,
  };
};

// 读取用户信息
export const useUserFaucetInfo = (address?: string) => {
  const { data: userInfoData, refetch } = useReadContract({
    ...contracts.gogogaTokenFaucet,
    functionName: "getUserInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const userInfo = userInfoData as
    | [bigint, bigint, bigint, boolean]
    | undefined;

  return {
    lastRequestTime: userInfo?.[0] ? Number(userInfo[0]) : 0,
    totalClaimed: userInfo?.[1] ? formatUnits(userInfo[1], 18) : "0",
    totalClaimedRaw: userInfo?.[1] as bigint | undefined,
    timeUntilNext: userInfo?.[2] ? Number(userInfo[2]) : 0,
    canClaim: userInfo?.[3] || false,
    refetch,
  };
};

// 检查是否可以领取
export const useCanRequestTokens = (address?: string) => {
  const { data: canRequestData } = useReadContract({
    ...contracts.gogogaTokenFaucet,
    functionName: "canRequestTokens",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    canRequest: (canRequestData as boolean) || false,
  };
};

// 获取剩余可领取额度
export const useRemainingClaimAmount = (address?: string) => {
  const { data: remainingData } = useReadContract({
    ...contracts.gogogaTokenFaucet,
    functionName: "getRemainingClaimAmount",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    remainingClaim: remainingData
      ? formatUnits(remainingData as bigint, 18)
      : "0",
    remainingClaimRaw: remainingData as bigint | undefined,
  };
};

// 领取代币
export const useRequestTokens = () => {
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

  const requestTokens = () => {
    writeContract({
      ...contracts.gogogaTokenFaucet,
      functionName: "requestTokens",
    });
  };

  return {
    requestTokens,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// 检查是否是 owner
export const useIsFaucetOwner = () => {
  const { address } = useConnection();
  const { data: owner } = useReadContract({
    ...contracts.gogogaTokenFaucet,
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

// Owner: 设置请求金额
export const useSetRequestAmount = () => {
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

  const setRequestAmount = (amount: bigint) => {
    writeContract({
      ...contracts.gogogaTokenFaucet,
      functionName: "setRequestAmount",
      args: [amount],
    });
  };

  return {
    setRequestAmount,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 设置冷却时间
export const useSetCooldownTime = () => {
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

  const setCooldownTime = (cooldownTime: bigint) => {
    writeContract({
      ...contracts.gogogaTokenFaucet,
      functionName: "setCooldownTime",
      args: [cooldownTime],
    });
  };

  return {
    setCooldownTime,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 设置每地址最大领取额度
export const useSetMaxClaimPerAddress = () => {
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

  const setMaxClaimPerAddress = (maxClaim: bigint) => {
    writeContract({
      ...contracts.gogogaTokenFaucet,
      functionName: "setMaxClaimPerAddress",
      args: [maxClaim],
    });
  };

  return {
    setMaxClaimPerAddress,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 暂停/恢复
export const useFaucetPause = () => {
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
      ...contracts.gogogaTokenFaucet,
      functionName: "pause",
    });
  };

  const unpause = () => {
    writeContract({
      ...contracts.gogogaTokenFaucet,
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

// Owner: 提取代币
export const useWithdrawFaucetTokens = () => {
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

  const withdrawTokens = (amount: bigint) => {
    writeContract({
      ...contracts.gogogaTokenFaucet,
      functionName: "withdrawTokens",
      args: [amount],
    });
  };

  return {
    withdrawTokens,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 为 Faucet 充值
export const useFundFaucet = () => {
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

  const fundFaucet = (amount: bigint) => {
    writeContract({
      ...contracts.gogogaTokenFaucet,
      functionName: "fundFaucet",
      args: [amount],
    });
  };

  return {
    fundFaucet,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};
