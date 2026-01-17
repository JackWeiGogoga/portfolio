import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage, { EmptyState } from "@/components/ErrorMessage";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampaigns } from "@/hooks/useCampaigns";
import { SortBy } from "@/types";

// Number of items to load per batch
const ITEMS_PER_LOAD = 12;

export default function CrowdfundingProject() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Get all campaigns (no pagination in hook)
  const {
    campaigns: allCampaigns,
    totalCount,
    isLoading,
    error,
    refetch,
  } = useCampaigns({
    search: searchQuery,
    sortBy,
  });

  // Displayed campaigns based on displayCount
  const campaigns = allCampaigns.slice(0, displayCount);
  const hasMore = displayCount < totalCount;

  // Determine if we should show loading
  const shouldShowLoading = isLoading;

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setDisplayCount(ITEMS_PER_LOAD); // Reset display count
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value as SortBy);
    setDisplayCount(ITEMS_PER_LOAD); // Reset display count
  };

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_LOAD, totalCount));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, isLoading, totalCount]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore]);

  return (
    <Layout variant="crowdfunding">
      {/* Page Title and Create Button */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight font-mono">
            Crowdfunding Projects
          </h1>
          <p className="text-base text-muted-foreground font-mono">
            Discover interesting projects and support creative ideas you love
          </p>
        </div>

        {/* Create Project Modal */}
        <CreateCampaignModal onSuccess={refetch} />
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-3">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search project name or description..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Sort Tabs with counter */}
        <div className="flex items-center justify-between">
          <Tabs value={sortBy} onValueChange={handleSortChange}>
            <TabsList>
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="endingSoon">Ending Soon</TabsTrigger>
              <TabsTrigger value="mostFunded">Most Funded</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Project List */}
      {shouldShowLoading && campaigns.length === 0 ? (
        <LoadingSpinner text="Loading projects..." />
      ) : error ? (
        <ErrorMessage
          message={error.message || "Failed to load projects"}
          onRetry={refetch}
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No Projects"
          description={
            searchQuery
              ? "No matching projects found, try other keywords"
              : "No crowdfunding projects yet"
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {campaigns.map((campaign) => (
              <ProjectCard key={campaign.address} campaign={campaign} />
            ))}
          </div>

          {/* Load More Trigger */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="mt-8 flex items-center justify-center py-8"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading more projects...</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="min-w-[200px]"
                >
                  Load More Projects
                </Button>
              )}
            </div>
          )}

          {/* Show total count */}
          {!hasMore && campaigns.length > 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing all {totalCount} project{totalCount !== 1 ? "s" : ""}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
