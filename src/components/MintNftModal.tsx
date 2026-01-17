import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Upload, X, Image as ImageIcon } from "lucide-react";
import { useMintNft } from "@/hooks/useGogogaNftMint";
import { Nft } from "@/types";
import { useConnection, useChainId } from "wagmi";
import { formatEther } from "viem";
import { useToast } from "@/hooks/use-toast";
import { useGogogaNftInfo, usePresetNftPreview } from "@/hooks/useGogogaNft";
import { CHAIN_ID } from "@/config/constants";
import { uploadNftToIPFS, validateImageFile } from "@/lib/ipfs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MintNftModalProps {
  onSuccess?: () => void;
  onMintSuccess?: (nft: Nft) => void; // 乐观更新回调，传递新 NFT
}

interface NftFormData {
  name: string;
  description: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

/**
 * 增强版 Mint NFT Modal - 支持自定义图片上传
 *
 * 功能：
 * 1. 自定义模式 - 用户上传图片和元数据
 * 2. 快速模式 - 使用默认 metadata mint
 */
export default function MintNftModal({
  onSuccess,
  onMintSuccess,
}: MintNftModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintMode, setMintMode] = useState<"preset" | "custom">("custom");

  // Custom mint state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<NftFormData>({
    name: "",
    description: "",
    attributes: [],
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isConnected } = useConnection();
  const chainId = useChainId();
  const { contractInfo, isLoading: isLoadingInfo } = useGogogaNftInfo();
  const { mintPreset, mintCustom } = useMintNft();

  const isSupportedChain = chainId === CHAIN_ID;

  // Get next preset NFT preview
  const nextPresetTokenId = contractInfo
    ? Number(contractInfo.presetSupply)
    : 0;
  const { imageUrl: presetImageUrl, isLoading: isLoadingPreview } =
    usePresetNftPreview(nextPresetTokenId);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid image file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add attribute
  const handleAddAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { trait_type: "", value: "" }],
    });
  };

  // Update attribute
  const handleUpdateAttribute = (
    index: number,
    field: "trait_type" | "value",
    value: string
  ) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  // Remove attribute
  const handleRemoveAttribute = (index: number) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: newAttributes });
  };

  // Handle custom mint (with IPFS upload)
  const handleCustomMint = async () => {
    if (!contractInfo) {
      toast({
        title: "Error",
        description: "Contract info not loaded",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter NFT name",
        variant: "destructive",
      });
      return;
    }

    if (contractInfo.isPaused) {
      toast({
        title: "Error",
        description: "Minting is currently paused",
        variant: "destructive",
      });
      return;
    }

    if (contractInfo.remainingCustomSupply <= 0n) {
      toast({
        title: "Error",
        description: "All custom NFTs have been minted",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    setIsUploading(true);

    try {
      // Step 1: Upload to IPFS
      const metadataUri = await uploadNftToIPFS(
        imageFile,
        {
          name: formData.name,
          description: formData.description,
          attributes: formData.attributes.filter(
            (attr) => attr.trait_type && attr.value
          ),
        },
        (step, progress) => {
          setUploadStep(step);
          setUploadProgress(progress);
        }
      );

      setIsUploading(false);

      // Step 2: 提示交易提交中
      toast({
        title: "Transaction submitted",
        description: "Waiting for confirmation...",
        variant: "info",
      });

      // Step 3: Mint NFT 并等待确认
      const result = await mintCustom(
        contractInfo.customMintPrice,
        metadataUri
      );

      if (result.success) {
        toast({
          title: "Custom NFT minted successfully!",
          description: "Your NFT has been added to your collection",
          variant: "success",
        });

        // 乐观更新：立即将新 NFT 添加到列表
        if (result.newNft && onMintSuccess) {
          // 为 custom NFT 添加完整的 metadata
          const nftWithMetadata: Nft = {
            ...result.newNft,
            metadata: {
              name: formData.name,
              description: formData.description,
              image: imagePreview, // 使用本地预览图作为临时图片
              attributes: formData.attributes.filter(
                (attr) => attr.trait_type && attr.value
              ),
            },
          };
          onMintSuccess(nftWithMetadata);
        }

        resetForm();
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast({
          title: "Failed to mint NFT",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error minting custom NFT:", error);
      toast({
        title: "Failed to mint NFT",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStep("");
    }
  };

  // Handle preset mint (no custom metadata)
  const handlePresetMint = async () => {
    if (!contractInfo) {
      toast({
        title: "Error",
        description: "Contract info not loaded",
        variant: "destructive",
      });
      return;
    }

    if (contractInfo.isPaused) {
      toast({
        title: "Error",
        description: "Minting is currently paused",
        variant: "destructive",
      });
      return;
    }

    if (contractInfo.remainingPresetSupply <= 0n) {
      toast({
        title: "Error",
        description: "All preset NFTs have been minted",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);

    try {
      // 提示交易提交中
      toast({
        title: "Transaction submitted",
        description: "Waiting for confirmation...",
        variant: "info",
      });

      // Mint NFT 并等待确认
      const result = await mintPreset(contractInfo.presetMintPrice);

      if (result.success) {
        toast({
          title: "Preset NFT minted successfully!",
          description: "Your NFT has been added to your collection",
          variant: "success",
        });

        // 乐观更新：立即将新 NFT 添加到列表
        if (result.newNft && onMintSuccess) {
          // Preset NFT 使用预览图作为临时图片
          const nftWithMetadata: Nft = {
            ...result.newNft,
            metadata: presetImageUrl
              ? {
                  name: `Gogoga NFT #${result.newNft.tokenId}`,
                  description: "Preset NFT from Gogoga Collection",
                  image: presetImageUrl,
                }
              : undefined,
          };
          onMintSuccess(nftWithMetadata);
        }

        setIsOpen(false);
        onSuccess?.();
      } else {
        toast({
          title: "Failed to mint NFT",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error minting preset NFT:", error);
      toast({
        title: "Failed to mint NFT",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ name: "", description: "", attributes: [] });
    setUploadProgress(0);
    setUploadStep("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMint =
    mintMode === "custom" ? handleCustomMint : handlePresetMint;

  // 判断是否正在处理交易
  const isProcessing = isMinting || isUploading;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        // 只有在非处理状态时才允许关闭
        if (!isProcessing) {
          setIsOpen(newOpen);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="font-mono">
          <Plus className="h-5 w-5 mr-2" />
          Mint
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] max-h-[97vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // 处理过程中时阻止点击外部关闭
          if (isProcessing) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // 处理过程中时阻止 ESC 键关闭
          if (isProcessing) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">Mint NFT</DialogTitle>
          <DialogDescription className="font-mono">
            Create your unique NFT on the blockchain
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground font-mono mb-4">
              Please connect your wallet to mint NFT
            </p>
          </div>
        ) : !isSupportedChain ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground font-mono mb-4">
              Please switch to a supported network
            </p>
          </div>
        ) : isLoadingInfo ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !contractInfo ? (
          <div className="py-8 text-center">
            <p className="text-destructive font-mono">
              Failed to load contract info
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mint Mode Tabs */}
            <Tabs
              value={mintMode}
              onValueChange={(v) => setMintMode(v as "preset" | "custom")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="custom"
                  className="font-mono"
                  disabled={isProcessing}
                >
                  🎨 Custom NFT
                </TabsTrigger>
                <TabsTrigger
                  value="preset"
                  className="font-mono"
                  disabled={isProcessing}
                >
                  ⚡ Preset NFT
                </TabsTrigger>
              </TabsList>

              {/* Custom Mint Tab */}
              <TabsContent value="custom" className="space-y-4 mt-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="font-mono">NFT Image *</Label>
                  {!imagePreview ? (
                    <div
                      onClick={() =>
                        !isProcessing && fileInputRef.current?.click()
                      }
                      className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        isProcessing
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:border-primary"
                      } transition-colors`}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-mono text-muted-foreground">
                        Click to upload image
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        JPEG, PNG, GIF, WebP (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-xs mx-auto">
                      <div className="relative aspect-square rounded-lg border-2 border-primary overflow-hidden bg-muted/30">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-mono">
                    NFT Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="My Awesome NFT"
                    className="font-mono"
                    disabled={isProcessing}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-mono">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your NFT..."
                    className="font-mono min-h-20"
                    disabled={isProcessing}
                  />
                </div>

                {/* Attributes */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-mono">Attributes (Optional)</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddAttribute}
                      className="font-mono"
                      disabled={isProcessing}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Trait (e.g., Color)"
                        value={attr.trait_type}
                        onChange={(e) =>
                          handleUpdateAttribute(
                            index,
                            "trait_type",
                            e.target.value
                          )
                        }
                        className="font-mono"
                        disabled={isProcessing}
                      />
                      <Input
                        placeholder="Value (e.g., Blue)"
                        value={attr.value}
                        onChange={(e) =>
                          handleUpdateAttribute(index, "value", e.target.value)
                        }
                        className="font-mono"
                        disabled={isProcessing}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveAttribute(index)}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <Card className="p-4">
                    <p className="text-sm font-mono mb-2">{uploadStep}</p>
                    <Progress value={uploadProgress} />
                  </Card>
                )}

                {/* Contract Info */}
                <div className="rounded-lg border bg-muted/50 p-3 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mint Price</span>
                    <span className="font-semibold">
                      {formatEther(contractInfo.customMintPrice)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custom Supply</span>
                    <span>
                      {Number(contractInfo.customSupply)} /{" "}
                      {Number(
                        contractInfo.customSupply +
                          contractInfo.remainingCustomSupply
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span>{Number(contractInfo.remainingCustomSupply)}</span>
                  </div>
                </div>
              </TabsContent>

              {/* Preset Mint Tab */}
              <TabsContent value="preset" className="space-y-4 mt-4">
                {/* Next NFT Preview */}
                <div className="space-y-2">
                  <Label className="font-mono">Next NFT to Mint</Label>
                  <div className="max-w-xs mx-auto">
                    <div className="relative aspect-square rounded-lg border-2 border-primary overflow-hidden bg-muted/30">
                      {isLoadingPreview ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : presetImageUrl ? (
                        <>
                          <img
                            src={presetImageUrl}
                            alt={`Preset NFT #${nextPresetTokenId}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-16 w-16 text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
                              }
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center">
                            <p className="font-mono text-sm font-semibold">
                              Token ID #{nextPresetTokenId}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono text-center">
                    You will receive this NFT when you mint
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-3 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mint Price</span>
                    <span className="font-semibold">
                      {formatEther(contractInfo.presetMintPrice)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preset Supply</span>
                    <span>
                      {Number(contractInfo.presetSupply)} /{" "}
                      {Number(
                        contractInfo.presetSupply +
                          contractInfo.remainingPresetSupply
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span>{Number(contractInfo.remainingPresetSupply)}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Transaction Progress Indicator */}
            {isProcessing && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium font-mono mb-1">
                  {isUploading
                    ? "📤 Uploading to IPFS..."
                    : "⏳ Transaction in progress..."}
                </p>
                <p className="text-xs opacity-80 font-mono">
                  {isUploading
                    ? "Please wait while we upload your NFT to IPFS. This may take a few moments."
                    : "Please wait for the transaction to complete. This may take a few moments. Do not close this dialog."}
                </p>
              </div>
            )}

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={
                isMinting ||
                isUploading ||
                contractInfo.isPaused ||
                (mintMode === "custom" &&
                  (contractInfo.remainingCustomSupply <= 0n ||
                    !imageFile ||
                    !formData.name.trim())) ||
                (mintMode === "preset" &&
                  contractInfo.remainingPresetSupply <= 0n)
              }
              className="w-full font-mono"
              size="lg"
            >
              {isMinting || isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isUploading ? "Uploading..." : "Minting..."}
                </>
              ) : mintMode === "custom" &&
                contractInfo.remainingCustomSupply <= 0n ? (
                "Custom NFTs Sold Out"
              ) : mintMode === "preset" &&
                contractInfo.remainingPresetSupply <= 0n ? (
                "Preset NFTs Sold Out"
              ) : contractInfo.isPaused ? (
                "Minting Paused"
              ) : (
                `Mint for ${formatEther(
                  mintMode === "custom"
                    ? contractInfo.customMintPrice
                    : contractInfo.presetMintPrice
                )} ETH`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
