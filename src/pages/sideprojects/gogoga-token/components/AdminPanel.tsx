import { useEffect, useRef, useState } from "react";
import { isAddress } from "viem";
import { toast } from "sonner";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ProjectCard,
  ProjectCardContent,
  ProjectCardHeader,
  ProjectCardTitle,
} from "@/components/ui/project-card";
import { Loader2, Pause, Play, X } from "lucide-react";
import { formatNumber } from "../utils";

type SuccessHashes = {
  mint?: string;
  updatePrice?: string;
  updateLimits?: string;
  tokenPause?: string;
  salePause?: string;
  withdrawEth?: string;
  withdrawTokens?: string;
};

type ConfirmDialogState =
  | { type: "mint"; data: { address: string; amount: string } }
  | { type: "withdrawEth"; data: { amount: string } }
  | { type: "withdrawTokens"; data: { amount: string } }
  | {
      type: "pauseToken" | "unpauseToken" | "pauseSale" | "unpauseSale";
      data?: undefined;
    }
  | { type: null; data?: undefined };

type AdminPanelProps = {
  tokenInfo: {
    symbol?: string;
    isPaused: boolean;
    refetch: (...args: never[]) => Promise<unknown>;
  };
  saleInfo: {
    priceInEth: string;
    minPurchase: string;
    maxPurchase: string;
    contractTokenBalance: string;
    isPaused: boolean;
    refetch: (...args: never[]) => Promise<unknown>;
  };
  decimals: number;
  pendingWithdrawals: string;
  tokenMint: {
    mint: (to: string, amount: string, decimals: number) => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    hash?: `0x${string}`;
  };
  tokenPause: {
    pause: () => void;
    unpause: () => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    hash?: `0x${string}`;
  };
  updatePrice: {
    updatePrice: (price: string) => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    hash?: `0x${string}`;
  };
  updateLimits: {
    updateLimits: (min: string, max: string) => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    hash?: `0x${string}`;
  };
  withdrawEth: {
    withdrawEth: () => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    hash?: `0x${string}`;
  };
  withdrawTokens: {
    withdrawTokens: () => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    hash?: `0x${string}`;
  };
  salePause: {
    pause: () => void;
    unpause: () => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    hash?: `0x${string}`;
  };
  onMintSuccess: () => void;
  onPriceUpdateSuccess: () => void;
  onLimitsUpdateSuccess: () => void;
  onTokenPauseSuccess: () => void;
  onSalePauseSuccess: () => void;
  onWithdrawEthSuccess: () => void;
  onWithdrawTokensSuccess: () => void;
  handledHashes: SuccessHashes;
  onSuccessHandled: (key: keyof SuccessHashes, hash?: string) => void;
};

