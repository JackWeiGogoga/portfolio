import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contracts } from "@/config/contracts";
import { useConnection } from "wagmi";
import { formatUnits, formatEther, parseEther } from "viem";
import { TokenSaleContractInfo } from "@/types";

// 读取 Token Sale 信息
export const useTokenSaleInfo = () => {
  const { data: contractInfo, refetch } = useReadContract({
    ...contracts.gogogaTokenSale,
    functionName: "getContractInfo",
  });

  const info = contractInfo as TokenSaleContractInfo | undefined;

  return {
    tokenAddress: info?.[0] as string,
    tokenSymbol: info?.[1] as string,
    tokenDecimals: info?.[2] as number,
    contractTokenBalance: info?.[3] ? formatUnits(info[3], info[2] || 18) : "0",
    contractTokenBalanceRaw: info?.[3] as bigint,
    priceInEth: info?.[4] ? formatEther(info[4]) : "0",
    priceInEthRaw: info?.[4] as bigint,
    totalSold: info?.[5] ? formatUnits(info[5], info[2] || 18) : "0",
    totalSoldRaw: info?.[5] as bigint,
    totalRaised: info?.[6] ? formatEther(info[6]) : "0",
    totalRaisedRaw: info?.[6] as bigint,
    minPurchase: info?.[7] ? formatEther(info[7]) : "0",
    minPurchaseRaw: info?.[7] as bigint,
    maxPurchase: info?.[8] ? formatEther(info[8]) : "0",
    maxPurchaseRaw: info?.[8] as bigint,
    isPaused: info?.[9] as boolean,
    refetch,
  };
};

// 计算可购买的代币数量
export const useCalculateTokenAmount = (ethAmount: string) => {
  const { data: tokenAmount } = useReadContract({
    ...contracts.gogogaTokenSale,
    functionName: "calculateTokenAmount",
    args:
      ethAmount && parseFloat(ethAmount) > 0
        ? [parseEther(ethAmount)]
        : undefined,
    query: {
      enabled: !!ethAmount && parseFloat(ethAmount) > 0,
    },
  });

  const { data: decimals } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "decimals",
  });

  return {
    tokenAmount: tokenAmount
      ? formatUnits(tokenAmount as bigint, (decimals as number) || 18)
      : "0",
    tokenAmountRaw: tokenAmount as bigint,
  };
};

// 购买代币
export const useBuyTokens = () => {
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

  const buyTokens = (ethAmount: string) => {
    writeContract({
      ...contracts.gogogaTokenSale,
      functionName: "buyTokens",
      value: parseEther(ethAmount),
    });
  };

  return {
    buyTokens,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 更新价格
export const useUpdateTokenPrice = () => {
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

  const updatePrice = (newPrice: string) => {
    writeContract({
      ...contracts.gogogaTokenSale,
      functionName: "updateTokenPrice",
      args: [parseEther(newPrice)],
    });
  };

  return {
    updatePrice,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 更新购买限制
export const useUpdatePurchaseLimits = () => {
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

  const updateLimits = (minAmount: string, maxAmount: string) => {
    writeContract({
      ...contracts.gogogaTokenSale,
      functionName: "updatePurchaseLimits",
      args: [parseEther(minAmount), parseEther(maxAmount)],
    });
  };

  return {
    updateLimits,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 提取 ETH
export const useWithdrawEth = () => {
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

  const withdrawEth = () => {
    writeContract({
      ...contracts.gogogaTokenSale,
      functionName: "withdrawEth",
    });
  };

  return {
    withdrawEth,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: 提取剩余代币
export const useWithdrawRemainingTokens = () => {
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

  const withdrawTokens = () => {
    writeContract({
      ...contracts.gogogaTokenSale,
      functionName: "withdrawRemainingTokens",
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

// Owner: Pause/Unpause Sale
export const useTokenSalePause = () => {
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
      ...contracts.gogogaTokenSale,
      functionName: "pause",
    });
  };

  const unpause = () => {
    writeContract({
      ...contracts.gogogaTokenSale,
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

// 检查是否是 Token Sale owner
export const useIsTokenSaleOwner = () => {
  const { address } = useConnection();
  const { data: owner } = useReadContract({
    ...contracts.gogogaTokenSale,
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

// 读取待提取的 ETH
export const usePendingWithdrawals = () => {
  const { data: pending, refetch } = useReadContract({
    ...contracts.gogogaTokenSale,
    functionName: "pendingWithdrawals",
  });

  return {
    pendingWithdrawals: pending ? formatEther(pending as bigint) : "0",
    pendingWithdrawalsRaw: pending as bigint,
    refetch,
  };
};
