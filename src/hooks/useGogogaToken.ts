import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contracts } from "@/config/contracts";
import { useConnection } from "wagmi";
import { formatUnits, parseUnits } from "viem";

// 读取代币基本信息
export const useTokenInfo = () => {
  const { data: name } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "name",
  });

  const { data: symbol } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "symbol",
  });

  const { data: decimals } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "decimals",
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "totalSupply",
  });

  const { data: maxSupply } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "MAX_SUPPLY",
  });

  const { data: isPaused, refetch: refetchPaused } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "paused",
  });

  const { data: owner } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "owner",
  });

  const refetch = async () => {
    await Promise.all([refetchTotalSupply(), refetchPaused()]);
  };

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
    totalSupply: totalSupply
      ? formatUnits(totalSupply as bigint, (decimals as number) || 18)
      : "0",
    totalSupplyRaw: totalSupply as bigint,
    maxSupply: maxSupply
      ? formatUnits(maxSupply as bigint, (decimals as number) || 18)
      : "0",
    maxSupplyRaw: maxSupply as bigint,
    isPaused: isPaused as boolean,
    owner: owner as string,
    refetch,
  };
};

// 读取用户余额
export const useTokenBalance = (address?: string) => {
  const { data: balance, refetch } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: decimals } = useReadContract({
    ...contracts.gogogaToken,
    functionName: "decimals",
  });

  return {
    balance: balance
      ? formatUnits(balance as bigint, (decimals as number) || 18)
      : "0",
    balanceRaw: balance as bigint,
    decimals: decimals as number,
    refetch,
  };
};

// 代币转账
export const useTokenTransfer = () => {
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

  const transfer = (to: string, amount: string, decimals: number) => {
    writeContract({
      ...contracts.gogogaToken,
      functionName: "transfer",
      args: [to, parseUnits(amount, decimals)],
    });
  };

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: Mint 代币
export const useTokenMint = () => {
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

  const mint = (to: string, amount: string, decimals: number) => {
    writeContract({
      ...contracts.gogogaToken,
      functionName: "mint",
      args: [to, parseUnits(amount, decimals)],
    });
  };

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
};

// Owner: Pause/Unpause
export const useTokenPause = () => {
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
      ...contracts.gogogaToken,
      functionName: "pause",
    });
  };

  const unpause = () => {
    writeContract({
      ...contracts.gogogaToken,
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

// 检查是否是 owner
export const useIsTokenOwner = () => {
  const { address } = useConnection();
  const { data: owner } = useReadContract({
    ...contracts.gogogaToken,
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
