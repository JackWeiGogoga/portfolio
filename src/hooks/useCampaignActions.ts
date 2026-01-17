import { useState } from "react";
import { Address, parseEther, maxUint256 } from "viem";
import { useWriteContract, usePublicClient } from "wagmi";
import { crowdfundingABI } from "@/config/contracts";

// 支持项目（选择档位）
export const useBackTier = (campaignAddress: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const backTier = async (tierId: number, amount: string) => {
    if (!campaignAddress) {
      throw new Error("Campaign address is required");
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. 发送交易
      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: crowdfundingABI,
        functionName: "fund",
        args: [BigInt(tierId)],
        value: parseEther(amount),
      });

      // 2. 等待交易确认（重要！）
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1, // 等待1个区块确认
        });
      }

      return hash;
    } catch (err) {
      console.error("Back tier error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    backTier,
    isLoading,
    error,
  };
};

// 自定义金额支持
export const useBackCustom = (campaignAddress: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const backCustom = async (amount: string) => {
    if (!campaignAddress) {
      throw new Error("Campaign address is required");
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. 使用 maxUint256 表示自定义金额（CUSTOM_TIER_INDEX）
      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: crowdfundingABI,
        functionName: "fund",
        args: [maxUint256],
        value: parseEther(amount),
      });

      // 2. 等待交易确认（重要！）
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1, // 等待1个区块确认
        });
      }

      return hash;
    } catch (err) {
      console.error("Back custom error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    backCustom,
    isLoading,
    error,
  };
};

// 申请退款
export const useRequestRefund = (campaignAddress: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const requestRefund = async () => {
    if (!campaignAddress) {
      throw new Error("Campaign address is required");
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: crowdfundingABI,
        functionName: "refund",
        args: [],
      });

      // 等待交易确认
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      return hash;
    } catch (err) {
      console.error("Refund error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestRefund,
    isLoading,
    error,
  };
};

// 切换暂停状态（仅项目创建者）
export const useTogglePause = (campaignAddress: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const togglePause = async () => {
    if (!campaignAddress) {
      throw new Error("Campaign address is required");
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: crowdfundingABI,
        functionName: "togglePause",
        args: [],
      });

      // 等待交易确认
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      return hash;
    } catch (err) {
      console.error("Toggle pause error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    togglePause,
    isLoading,
    error,
  };
};

// 提款（仅项目创建者）
export const useWithdraw = (campaignAddress: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const withdraw = async () => {
    if (!campaignAddress) {
      throw new Error("Campaign address is required");
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: crowdfundingABI,
        functionName: "withdraw",
        args: [],
      });

      // 等待交易确认
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      return hash;
    } catch (err) {
      console.error("Withdraw error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    withdraw,
    isLoading,
    error,
  };
};

// 添加 Tier（仅项目创建者）
export const useAddTier = (campaignAddress: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const addTier = async (name: string, amount: string) => {
    if (!campaignAddress) {
      throw new Error("Campaign address is required");
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: crowdfundingABI,
        functionName: "addTier",
        args: [name, parseEther(amount)],
      });

      // 等待交易确认
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      return hash;
    } catch (err) {
      console.error("Add tier error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addTier,
    isLoading,
    error,
  };
};

// 删除 Tier（仅项目创建者）
export const useRemoveTier = (campaignAddress: Address | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract();

  const removeTier = async (tierIndex: number) => {
    if (!campaignAddress) {
      throw new Error("Campaign address is required");
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await writeContractAsync({
        address: campaignAddress,
        abi: crowdfundingABI,
        functionName: "removeTier",
        args: [BigInt(tierIndex)],
      });

      // 等待交易确认
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        });
      }

      return hash;
    } catch (err) {
      console.error("Remove tier error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    removeTier,
    isLoading,
    error,
  };
};
