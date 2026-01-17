import { useMemo } from "react";
import { useFactoryRead } from "./useContract";
import { FactoryCampaign, QueryParams } from "@/types";
import { useCampaignData } from "./useCampaignData";

export const useCampaigns = (params?: Partial<QueryParams>) => {
  // Get all campaign addresses
  const {
    data: campaignData,
    isLoading: isFactoryLoading,
    refetch: refetchAddresses,
    isError: isFactoryError,
    error: factoryError,
  } = useFactoryRead("getAllCampaigns", []) as {
    data: FactoryCampaign[] | undefined;
    isLoading: boolean;
    refetch: () => void;
    isError: boolean;
    error: Error | null;
  };

  // Extract addresses from Campaign struct
  const campaignAddresses = useMemo(() => {
    if (!campaignData) return [];
    return campaignData.map((campaign) => campaign.campaignAddress);
  }, [campaignData]);

  // Fetch detailed data for each campaign
  const { campaigns: fetchedCampaigns, isLoading: isFetchingData } =
    useCampaignData(campaignAddresses || []);

  // Filter and sort logic
  const filteredAndSortedCampaigns = useMemo(() => {
    if (!fetchedCampaigns || !fetchedCampaigns.length) return [];

    let result = [...fetchedCampaigns];

    // Filter
    if (params?.state !== undefined) {
      result = result.filter((c) => c.state === params.state);
    }

    if (params?.owner) {
      result = result.filter(
        (c) => c.owner.toLowerCase() === params.owner?.toLowerCase()
      );
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (params?.sortBy) {
      case "newest":
        result.sort((a, b) => Number(b.deadline - a.deadline));
        break;
      case "oldest":
        result.sort((a, b) => Number(a.deadline - b.deadline));
        break;
      case "mostFunded":
        result.sort((a, b) => Number(b.balance - a.balance));
        break;
      case "endingSoon":
        result.sort((a, b) => Number(a.deadline - b.deadline));
        break;
      default:
        result.sort((a, b) => Number(b.deadline - a.deadline));
    }

    return result;
  }, [fetchedCampaigns, params]);

  const refetch = () => {
    refetchAddresses();
  };

  // Determine if there's an error
  const hasError = isFactoryError;
  const errorMessage = factoryError;

  const isLoading = isFactoryLoading || isFetchingData;

  return {
    campaigns: filteredAndSortedCampaigns,
    totalCount: filteredAndSortedCampaigns.length,
    isLoading,
    error: hasError ? errorMessage : null,
    refetch,
  };
};