export function AdminPanel({
  tokenInfo,
  saleInfo,
  decimals,
  pendingWithdrawals,
  tokenMint,
  tokenPause,
  updatePrice,
  updateLimits,
  withdrawEth,
  withdrawTokens,
  salePause,
  onMintSuccess,
  onPriceUpdateSuccess,
  onLimitsUpdateSuccess,
  onTokenPauseSuccess,
  onSalePauseSuccess,
  onWithdrawEthSuccess,
  onWithdrawTokensSuccess,
  handledHashes,
  onSuccessHandled,
}: AdminPanelProps) {
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxPurchase, setMaxPurchase] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    type: null,
  });

  const mintIsValidAddress = mintTo.startsWith("0x") && isAddress(mintTo);
  const mintIsEnsName = mintTo.includes(".") && !mintTo.startsWith("0x");

  const { data: mintToEnsName } = useEnsName({
    address: mintIsValidAddress ? (mintTo as `0x${string}`) : undefined,
    chainId: 1,
    query: {
      enabled: mintIsValidAddress,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const { data: mintToEnsAddress } = useEnsAddress({
    name: mintIsEnsName ? mintTo : undefined,
    chainId: 1,
    query: {
      enabled: mintIsEnsName,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const { data: mintToEnsAvatar } = useEnsAvatar({
    name: mintIsEnsName ? mintTo : undefined,
    chainId: 1,
    query: {
      enabled: mintIsEnsName && !!mintToEnsAddress,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const { data: mintToAddressAvatar } = useEnsAvatar({
    name: mintToEnsName || undefined,
    chainId: 1,
    query: {
      enabled: mintIsValidAddress && !!mintToEnsName,
      retry: false,
      staleTime: 1000 * 60 * 60,
    },
  });

  const handledHashesRef = useRef<SuccessHashes>(handledHashes);

  const handleMint = () => {
    if (!mintTo || !mintAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    const actualAddress = mintIsEnsName ? mintToEnsAddress : mintTo;
    if (!actualAddress) {
      toast.error("Invalid address");
      return;
    }
    setConfirmDialog({
      type: "mint",
      data: { address: actualAddress, amount: mintAmount },
    });
  };

  const confirmMint = () => {
    if (confirmDialog.type === "mint" && confirmDialog.data) {
      tokenMint.mint(
        confirmDialog.data.address,
        confirmDialog.data.amount,
        decimals
      );
      setConfirmDialog({ type: null });
    }
  };

  const handleUpdatePrice = () => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    updatePrice.updatePrice(newPrice);
  };

  const handleUpdateLimits = () => {
    if (!minPurchase || !maxPurchase) {
      toast.error("Please fill in all fields");
      return;
    }
    updateLimits.updateLimits(minPurchase, maxPurchase);
  };

  useEffect(() => {
    if (
      tokenMint.isSuccess &&
      tokenMint.hash &&
      handledHashesRef.current.mint !== tokenMint.hash
    ) {
      handledHashesRef.current.mint = tokenMint.hash;
      onSuccessHandled("mint", tokenMint.hash);
      toast.success("Tokens minted successfully!");
      queueMicrotask(() => {
        setMintAmount("");
        onMintSuccess();
      });
    }
  }, [tokenMint.isSuccess, tokenMint.hash, onMintSuccess, onSuccessHandled]);

  useEffect(() => {
    if (
      updatePrice.isSuccess &&
      updatePrice.hash &&
      handledHashesRef.current.updatePrice !== updatePrice.hash
    ) {
      handledHashesRef.current.updatePrice = updatePrice.hash;
      onSuccessHandled("updatePrice", updatePrice.hash);
      toast.success("Price updated successfully!");
      queueMicrotask(() => {
        setNewPrice("");
        onPriceUpdateSuccess();
      });
    }
  }, [
    updatePrice.isSuccess,
    updatePrice.hash,
    onPriceUpdateSuccess,
    onSuccessHandled,
  ]);

  useEffect(() => {
    if (
      updateLimits.isSuccess &&
      updateLimits.hash &&
      handledHashesRef.current.updateLimits !== updateLimits.hash
    ) {
      handledHashesRef.current.updateLimits = updateLimits.hash;
      onSuccessHandled("updateLimits", updateLimits.hash);
      toast.success("Purchase limits updated successfully!");
      queueMicrotask(() => {
        setMinPurchase("");
        setMaxPurchase("");
        onLimitsUpdateSuccess();
      });
    }
  }, [
    updateLimits.isSuccess,
    updateLimits.hash,
    onLimitsUpdateSuccess,
    onSuccessHandled,
  ]);

  useEffect(() => {
    if (
      tokenPause.isSuccess &&
      tokenPause.hash &&
      handledHashesRef.current.tokenPause !== tokenPause.hash
    ) {
      handledHashesRef.current.tokenPause = tokenPause.hash;
      onSuccessHandled("tokenPause", tokenPause.hash);
      toast.success("Token contract state updated!");
      queueMicrotask(() => {
        onTokenPauseSuccess();
      });
    }
  }, [
    tokenPause.isSuccess,
    tokenPause.hash,
    onTokenPauseSuccess,
    onSuccessHandled,
  ]);

  useEffect(() => {
    if (
      salePause.isSuccess &&
      salePause.hash &&
      handledHashesRef.current.salePause !== salePause.hash
    ) {
      handledHashesRef.current.salePause = salePause.hash;
      onSuccessHandled("salePause", salePause.hash);
      toast.success("Token sale state updated!");
      queueMicrotask(() => {
        onSalePauseSuccess();
      });
    }
  }, [
    salePause.isSuccess,
    salePause.hash,
    onSalePauseSuccess,
    onSuccessHandled,
  ]);

  useEffect(() => {
    if (
      withdrawEth.isSuccess &&
      withdrawEth.hash &&
      handledHashesRef.current.withdrawEth !== withdrawEth.hash
    ) {
      handledHashesRef.current.withdrawEth = withdrawEth.hash;
      onSuccessHandled("withdrawEth", withdrawEth.hash);
      toast.success("ETH withdrawn successfully!");
      queueMicrotask(() => {
        onWithdrawEthSuccess();
      });
    }
  }, [
    withdrawEth.isSuccess,
    withdrawEth.hash,
    onWithdrawEthSuccess,
    onSuccessHandled,
  ]);

  useEffect(() => {
    if (
      withdrawTokens.isSuccess &&
      withdrawTokens.hash &&
      handledHashesRef.current.withdrawTokens !== withdrawTokens.hash
    ) {
      handledHashesRef.current.withdrawTokens = withdrawTokens.hash;
      onSuccessHandled("withdrawTokens", withdrawTokens.hash);
      toast.success("Tokens withdrawn successfully!");
      queueMicrotask(() => {
        onWithdrawTokensSuccess();
      });
    }
  }, [
    withdrawTokens.isSuccess,
    withdrawTokens.hash,
    onWithdrawTokensSuccess,
    onSuccessHandled,
  ]);

  return (
    <div className="space-y-6">
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle>Token Management</ProjectCardTitle>
          <p className="text-sm text-muted-foreground">
            Owner-only functions for token contract
          </p>
        </ProjectCardHeader>
        <ProjectCardContent className="space-y-6">
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold">Mint New Tokens</h3>
            <div className="space-y-2">
              <Label htmlFor="mintTo">Recipient Address</Label>
              <div className="relative">
                <Input
                  id="mintTo"
                  placeholder="0x... or ENS name (e.g., vitalik.eth)"
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  className="pr-9"
                />
                {mintTo && (
                  <button
                    type="button"
                    onClick={() => setMintTo("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {mintTo && (
                <>
                  {mintIsValidAddress && mintToEnsName && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                      {mintToAddressAvatar && (
                        <img
                          src={mintToAddressAvatar}
                          alt={mintToEnsName}
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
                          {mintToEnsName}
                        </div>
                      </div>
                    </div>
                  )}
                  {mintIsEnsName && mintToEnsAddress && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                      {mintToEnsAvatar && (
                        <img
                          src={mintToEnsAvatar}
                          alt={mintTo}
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
                          {mintToEnsAddress.slice(0, 6)}...
                          {mintToEnsAddress.slice(-4)}
                        </code>
                      </div>
                    </div>
                  )}
                  {mintIsEnsName && mintTo.length > 3 && !mintToEnsAddress && (
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
              <Label htmlFor="mintAmount">Amount</Label>
              <Input
                id="mintAmount"
                type="number"
                step="0.01"
                placeholder="1000"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={handleMint}
              disabled={
                !mintTo ||
                !mintAmount ||
                tokenMint.isPending ||
                tokenMint.isConfirming ||
                (mintIsEnsName && !mintToEnsAddress) ||
                (!mintIsValidAddress && !mintIsEnsName)
              }
              className="w-full"
            >
              {tokenMint.isPending || tokenMint.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                "Mint Tokens"
              )}
            </Button>

            <AlertDialog
              open={confirmDialog.type === "mint"}
              onOpenChange={(open) => {
                if (!open) setConfirmDialog({ type: null });
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mint New Tokens</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mint{" "}
                    <span className="font-semibold text-foreground">
                      {confirmDialog.type === "mint" &&
                        confirmDialog.data?.amount}{" "}
                      {tokenInfo.symbol}
                    </span>{" "}
                    to{" "}
                    <span className="font-mono text-xs text-foreground">
                      {confirmDialog.type === "mint" &&
                        confirmDialog.data?.address}
                    </span>
                    ? This will increase the total supply.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmMint}>
                    Confirm Mint
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Pause Token Transfers</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ type: "pauseToken" })}
                disabled={
                  tokenInfo.isPaused ||
                  tokenPause.isPending ||
                  tokenPause.isConfirming
                }
                className="flex-1"
              >
                {tokenPause.isPending || tokenPause.isConfirming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Pause className="mr-2 h-4 w-4" />
                )}
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ type: "unpauseToken" })}
                disabled={
                  !tokenInfo.isPaused ||
                  tokenPause.isPending ||
                  tokenPause.isConfirming
                }
                className="flex-1"
              >
                {tokenPause.isPending || tokenPause.isConfirming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Unpause
              </Button>
            </div>

            <AlertDialog
              open={confirmDialog.type === "pauseToken"}
              onOpenChange={(open) => {
                if (!open) setConfirmDialog({ type: null });
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause Token Transfers</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to pause all token transfers? Users
                    will not be able to transfer tokens until you unpause.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      tokenPause.pause();
                      setConfirmDialog({ type: null });
                    }}
                  >
                    Pause
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={confirmDialog.type === "unpauseToken"}
              onOpenChange={(open) => {
                if (!open) setConfirmDialog({ type: null });
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resume Token Transfers</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to resume token transfers? Users will
                    be able to transfer tokens again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      tokenPause.unpause();
                      setConfirmDialog({ type: null });
                    }}
                  >
                    Resume
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ProjectCardContent>
      </ProjectCard>

      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle>Sale Management</ProjectCardTitle>
          <p className="text-sm text-muted-foreground">
            Owner-only functions for token sale contract
          </p>
        </ProjectCardHeader>
        <ProjectCardContent className="space-y-6">
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold">Update Token Price</h3>
            <div className="space-y-2">
              <Label htmlFor="newPrice">New Price (ETH)</Label>
              <Input
                id="newPrice"
                type="number"
                step="0.000001"
                placeholder={saleInfo.priceInEth}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Current: {formatNumber(saleInfo.priceInEth, 6)} ETH
              </p>
            </div>
            <Button
              onClick={handleUpdatePrice}
              disabled={
                !newPrice || updatePrice.isPending || updatePrice.isConfirming
              }
              className="w-full"
            >
              {updatePrice.isPending || updatePrice.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Price"
              )}
            </Button>
          </div>

          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold">Update Purchase Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Min (ETH)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  step="0.001"
                  placeholder={saleInfo.minPurchase}
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPurchase">Max (ETH)</Label>
                <Input
                  id="maxPurchase"
                  type="number"
                  step="0.1"
                  placeholder={saleInfo.maxPurchase}
                  value={maxPurchase}
                  onChange={(e) => setMaxPurchase(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Current: {saleInfo.minPurchase} - {saleInfo.maxPurchase} ETH
            </p>
            <Button
              onClick={handleUpdateLimits}
              disabled={
                !minPurchase ||
                !maxPurchase ||
                updateLimits.isPending ||
                updateLimits.isConfirming
              }
              className="w-full"
            >
              {updateLimits.isPending || updateLimits.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Limits"
              )}
            </Button>
          </div>

          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold">Withdraw ETH</h3>
            <p className="text-sm text-muted-foreground">
              Pending withdrawals: {formatNumber(pendingWithdrawals, 6)} ETH
            </p>
            <Button
              onClick={() =>
                setConfirmDialog({
                  type: "withdrawEth",
                  data: { amount: pendingWithdrawals },
                })
              }
              disabled={
                parseFloat(pendingWithdrawals) === 0 ||
                withdrawEth.isPending ||
                withdrawEth.isConfirming
              }
              className="w-full"
            >
              {withdrawEth.isPending || withdrawEth.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw ETH"
              )}
            </Button>

            <AlertDialog
              open={confirmDialog.type === "withdrawEth"}
              onOpenChange={(open) => {
                if (!open) setConfirmDialog({ type: null });
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Withdraw ETH</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to withdraw{" "}
                    <span className="font-semibold text-foreground">
                      {confirmDialog.type === "withdrawEth" &&
                        formatNumber(confirmDialog.data?.amount, 6)}{" "}
                      ETH
                    </span>{" "}
                    from the contract? This will transfer the funds to your
                    wallet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      withdrawEth.withdrawEth();
                      setConfirmDialog({ type: null });
                    }}
                  >
                    Confirm Withdraw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold">Withdraw Remaining Tokens</h3>
            <p className="text-sm text-muted-foreground">
              Available: {formatNumber(saleInfo.contractTokenBalance)}{" "}
              {tokenInfo.symbol}
            </p>
            <Button
              onClick={() =>
                setConfirmDialog({
                  type: "withdrawTokens",
                  data: { amount: saleInfo.contractTokenBalance },
                })
              }
              disabled={
                parseFloat(saleInfo.contractTokenBalance) === 0 ||
                withdrawTokens.isPending ||
                withdrawTokens.isConfirming
              }
              className="w-full"
            >
              {withdrawTokens.isPending || withdrawTokens.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw Tokens"
              )}
            </Button>

            <AlertDialog
              open={confirmDialog.type === "withdrawTokens"}
              onOpenChange={(open) => {
                if (!open) setConfirmDialog({ type: null });
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Withdraw Remaining Tokens</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to withdraw{" "}
                    <span className="font-semibold text-foreground">
                      {confirmDialog.type === "withdrawTokens" &&
                        formatNumber(confirmDialog.data?.amount)}{" "}
                      {tokenInfo.symbol}
                    </span>{" "}
                    from the contract? This will transfer all remaining tokens
                    to your wallet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      withdrawTokens.withdrawTokens();
                      setConfirmDialog({ type: null });
                    }}
                  >
                    Confirm Withdraw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Pause Token Sale</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ type: "pauseSale" })}
                disabled={
                  saleInfo.isPaused ||
                  salePause.isPending ||
                  salePause.isConfirming
                }
                className="flex-1"
              >
                {salePause.isPending || salePause.isConfirming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Pause className="mr-2 h-4 w-4" />
                )}
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ type: "unpauseSale" })}
                disabled={
                  !saleInfo.isPaused ||
                  salePause.isPending ||
                  salePause.isConfirming
                }
                className="flex-1"
              >
                {salePause.isPending || salePause.isConfirming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Unpause
              </Button>
            </div>

            <AlertDialog
              open={confirmDialog.type === "pauseSale"}
              onOpenChange={(open) => {
                if (!open) setConfirmDialog({ type: null });
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Pause Token Sale</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to pause the token sale? Users will
                    not be able to purchase tokens until you unpause.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      salePause.pause();
                      setConfirmDialog({ type: null });
                    }}
                  >
                    Pause Sale
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={confirmDialog.type === "unpauseSale"}
              onOpenChange={(open) => {
                if (!open) setConfirmDialog({ type: null });
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resume Token Sale</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to resume the token sale? Users will
                    be able to purchase tokens again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      salePause.unpause();
                      setConfirmDialog({ type: null });
                    }}
                  >
                    Resume Sale
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    </div>
  );
}
