import { useState, useEffect, useRef } from "react";
import {
  useConnection,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Pause,
  Play,
  DollarSign,
  Package,
  Download,
  Edit,
} from "lucide-react";
import { contracts } from "@/config/contracts";
import { toast } from "sonner";

export function AdminPanel({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useConnection();
  const [isOpen, setIsOpen] = useState(false);

  // Check if user is owner
  const { data: owner } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "owner",
  });

  const isOwner =
    address &&
    owner &&
    address.toLowerCase() === (owner as string).toLowerCase();

  if (!isOwner) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-mono">
          <Settings className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Admin</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>NFT Contract Admin Panel</DialogTitle>
          <DialogDescription>
            Manage contract settings and operations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4">
            <PauseControl onSuccess={onSuccess} />
            <WithdrawControl onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <PricingControl onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="mint" className="space-y-4">
            <BatchMintControl onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <BaseURIControl onSuccess={onSuccess} />
            <CustomURIControl onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Pause/Unpause Control
function PauseControl({ onSuccess }: { onSuccess?: () => void }) {
  const { data: paused, refetch } = useReadContract({
    ...contracts.gogogaNft,
    functionName: "paused",
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const processedHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isConfirmed && hash && hash !== processedHash.current) {
      processedHash.current = hash;
      toast.success(`Contract ${paused ? "unpaused" : "paused"} successfully`);
      queueMicrotask(() => {
        refetch();
        onSuccess?.();
      });
    }
  }, [isConfirmed, hash, paused, onSuccess, refetch]);

  useEffect(() => {
    if (error) {
      toast.error(
        `Failed to ${paused ? "unpause" : "pause"}: ${error.message}`
      );
    }
  }, [error, paused]);

  const handlePauseToggle = () => {
    if (paused) {
      writeContract({
        ...contracts.gogogaNft,
        functionName: "unpause",
      });
    } else {
      writeContract({
        ...contracts.gogogaNft,
        functionName: "pause",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {paused ? (
            <Play className="h-5 w-5" />
          ) : (
            <Pause className="h-5 w-5" />
          )}
          Contract Status
        </CardTitle>
        <CardDescription>
          {paused
            ? "Contract is currently paused"
            : "Contract is currently active"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handlePauseToggle}
          disabled={isPending || isConfirming}
          className="w-full"
        >
          {isPending || isConfirming ? (
            "Processing..."
          ) : paused ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Unpause Contract
            </>
          ) : (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause Contract
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Withdraw Control
function WithdrawControl({ onSuccess }: { onSuccess?: () => void }) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const processedHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isConfirmed && hash && hash !== processedHash.current) {
      processedHash.current = hash;
      toast.success("Funds withdrawn successfully");
      queueMicrotask(() => {
        onSuccess?.();
      });
    }
  }, [isConfirmed, hash, onSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(`Withdrawal failed: ${error.message}`);
    }
  }, [error]);

  const handleWithdraw = () => {
    writeContract({
      ...contracts.gogogaNft,
      functionName: "withdraw",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Withdraw Funds
        </CardTitle>
        <CardDescription>
          Withdraw all contract funds to owner address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleWithdraw}
          disabled={isPending || isConfirming}
          variant="outline"
          className="w-full"
        >
          {isPending || isConfirming ? "Processing..." : "Withdraw All Funds"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Pricing Control
function PricingControl({ onSuccess }: { onSuccess?: () => void }) {
  const [presetPrice, setPresetPrice] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [lastAction, setLastAction] = useState<"preset" | "custom" | null>(
    null
  );

  const { data: currentPresetPrice, refetch: refetchPresetPrice } =
    useReadContract({
      ...contracts.gogogaNft,
      functionName: "presetMintPrice",
    });

  const { data: currentCustomPrice, refetch: refetchCustomPrice } =
    useReadContract({
      ...contracts.gogogaNft,
      functionName: "customMintPrice",
    });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const processedHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isConfirmed && hash && hash !== processedHash.current && lastAction) {
      processedHash.current = hash;
      if (lastAction === "preset") {
        toast.success("Preset price updated");
        queueMicrotask(() => {
          setPresetPrice("");
          refetchPresetPrice();
        });
      } else {
        toast.success("Custom price updated");
        queueMicrotask(() => {
          setCustomPrice("");
          refetchCustomPrice();
        });
      }
      queueMicrotask(() => {
        onSuccess?.();
        setLastAction(null);
      });
    }
  }, [
    isConfirmed,
    hash,
    lastAction,
    onSuccess,
    refetchPresetPrice,
    refetchCustomPrice,
  ]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to update price: ${error.message}`);
      queueMicrotask(() => {
        setLastAction(null);
      });
    }
  }, [error]);

  const handleSetPresetPrice = () => {
    if (!presetPrice) {
      toast.error("Please enter a price");
      return;
    }

    try {
      const priceInWei = parseEther(presetPrice);
      setLastAction("preset");
      writeContract({
        ...contracts.gogogaNft,
        functionName: "setPresetMintPrice",
        args: [priceInWei],
      });
    } catch {
      toast.error("Invalid price format");
    }
  };

  const handleSetCustomPrice = () => {
    if (!customPrice) {
      toast.error("Please enter a price");
      return;
    }

    try {
      const priceInWei = parseEther(customPrice);
      setLastAction("custom");
      writeContract({
        ...contracts.gogogaNft,
        functionName: "setCustomMintPrice",
        args: [priceInWei],
      });
    } catch {
      toast.error("Invalid price format");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Management
        </CardTitle>
        <CardDescription>
          Update mint prices for preset and custom NFTs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Price */}
        <div className="space-y-2">
          <Label>Preset Mint Price</Label>
          <div className="text-sm text-muted-foreground mb-2">
            Current: Ξ
            {currentPresetPrice
              ? formatEther(currentPresetPrice as bigint)
              : "0"}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.001"
              placeholder="0.001"
              value={presetPrice}
              onChange={(e) => setPresetPrice(e.target.value)}
            />
            <Button
              onClick={handleSetPresetPrice}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? "Processing..." : "Update"}
            </Button>
          </div>
        </div>

        {/* Custom Price */}
        <div className="space-y-2">
          <Label>Custom Mint Price</Label>
          <div className="text-sm text-muted-foreground mb-2">
            Current: Ξ
            {currentCustomPrice
              ? formatEther(currentCustomPrice as bigint)
              : "0"}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.001"
              placeholder="0.002"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
            />
            <Button
              onClick={handleSetCustomPrice}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? "Processing..." : "Update"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Batch Mint Control
function BatchMintControl({ onSuccess }: { onSuccess?: () => void }) {
  const [recipient, setRecipient] = useState("");
  const [quantity, setQuantity] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const processedHash = useRef<string | undefined>(undefined);
  const mintInfo = useRef<{ recipient: string; quantity: string } | undefined>(
    undefined
  );

  useEffect(() => {
    if (
      isConfirmed &&
      hash &&
      hash !== processedHash.current &&
      mintInfo.current
    ) {
      processedHash.current = hash;
      toast.success(
        `Batch minted ${mintInfo.current.quantity} NFTs to ${mintInfo.current.recipient}`
      );
      queueMicrotask(() => {
        setRecipient("");
        setQuantity("");
        mintInfo.current = undefined;
        onSuccess?.();
      });
    }
  }, [isConfirmed, hash, onSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(`Batch mint failed: ${error.message}`);
      queueMicrotask(() => {
        mintInfo.current = undefined;
      });
    }
  }, [error]);

  const handleBatchMint = () => {
    if (!recipient || !quantity) {
      toast.error("Please fill in all fields");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0 || qty > 10) {
      toast.error("Quantity must be between 1 and 10");
      return;
    }

    mintInfo.current = { recipient, quantity };
    writeContract({
      ...contracts.gogogaNft,
      functionName: "batchMintPreset",
      args: [recipient as `0x${string}`, BigInt(qty)],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Batch Mint Preset NFTs
        </CardTitle>
        <CardDescription>
          Mint multiple preset NFTs to a specific address (for airdrops)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Recipient Address</Label>
          <Input
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Quantity (1-10)</Label>
          <Input
            type="number"
            min="1"
            max="10"
            placeholder="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <Button
          onClick={handleBatchMint}
          disabled={isPending || isConfirming}
          className="w-full"
        >
          {isPending || isConfirming ? "Processing..." : "Batch Mint"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Base URI Control
function BaseURIControl({ onSuccess }: { onSuccess?: () => void }) {
  const [baseURI, setBaseURI] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const processedHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isConfirmed && hash && hash !== processedHash.current) {
      processedHash.current = hash;
      toast.success("Preset base URI updated");
      queueMicrotask(() => {
        setBaseURI("");
        onSuccess?.();
      });
    }
  }, [isConfirmed, hash, onSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to update base URI: ${error.message}`);
    }
  }, [error]);

  const handleSetBaseURI = () => {
    if (!baseURI) {
      toast.error("Please enter a base URI");
      return;
    }

    writeContract({
      ...contracts.gogogaNft,
      functionName: "setPresetBaseURI",
      args: [baseURI],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Update Preset Base URI
        </CardTitle>
        <CardDescription>
          Update the base URI for preset NFTs (0-9)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Base URI</Label>
          <Input
            type="text"
            placeholder="ipfs://QmXXX/"
            value={baseURI}
            onChange={(e) => setBaseURI(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Example: ipfs://QmXXX/ (will append token ID)
          </p>
        </div>

        <Button
          onClick={handleSetBaseURI}
          disabled={isPending || isConfirming}
          className="w-full"
        >
          {isPending || isConfirming ? "Processing..." : "Update Base URI"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Custom URI Control
function CustomURIControl({ onSuccess }: { onSuccess?: () => void }) {
  const [tokenId, setTokenId] = useState("");
  const [customURI, setCustomURI] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const processedHash = useRef<string | undefined>(undefined);
  const updateInfo = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      isConfirmed &&
      hash &&
      hash !== processedHash.current &&
      updateInfo.current
    ) {
      processedHash.current = hash;
      toast.success(`Updated URI for token #${updateInfo.current}`);
      queueMicrotask(() => {
        setTokenId("");
        setCustomURI("");
        updateInfo.current = undefined;
        onSuccess?.();
      });
    }
  }, [isConfirmed, hash, onSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to update URI: ${error.message}`);
      queueMicrotask(() => {
        updateInfo.current = undefined;
      });
    }
  }, [error]);

  const handleUpdateCustomURI = () => {
    if (!tokenId || !customURI) {
      toast.error("Please fill in all fields");
      return;
    }

    const id = parseInt(tokenId);
    if (isNaN(id) || id < 10) {
      toast.error("Token ID must be 10 or greater");
      return;
    }

    updateInfo.current = tokenId;
    writeContract({
      ...contracts.gogogaNft,
      functionName: "updateCustomTokenURI",
      args: [BigInt(id), customURI],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Update Custom Token URI
        </CardTitle>
        <CardDescription>
          Update URI for custom NFTs (for content moderation)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Token ID (≥10)</Label>
          <Input
            type="number"
            min="10"
            placeholder="10"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>New URI</Label>
          <Input
            type="text"
            placeholder="ipfs://QmYYY/metadata.json"
            value={customURI}
            onChange={(e) => setCustomURI(e.target.value)}
          />
        </div>

        <Button
          onClick={handleUpdateCustomURI}
          disabled={isPending || isConfirming}
          className="w-full"
        >
          {isPending || isConfirming ? "Processing..." : "Update Custom URI"}
        </Button>
      </CardContent>
    </Card>
  );
}
