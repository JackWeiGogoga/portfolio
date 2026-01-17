import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useConnection } from "wagmi";
import { formatEther, maxUint256 } from "viem";
import {
  Users,
  Heart,
  Share2,
  ChevronRight,
  Home,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { ethereumIcon } from "@/config/chainIcons";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ProjectSidebar from "@/components/ProjectSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressDisplay } from "@/components/AddressDisplay";
import { ProjectCard, ProjectCardContent } from "@/components/ui/project-card";
import { ProjectIcon } from "@/components/IpfsImage";
import { useCampaignDetail } from "@/hooks/useCampaignDetail";
import { useFundEventsSubgraph } from "@/hooks/useFundEventsSubgraph";
import { useAddTier, useRemoveTier } from "@/hooks/useCampaignActions";
import {
  CAMPAIGN_STATE_TEXT,
  CAMPAIGN_STATE_COLORS,
  ROUTES,
  BLOCK_EXPLORER_URL,
} from "@/config/constants";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CrowdfundingProjectDetail() {
  const { address } = useParams<{ address: string }>();
  const { address: userAddress } = useConnection();

  // 添加 tier 对话框状态
  const [isAddTierDialogOpen, setIsAddTierDialogOpen] = useState(false);
  const [newTierName, setNewTierName] = useState("");
  const [newTierAmount, setNewTierAmount] = useState("");

  // 获取项目详情
  const { campaign, isLoading, error, refetch } = useCampaignDetail(
    address as `0x${string}`
  );

  // 获取 fund 事件（使用 Etherscan API，支持滚动加载）
  const {
    events: fundEvents,
    totalEvents,
    isLoading: isLoadingEvents,
    isLoadingMore,
    hasMore,
    error: eventsError,
    loadMore,
    refetch: refetchEvents,
  } = useFundEventsSubgraph(address as `0x${string}`, 10); // 每页 10 条

  // Tier 管理 hooks
  const { addTier, isLoading: isAddingTier } = useAddTier(
    address as `0x${string}`
  );
  const { removeTier, isLoading: isRemovingTier } = useRemoveTier(
    address as `0x${string}`
  );

  // 添加 tier 处理函数
  const handleAddTier = async () => {
    if (!newTierName || !newTierAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addTier(newTierName, newTierAmount);
      toast.success("Tier added successfully!");
      setIsAddTierDialogOpen(false);
      setNewTierName("");
      setNewTierAmount("");
      refetch();
    } catch (error: unknown) {
      console.error("Add tier error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add tier";
      toast.error(errorMessage);
    }
  };

  // 删除 tier 处理函数
  const handleRemoveTier = async (tierIndex: number) => {
    if (!confirm("Are you sure you want to remove this tier?")) {
      return;
    }

    try {
      await removeTier(tierIndex);
      toast.success("Tier removed successfully!");
      refetch();
    } catch (error: unknown) {
      console.error("Remove tier error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove tier";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen text="Loading project details..." />
      </Layout>
    );
  }

  if (error || !campaign) {
    return (
      <Layout>
        <ErrorMessage
          message={error?.message || "Project not found"}
          onRetry={refetch}
        />
      </Layout>
    );
  }

  // 计算进度
  const progress =
    campaign.goal > 0n ? Number((campaign.balance * 100n) / campaign.goal) : 0;

  // 计算剩余天数
  const now = Math.floor(Date.now() / 1000);
  const deadline = Number(campaign.deadline);
  const daysLeft = Math.max(0, Math.ceil((deadline - now) / 86400));
  const isActive = campaign.state === 0 && daysLeft > 0;
  const isOwner = userAddress?.toLowerCase() === campaign.owner.toLowerCase();

  return (
    <Layout>
      {/* Breadcrumb Navigation */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          to={ROUTES.HOME}
          className="hover:text-foreground transition-colors flex items-center gap-1 no-underline"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to={ROUTES.PROJECTS}
          className="hover:text-foreground transition-colors no-underline"
        >
          Projects
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {campaign.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectCard>
            <ProjectCardContent className="p-4 md:p-5 relative">
              <div className="absolute top-4 right-4 md:top-5 md:right-5 flex gap-2 z-10">
                <Button variant="outline" size="icon-sm">
                  <Share2 />
                </Button>
                <Button variant="outline" size="icon-sm">
                  <Heart />
                </Button>
              </div>

              <div className="flex items-start gap-4 md:gap-6">
                <div className="shrink-0">
                  <ProjectIcon
                    src={campaign.icon}
                    alt={campaign.name}
                    size="lg"
                  />
                </div>

                <div className="flex-1 min-w-0 pr-16 md:pr-20">
                  <div className="flex items-center gap-2 mb-4 md:gap-3 md:mb-5 flex-wrap">
                    <h1 className="text-xl md:text-3xl font-bold">
                      {campaign.name}
                    </h1>
                    <img
                      src={ethereumIcon}
                      className="w-4 h-4 md:w-5 md:h-5 shrink-0"
                    />
                    <Badge className={CAMPAIGN_STATE_COLORS[campaign.state]}>
                      {CAMPAIGN_STATE_TEXT[campaign.state]}
                    </Badge>
                    {campaign.paused && (
                      <Badge variant="destructive">Paused</Badge>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 text-sm mb-3 md:mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-primary font-semibold">
                        Ξ{formatEther(campaign.balance)}
                      </span>
                      <span className="text-muted-foreground">
                        / Ξ{formatEther(campaign.goal)}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="text-primary font-semibold">
                        {(
                          campaign.backerCount + campaign.customBackerCount
                        ).toString()}{" "}
                      </span>
                      backers
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>
                        Created:{" "}
                        {new Date(
                          Number(campaign.createdAt) * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>Owner by:</span>
                      <AddressDisplay address={campaign.owner} />
                      {isOwner && (
                        <Badge variant="outline" className="text-xs">
                          My Project
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ProjectCardContent>
          </ProjectCard>

          {/* Mobile Sidebar (Visible only on mobile) */}
          <div className="lg:hidden">
            <ProjectSidebar
              campaign={campaign}
              userAddress={userAddress}
              isOwner={isOwner}
              progress={progress}
              daysLeft={daysLeft}
              isActive={isActive}
              onRefetch={refetch}
              onRefetchEvents={() => refetchEvents(true)}
            />
          </div>

          {/* Detail Tabs */}
          <Tabs defaultValue="about" className="space-y-4">
            <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0 gap-6">
              {[
                { value: "about", label: "About" },
                { value: "tiers", label: "Tiers" },
                { value: "events", label: "Fund Events" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="bg-transparent! rounded-none border-x-0 border-t-0 border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent! hover:bg-transparent! px-0 pb-2 data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="about" className="mt-0 px-2">
              <div>
                <MarkdownRenderer
                  content={campaign.description}
                  className="prose-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="tiers" className="space-y-3 mt-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Support Tiers</h3>
                {isOwner && (
                  <Button
                    onClick={() => setIsAddTierDialogOpen(true)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Tier
                  </Button>
                )}
              </div>
              {campaign.tiers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No tiers available
                  {isOwner && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddTierDialogOpen(true)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Your First Tier
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                campaign.tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-300 dark:border-white/12 hover:border-gray-500 dark:hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold">{tier.name}</h4>
                        <span className="font-bold text-primary">
                          Ξ{formatEther(tier.amount)}
                        </span>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveTier(index)}
                          disabled={isRemovingTier}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {tier.backers.toString()} backers for this tier
                      </span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    Fund Events
                    {totalEvents > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({fundEvents.length} / {totalEvents})
                      </span>
                    )}
                  </h3>
                </div>

                {isLoadingEvents ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading events...
                  </div>
                ) : eventsError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive mb-2">
                      Failed to load events
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {eventsError.message}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchEvents(true)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : fundEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No funding events yet
                  </div>
                ) : (
                  <>
                    {/* 限制高度的滚动容器 */}
                    <div
                      className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
                      onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        const bottom =
                          target.scrollHeight - target.scrollTop <=
                          target.clientHeight + 50;
                        if (bottom && hasMore && !isLoadingMore) {
                          loadMore();
                        }
                      }}
                    >
                      {fundEvents.map((event, index) => (
                        <div
                          key={`${event.transactionHash}-${index}`}
                          className="p-4 rounded-lg border border-gray-300 dark:border-white/12 hover:border-gray-500 dark:hover:border-white/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <AddressDisplay address={event.backer} />
                                {event.tierIndex === maxUint256 ? (
                                  <Badge variant="outline">Custom Amount</Badge>
                                ) : (
                                  <Badge variant="outline">
                                    Tier #{event.tierIndex.toString()}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-primary font-semibold">
                                  Ξ{formatEther(event.amount)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Total: Ξ{formatEther(event.totalContribution)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground shrink-0">
                              {event.timestamp ? (
                                <>
                                  <div>
                                    {new Date(
                                      event.timestamp * 1000
                                    ).toLocaleDateString()}
                                  </div>
                                  <div>
                                    {new Date(
                                      event.timestamp * 1000
                                    ).toLocaleTimeString()}
                                  </div>
                                </>
                              ) : (
                                <div>Block #{event.blockNumber.toString()}</div>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <a
                              href={`${BLOCK_EXPLORER_URL}/tx/${event.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline no-underline"
                            >
                              View on Etherscan →
                            </a>
                          </div>
                        </div>
                      ))}

                      {/* 加载更多指示器 */}
                      {isLoadingMore && (
                        <div className="text-center py-4 text-muted-foreground">
                          <div className="inline-flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            Loading more...
                          </div>
                        </div>
                      )}

                      {/* 已加载全部提示 */}
                      {!hasMore &&
                        fundEvents.length > 0 &&
                        totalEvents > 10 && (
                          <div className="text-center py-4 text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-800">
                            All {totalEvents} events loaded
                          </div>
                        )}
                    </div>

                    {/* 手动加载更多按钮（备选方案） */}
                    {hasMore && !isLoadingMore && (
                      <div className="text-center mt-4">
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          className="w-full"
                        >
                          Load More ({totalEvents - fundEvents.length}{" "}
                          remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:block">
          <ProjectSidebar
            campaign={campaign}
            userAddress={userAddress}
            isOwner={isOwner}
            progress={progress}
            daysLeft={daysLeft}
            isActive={isActive}
            onRefetch={refetch}
            onRefetchEvents={() => refetchEvents(true)}
          />
        </div>
      </div>

      {/* Add Tier Dialog */}
      <Dialog
        open={isAddTierDialogOpen}
        onOpenChange={(open) => {
          if (!isAddingTier) {
            setIsAddTierDialogOpen(open);
          }
        }}
      >
        <DialogContent
          onPointerDownOutside={(e) => {
            if (isAddingTier) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (isAddingTier) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Tier</DialogTitle>
            <DialogDescription>
              Create a new support tier for your campaign. Backers can choose to
              fund at this tier level.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tier-name">Tier Name</Label>
              <Input
                id="tier-name"
                placeholder="e.g., Bronze Supporter"
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
                disabled={isAddingTier}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tier-amount">Amount (ETH)</Label>
              <Input
                id="tier-amount"
                type="number"
                step="0.001"
                placeholder="e.g., 0.1"
                value={newTierAmount}
                onChange={(e) => setNewTierAmount(e.target.value)}
                disabled={isAddingTier}
              />
            </div>
            {isAddingTier && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">⏳ Transaction in progress</p>
                <p className="text-xs opacity-80">
                  Please wait for the transaction to complete. Do not close this
                  dialog.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddTierDialogOpen(false)}
              disabled={isAddingTier}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTier} disabled={isAddingTier}>
              {isAddingTier ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                "Add Tier"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
