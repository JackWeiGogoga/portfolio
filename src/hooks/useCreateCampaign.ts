import { useState } from "react";
import { parseEther, decodeEventLog, Address } from "viem";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useConnection,
} from "wagmi";
import {
  crowdfundingFactoryABI,
  CROWDFUNDING_FACTORY_ADDRESS,
} from "@/config/contracts";

// 定义从 getUserCampaigns 返回的数据结构
interface UserCampaign {
  campaignAddress: Address;
  name: string;
  goal: bigint;
  deadline: bigint;
  state: number;
}

export interface CreateCampaignParams {
  name: string;
  description: string;
  icon: string;
  goal: string; // ETH amount as string
  durationInDays: number; // Duration in days (not timestamp!)
  minContribution: string; // ETH amount as string (set to "0" to disable custom amounts)
  tiers: {
    name: string;
    amount: string; // ETH amount as string
  }[];
}

export const useCreateCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [campaignAddress, setCampaignAddress] = useState<string | null>(null);

  const { address: userAddress } = useConnection();
  const publicClient = usePublicClient();
  const { writeContractAsync, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createCampaign = async (params: CreateCampaignParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setCampaignAddress(null);

      // 准备 tiers 数据
      const tierNames = params.tiers?.map((tier) => tier.name) || [];
      const tierAmounts =
        params.tiers?.map((tier) => parseEther(tier.amount)) || [];

      // Step 1: 调用工厂合约创建众筹项目（一次性传入所有 tiers）
      const txHash = await writeContractAsync({
        address: CROWDFUNDING_FACTORY_ADDRESS,
        abi: crowdfundingFactoryABI,
        functionName: "createCampaign",
        args: [
          params.name,
          params.description,
          params.icon,
          parseEther(params.goal),
          BigInt(params.durationInDays), // 传递天数，不是时间戳！
          parseEther(params.minContribution), // 设置为 0 则禁用自定义金额
          tierNames, // tier 名称数组
          tierAmounts, // tier 金额数组
        ],
      });

      // Step 2: 等待交易确认并获取新创建的合约地址
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        // 方法 1（推荐）: 从事件日志中提取新创建的众筹合约地址
        // Event: CampaignCreated(address indexed campaignAddress, address indexed owner, string name, uint256 goal, uint256 deadline)
        // 使用 viem 的 decodeEventLog 自动解析
        const campaignCreatedEvent = {
          type: "event",
          name: "CampaignCreated",
          inputs: [
            { type: "address", indexed: true, name: "campaignAddress" },
            { type: "address", indexed: true, name: "owner" },
            { type: "string", indexed: false, name: "name" },
            { type: "uint256", indexed: false, name: "goal" },
            { type: "uint256", indexed: false, name: "deadline" },
          ],
        } as const;

        let newCampaignAddress: string | null = null;

        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: [campaignCreatedEvent],
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === "CampaignCreated") {
              newCampaignAddress = decoded.args.campaignAddress;
              break;
            }
          } catch {
            // 不是我们要的事件，继续
            continue;
          }
        }

        if (newCampaignAddress) {
          setCampaignAddress(newCampaignAddress);
        } else {
          // 方法 2（备选）: 如果事件解析失败，通过查询用户最新创建的合约
          console.warn("Failed to parse event, fetching from contract...");

          const userCampaigns = (await publicClient.readContract({
            address: CROWDFUNDING_FACTORY_ADDRESS,
            abi: crowdfundingFactoryABI,
            functionName: "getUserCampaigns",
            args: [userAddress!], // 使用当前连接的钱包地址
          })) as UserCampaign[];

          if (userCampaigns && userCampaigns.length > 0) {
            // 获取最新创建的合约（最后一个）
            const latestCampaign = userCampaigns[userCampaigns.length - 1];
            newCampaignAddress = latestCampaign.campaignAddress;
            setCampaignAddress(newCampaignAddress);
          }
        }
      }

      return txHash;
    } catch (err) {
      console.error("Create campaign error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCampaign,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    hash,
    campaignAddress,
  };
};
