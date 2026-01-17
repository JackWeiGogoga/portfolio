import { useState, useEffect } from "react";
import { Address } from "viem";
import { useReadContracts } from "wagmi";
import { CampaignDetail, Tier, CampaignState, CampaignStats } from "@/types";
import { crowdfundingABI } from "@/config/contracts";

// 定义从合约返回的原始 Tier 类型
type RawTier = {
  name: string;
  amount: bigint;
  backers: bigint;
};

export const useCampaignDetail = (address: Address | undefined) => {
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 准备读取调用
  const calls = address
    ? [
        { address, abi: crowdfundingABI, functionName: "owner" },
        { address, abi: crowdfundingABI, functionName: "name" },
        { address, abi: crowdfundingABI, functionName: "description" },
        { address, abi: crowdfundingABI, functionName: "icon" },
        { address, abi: crowdfundingABI, functionName: "goal" },
        { address, abi: crowdfundingABI, functionName: "deadline" },
        { address, abi: crowdfundingABI, functionName: "minContribution" },
        { address, abi: crowdfundingABI, functionName: "getBalance" },
        { address, abi: crowdfundingABI, functionName: "getState" },
        { address, abi: crowdfundingABI, functionName: "paused" },
        { address, abi: crowdfundingABI, functionName: "withdrawn" },
        { address, abi: crowdfundingABI, functionName: "allowCustomAmount" },
        { address, abi: crowdfundingABI, functionName: "getTiers" },
        { address, abi: crowdfundingABI, functionName: "getBackerCount" },
        { address, abi: crowdfundingABI, functionName: "customBackerCount" },
        { address, abi: crowdfundingABI, functionName: "getAllBackers" },
        { address, abi: crowdfundingABI, functionName: "createdAt" },
      ]
    : [];

  const {
    data,
    isLoading: isContractLoading,
    refetch,
  } = useReadContracts({
    contracts: calls as typeof calls,
  });

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      setCampaign(null);
      return;
    }

    if (!data || isContractLoading) {
      setIsLoading(true);
      return;
    }

    const parseCampaign = async () => {
      try {
        if (data.some((d) => d.status === "failure")) {
          console.error("Failed to fetch campaign data:", {
            address,
            failedCalls: data
              .map((d, idx) => (d.status === "failure" ? idx : null))
              .filter((idx) => idx !== null),
          });
          throw new Error("Failed to fetch campaign data");
        }

        const balance = data[7].result as bigint;
        const goal = data[4].result as bigint;
        const backerCount = data[13].result as bigint;
        const customBackerCount = data[14].result as bigint;

        // getTiers() 返回档位数组
        const tiersResult = data[12].result as RawTier[] | undefined;
        const tiers: Tier[] = tiersResult
          ? tiersResult.map((tier: RawTier) => ({
              name: tier.name,
              amount: tier.amount,
              backers: tier.backers,
            }))
          : [];

        // 计算统计数据
        const stats: CampaignStats = {
          totalBackers: backerCount + customBackerCount,
          totalTierBackers: backerCount,
          totalCustomBackers: customBackerCount,
          currentBalance: balance,
          remainingAmount: goal > balance ? goal - balance : 0n,
        };

        const campaignDetail: CampaignDetail = {
          address,
          owner: data[0].result as Address,
          name: data[1].result as string,
          description: data[2].result as string,
          icon: data[3].result as string,
          goal,
          deadline: data[5].result as bigint,
          minContribution: data[6].result as bigint,
          balance,
          state: data[8].result as CampaignState,
          paused: data[9].result as boolean,
          withdrawn: data[10].result as boolean,
          allowCustomAmount: data[11].result as boolean,
          tiers,
          backerCount,
          customBackerCount,
          stats,
          backers: (data[15].result as Address[]) || [],
          createdAt: data[16].result as bigint,
        };

        setCampaign(campaignDetail);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error parsing campaign data:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    parseCampaign();
  }, [data, isContractLoading, address]);

  return {
    campaign,
    isLoading,
    error,
    refetch,
  };
};
