import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { Loader2 } from "lucide-react";
import { Address } from "viem";
import { useBackTier, useBackCustom } from "@/hooks/useCampaignActions";
import { Tier } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface BackProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignAddress: Address;
  campaignName: string;
  tiers: Tier[];
  allowCustomAmount: boolean;
  minContribution: bigint;
  onSuccess?: () => void;
  onRefetchEvents?: () => void;
}

export default function BackProjectDialog({
  open,
  onOpenChange,
  campaignAddress,
  campaignName,
  tiers,
  allowCustomAmount,
  minContribution,
  onSuccess,
  onRefetchEvents,
}: BackProjectDialogProps) {
  // 计算初始的 backType
  const getInitialBackType = () => {
    return tiers.length > 0 ? "tier" : "custom";
  };

  const [selectedTier, setSelectedTier] = useState<number | null>(
    tiers.length > 0 ? 0 : null
  );
  const [customAmount, setCustomAmount] = useState("");
  const [backType, setBackType] = useState<"tier" | "custom">(
    getInitialBackType()
  );

  const { toast } = useToast();

  // 当弹窗关闭时，重置状态到初始值
  useEffect(() => {
    if (!open) {
      setSelectedTier(tiers.length > 0 ? 0 : null);
      setCustomAmount("");
      setBackType(getInitialBackType());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const { backTier, isLoading: isBackingTier } = useBackTier(campaignAddress);
  const { backCustom, isLoading: isBackingCustom } =
    useBackCustom(campaignAddress);

  const isLoading = isBackingTier || isBackingCustom;

  const handleBack = async () => {
    try {
      if (backType === "tier") {
        if (selectedTier === null) {
          toast({
            variant: "destructive",
            title: "Please Select a Tier",
            description: "Please select a support tier",
          });
          return;
        }

        const tier = tiers[selectedTier];

        // 显示交易进行中的提示
        toast({
          variant: "info",
          title: "Transaction Pending",
          description: "Please confirm the transaction in your wallet...",
        });

        await backTier(selectedTier, formatEther(tier.amount));

        // 交易已确认，显示成功提示
        toast({
          variant: "success",
          title: "Backing Successful! ✅",
          description: `Successfully backed ${tier.name}. The page data will refresh shortly.`,
        });
      } else {
        if (!customAmount || parseFloat(customAmount) <= 0) {
          toast({
            variant: "destructive",
            title: "Please Enter Amount",
            description: "Please enter a valid backing amount",
          });
          return;
        }

        const minAmount = parseFloat(formatEther(minContribution));
        if (parseFloat(customAmount) < minAmount) {
          toast({
            variant: "destructive",
            title: "Amount Too Small",
            description: `Minimum backing amount is ${minAmount} ETH`,
          });
          return;
        }

        // 显示交易进行中的提示
        toast({
          variant: "info",
          title: "Transaction Pending",
          description: "Please confirm the transaction in your wallet...",
        });

        await backCustom(customAmount);

        // 交易已确认，显示成功提示
        toast({
          variant: "success",
          title: "Backing Successful! ✅",
          description: `Successfully backed ${customAmount} ETH. The page data will refresh shortly.`,
        });
      }

      onOpenChange(false);
      // 🔥 关键：交易确认后才调用刷新
      onSuccess?.();
      // 🔥 强制刷新 event 缓存
      onRefetchEvents?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Backing Failed",
        description: message || "Transaction failed, please try again",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // 只有在非加载状态时才允许关闭
        if (!isLoading) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // 交易进行中时阻止点击外部关闭
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // 交易进行中时阻止 ESC 键关闭
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Back Project</DialogTitle>
          <DialogDescription>
            Support <span className="font-semibold">{campaignName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 选择支持方式 */}
          <RadioGroup
            value={backType}
            onValueChange={(value) => setBackType(value as "tier" | "custom")}
            disabled={isLoading}
          >
            {/* 只有在有 tiers 时才显示 tier 选项 */}
            {tiers.length > 0 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tier" id="tier" disabled={isLoading} />
                <Label htmlFor="tier" className={isLoading ? "opacity-50" : ""}>
                  Select Tier
                </Label>
              </div>
            )}
            {allowCustomAmount && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="custom"
                  id="custom"
                  disabled={isLoading}
                />
                <Label
                  htmlFor="custom"
                  className={isLoading ? "opacity-50" : ""}
                >
                  Custom Amount
                </Label>
              </div>
            )}
          </RadioGroup>

          {backType === "tier" && (
            <div className="space-y-3">
              {tiers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tiers available
                </p>
              ) : (
                <RadioGroup
                  value={selectedTier?.toString() ?? ""}
                  onValueChange={(value) => setSelectedTier(parseInt(value))}
                  disabled={isLoading}
                >
                  {tiers.map((tier, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 rounded-lg border p-4 ${
                        isLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-accent cursor-pointer"
                      }`}
                      onClick={() => !isLoading && setSelectedTier(index)}
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`tier-${index}`}
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`tier-${index}`}
                          className={
                            isLoading
                              ? "cursor-not-allowed"
                              : "cursor-pointer block w-full"
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{tier.name}</div>
                            <div className="text-primary font-bold">
                              {formatEther(tier.amount)} ETH
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}

          {backType === "custom" && (
            <div className="space-y-3">
              <Label htmlFor="custom-amount">Backing Amount (ETH)</Label>
              <Input
                id="custom-amount"
                type="number"
                step="0.001"
                min={formatEther(minContribution)}
                placeholder={`Minimum ${formatEther(minContribution)} ETH`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Minimum backing amount: {formatEther(minContribution)} ETH
              </p>
            </div>
          )}

          {isLoading && (
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
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleBack} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Confirming Transaction..." : "Confirm Backing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
