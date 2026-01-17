import {
  ProjectCard,
  ProjectCardContent,
} from "@/components/ui/project-card";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "@/components/AddressDisplay";
import { GOGOGA_TOKEN_ADDRESS } from "@/config/contracts";
import { ProjectIcon } from "@/components/IpfsImage";
import { formatNumber } from "../utils";

type TokenInfoCardProps = {
  tokenInfo: {
    name?: string;
    symbol?: string;
    totalSupply: string;
    isPaused: boolean;
  };
  saleInfo: {
    priceInEth: string;
    totalSold: string;
    totalRaised: string;
    isPaused: boolean;
  };
  userBalance: string;
  isConnected: boolean;
  isOwner: boolean;
};

export function TokenInfoCard({
  tokenInfo,
  saleInfo,
  userBalance,
  isConnected,
  isOwner,
}: TokenInfoCardProps) {
  return (
    <ProjectCard className="mb-4">
      <ProjectCardContent>
        <div className="flex items-start gap-4 md:gap-6">
          <div className="shrink-0">
            <ProjectIcon
              src="https://euc.li/gogoga.eth"
              alt={tokenInfo.name || "Gogoga Token"}
              size="lg"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
              <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                {tokenInfo.name || "Gogoga Token"}
              </h1>
              <Badge
                variant={tokenInfo.isPaused ? "destructive" : "default"}
                className="text-xs"
              >
                {tokenInfo.isPaused ? "Paused" : "Active"}
              </Badge>
              {saleInfo.isPaused && (
                <Badge variant="secondary" className="text-xs">
                  Sale Paused
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              ERC20 token with sale functionality - A demo project showcasing
              token economics
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Total Supply
                </div>
                <div className="font-bold text-sm md:text-base">
                  {formatNumber(tokenInfo.totalSupply)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tokenInfo.symbol}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Token Price
                </div>
                <div className="font-bold text-sm md:text-base text-primary">
                  Ξ{formatNumber(saleInfo.priceInEth, 6)}
                </div>
                <div className="text-xs text-muted-foreground">
                  per {tokenInfo.symbol}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Total Sold
                </div>
                <div className="font-bold text-sm md:text-base">
                  {formatNumber(saleInfo.totalSold)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Raised: Ξ{formatNumber(saleInfo.totalRaised, 4)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Your Balance
                </div>
                <div className="font-bold text-sm md:text-base">
                  {isConnected ? formatNumber(userBalance) : "0"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tokenInfo.symbol}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground">Token Contract:</span>
              <AddressDisplay address={GOGOGA_TOKEN_ADDRESS} />
              {isOwner && (
                <Badge variant="outline" className="text-xs">
                  Owner
                </Badge>
              )}
            </div>
          </div>
        </div>
      </ProjectCardContent>
    </ProjectCard>
  );
}
