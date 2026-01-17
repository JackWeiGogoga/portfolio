import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, ArrowDown, Loader2 } from "lucide-react";
import ethImg from "@/assets/icons/eth.svg";
import gogogaImg from "@/assets/icons/gogoga.png";
import { ProjectIcon } from "@/components/IpfsImage";
import { formatPrice } from "@/hooks/useCoinGeckoPrice";
import { formatNumber, formatErrorMessage } from "../utils";

type BuyTokensPanelProps = {
  saleInfo: {
    priceInEth: string;
    priceInEthRaw?: bigint;
    minPurchase: string;
    maxPurchase: string;
    contractTokenBalance: string;
    contractTokenBalanceRaw?: bigint;
    tokenDecimals?: number;
    isPaused: boolean;
  };
  tokenInfo: {
    symbol?: string;
  };
  ethBalance?: {
    value?: bigint;
  };
  ethPriceUsd?: number;
  isPriceLoading: boolean;
  decimals: number;
  buyTokens: {
    buyTokens: (ethAmount: string) => void;
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    hash?: `0x${string}`;
  };
  isConnected: boolean;
  onPurchaseSuccess: () => void;
  shouldAutoFocus: boolean;
  lastHandledSuccessHash?: string;
  onSuccessHandled: (hash?: string) => void;
};

