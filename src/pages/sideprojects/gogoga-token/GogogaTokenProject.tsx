import { useCallback, useState } from "react";
import { useConnection, useBalance } from "wagmi";
import {
  AlertCircle,
  Droplet,
  Gift,
  History,
  Send,
  Settings,
  ShoppingCart,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useIsTokenOwner,
  useTokenBalance,
  useTokenInfo,
  useTokenMint,
  useTokenPause,
  useTokenTransfer,
} from "@/hooks/useGogogaToken";
import {
  useAirdropInfo,
  useClaimAirdrop,
  useClaimStatus,
} from "@/hooks/useGogogaTokenAirdrop";
import {
  useFaucetInfo,
  useUserFaucetInfo,
  useRemainingClaimAmount,
  useRequestTokens,
  useIsFaucetOwner,
} from "@/hooks/useGogogaTokenFaucet";
import {
  useBuyTokens,
  useIsTokenSaleOwner,
  usePendingWithdrawals,
  useTokenSaleInfo,
  useTokenSalePause,
  useUpdatePurchaseLimits,
  useUpdateTokenPrice,
  useWithdrawEth,
  useWithdrawRemainingTokens,
} from "@/hooks/useGogogaTokenSale";
import { useCoinGeckoPrice } from "@/hooks/useCoinGeckoPrice";
import {
  GOGOGA_TOKEN_ADDRESS,
  GOGOGA_TOKEN_SALE_ADDRESS,
} from "@/config/contracts";
import {
  usePurchaseEvents,
  useTransferEvents,
} from "@/hooks/useGogogaTokenEvents";
import {
  ProjectCard,
  ProjectCardContent,
  ProjectCardHeader,
  ProjectCardTitle,
} from "@/components/ui/project-card";
import { TokenInfoCard } from "./components/TokenInfoCard";
import { BuyTokensPanel } from "./components/BuyTokensPanel";
import { TransferPanel } from "./components/TransferPanel";
import { PurchaseHistoryPanel } from "./components/PurchaseHistoryPanel";
import { TransferHistoryPanel } from "./components/TransferHistoryPanel";
import { AdminPanel } from "./components/AdminPanel";
import { AirdropPanel } from "./components/AirdropPanel";
import { FaucetPanel } from "./components/FaucetPanel";
import { numberInputStyles } from "./utils";

