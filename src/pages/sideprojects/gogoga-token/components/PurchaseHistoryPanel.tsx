import { formatUnits } from "viem";
import { ProjectCard, ProjectCardContent, ProjectCardHeader, ProjectCardTitle } from "@/components/ui/project-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, ExternalLink, AlertCircle } from "lucide-react";
import { AddressDisplay } from "@/components/AddressDisplay";
import { BLOCK_EXPLORER_URL } from "@/config/constants";

type PurchaseEvent = {
  buyer: string;
  ethAmount: bigint;
  tokenAmount: bigint;
  transactionHash: string;
  timestamp: number;
};

type PurchaseHistoryPanelProps = {
  purchaseEvents: {
    events: PurchaseEvent[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    totalEvents: number;
    loadMore: () => void;
    error: Error | null;
  };
  saleAddress?: string;
  decimals: number;
  tokenSymbol?: string;
};

export function PurchaseHistoryPanel({
  purchaseEvents,
  saleAddress,
  decimals,
  tokenSymbol,
}: PurchaseHistoryPanelProps) {
  return (
    <ProjectCard>
      <ProjectCardHeader>
        <ProjectCardTitle>Purchase History</ProjectCardTitle>
        <p className="text-sm text-muted-foreground">
          All token purchase transactions
        </p>
      </ProjectCardHeader>
      <ProjectCardContent>
        {!saleAddress ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Token Sale contract address not configured
            </AlertDescription>
          </Alert>
        ) : purchaseEvents.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : purchaseEvents.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{purchaseEvents.error.message}</AlertDescription>
          </Alert>
        ) : purchaseEvents.events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No purchase records found
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                const bottom =
                  target.scrollHeight - target.scrollTop <=
                  target.clientHeight + 50;
                if (
                  bottom &&
                  purchaseEvents.hasMore &&
                  !purchaseEvents.isLoadingMore
                ) {
                  purchaseEvents.loadMore();
                }
              }}
            >
              {purchaseEvents.events.map((event, index) => (
                <div
                  key={`${event.transactionHash}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-300 dark:border-white/12 hover:border-gray-500 dark:hover:border-white/30 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-green-500" />
                      <AddressDisplay
                        address={event.buyer}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {formatUnits(event.ethAmount, 18)} ETH →{" "}
                        {formatUnits(event.tokenAmount, decimals || 18)}{" "}
                        {tokenSymbol}
                      </span>
                      <span>
                        {new Date(event.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`${BLOCK_EXPLORER_URL}/tx/${event.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 no-underline"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              ))}

              {purchaseEvents.isLoadingMore && (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    Loading more...
                  </div>
                </div>
              )}

              {!purchaseEvents.hasMore &&
                purchaseEvents.events.length > 0 &&
                purchaseEvents.totalEvents > 10 && (
                  <div className="text-center py-4 text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-800">
                    All {purchaseEvents.totalEvents} events loaded
                  </div>
                )}
            </div>

            {purchaseEvents.hasMore && !purchaseEvents.isLoadingMore && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={purchaseEvents.loadMore} className="w-full">
                  Load More (
                  {purchaseEvents.totalEvents - purchaseEvents.events.length}{" "}
                  remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </ProjectCardContent>
    </ProjectCard>
  );
}
