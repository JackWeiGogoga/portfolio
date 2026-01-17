import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { AlertCircle, Gift, Loader2 } from "lucide-react";
import { formatErrorMessage } from "../utils";
import { parseUnits } from "viem";

type AirdropPanelProps = {
  airdropInfo: {
    isActive?: boolean;
    isPaused?: boolean;
    remainingBalance: string;
    totalClaimed: string;
    totalClaimCount: number;
  };
  claimStatus: {
    hasClaimed: boolean;
    claimedAmount: string;
  };
  tokenInfo: {
    symbol?: string;
  };
  decimals: number;
  claimAirdrop: {
    claim: (amount: string, merkleProof: string[]) => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    hash?: `0x${string}`;
  };
  isConnected: boolean;
  onClaimSuccess: () => void;
  lastHandledSuccessHash?: string;
  onSuccessHandled: (hash?: string) => void;
};

export function AirdropPanel({
  airdropInfo,
  claimStatus,
  tokenInfo,
  decimals,
  claimAirdrop,
  isConnected,
  onClaimSuccess,
  lastHandledSuccessHash,
  onSuccessHandled,
}: AirdropPanelProps) {
  const [amount, setAmount] = useState("");
  const [proofInput, setProofInput] = useState("");
  const lastSuccessHashRef = useRef<string | undefined>(lastHandledSuccessHash);

  // 使用 useMemo 计算派生状态，避免在 effect 中调用 setState
  const { parsedProof, proofError } = useMemo(() => {
    if (!proofInput.trim()) {
      return { parsedProof: [], proofError: "" };
    }

    try {
      // 尝试解析为 JSON 数组
      const parsed = JSON.parse(proofInput);
      if (Array.isArray(parsed)) {
        // 验证每个元素都是有效的十六进制字符串
        const isValid = parsed.every((item) => {
          if (typeof item !== "string") return false;
          // 检查是否是有效的十六进制字符串
          return /^0x[0-9a-fA-F]{64}$/.test(item);
        });

        if (isValid) {
          return { parsedProof: parsed, proofError: "" };
        } else {
          return {
            parsedProof: [],
            proofError:
              "Invalid proof format. Each proof must be a 32-byte hex string (0x...)",
          };
        }
      } else {
        return { parsedProof: [], proofError: "Proof must be a JSON array" };
      }
    } catch {
      return { parsedProof: [], proofError: "Invalid JSON format" };
    }
  }, [proofInput]);

  const handleClaim = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parsedProof.length === 0) {
      toast.error("Please provide a valid merkle proof");
      return;
    }

    try {
      // 将金额转换为 wei（使用原始的 BigInt 字符串）
      const amountInWei = parseUnits(amount, decimals).toString();
      claimAirdrop.claim(amountInWei, parsedProof);
    } catch (error) {
      toast.error("Invalid amount format");
      console.error(error);
    }
  };

  useEffect(() => {
    if (
      claimAirdrop.isSuccess &&
      claimAirdrop.hash &&
      lastSuccessHashRef.current !== claimAirdrop.hash
    ) {
      lastSuccessHashRef.current = claimAirdrop.hash;
      onSuccessHandled(claimAirdrop.hash);
      toast.success("Airdrop claimed successfully!");
      queueMicrotask(() => {
        setAmount("");
        setProofInput("");
        onClaimSuccess();
      });
    }
  }, [
    claimAirdrop.isSuccess,
    claimAirdrop.hash,
    onClaimSuccess,
    onSuccessHandled,
  ]);

  // 输入框禁用条件：只检查基本状态
  const isInputDisabled =
    !isConnected ||
    claimAirdrop.isPending ||
    claimAirdrop.isConfirming ||
    airdropInfo.isPaused ||
    !airdropInfo.isActive ||
    claimStatus.hasClaimed;

  // 按钮禁用条件：需要检查输入内容
  const isButtonDisabled =
    isInputDisabled || !amount || parsedProof.length === 0;

  return (
    <div className="space-y-6">
      {/* 空投状态信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Remaining</div>
          <div className="text-lg font-semibold">
            {parseFloat(airdropInfo.remainingBalance).toLocaleString()}{" "}
            {tokenInfo.symbol}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">
            Total Claimed
          </div>
          <div className="text-lg font-semibold">
            {parseFloat(airdropInfo.totalClaimed).toLocaleString()}{" "}
            {tokenInfo.symbol}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Total Claims</div>
          <div className="text-lg font-semibold">
            {airdropInfo.totalClaimCount}
          </div>
        </div>
      </div>

      {/* 用户领取状态 */}
      {isConnected && claimStatus.hasClaimed && (
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            You have already claimed {claimStatus.claimedAmount}{" "}
            {tokenInfo.symbol}
          </AlertDescription>
        </Alert>
      )}

      {/* 空投状态警告 */}
      {airdropInfo.isPaused && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Airdrop is currently paused</AlertDescription>
        </Alert>
      )}

      {!airdropInfo.isActive && !airdropInfo.isPaused && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Airdrop is not active</AlertDescription>
        </Alert>
      )}

      {/* 领取表单 */}
      {!claimStatus.hasClaimed && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({tokenInfo.symbol})</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              placeholder={`Enter amount to claim`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isInputDisabled}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Enter the exact amount you are eligible to claim
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Merkle Proof</Label>
            <Textarea
              id="proof"
              placeholder='["0x...", "0x...", "0x..."]'
              value={proofInput}
              onChange={(e) => setProofInput(e.target.value)}
              disabled={isInputDisabled}
              className="font-mono text-sm min-h-[120px]"
            />
            {proofError && (
              <p className="text-xs text-destructive">{proofError}</p>
            )}
            {parsedProof.length > 0 && !proofError && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ Valid proof with {parsedProof.length} element(s)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Paste your merkle proof as a JSON array. Example: ["0x123...",
              "0x456..."]
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleClaim}
            disabled={isButtonDisabled}
          >
            {claimAirdrop.isPending || claimAirdrop.isConfirming ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {claimAirdrop.isPending ? "Confirming..." : "Processing..."}
              </>
            ) : !isConnected ? (
              "Connect Wallet"
            ) : claimStatus.hasClaimed ? (
              "Already Claimed"
            ) : !airdropInfo.isActive ? (
              "Airdrop Not Active"
            ) : airdropInfo.isPaused ? (
              "Airdrop Paused"
            ) : !amount ? (
              "Enter Amount"
            ) : parsedProof.length === 0 ? (
              "Enter Merkle Proof"
            ) : (
              <>
                <Gift className="mr-2 h-5 w-5" />
                Claim Airdrop
              </>
            )}
          </Button>

          {claimAirdrop.isError && (
            <Alert
              variant={
                claimAirdrop.error?.message?.includes("User rejected") ||
                claimAirdrop.error?.message?.includes("User denied")
                  ? "default"
                  : "destructive"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formatErrorMessage(claimAirdrop.error)}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