export default function GogogaTokenProject() {
  const { address, isConnected } = useConnection();
  const { data: ethBalance } = useBalance({ address });

  const tokenInfo = useTokenInfo();
  const {
    balance: userBalance,
    decimals,
    refetch: refetchBalance,
  } = useTokenBalance(address);
  const { isOwner: isTokenOwner } = useIsTokenOwner();

  const saleInfo = useTokenSaleInfo();
  const { isOwner: isSaleOwner } = useIsTokenSaleOwner();
  const { pendingWithdrawals, refetch: refetchPendingWithdrawals } =
    usePendingWithdrawals();

  const purchaseEvents = usePurchaseEvents(10);
  const transferEvents = useTransferEvents(address, 10);

  const airdropInfo = useAirdropInfo();
  const claimStatus = useClaimStatus(address);
  const claimAirdrop = useClaimAirdrop();

  const faucetInfo = useFaucetInfo();
  const userFaucetInfo = useUserFaucetInfo(address);
  const remainingClaim = useRemainingClaimAmount(address);
  const requestTokensFromFaucet = useRequestTokens();
  const { isOwner: isFaucetOwner } = useIsFaucetOwner();

  const tokenTransfer = useTokenTransfer();
  const buyTokens = useBuyTokens();
  const tokenMint = useTokenMint();
  const tokenPause = useTokenPause();
  const updatePrice = useUpdateTokenPrice();
  const updateLimits = useUpdatePurchaseLimits();
  const withdrawEth = useWithdrawEth();
  const withdrawTokens = useWithdrawRemainingTokens();
  const salePause = useTokenSalePause();
  const [lastPurchaseSuccessHash, setLastPurchaseSuccessHash] = useState<
    string | undefined
  >(undefined);
  const [lastTransferSuccessHash, setLastTransferSuccessHash] = useState<
    string | undefined
  >(undefined);
  const [lastAirdropSuccessHash, setLastAirdropSuccessHash] = useState<
    string | undefined
  >(undefined);
  const [lastFaucetSuccessHash, setLastFaucetSuccessHash] = useState<
    string | undefined
  >(undefined);
  const [handledAdminSuccessHashes, setHandledAdminSuccessHashes] = useState<{
    mint?: string;
    updatePrice?: string;
    updateLimits?: string;
    tokenPause?: string;
    salePause?: string;
    withdrawEth?: string;
    withdrawTokens?: string;
  }>({});

  const { price: ethPriceUsd, isLoading: isPriceLoading } = useCoinGeckoPrice(
    "ethereum",
    "usd",
    {
      refreshInterval: 60000,
      autoRefresh: true,
      enableCache: true,
    }
  );

  const [currentTab, setCurrentTab] = useState("buy");

  const isOwner = isTokenOwner || isSaleOwner || isFaucetOwner;
  const refetchSaleInfo = saleInfo.refetch;
  const refetchTokenInfo = tokenInfo.refetch;

  const handleTransferSuccess = useCallback(() => {
    refetchBalance();
  }, [refetchBalance]);

  const handlePurchaseSuccess = useCallback(() => {
    refetchBalance();
    refetchSaleInfo();
    refetchPendingWithdrawals();
  }, [refetchBalance, refetchSaleInfo, refetchPendingWithdrawals]);

  const handleMintSuccess = useCallback(() => {
    refetchBalance();
    refetchTokenInfo();
  }, [refetchBalance, refetchTokenInfo]);

  const handlePriceUpdateSuccess = useCallback(() => {
    refetchSaleInfo();
  }, [refetchSaleInfo]);

  const handleLimitsUpdateSuccess = useCallback(() => {
    refetchSaleInfo();
  }, [refetchSaleInfo]);

  const handleTokenPauseSuccess = useCallback(() => {
    refetchTokenInfo();
  }, [refetchTokenInfo]);

  const handleSalePauseSuccess = useCallback(() => {
    refetchSaleInfo();
  }, [refetchSaleInfo]);

  const handleWithdrawEthSuccess = useCallback(() => {
    refetchPendingWithdrawals();
    refetchSaleInfo();
  }, [refetchPendingWithdrawals, refetchSaleInfo]);

  const handleWithdrawTokensSuccess = useCallback(() => {
    refetchSaleInfo();
  }, [refetchSaleInfo]);

  const handleAirdropClaimSuccess = useCallback(() => {
    refetchBalance();
    airdropInfo.refetch();
    claimStatus.refetch();
  }, [refetchBalance, airdropInfo, claimStatus]);

  const handleFaucetRequestSuccess = useCallback(() => {
    refetchBalance();
    faucetInfo.refetch();
    userFaucetInfo.refetch();
  }, [refetchBalance, faucetInfo, userFaucetInfo]);

  return (
    <>
      <style>{numberInputStyles}</style>
      <Layout variant="gogoga">
        {!isConnected && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to interact with the token
            </AlertDescription>
          </Alert>
        )}

        <TokenInfoCard
          tokenInfo={tokenInfo}
          saleInfo={saleInfo}
          userBalance={userBalance}
          isConnected={isConnected}
          isOwner={isOwner}
        />

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-2"
        >
          <div className="w-full overflow-x-auto pb-2 -mb-2">
            <TabsList className="inline-flex w-auto min-w-full lg:w-auto">
              <TabsTrigger value="buy">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Tokens
              </TabsTrigger>
              <TabsTrigger value="transfer">
                <Send className="h-4 w-4 mr-2" />
                Transfer
              </TabsTrigger>
              <TabsTrigger value="airdrop">
                <Gift className="h-4 w-4 mr-2" />
                Airdrop
              </TabsTrigger>
              <TabsTrigger value="faucet">
                <Droplet className="h-4 w-4 mr-2" />
                Faucet
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="buy" className="w-full">
            <ProjectCard>
              <ProjectCardContent>
                <BuyTokensPanel
                  saleInfo={saleInfo}
                  tokenInfo={tokenInfo}
                  ethBalance={ethBalance}
                  ethPriceUsd={ethPriceUsd}
                  isPriceLoading={isPriceLoading}
                  decimals={decimals || 18}
                  buyTokens={buyTokens}
                  isConnected={isConnected}
                  onPurchaseSuccess={handlePurchaseSuccess}
                  shouldAutoFocus={currentTab === "buy" && !saleInfo.isPaused}
                  lastHandledSuccessHash={lastPurchaseSuccessHash}
                  onSuccessHandled={(hash) => {
                    setLastPurchaseSuccessHash(hash);
                  }}
                />
              </ProjectCardContent>
            </ProjectCard>
          </TabsContent>

          <TabsContent value="transfer">
            <ProjectCard>
              <ProjectCardHeader>
                <ProjectCardTitle>Transfer Tokens</ProjectCardTitle>
                <p className="text-sm text-muted-foreground">
                  Send {tokenInfo.symbol} tokens to another address
                </p>
              </ProjectCardHeader>
              <ProjectCardContent>
                <TransferPanel
                  tokenInfo={tokenInfo}
                  userBalance={userBalance}
                  tokenTransfer={tokenTransfer}
                  decimals={decimals || 18}
                  isConnected={isConnected}
                  onTransferSuccess={handleTransferSuccess}
                  lastHandledSuccessHash={lastTransferSuccessHash}
                  onSuccessHandled={(hash) => {
                    setLastTransferSuccessHash(hash);
                  }}
                />
              </ProjectCardContent>
            </ProjectCard>
          </TabsContent>

          <TabsContent value="airdrop">
            <ProjectCard>
              <ProjectCardHeader>
                <ProjectCardTitle>Claim Airdrop</ProjectCardTitle>
                <p className="text-sm text-muted-foreground">
                  Claim your {tokenInfo.symbol} airdrop tokens
                </p>
              </ProjectCardHeader>
              <ProjectCardContent>
                <AirdropPanel
                  airdropInfo={airdropInfo}
                  claimStatus={claimStatus}
                  tokenInfo={tokenInfo}
                  decimals={decimals || 18}
                  claimAirdrop={claimAirdrop}
                  isConnected={isConnected}
                  onClaimSuccess={handleAirdropClaimSuccess}
                  lastHandledSuccessHash={lastAirdropSuccessHash}
                  onSuccessHandled={(hash) => {
                    setLastAirdropSuccessHash(hash);
                  }}
                />
              </ProjectCardContent>
            </ProjectCard>
          </TabsContent>

          <TabsContent value="faucet">
            <ProjectCard>
              <ProjectCardHeader>
                <ProjectCardTitle>Token Faucet</ProjectCardTitle>
                <p className="text-sm text-muted-foreground">
                  Request free {tokenInfo.symbol} tokens from the faucet
                </p>
              </ProjectCardHeader>
              <ProjectCardContent>
                <FaucetPanel
                  faucetInfo={faucetInfo}
                  userFaucetInfo={userFaucetInfo}
                  remainingClaim={remainingClaim}
                  tokenInfo={tokenInfo}
                  decimals={decimals || 18}
                  requestTokens={requestTokensFromFaucet}
                  isConnected={isConnected}
                  onRequestSuccess={handleFaucetRequestSuccess}
                  lastHandledSuccessHash={lastFaucetSuccessHash}
                  onSuccessHandled={(hash) => {
                    setLastFaucetSuccessHash(hash);
                  }}
                />
              </ProjectCardContent>
            </ProjectCard>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <PurchaseHistoryPanel
              purchaseEvents={purchaseEvents}
              saleAddress={GOGOGA_TOKEN_SALE_ADDRESS}
              decimals={decimals || 18}
              tokenSymbol={tokenInfo.symbol}
            />

            <TransferHistoryPanel
              transferEvents={transferEvents}
              isConnected={isConnected}
              tokenAddress={GOGOGA_TOKEN_ADDRESS}
              address={address}
              decimals={decimals || 18}
              tokenSymbol={tokenInfo.symbol}
            />
          </TabsContent>

          {isOwner && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel
                tokenInfo={tokenInfo}
                saleInfo={saleInfo}
                decimals={decimals || 18}
                pendingWithdrawals={pendingWithdrawals}
                tokenMint={tokenMint}
                tokenPause={tokenPause}
                updatePrice={updatePrice}
                updateLimits={updateLimits}
                withdrawEth={withdrawEth}
                withdrawTokens={withdrawTokens}
                salePause={salePause}
                onMintSuccess={handleMintSuccess}
                onPriceUpdateSuccess={handlePriceUpdateSuccess}
                onLimitsUpdateSuccess={handleLimitsUpdateSuccess}
                onTokenPauseSuccess={handleTokenPauseSuccess}
                onSalePauseSuccess={handleSalePauseSuccess}
                onWithdrawEthSuccess={handleWithdrawEthSuccess}
                onWithdrawTokensSuccess={handleWithdrawTokensSuccess}
                handledHashes={handledAdminSuccessHashes}
                onSuccessHandled={(key, hash) => {
                  setHandledAdminSuccessHashes((prev) => ({
                    ...prev,
                    [key]: hash,
                  }));
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </Layout>
    </>
  );
}
