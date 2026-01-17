import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Grid3x3 } from "lucide-react";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage, { EmptyState } from "@/components/ErrorMessage";
import { useNfts } from "@/hooks/useGogogaNftEvents";
import { useGogogaNftInfo, useNftBalance } from "@/hooks/useGogogaNft";
import { useConnection, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { Nft, NftSortBy } from "@/types";
import NftCard from "@/components/NftCard";
import MintNftModal from "@/components/MintNftModal";
import { AdminPanel } from "@/components/AdminPanel";
import { contracts } from "@/config/contracts";
import { ProjectCard, ProjectCardContent } from "@/components/ui/project-card";
import { ProjectIcon } from "@/components/IpfsImage";
import { AddressDisplay } from "@/components/AddressDisplay";
import { GOGOGA_NFT_ADDRESS } from "@/config/contracts";
import { Badge } from "@/components/ui/badge";

export default function GogogaNftPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<NftSortBy>("newest");
  const [activeTab, setActiveTab] = useState("all");

  const { isConnected } = useConnection();
  const {
    contractInfo,
    isLoading: isLoadingInfo,
    refetch: refetchContractInfo,
  } = useGogogaNftInfo();
  const { balance: myNftBalance, refetch: refetchNftBalance } = useNftBalance();

  // Read paused state from contract
  const { data: isPaused } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "paused",
  });

  // Fetch all NFTs
  const {
    nfts: allNfts,
    totalCount: allCount,
    isLoading: isLoadingAll,
    error: errorAll,
    refetch: refetchAll,
    addOptimisticNft: addOptimisticNftAll,
  } = useNfts({
    search: searchQuery,
    sortBy,
    myNftsOnly: false,
  });

  // Fetch my NFTs
  const {
    nfts: myNfts,
    totalCount: myCount,
    isLoading: isLoadingMy,
    error: errorMy,
    refetch: refetchMy,
    addOptimisticNft: addOptimisticNftMy,
  } = useNfts({
    search: searchQuery,
    sortBy,
    myNftsOnly: true,
  });

  const handleRefresh = () => {
    refetchAll();
    refetchMy();
    refetchContractInfo();
    refetchNftBalance();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as NftSortBy);
  };

  return (
    <Layout variant="crowdfunding">
      {/* NFT Collection Info Card */}
      {isLoadingInfo ? (
        <LoadingSpinner text="Loading contract info..." />
      ) : contractInfo ? (
        <ProjectCard className="mb-4">
          <ProjectCardContent>
            <div className="flex items-start gap-4 md:gap-6">
              <div className="shrink-0">
                <ProjectIcon
                  src="https://euc.li/gogoga.eth"
                  alt="Gogoga NFT Collection"
                  size="lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="mb-3 md:mb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl md:text-3xl font-bold">
                        Gogoga NFT
                      </h1>
                      <Badge
                        variant={isPaused ? "destructive" : "default"}
                        className="text-xs"
                      >
                        {isPaused ? "Paused" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 self-end md:self-auto">
                      <AdminPanel onSuccess={handleRefresh} />
                      <MintNftModal
                        onSuccess={handleRefresh}
                        onMintSuccess={(newNft) => {
                          // 乐观更新：立即在列表中显示新 NFT
                          addOptimisticNftAll(newNft);
                          addOptimisticNftMy(newNft);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  ERC721 NFT collection with preset and custom minting - Hybrid
                  NFTs with IPFS storage
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Total Supply
                    </div>
                    <div className="font-bold text-sm md:text-base">
                      {Number(contractInfo.totalSupply)} /{" "}
                      {Number(contractInfo.maxSupply)}
                    </div>
                    <div className="text-xs text-muted-foreground">NFTs</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Preset Mint
                    </div>
                    <div className="font-bold text-sm md:text-base text-blue-600 dark:text-blue-400">
                      Ξ{formatEther(contractInfo.presetMintPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Number(contractInfo.presetSupply)} /{" "}
                      {Number(
                        contractInfo.presetSupply +
                          contractInfo.remainingPresetSupply
                      )}{" "}
                      minted
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Custom Mint
                    </div>
                    <div className="font-bold text-sm md:text-base text-purple-600 dark:text-purple-400">
                      Ξ{formatEther(contractInfo.customMintPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Number(contractInfo.customSupply)} /{" "}
                      {Number(
                        contractInfo.customSupply +
                          contractInfo.remainingCustomSupply
                      )}{" "}
                      minted
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      My NFTs
                    </div>
                    <div className="font-bold text-sm md:text-base">
                      {isConnected ? Number(myNftBalance) : "0"}
                    </div>
                    <div className="text-xs text-muted-foreground">Owned</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="text-muted-foreground">NFT Contract:</span>
                  <AddressDisplay address={GOGOGA_NFT_ADDRESS} />
                </div>
              </div>
            </div>
          </ProjectCardContent>
        </ProjectCard>
      ) : null}

      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-3">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Token ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Sort Tabs and Collection Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Sort Tabs */}
          <Tabs value={sortBy} onValueChange={handleSortChange}>
            <TabsList>
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="oldest">Oldest</TabsTrigger>
              <TabsTrigger value="tokenId">Token ID</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Collection Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="all" className="font-mono">
                All NFTs ({allCount})
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="font-mono"
                disabled={!isConnected}
              >
                My NFTs ({isConnected ? myCount : 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* NFT List */}
      {activeTab === "all" ? (
        <div className="mb-8">
          <NFTGrid
            nfts={allNfts}
            isLoading={isLoadingAll}
            error={errorAll}
            emptyMessage="No NFTs found"
          />
        </div>
      ) : (
        <div className="mb-8">
          <NFTGrid
            nfts={myNfts}
            isLoading={isLoadingMy}
            error={errorMy}
            emptyMessage={
              isConnected
                ? "You don't own any NFTs yet. Start minting!"
                : "Connect your wallet to view your NFTs"
            }
          />
        </div>
      )}

      {/* Features Section */}
      <ProjectCard className="mb-8">
        <ProjectCardContent className="py-0">
          <h2 className="text-lg font-bold font-mono mb-3">
            Collection Features
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold font-mono">
                🎨 Hybrid NFTs
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Support both preset and custom NFT minting modes
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold font-mono">
                ☁️ IPFS Storage
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Custom NFTs stored on IPFS with user-uploaded images
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold font-mono">🔥 Burnable</h3>
              <p className="text-xs text-muted-foreground font-mono">
                Token holders can burn their NFTs
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold font-mono">⏸️ Pausable</h3>
              <p className="text-xs text-muted-foreground font-mono">
                Owner can pause/unpause minting when needed
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold font-mono">📦 Batch Mint</h3>
              <p className="text-xs text-muted-foreground font-mono">
                Owner can batch mint preset NFTs for airdrops
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold font-mono">
                💰 Dual Pricing
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Different prices for preset and custom minting
              </p>
            </div>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    </Layout>
  );
}

// NFT Grid Component
function NFTGrid({
  nfts,
  isLoading,
  error,
  emptyMessage,
}: {
  nfts: Nft[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
}) {
  if (isLoading) {
    return <LoadingSpinner text="Loading NFTs..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || "Failed to load NFTs"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (nfts.length === 0) {
    return (
      <EmptyState
        title="No NFTs"
        description={emptyMessage}
        icon={<Grid3x3 className="h-12 w-12" />}
      />
    );
  }

  return (
    <>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {nfts.map((nft) => (
          <NftCard key={nft.tokenId.toString()} nft={nft} />
        ))}
      </div>

      {/* Show total count */}
      {nfts.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {nfts.length} NFT{nfts.length !== 1 ? "s" : ""}
        </div>
      )}
    </>
  );
}
