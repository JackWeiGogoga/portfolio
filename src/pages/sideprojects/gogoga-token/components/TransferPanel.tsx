import { useEffect, useRef, useState } from "react";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { isAddress } from "viem";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Send, X } from "lucide-react";
import { formatNumber, formatErrorMessage } from "../utils";

type TransferPanelProps = {
  tokenInfo: {
    symbol?: string;
    isPaused: boolean;
  };
  userBalance: string;
  tokenTransfer: {
    transfer: (to: string, amount: string, decimals: number) => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    hash?: `0x${string}`;
  };
  decimals: number;
  isConnected: boolean;
  onTransferSuccess: () => void;
  lastHandledSuccessHash?: string;
  onSuccessHandled: (hash?: string) => void;
};

export function TransferPanel({
  tokenInfo,
  userBalance,
  tokenTransfer,
  decimals,
  isConnected,
  onTransferSuccess,
  lastHandledSuccessHash,
  onSuccessHandled,
}: TransferPanelProps) {
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const isValidAddress = transferTo.startsWith("0x") && isAddress(transferTo);
  const isEnsName = transferTo.includes(".") && !transferTo.startsWith("0x");
  const handledHashRef = useRef<string | undefined>(lastHandledSuccessHash);

  const { data: transferToEnsName } = useEnsName({
    address: isValidAddress ? (transferTo as `0x${string}`) : undefined,
    chainId: 1,
    query: {
      enabled: isValidAddress,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const { data: transferToEnsAddress } = useEnsAddress({
    name: isEnsName ? transferTo : undefined,
    chainId: 1,
    query: {
      enabled: isEnsName,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const { data: transferToEnsAvatar } = useEnsAvatar({
    name: isEnsName ? transferTo : undefined,
    chainId: 1,
    query: {
      enabled: isEnsName && !!transferToEnsAddress,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const { data: transferToAddressAvatar } = useEnsAvatar({
    name: transferToEnsName || undefined,
    chainId: 1,
    query: {
      enabled: isValidAddress && !!transferToEnsName,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const handleTransfer = () => {
    if (!transferTo || !transferAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    const actualAddress = transferToEnsAddress || transferTo;
    tokenTransfer.transfer(actualAddress, transferAmount, decimals);
  };

  useEffect(() => {
    if (
      tokenTransfer.isSuccess &&
      tokenTransfer.hash &&
      handledHashRef.current !== tokenTransfer.hash
    ) {
      handledHashRef.current = tokenTransfer.hash;
      onSuccessHandled(tokenTransfer.hash);
      toast.success("Transfer successful!");
      queueMicrotask(() => {
        setTransferAmount("");
        onTransferSuccess();
      });
    }
  }, [
    tokenTransfer.isSuccess,
    tokenTransfer.hash,
    onTransferSuccess,
    onSuccessHandled,
  ]);

  return (
    <div className="space-y-4">
      {tokenInfo.isPaused && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Token transfers are currently paused
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="transferTo">Recipient Address</Label>
        <div className="relative">
          <Input
            id="transferTo"
            placeholder="0x... or ENS name (e.g., vitalik.eth)"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            disabled={!isConnected || tokenInfo.isPaused}
            className="pr-9"
          />
          {transferTo && (
            <button
              type="button"
              onClick={() => setTransferTo("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={!isConnected || tokenInfo.isPaused}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {transferTo && (
          <>
            {isValidAddress && transferToEnsName && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                {transferToAddressAvatar && (
                  <img
                    src={transferToAddressAvatar}
                    alt={transferToEnsName}
                    className="w-10 h-10 rounded-full border-2 border-primary/20"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    ENS Name
                  </div>
                  <div className="text-sm font-medium text-primary">
                    {transferToEnsName}
                  </div>
                </div>
              </div>
            )}
            {isEnsName && transferToEnsAddress && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                {transferToEnsAvatar && (
                  <img
                    src={transferToEnsAvatar}
                    alt={transferTo}
                    className="w-10 h-10 rounded-full border-2 border-primary/20"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Resolved to
                  </div>
                  <code className="text-sm font-medium text-primary">
                    {transferToEnsAddress}
                  </code>
                </div>
              </div>
            )}
            {isEnsName && transferTo.length > 3 && !transferToEnsAddress && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Resolving ENS name...
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transferAmount">Amount</Label>
        <Input
          id="transferAmount"
          type="number"
          step="0.01"
          placeholder="100"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          disabled={!isConnected || tokenInfo.isPaused}
        />
        <p className="text-sm text-muted-foreground">
          Your balance: {formatNumber(userBalance)} {tokenInfo.symbol}
        </p>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleTransfer}
        disabled={
          !isConnected ||
          !transferTo ||
          !transferAmount ||
          tokenTransfer.isPending ||
          tokenTransfer.isConfirming ||
          tokenInfo.isPaused ||
          (isEnsName && !transferToEnsAddress) ||
          (!isValidAddress && !isEnsName)
        }
      >
        {tokenTransfer.isPending || tokenTransfer.isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {tokenTransfer.isPending ? "Confirming..." : "Processing..."}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Transfer
          </>
        )}
      </Button>

      {tokenTransfer.isError && (
        <Alert
          variant={
            tokenTransfer.error?.message?.includes("User rejected") ||
            tokenTransfer.error?.message?.includes("User denied")
              ? "default"
              : "destructive"
          }
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {formatErrorMessage(tokenTransfer.error)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
