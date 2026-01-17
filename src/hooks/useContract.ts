import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Address, Abi } from "viem";
import { contracts, crowdfundingABI } from "@/config/contracts";

// 读取 Factory 合约
export const useFactoryRead = (
  functionName: string,
  args?: readonly unknown[]
) => {
  return useReadContract({
    ...contracts.crowdfundingFactory,
    functionName,
    args,
  });
};

// 写入 Factory 合约
export const useFactoryWrite = () => {
  return useWriteContract();
};

// 读取单个 Crowdfunding 合约
export const useCrowdfundingRead = (
  address: Address | undefined,
  functionName: string,
  args?: readonly unknown[]
) => {
  return useReadContract({
    address,
    abi: crowdfundingABI,
    functionName,
    args,
    query: {
      enabled: !!address,
    },
  });
};

// 写入单个 Crowdfunding 合约
export const useCrowdfundingWrite = () => {
  return useWriteContract();
};

// 等待交易确认
export const useTransactionReceipt = (hash: Address | undefined) => {
  return useWaitForTransactionReceipt({
    hash,
  });
};

// 定义合约调用参数类型
type ContractCall = {
  address?: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  chainId?: number;
};

// 批量读取合约数据的辅助函数
export const useMultipleReads = (calls: ContractCall[]) => {
  // 使用 useReadContracts 来批量读取，这会自动使用 multicall 优化性能
  return useReadContracts({
    contracts: calls,
  });
};
