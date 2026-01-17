import { useMemo } from "react";
import { Address } from "viem";
import { useReadContracts } from "wagmi";
import { Campaign, Tier, CampaignState } from "@/types";
import { crowdfundingABI } from "@/config/contracts";

// 定义从合约返回的原始 Tier 类型
type RawTier = {
  name: string;
  amount: bigint;
  backers: bigint;
};

// 为单个众筹准备读取调用
const prepareCampaignCalls = (address: Address) => {
  return [
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
    { address, abi: crowdfundingABI, functionName: "createdAt" },
  ];
};

export const useCampaignData = (addresses: Address[]) => {
  // 准备所有调用
  const calls = useMemo(
    () => addresses.flatMap(prepareCampaignCalls),
    [addresses]
  );

  const { data, isLoading: isContractLoading } = useReadContracts({
    contracts: calls,
  });

  // 使用 useMemo 来解析数据，避免在 effect 中调用 setState
  const campaigns = useMemo(() => {
    // 如果没有地址或正在加载，返回空数组
    if (addresses.length === 0 || !data || isContractLoading) {
      return [];
    }

    const campaignsData: Campaign[] = [];
    const callsPerCampaign = 16;

    for (let i = 0; i < addresses.length; i++) {
      const startIdx = i * callsPerCampaign;
      const campaignData = data.slice(startIdx, startIdx + callsPerCampaign);

      if (campaignData.some((d) => d.status === "failure")) {
        console.error(`Failed to fetch data for campaign: ${addresses[i]}`, {
          address: addresses[i],
          failedCalls: campaignData
            .map((d, idx) => (d.status === "failure" ? idx : null))
            .filter((idx) => idx !== null),
        });
        continue;
      }

      // getTiers() 返回档位数组
      const tiersResult = campaignData[12].result as RawTier[] | undefined;
      const tiers: Tier[] = tiersResult
        ? tiersResult.map((tier: RawTier) => ({
            name: tier.name,
            amount: tier.amount,
            backers: tier.backers,
          }))
        : [];

      const campaign: Campaign = {
        address: addresses[i],
        owner: campaignData[0].result as Address,
        name: campaignData[1].result as string,
        description: campaignData[2].result as string,
        icon: campaignData[3].result as string,
        goal: campaignData[4].result as bigint,
        deadline: campaignData[5].result as bigint,
        minContribution: campaignData[6].result as bigint,
        balance: campaignData[7].result as bigint,
        state: campaignData[8].result as CampaignState,
        paused: campaignData[9].result as boolean,
        withdrawn: campaignData[10].result as boolean,
        allowCustomAmount: campaignData[11].result as boolean,
        tiers,
        backerCount: campaignData[13].result as bigint,
        customBackerCount: campaignData[14].result as bigint,
        createdAt: campaignData[15].result as bigint,
      };

      campaignsData.push(campaign);
    }

    return campaignsData;
  }, [data, isContractLoading, addresses]);

  return {
    campaigns,
    isLoading:
      isContractLoading || addresses.length === 0 ? isContractLoading : false,
  };
};
