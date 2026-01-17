import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Droplet,
  Clock,
  Gift,
  TrendingUp,
} from "lucide-react";

interface FaucetPanelProps {
  faucetInfo: {
    faucetBalance: string;
    requestAmount: string;
    cooldownTime: number;
    maxClaimPerAddress: string;
    maxClaimPerAddressRaw?: bigint;
    totalDistributed: string;
    isPaused?: boolean;
    refetch: () => void;
  };
  userFaucetInfo: {
    lastRequestTime: number;
    totalClaimed: string;
    timeUntilNext: number;
    canClaim: boolean;
    refetch: () => void;
  };
  remainingClaim: {
    remainingClaim: string;
    remainingClaimRaw?: bigint;
  };
  tokenInfo: {
    symbol: string;
  };
  decimals: number;
  requestTokens: {
    requestTokens: () => void;
    hash?: string;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
  };
  isConnected: boolean;
  onRequestSuccess: () => void;
  lastHandledSuccessHash?: string;
  onSuccessHandled: (hash: string) => void;
}

export function FaucetPanel({
  faucetInfo,
  userFaucetInfo,
  remainingClaim,
  tokenInfo,
  requestTokens,
  isConnected,
  onRequestSuccess,
  lastHandledSuccessHash,
  onSuccessHandled,
}: FaucetPanelProps) {
  // 使用基于实际时间的倒计时，而不是本地 state
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(Date.now() / 1000)
  );

  // 处理成功后的刷新
  useEffect(() => {
    if (
      requestTokens.isSuccess &&
      requestTokens.hash &&
      requestTokens.hash !== lastHandledSuccessHash
    ) {
      onSuccessHandled(requestTokens.hash);
      onRequestSuccess();
    }
  }, [
    requestTokens.isSuccess,
    requestTokens.hash,
    lastHandledSuccessHash,
    onSuccessHandled,
    onRequestSuccess,
  ]);

  // 每秒更新当前时间用于实时计算倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 计算实时倒计时（基于上次请求时间和冷却时间）
  const countdown = useMemo(() => {
    if (
      !userFaucetInfo.lastRequestTime ||
      userFaucetInfo.lastRequestTime === 0
    ) {
      return 0;
    }
    const nextAvailableTime =
      userFaucetInfo.lastRequestTime + faucetInfo.cooldownTime;
    const remaining = nextAvailableTime - currentTime;
    return Math.max(0, remaining);
  }, [userFaucetInfo.lastRequestTime, faucetInfo.cooldownTime, currentTime]);

  const handleRequest = useCallback(() => {
    requestTokens.requestTokens();
  }, [requestTokens]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatCooldownTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
  };

  const hasMaxClaimLimit = Boolean(
    faucetInfo.maxClaimPerAddressRaw && faucetInfo.maxClaimPerAddressRaw > 0n
  );
  const isMaxClaimReached = Boolean(
    hasMaxClaimLimit &&
      remainingClaim.remainingClaimRaw !== undefined &&
      remainingClaim.remainingClaimRaw === 0n
  );

  const canRequest =
    isConnected &&
    !faucetInfo.isPaused &&
    countdown === 0 &&
    !isMaxClaimReached &&
    parseFloat(faucetInfo.faucetBalance) > 0;

  return (
    <div className="space-y-6">
      {/* Faucet 状态信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplet className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              Amount per Request
            </div>
          </div>
          <div className="text-lg font-semibold">
            {faucetInfo.requestAmount} {tokenInfo.symbol}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Cooldown Period</div>
          </div>
          <div className="text-lg font-semibold">
            {formatCooldownTime(faucetInfo.cooldownTime)}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Gift className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Faucet Balance</div>
          </div>
          <div className="text-lg font-semibold">
            {parseFloat(faucetInfo.faucetBalance).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            {tokenInfo.symbol}
          </div>
        </div>
      </div>

      {/* 用户统计信息 */}
      {isConnected && (
        <div
          className={`grid grid-cols-1 gap-4 ${
            hasMaxClaimLimit ? "md:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">
              Your Total Claimed
            </div>
            <div className="text-lg font-semibold">
              {userFaucetInfo.totalClaimed} {tokenInfo.symbol}
            </div>
          </div>

          {hasMaxClaimLimit && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">
                Remaining Claim Limit
              </div>
              <div className="text-lg font-semibold">
                {remainingClaim.remainingClaim ===
                "115792089237316195423570985008687907853269984665640564039457.584007913129639935"
                  ? "Unlimited"
                  : `${remainingClaim.remainingClaim} ${tokenInfo.symbol}`}
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Total Distributed
            </div>
            <div className="text-lg font-semibold">
              {parseFloat(faucetInfo.totalDistributed).toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 2,
                }
              )}{" "}
              {tokenInfo.symbol}
            </div>
          </div>
        </div>
      )}

      {/* 警告和错误信息 */}
      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to request tokens from the faucet
          </AlertDescription>
        </Alert>
      )}

      {faucetInfo.isPaused && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The faucet is currently paused. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isMaxClaimReached && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have reached the maximum claim limit of{" "}
            {faucetInfo.maxClaimPerAddress} {tokenInfo.symbol}
          </AlertDescription>
        </Alert>
      )}

      {isConnected && parseFloat(faucetInfo.faucetBalance) === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The faucet is empty. Please contact the administrator.
          </AlertDescription>
        </Alert>
      )}

      {requestTokens.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {requestTokens.error?.message || "Failed to request tokens"}
          </AlertDescription>
        </Alert>
      )}

      {requestTokens.isSuccess && (
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            Successfully requested {faucetInfo.requestAmount} {tokenInfo.symbol}
            !
          </AlertDescription>
        </Alert>
      )}

      {/* 请求按钮 */}
      <div className="space-y-4">
        <Button
          onClick={handleRequest}
          disabled={
            !canRequest || requestTokens.isPending || requestTokens.isConfirming
          }
          className="w-full"
          size="lg"
        >
          {requestTokens.isPending || requestTokens.isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {requestTokens.isPending && "Confirming..."}
              {requestTokens.isConfirming && "Processing..."}
            </>
          ) : countdown > 0 ? (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Wait {formatTime(countdown)}
            </>
          ) : (
            <>
              <Droplet className="h-4 w-4 mr-2" />
              Request {faucetInfo.requestAmount} {tokenInfo.symbol}
            </>
          )}
        </Button>

        {requestTokens.hash && (
          <p className="text-xs text-center text-muted-foreground">
            Transaction:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${requestTokens.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {requestTokens.hash.slice(0, 10)}...{requestTokens.hash.slice(-8)}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