export function BuyTokensPanel({
  saleInfo,
  tokenInfo,
  ethBalance,
  ethPriceUsd,
  isPriceLoading,
  buyTokens,
  isConnected,
  onPurchaseSuccess,
  shouldAutoFocus,
  lastHandledSuccessHash,
  onSuccessHandled,
}: BuyTokensPanelProps) {
  const [buyEthAmount, setBuyEthAmount] = useState("");
  const [buyTokenAmount, setBuyTokenAmount] = useState("");
  const [focusedInput, setFocusedInput] = useState<"sell" | "buy" | null>(null);
  const [isHoveringSell, setIsHoveringSell] = useState(false);
  const [isHoveringBuy, setIsHoveringBuy] = useState(false);
  const [activeSection, setActiveSection] = useState<"sell" | "buy" | null>(
    null
  );
  const [isSellExceeded, setIsSellExceeded] = useState(false);
  const [isBuyExceeded, setIsBuyExceeded] = useState(false);
  const [isUnderMin, setIsUnderMin] = useState(false);
  const [isOverMax, setIsOverMax] = useState(false);
  const [lastFocusedInput, setLastFocusedInput] = useState<
    "sell" | "buy" | null
  >(shouldAutoFocus && !saleInfo.isPaused ? "sell" : null);
  const sellInputRef = useRef<HTMLInputElement>(null);
  const buyInputRef = useRef<HTMLInputElement>(null);
  const lastSuccessHashRef = useRef<string | undefined>(lastHandledSuccessHash);

  // 当 shouldAutoFocus 变化时（例如切换 tab），同步聚焦输入框
  useLayoutEffect(() => {
    if (shouldAutoFocus && sellInputRef.current && !saleInfo.isPaused) {
      // 使用 requestAnimationFrame 确保在下一帧聚焦，避免阻塞渲染
      requestAnimationFrame(() => {
        sellInputRef.current?.focus();
      });
    }
  }, [shouldAutoFocus, saleInfo.isPaused]);

  const getBackgroundClass = (section: "sell" | "buy") => {
    const isHovering = section === "sell" ? isHoveringSell : isHoveringBuy;
    const activeInput = focusedInput || lastFocusedInput;

    // 当前输入框获得焦点时，保持透明
    if (focusedInput === section) {
      return "bg-transparent";
    }

    // 鼠标悬停时，如果没有焦点且不是最后聚焦的输入框
    if (isHovering && !focusedInput && activeInput !== section) {
      return "bg-muted/80";
    }

    // 有输入框获得焦点时，其他输入框显示背景
    if (focusedInput && focusedInput !== section) {
      return "bg-muted/60";
    }

    // 如果当前没有焦点，但有最后聚焦的输入框
    if (!focusedInput && activeInput && activeInput === section) {
      return "bg-transparent";
    }

    // 如果当前没有焦点，但有最后聚焦的输入框，并且不是当前区域
    if (!focusedInput && activeInput && activeInput !== section) {
      return "bg-muted/60";
    }

    // 默认透明
    return "bg-transparent";
  };

  const handlePercentageSelect = (percentage: number) => {
    if (!ethBalance?.value) return;

    if (percentage === 100) {
      const fullBalance = formatEther(ethBalance.value);
      handleEthInputChange(fullBalance);
    } else {
      const percentageAmount = (ethBalance.value * BigInt(percentage)) / 100n;
      const ethAmount = formatEther(percentageAmount);
      handleEthInputChange(ethAmount);
    }
  };

  const handleEthInputChange = (value: string) => {
    if (!value) {
      setBuyEthAmount("");
      setBuyTokenAmount("");
      setIsSellExceeded(false);
      setIsBuyExceeded(false);
      setIsUnderMin(false);
      setIsOverMax(false);
      return;
    }

    try {
      const ethAmountWei = parseEther(value);
      const ethAmountNum = parseFloat(value);

      const exceedsEthBalance =
        ethBalance?.value && ethAmountWei > ethBalance.value;

      const minPurchaseNum = parseFloat(saleInfo.minPurchase);
      const maxPurchaseNum = parseFloat(saleInfo.maxPurchase);
      const underMin = ethAmountNum > 0 && ethAmountNum < minPurchaseNum;
      const overMax = ethAmountNum > maxPurchaseNum;

      setBuyEthAmount(value);

      if (saleInfo.priceInEthRaw && saleInfo.priceInEthRaw > 0n) {
        const tokenDecimals = saleInfo.tokenDecimals || 18;
        const tokenAmountWei =
          (ethAmountWei * BigInt(10 ** tokenDecimals)) / saleInfo.priceInEthRaw;

        const exceedsTokenBalance =
          saleInfo.contractTokenBalanceRaw &&
          tokenAmountWei > saleInfo.contractTokenBalanceRaw;

        setIsSellExceeded(!!exceedsEthBalance);
        setIsBuyExceeded(!!exceedsTokenBalance);
        setIsUnderMin(underMin);
        setIsOverMax(overMax);

        const tokenAmount = formatUnits(tokenAmountWei, tokenDecimals);
        setBuyTokenAmount(tokenAmount);
      } else {
        setBuyTokenAmount("");
        setIsSellExceeded(!!exceedsEthBalance);
        setIsBuyExceeded(false);
        setIsUnderMin(underMin);
        setIsOverMax(overMax);
      }
    } catch (error) {
      console.error("Invalid ETH amount:", error);
      setIsSellExceeded(false);
      setIsBuyExceeded(false);
      setIsUnderMin(false);
      setIsOverMax(false);
    }
  };

  const handleTokenInputChange = (value: string) => {
    if (!value) {
      setBuyEthAmount("");
      setBuyTokenAmount("");
      setIsSellExceeded(false);
      setIsBuyExceeded(false);
      setIsUnderMin(false);
      setIsOverMax(false);
      return;
    }

    try {
      const tokenDecimals = saleInfo.tokenDecimals || 18;
      const tokenAmountWei = parseUnits(value, tokenDecimals);

      const exceedsTokenBalance =
        saleInfo.contractTokenBalanceRaw &&
        tokenAmountWei > saleInfo.contractTokenBalanceRaw;

      setBuyTokenAmount(value);

      if (saleInfo.priceInEthRaw && saleInfo.priceInEthRaw > 0n) {
        const ethAmountWei =
          (tokenAmountWei * saleInfo.priceInEthRaw) /
          BigInt(10 ** tokenDecimals);

        const exceedsEthBalance =
          ethBalance?.value && ethAmountWei > ethBalance.value;

        const ethAmountNum = parseFloat(formatEther(ethAmountWei));
        const minPurchaseNum = parseFloat(saleInfo.minPurchase);
        const maxPurchaseNum = parseFloat(saleInfo.maxPurchase);
        const underMin = ethAmountNum > 0 && ethAmountNum < minPurchaseNum;
        const overMax = ethAmountNum > maxPurchaseNum;

        setIsSellExceeded(!!exceedsEthBalance);
        setIsBuyExceeded(!!exceedsTokenBalance);
        setIsUnderMin(underMin);
        setIsOverMax(overMax);

        const ethAmount = formatEther(ethAmountWei);
        setBuyEthAmount(ethAmount);
      } else {
        setBuyEthAmount("");
        setIsSellExceeded(false);
        setIsBuyExceeded(!!exceedsTokenBalance);
        setIsUnderMin(false);
        setIsOverMax(false);
      }
    } catch (error) {
      console.error("Invalid token amount:", error);
      setIsSellExceeded(false);
      setIsBuyExceeded(false);
      setIsUnderMin(false);
      setIsOverMax(false);
    }
  };

  const handleBuyTokens = () => {
    if (!buyEthAmount || parseFloat(buyEthAmount) <= 0) {
      toast.error("Please enter a valid ETH amount");
      return;
    }
    buyTokens.buyTokens(buyEthAmount);
  };

  useEffect(() => {
    if (
      buyTokens.isSuccess &&
      buyTokens.hash &&
      lastSuccessHashRef.current !== buyTokens.hash
    ) {
      lastSuccessHashRef.current = buyTokens.hash;
      onSuccessHandled(buyTokens.hash);
      toast.success("Tokens purchased successfully!");
      queueMicrotask(() => {
        setBuyEthAmount("");
        setBuyTokenAmount("");
        onPurchaseSuccess();
      });
    }
  }, [
    buyTokens.isSuccess,
    buyTokens.hash,
    onPurchaseSuccess,
    onSuccessHandled,
  ]);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div
          className={`p-4 rounded-2xl space-y-2 border border-border/40 transition-all duration-200 ease-out cursor-pointer ${getBackgroundClass(
            "sell"
          )}`}
          style={{
            transform: activeSection === "sell" ? "scale(0.98)" : "scale(1)",
            transition:
              "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s",
          }}
          onClick={() => {
            if (!saleInfo.isPaused && isConnected) {
              sellInputRef.current?.focus();
            }
          }}
          onMouseEnter={() => setIsHoveringSell(true)}
          onMouseLeave={() => {
            setIsHoveringSell(false);
            setActiveSection(null);
          }}
          onMouseDown={() => setActiveSection("sell")}
          onMouseUp={() => setActiveSection(null)}
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Sell</span>
            <div
              className={`flex gap-1 transition-all duration-300 ease-out ${
                isHoveringSell && isConnected && !saleInfo.isPaused
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-4 scale-95 pointer-events-none"
              }`}
            >
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  className="text-xs px-2 py-0.5 rounded-md bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all duration-200 font-medium border border-border/50 hover:border-primary/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePercentageSelect(percent);
                  }}
                  disabled={!isConnected || saleInfo.isPaused}
                >
                  {percent === 100 ? "Max" : `${percent}%`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              ref={sellInputRef}
              type="number"
              min="0"
              className={`border-none bg-transparent dark:bg-transparent text-3xl md:text-4xl font-semibold p-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50 shadow-none ${
                isSellExceeded || isUnderMin || isOverMax
                  ? "text-destructive"
                  : ""
              }`}
              placeholder="0"
              value={buyEthAmount}
              onChange={(e) => handleEthInputChange(e.target.value)}
              onFocus={() => {
                setFocusedInput("sell");
              }}
              onBlur={() => {
                setLastFocusedInput(focusedInput);
                setFocusedInput(null);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowUp" ||
                  e.key === "ArrowDown" ||
                  e.key === "-" ||
                  e.key === "+" ||
                  e.key === "e" ||
                  e.key === "E"
                ) {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={!isConnected || saleInfo.isPaused}
            />
            <div className="flex items-center gap-1.5 bg-card shadow-[0_0_10px_rgba(19,19,19,0.04)] dark:shadow-[0_0_10px_rgba(255,255,255,0.04)] rounded-full px-3 py-1.5 shrink-0 border border-border/50 min-w-[90px] transition-colors cursor-pointer">
              <img src={ethImg} className="w-6 h-6" alt="ETH" />
              <span className="font-semibold text-sm">ETH</span>
            </div>
          </div>
          <div className="flex justify-between px-1">
            <span
              className={`text-xs ${
                isUnderMin || isOverMax
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {isUnderMin ? (
                `Min: ${saleInfo.minPurchase} ETH`
              ) : isOverMax ? (
                `Max: ${saleInfo.maxPurchase} ETH`
              ) : buyEthAmount &&
                parseFloat(buyEthAmount) > 0 &&
                ethPriceUsd &&
                !isPriceLoading ? (
                <>≈ {formatPrice(parseFloat(buyEthAmount) * ethPriceUsd)}</>
              ) : (
                `Min: ${saleInfo.minPurchase} • Max: ${saleInfo.maxPurchase} ETH`
              )}
            </span>
            <span
              className={`text-xs ${
                isSellExceeded ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              Balance:{" "}
              {ethBalance?.value
                ? parseFloat(formatEther(ethBalance.value)).toFixed(3)
                : "0"}
            </span>
          </div>
        </div>

        <div className="relative h-0 z-10">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 bg-muted border-[3px] border-card rounded-xl p-2 cursor-pointer transition-all duration-200 hover:bg-muted/90 active:scale-95">
            <ArrowDown className="h-4 w-4 text-muted-foreground transition-colors duration-200" />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl space-y-2 border border-border/40 transition-all duration-200 ease-out cursor-pointer ${getBackgroundClass(
            "buy"
          )}`}
          style={{
            transform: activeSection === "buy" ? "scale(0.98)" : "scale(1)",
            transition:
              "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s",
          }}
          onClick={() => {
            if (!saleInfo.isPaused && isConnected) {
              buyInputRef.current?.focus();
            }
          }}
          onMouseEnter={() => setIsHoveringBuy(true)}
          onMouseLeave={() => {
            setIsHoveringBuy(false);
            setActiveSection(null);
          }}
          onMouseDown={() => setActiveSection("buy")}
          onMouseUp={() => setActiveSection(null)}
        >
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Buy</span>
            <div
              className={`flex gap-1 transition-all duration-300 ease-out ${
                isHoveringBuy && isConnected && !saleInfo.isPaused
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-4 scale-95 pointer-events-none"
              }`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-xs px-2 py-0.5 rounded-md bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all duration-200 font-medium border border-border/50 hover:border-primary/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        const maxTokens = parseFloat(
                          saleInfo.contractTokenBalance
                        );
                        handleTokenInputChange(maxTokens.toString());
                      }}
                      disabled={!isConnected || saleInfo.isPaused}
                    >
                      MAX
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Available: {formatNumber(saleInfo.contractTokenBalance)}{" "}
                      {tokenInfo.symbol}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              ref={buyInputRef}
              type="number"
              min="0"
              className={`border-none bg-transparent dark:bg-transparent text-3xl md:text-4xl font-semibold p-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50 shadow-none ${
                isBuyExceeded ? "text-destructive" : ""
              }`}
              placeholder="0"
              value={buyTokenAmount}
              onChange={(e) => handleTokenInputChange(e.target.value)}
              onFocus={() => {
                setFocusedInput("buy");
              }}
              onBlur={() => {
                setLastFocusedInput(focusedInput);
                setFocusedInput(null);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowUp" ||
                  e.key === "ArrowDown" ||
                  e.key === "-" ||
                  e.key === "+" ||
                  e.key === "e" ||
                  e.key === "E"
                ) {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={!isConnected || saleInfo.isPaused}
            />
            <div className="flex items-center gap-1.5  bg-card shadow-[0_0_10px_rgba(19,19,19,0.04)] dark:shadow-[0_0_10px_rgba(255,255,255,0.04)]  rounded-full px-3 py-1.5 shrink-0 border border-border/50 min-w-[90px] transition-colors cursor-pointer">
              <ProjectIcon
                src={gogogaImg}
                alt={tokenInfo.symbol}
                containerClassName="w-6 h-6 rounded-full overflow-hidden shrink-0"
                className="w-full h-full object-cover"
              />
              <span className="font-semibold text-sm truncate">
                {tokenInfo.symbol}
              </span>
            </div>
          </div>
          <div className="flex justify-end px-1">
            <span
              className={`text-xs ${
                isBuyExceeded ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              Available: {formatNumber(saleInfo.contractTokenBalance)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Price</span>
          <span>
            1 {tokenInfo.symbol} = {formatNumber(saleInfo.priceInEth, 6)} ETH
          </span>
        </div>

        {saleInfo.isPaused && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Token sale is currently paused</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleBuyTokens}
          disabled={
            !isConnected ||
            !buyEthAmount ||
            buyTokens.isPending ||
            buyTokens.isConfirming ||
            saleInfo.isPaused ||
            isSellExceeded ||
            isBuyExceeded ||
            isUnderMin ||
            isOverMax
          }
        >
          {buyTokens.isPending || buyTokens.isConfirming ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {buyTokens.isPending ? "Confirming..." : "Processing..."}
            </>
          ) : !isConnected ? (
            "Connect Wallet"
          ) : isSellExceeded ? (
            "Insufficient ETH Balance"
          ) : isBuyExceeded ? (
            "Exceeds Available Tokens"
          ) : isUnderMin ? (
            `Minimum ${saleInfo.minPurchase} ETH Required`
          ) : isOverMax ? (
            `Maximum ${saleInfo.maxPurchase} ETH Allowed`
          ) : !buyEthAmount ? (
            "Enter Amount"
          ) : (
            "Swap"
          )}
        </Button>

        {buyTokens.isError && (
          <Alert
            variant={
              buyTokens.error?.message?.includes("User rejected") ||
              buyTokens.error?.message?.includes("User denied")
                ? "default"
                : "destructive"
            }
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {formatErrorMessage(buyTokens.error)}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
