import { formatUnits } from "viem";
import { ProjectCard, ProjectCardContent, ProjectCardHeader, ProjectCardTitle } from "@/components/ui/project-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDownLeft, ArrowUpRight, ExternalLink, Loader2 } from "lucide-react";
import { AddressDisplay } from "@/components/AddressDisplay";
import { BLOCK_EXPLORER_URL } from "@/config/constants";

type TransferEvent = {
  from: string;
  to: string;
  value: bigint;
  transactionHash: string;
  timestamp?: number;
};

type TransferHistoryPanelProps = {
  transferEvents: {
    events: TransferEvent[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    totalEvents: number;
    loadMore: () => void;
    error: Error | null;
  };
  isConnected: boolean;
  tokenAddress?: string;
  address?: string;
  decimals: number;
  tokenSymbol?: string;
};

export function TransferHistoryPanel({
  transferEvents,
  isConnected,
  tokenAddress,
  address,
  decimals,
  tokenSymbol,
}: TransferHistoryPanelProps) {
  return (
    <ProjectCard>
      <ProjectCardHeader>
        <ProjectCardTitle>Transfer History</ProjectCardTitle>
        <p className="text-sm text-muted-foreground">
          Your token transfer transactions
        </p>
      </ProjectCardHeader>
      <ProjectCardContent>
        {!isConnected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to view transfer history
            </AlertDescription>
          </Alert>
        ) : !tokenAddress ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Token contract address not configured
            </AlertDescription>
          </Alert>
        ) : transferEvents.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : transferEvents.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{transferEvents.error.message}</AlertDescription>
          </Alert>
        ) : transferEvents.events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transfer records found
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
                  transferEvents.hasMore &&
                  !transferEvents.isLoadingMore
                ) {
                  transferEvents.loadMore();
                }
              }}
            >
              {transferEvents.events.map((event, index) => {
                const isSent =
                  event.from.toLowerCase() === address?.toLowerCase();
                return (
                  <div
                    key={`${event.transactionHash}-${index}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-300 dark:border-white/12 hover:border-gray-500 dark:hover:border-white/30 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {isSent ? (
                          <>
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">
                              Sent to
                            </span>
                            <AddressDisplay
                              address={event.to}
                              className="font-mono text-sm"
                            />
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">
                              Received from
                            </span>
                            <AddressDisplay
                              address={event.from}
                              className="font-mono text-sm"
                            />
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className={isSent ? "text-red-500" : "text-green-500"}>
                          {isSent ? "-" : "+"}
                          {formatUnits(event.value, decimals || 18)} {tokenSymbol}
                        </span>
                        {event.timestamp && (
                          <span>
                            {new Date(event.timestamp * 1000).toLocaleString()}
                          </span>
                        )}
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
                );
              })}

              {transferEvents.isLoadingMore && (
                <div className="text-center py-4 text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    Loading more...
                  </div>
                </div>
              )}

              {!transferEvents.hasMore &&
                transferEvents.events.length > 0 &&
                transferEvents.totalEvents > 10 && (
                  <div className="text-center py-4 text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-800">
                    All {transferEvents.totalEvents} events loaded
                  </div>
                )}
            </div>

            {transferEvents.hasMore && !transferEvents.isLoadingMore && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={transferEvents.loadMore} className="w-full">
                  Load More ({transferEvents.totalEvents - transferEvents.events.length} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </ProjectCardContent>
    </ProjectCard>
  );
}
