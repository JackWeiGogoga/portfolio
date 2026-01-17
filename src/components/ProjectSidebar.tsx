import { useState } from "react";
import { formatEther } from "viem";
import {
  Clock,
  Users,
  AlertCircle,
  Pause,
  Play,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ProjectCard,
  ProjectCardHeader,
  ProjectCardTitle,
  ProjectCardContent,
} from "@/components/ui/project-card";
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
import BackProjectDialog from "@/components/BackProjectDialog";
import { useToast } from "@/hooks/use-toast";
import {
  useTogglePause,
  useWithdraw,
  useRequestRefund,
} from "@/hooks/useCampaignActions";
import { CampaignDetail } from "@/types";

interface ProjectSidebarProps {
  campaign: CampaignDetail;
  userAddress?: string;
  isOwner: boolean;
  progress: number;
  daysLeft: number;
  isActive: boolean;
  onRefetch: () => void;
  onRefetchEvents: () => void;
}

export default function ProjectSidebar({
  campaign,
  userAddress,
  isOwner,
  progress,
  daysLeft,
  isActive,
  onRefetch,
  onRefetchEvents,
}: ProjectSidebarProps) {
  const { toast } = useToast();
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showTogglePauseDialog, setShowTogglePauseDialog] = useState(false);

  // Actions
  const { togglePause, isLoading: isTogglingPause } = useTogglePause(
    campaign.address
  );
  const { withdraw, isLoading: isWithdrawing } = useWithdraw(campaign.address);
  const { requestRefund, isLoading: isRefunding } = useRequestRefund(
    campaign.address
  );

  // Handlers
  const handleTogglePause = async () => {
    setShowTogglePauseDialog(false);

    const action = campaign.paused ? "Resume" : "Pause";
    try {
      toast({
        variant: "info",
        title: "Transaction Pending",
        description: "Please confirm the transaction in your wallet...",
      });

      await togglePause();

      toast({
        variant: "success",
        title: `Project ${campaign.paused ? "Resumed" : "Paused"} ✅`,
        description: "The page data will refresh shortly.",
      });

      onRefetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: `${action} Failed`,
        description: message,
      });
    }
  };

  const handleWithdraw = async () => {
    setShowWithdrawDialog(false);

    try {
      toast({
        variant: "info",
        title: "Transaction Pending",
        description: "Please confirm the transaction in your wallet...",
      });

      await withdraw();

      toast({
        variant: "success",
        title: "Withdrawal Successful! ✅",
        description: "Funds have been withdrawn to your wallet.",
      });

      onRefetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Withdrawal failed",
        description: message,
      });
    }
  };

  const handleRefund = async () => {
    setShowRefundDialog(false);

    try {
      toast({
        variant: "info",
        title: "Transaction Pending",
        description: "Please confirm the transaction in your wallet...",
      });

      await requestRefund();

      toast({
        variant: "success",
        title: "Refund Successful! ✅",
        description: "Your funds have been refunded.",
      });

      onRefetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Refund failed",
        description: message,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <ProjectCard>
        <ProjectCardContent className="pt-5 space-y-4">
          {/* Raised Amount */}
          <div>
            <div className="text-xl font-bold text-primary">
              {formatEther(campaign.balance)} ETH
            </div>
            <div className="text-sm text-muted-foreground">
              of {formatEther(campaign.goal)} ETH
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={Math.min(progress, 100)} />
            <div className="text-sm text-muted-foreground">
              {progress.toFixed(1)}% funded
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">
                  {(
                    campaign.backerCount + campaign.customBackerCount
                  ).toString()}
                </div>
                <div className="text-xs text-muted-foreground">Backers</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-semibold">
                  {daysLeft > 0 ? daysLeft : 0}
                </div>
                <div className="text-xs text-muted-foreground">Days left</div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          {isActive && !campaign.paused && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowBackDialog(true)}
              disabled={!userAddress}
            >
              {userAddress ? "Back this project" : "Connect wallet first"}
            </Button>
          )}

          {campaign.paused && (
            <div className="flex items-center gap-2 p-4 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-600">Project is paused</span>
            </div>
          )}

          {campaign.state === 2 && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowRefundDialog(true)}
              disabled={isRefunding || !userAddress}
            >
              {isRefunding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRefunding ? "Processing..." : "Request Refund"}
            </Button>
          )}
        </ProjectCardContent>
      </ProjectCard>

      {/* Project Management Card (Creator Only) */}
      {isOwner && (
        <ProjectCard>
          <ProjectCardHeader>
            <ProjectCardTitle>Project Management</ProjectCardTitle>
          </ProjectCardHeader>
          <ProjectCardContent className="space-y-3">
            {isActive &&
              (campaign.paused ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowTogglePauseDialog(true)}
                  disabled={isTogglingPause}
                >
                  {isTogglingPause ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isTogglingPause ? "Resuming..." : "Resume Project"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowTogglePauseDialog(true)}
                  disabled={isTogglingPause}
                >
                  {isTogglingPause ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Pause className="mr-2 h-4 w-4" />
                  )}
                  {isTogglingPause ? "Pausing..." : "Pause Project"}
                </Button>
              ))}

            {campaign.state === 1 && !campaign.withdrawn && (
              <Button
                className="w-full"
                onClick={() => setShowWithdrawDialog(true)}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-4 w-4" />
                )}
                {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
              </Button>
            )}

            {campaign.state === 1 && campaign.withdrawn && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  Funds have been withdrawn
                </span>
              </div>
            )}
          </ProjectCardContent>
        </ProjectCard>
      )}

      {/* Back Project Dialog */}
      <BackProjectDialog
        open={showBackDialog}
        onOpenChange={setShowBackDialog}
        campaignAddress={campaign.address}
        campaignName={campaign.name}
        tiers={campaign.tiers}
        allowCustomAmount={campaign.allowCustomAmount}
        minContribution={campaign.minContribution}
        onSuccess={onRefetch}
        onRefetchEvents={onRefetchEvents}
      />

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Funds</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw funds? This action will transfer
              the raised funds to your wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to request a refund? This will return your
              contribution back to your wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Pause Confirmation Dialog */}
      <AlertDialog
        open={showTogglePauseDialog}
        onOpenChange={setShowTogglePauseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {campaign.paused ? "Resume Project" : "Pause Project"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {campaign.paused
                ? "Are you sure you want to resume this project? Backers will be able to contribute again."
                : "Are you sure you want to pause this project? This will temporarily prevent new contributions."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTogglePause}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
