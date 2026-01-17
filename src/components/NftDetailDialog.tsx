import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  ExternalLink,
  Flame,
  Settings,
} from "lucide-react";
import { AddressDisplay } from "@/components/AddressDisplay";
import { Nft } from "@/types";
import { useState } from "react";
import { BLOCK_EXPLORER_URL } from "@/config/constants";
import { GOGOGA_NFT_ADDRESS } from "@/config/contracts";
import ethImg from "@/assets/icons/eth.svg";
import { useBurnNft } from "@/hooks/useGogogaNftMint";
import { useConnection } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface NftDetailDialogProps {
  nft: Nft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NftDetailDialog({
  nft,
  open,
  onOpenChange,
}: NftDetailDialogProps) {
  const [imageError, setImageError] = useState(false);
  const [showBurnDialog, setShowBurnDialog] = useState(false);
  const { address } = useConnection();
  const { burn, isPending } = useBurnNft();
  const { toast } = useToast();

  const imageUrl = nft.metadata?.image || "";

  // Check if current user is the owner
  const isOwner = address && nft.owner.toLowerCase() === address.toLowerCase();

  // Get block explorer URL
  const getTokenUrl = () => {
    if (!BLOCK_EXPLORER_URL) return "";
    return `${BLOCK_EXPLORER_URL}/token/${GOGOGA_NFT_ADDRESS}?a=${nft.tokenId}`;
  };

  // Handle burn NFT
  const handleBurnConfirm = async () => {
    setShowBurnDialog(false);

    try {
      toast({
        variant: "info",
        title: "Transaction Pending",
        description: "Please confirm the transaction in your wallet...",
      });

      const result = await burn(nft.tokenId);

      if (result.success) {
        toast({
          variant: "success",
          title: "NFT Burned Successfully! 🔥",
          description: `NFT #${nft.tokenId} has been permanently destroyed.`,
        });
        onOpenChange(false);
        // Reload page to refresh NFT list
        window.location.reload();
      } else {
        toast({
          variant: "destructive",
          title: "Burn Failed",
          description: result.error || "Failed to burn NFT",
        });
      }
    } catch (error) {
      console.error("Error burning NFT:", error);
      toast({
        variant: "destructive",
        title: "Burn Failed",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">
            {nft.metadata?.name || `NFT #${nft.tokenId}`}
          </DialogTitle>
          <DialogDescription className="font-mono">
            {nft.metadata?.description ||
              `NFT details for token #${nft.tokenId}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                <ImageIcon className="h-24 w-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div className="space-y-2">
              {/* Token ID */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground font-mono">
                  Token ID
                </h3>
                <Badge variant="secondary" className="font-mono text-base">
                  #{nft.tokenId.toString()}
                </Badge>
              </div>

              {/* Owner */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground font-mono">
                  Owner
                </h3>
                <AddressDisplay address={nft.owner} className="font-mono" />
              </div>

              {/* Minter */}
              {nft.minter && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground font-mono">
                    Minter
                  </h3>
                  <AddressDisplay address={nft.minter} className="font-mono" />
                </div>
              )}

              {/* Attributes */}
              {nft.metadata?.attributes &&
                nft.metadata.attributes.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-normal text-muted-foreground/60 font-mono uppercase">
                      Attributes
                    </h3>
                    <div className="grid grid-cols-2 gap-1">
                      {nft.metadata.attributes.map((attr, index) => (
                        <div
                          key={index}
                          className="rounded-sm border border-border/50 bg-muted/30 px-1.5 py-1 space-y-0"
                        >
                          <div className="text-[9px] text-muted-foreground/50 font-mono uppercase leading-tight">
                            {attr.trait_type}
                          </div>
                          <div className="text-[11px] font-normal font-mono text-muted-foreground">
                            {attr.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* View on Explorer & Actions */}
            <div className="pt-2 flex items-center justify-between">
              {BLOCK_EXPLORER_URL && (
                <a
                  href={getTokenUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group no-underline font-mono"
                >
                  <img
                    src={ethImg}
                    alt=""
                    className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                  <span>View on Explorer</span>
                  <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
              {/* Action Menu - Only show to owner */}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isPending}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setShowBurnDialog(true)}
                      disabled={isPending}
                      className="text-destructive focus:text-destructive font-mono cursor-pointer"
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      {isPending ? "Burning..." : "Burn NFT"}
                    </DropdownMenuItem>
                    {/* More actions can be added here in the future */}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Burn Confirmation Dialog */}
      <AlertDialog open={showBurnDialog} onOpenChange={setShowBurnDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono">
              🔥 Burn NFT #{nft.tokenId.toString()}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="font-mono space-y-2">
                <div>
                  Are you sure you want to permanently destroy this NFT? This
                  action <strong>cannot be undone</strong>.
                </div>
                <div className="text-destructive font-semibold">
                  ⚠️ The NFT will be burned forever and removed from your
                  wallet.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBurnConfirm}
              className="bg-destructive hover:bg-destructive/90 font-mono"
            >
              Burn Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
