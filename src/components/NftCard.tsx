import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon } from "lucide-react";
import { AddressDisplay } from "@/components/AddressDisplay";
import { Nft } from "@/types";
import { useState } from "react";
import NftDetailDialog from "./NftDetailDialog";
import { ProjectCard, ProjectCardContent } from "@/components/ui/project-card";

interface NftCardProps {
  nft: Nft;
}

export default function NftCard({ nft }: NftCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Extract image URL from metadata or tokenURI
  const imageUrl = nft.metadata?.image || "";

  return (
    <>
      <ProjectCard
        hover
        className="group overflow-hidden cursor-pointer py-0 gap-0"
        onClick={() => setIsDetailOpen(true)}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <ProjectCardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg truncate font-mono">
                {nft.metadata?.name || `NFT #${nft.tokenId}`}
              </h3>
              <Badge variant="secondary" className="font-mono shrink-0">
                #{nft.tokenId.toString()}
              </Badge>
            </div>

            {/* Owner */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground font-mono">
                Owner
              </span>
              <AddressDisplay address={nft.owner} className="text-xs" />
            </div>

            {/* Minter */}
            {nft.minter && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  Minter
                </span>
                <AddressDisplay address={nft.minter} className="text-xs" />
              </div>
            )}
          </div>
        </ProjectCardContent>
      </ProjectCard>

      {/* Detail Dialog */}
      <NftDetailDialog
        nft={nft}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
}
