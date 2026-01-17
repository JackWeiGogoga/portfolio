import { useState, useEffect, useMemo } from "react";
import { useReadContract, useConnection } from "wagmi";
import { contracts, GOGOGA_NFT_ADDRESS } from "@/config/contracts";
import type { UseNftContractInfoReturn, NftContractInfo } from "@/types";
import { ipfsToHttp } from "@/lib/ipfs";

/**
 * Hook to get preset NFT preview image URL
 */
export function usePresetNftPreview(tokenId: number) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Read base URI from contract
  const { data: baseURI } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "getPresetBaseURI",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!baseURI) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const uri = baseURI as string;

        // Construct metadata URI
        const metadataUrl = `${uri}${tokenId}`;

        // Convert IPFS URI to HTTP URL
        const httpMetadataUrl = ipfsToHttp(metadataUrl);

        // Fetch metadata
        const response = await fetch(httpMetadataUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const metadata = await response.json();

        // Extract image URL and convert IPFS to HTTP
        if (metadata.image) {
          const httpImageUrl = ipfsToHttp(metadata.image);
          setImageUrl(httpImageUrl);
        } else {
          throw new Error("No image found in metadata");
        }

        setError(null);
      } catch (err) {
        console.error("❌ Error fetching preset NFT preview:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Fallback to direct image URL if metadata fetch fails
        const fallbackUrl = ipfsToHttp(`${baseURI}${tokenId}.png`);
        setImageUrl(fallbackUrl);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [baseURI, tokenId]);

  return {
    imageUrl,
    isLoading,
    error,
  };
}

/**
 * Hook to get Gogoga NFT contract information
 */
export function useGogogaNftInfo(): UseNftContractInfoReturn {
  const error = !GOGOGA_NFT_ADDRESS
    ? new Error("NFT contract not configured")
    : null;

  // Get contract info
  const { data: name, isLoading: nameLoading } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "name",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const { data: symbol, isLoading: symbolLoading } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "symbol",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const {
    data: totalSupply,
    isLoading: totalSupplyLoading,
    refetch: refetchTotalSupply,
  } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "totalSupply",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const { data: maxSupply, isLoading: maxSupplyLoading } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "maxSupply",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const { data: presetMintPrice, isLoading: presetMintPriceLoading } =
    useReadContract({
      ...contracts.gogogaNft,
      functionName: "presetMintPrice",
      query: {
        enabled: !!GOGOGA_NFT_ADDRESS,
      },
    });

  const { data: customMintPrice, isLoading: customMintPriceLoading } =
    useReadContract({
      ...contracts.gogogaNft,
      functionName: "customMintPrice",
      query: {
        enabled: !!GOGOGA_NFT_ADDRESS,
      },
    });

  const {
    data: presetSupply,
    isLoading: presetSupplyLoading,
    refetch: refetchPresetSupply,
  } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "presetSupply",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const {
    data: customSupply,
    isLoading: customSupplyLoading,
    refetch: refetchCustomSupply,
  } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "customSupply",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const {
    data: remainingPresetSupply,
    isLoading: remainingPresetSupplyLoading,
    refetch: refetchRemainingPresetSupply,
  } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "remainingPresetSupply",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const {
    data: remainingCustomSupply,
    isLoading: remainingCustomSupplyLoading,
    refetch: refetchRemainingCustomSupply,
  } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "remainingCustomSupply",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const { data: paused, isLoading: pausedLoading } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "paused",
    query: {
      enabled: !!GOGOGA_NFT_ADDRESS,
    },
  });

  const isLoading =
    nameLoading ||
    symbolLoading ||
    totalSupplyLoading ||
    maxSupplyLoading ||
    presetMintPriceLoading ||
    customMintPriceLoading ||
    presetSupplyLoading ||
    customSupplyLoading ||
    remainingPresetSupplyLoading ||
    remainingCustomSupplyLoading ||
    pausedLoading;

  // Derive contract info from loaded data using useMemo
  const contractInfo = useMemo<NftContractInfo | null>(() => {
    if (!GOGOGA_NFT_ADDRESS) {
      return null;
    }

    if (
      !isLoading &&
      name &&
      symbol &&
      typeof totalSupply !== "undefined" &&
      typeof maxSupply !== "undefined" &&
      typeof presetMintPrice !== "undefined" &&
      typeof customMintPrice !== "undefined" &&
      typeof presetSupply !== "undefined" &&
      typeof customSupply !== "undefined" &&
      typeof remainingPresetSupply !== "undefined" &&
      typeof remainingCustomSupply !== "undefined" &&
      typeof paused !== "undefined"
    ) {
      return {
        name: name as string,
        symbol: symbol as string,
        totalSupply: totalSupply as bigint,
        maxSupply: maxSupply as bigint,
        presetMintPrice: presetMintPrice as bigint,
        customMintPrice: customMintPrice as bigint,
        presetSupply: presetSupply as bigint,
        customSupply: customSupply as bigint,
        remainingPresetSupply: remainingPresetSupply as bigint,
        remainingCustomSupply: remainingCustomSupply as bigint,
        isPaused: paused as boolean,
      };
    }

    return null;
  }, [
    isLoading,
    name,
    symbol,
    totalSupply,
    maxSupply,
    presetMintPrice,
    customMintPrice,
    presetSupply,
    customSupply,
    remainingPresetSupply,
    remainingCustomSupply,
    paused,
  ]);

  const refetch = () => {
    // Refetch all dynamic contract data
    refetchTotalSupply();
    refetchPresetSupply();
    refetchCustomSupply();
    refetchRemainingPresetSupply();
    refetchRemainingCustomSupply();
  };

  return {
    contractInfo,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get user's NFT balance
 */
export function useNftBalance() {
  const { address } = useConnection();

  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!GOGOGA_NFT_ADDRESS,
    },
  });

  return {
    balance: (balance as bigint) || 0n,
    isLoading,
    refetch,
  };
}
