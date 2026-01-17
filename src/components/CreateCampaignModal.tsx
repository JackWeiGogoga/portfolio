import { useState, useMemo } from "react";
import { useConnection } from "wagmi";
import { PlusCircle, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IpfsImage from "@/components/IpfsImage";
import { ipfsToHttp } from "@/lib/ipfs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useCreateCampaign,
  CreateCampaignParams,
} from "@/hooks/useCreateCampaign";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_MIN_CONTRIBUTION } from "@/config/constants";

export const FORM_VALIDATION = {
  PROJECT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  PROJECT_DESCRIPTION: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100000,
  },
  PROJECT_GOAL: {
    MIN: 0.001,
  },
  PROJECT_DURATION: {
    MIN: 1,
    MAX: 365,
  },
  TIER_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  TIER_AMOUNT: {
    MIN: 0.001,
    MAX: 1000,
  },
} as const;

interface TierFormData {
  name: string;
  amount: string;
}

interface CreateCampaignModalProps {
  onSuccess?: () => void;
}

export default function CreateCampaignModal({
  onSuccess,
}: CreateCampaignModalProps) {
  const { isConnected } = useConnection();
  const { toast } = useToast();
  const { createCampaign, isLoading: isCreating } = useCreateCampaign();

  const [isOpen, setIsOpen] = useState(false);
  const [isTiersOpen, setIsTiersOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [goal, setGoal] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [minContribution, setMinContribution] = useState(
    DEFAULT_MIN_CONTRIBUTION
  );
  const [tiers, setTiers] = useState<TierFormData[]>([]);

  // 将 IPFS URL 转换为可访问的 HTTP URL (使用 useMemo 优化性能)
  const iconPreview = useMemo(() => ipfsToHttp(icon), [icon]);

  // Validate create form
  const validateForm = (): string | null => {
    // 验证项目名称
    if (!name.trim()) return "Please enter project name";
    if (name.trim().length < FORM_VALIDATION.PROJECT_NAME.MIN_LENGTH)
      return `Project name must be at least ${FORM_VALIDATION.PROJECT_NAME.MIN_LENGTH} characters`;
    if (name.trim().length > FORM_VALIDATION.PROJECT_NAME.MAX_LENGTH)
      return `Project name must be less than ${FORM_VALIDATION.PROJECT_NAME.MAX_LENGTH} characters`;

    // 验证项目描述
    if (!description.trim()) return "Please enter project description";
    if (
      description.trim().length < FORM_VALIDATION.PROJECT_DESCRIPTION.MIN_LENGTH
    )
      return `Project description must be at least ${FORM_VALIDATION.PROJECT_DESCRIPTION.MIN_LENGTH} characters`;
    if (
      description.trim().length > FORM_VALIDATION.PROJECT_DESCRIPTION.MAX_LENGTH
    )
      return `Project description must be less than ${FORM_VALIDATION.PROJECT_DESCRIPTION.MAX_LENGTH} characters`;

    // 验证目标金额
    const goalAmount = parseFloat(goal);
    if (
      !goal ||
      isNaN(goalAmount) ||
      goalAmount < FORM_VALIDATION.PROJECT_GOAL.MIN
    )
      return `Goal amount must be at least ${FORM_VALIDATION.PROJECT_GOAL.MIN} ETH`;

    // 验证活动持续时间
    const duration = parseInt(durationDays);
    if (
      !durationDays ||
      isNaN(duration) ||
      duration < FORM_VALIDATION.PROJECT_DURATION.MIN
    )
      return `Campaign duration must be at least ${FORM_VALIDATION.PROJECT_DURATION.MIN} day(s)`;
    if (duration > FORM_VALIDATION.PROJECT_DURATION.MAX)
      return `Campaign duration must be less than ${FORM_VALIDATION.PROJECT_DURATION.MAX} days`;

    // 验证最小贡献
    const minContributionAmount = parseFloat(minContribution);
    if (
      !minContribution ||
      isNaN(minContributionAmount) ||
      minContributionAmount <= 0
    )
      return "Please enter a valid minimum contribution";

    // 验证层级
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];

      // 验证层级名称
      if (!tier.name.trim()) return `Tier ${i + 1}: Please enter a name`;
      if (tier.name.trim().length < FORM_VALIDATION.TIER_NAME.MIN_LENGTH)
        return `Tier ${i + 1}: Name must be at least ${
          FORM_VALIDATION.TIER_NAME.MIN_LENGTH
        } characters`;
      if (tier.name.trim().length > FORM_VALIDATION.TIER_NAME.MAX_LENGTH)
        return `Tier ${i + 1}: Name must be less than ${
          FORM_VALIDATION.TIER_NAME.MAX_LENGTH
        } characters`;

      // 验证层级金额
      const tierAmount = parseFloat(tier.amount);
      if (
        !tier.amount ||
        isNaN(tierAmount) ||
        tierAmount < FORM_VALIDATION.TIER_AMOUNT.MIN
      )
        return `Tier ${i + 1}: Amount must be at least ${
          FORM_VALIDATION.TIER_AMOUNT.MIN
        } ETH`;
      if (tierAmount > FORM_VALIDATION.TIER_AMOUNT.MAX)
        return `Tier ${i + 1}: Amount must be less than ${
          FORM_VALIDATION.TIER_AMOUNT.MAX
        } ETH`;
    }

    return null;
  };

  // Add tier
  const addTier = () => {
    setTiers([...tiers, { name: "", amount: "" }]);
  };

  // Remove tier
  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  // Update tier
  const updateTier = (
    index: number,
    field: keyof TierFormData,
    value: string
  ) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("");
    setGoal("");
    setDurationDays("30");
    setMinContribution(DEFAULT_MIN_CONTRIBUTION);
    setTiers([]);
  };

  // Submit create project form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Please connect your wallet first",
      });
      return;
    }

    const error = validateForm();
    if (error) {
      toast({
        variant: "destructive",
        title: "Form validation failed",
        description: error,
      });
      return;
    }

    try {
      const params: CreateCampaignParams = {
        name,
        description,
        icon: icon || "",
        goal,
        durationInDays: parseInt(durationDays),
        minContribution,
        tiers: tiers.map((tier) => ({
          name: tier.name,
          amount: tier.amount,
        })),
      };

      await createCampaign(params);

      toast({
        variant: "success",
        title: "Success!",
        description: "Your crowdfunding project has been created successfully",
      });

      resetForm();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create project, please try again";

      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        // 只有在非创建状态时才允许关闭
        if (!isCreating) {
          setIsOpen(newOpen);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" disabled={!isConnected}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // 创建过程中时阻止点击外部关闭
          if (isCreating) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // 创建过程中时阻止 ESC 键关闭
          if (isCreating) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Crowdfunding Project</DialogTitle>
          <DialogDescription>
            Fill in the following information to create your crowdfunding
            project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Give your project a good name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>

              <MarkdownEditor
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="Project Description"
                placeholder="Describe your project in detail... (Markdown supported)"
                required
                maxLength={5000}
                disabled={isCreating}
              />

              <div className="space-y-2">
                <Label htmlFor="icon">
                  Project Icon URL (Optional)
                  <span className="text-xs text-muted-foreground ml-2">
                    Supports IPFS (ipfs://...)
                  </span>
                </Label>
                <Input
                  id="icon"
                  type="text"
                  placeholder="https://example.com/icon.png or ipfs://Qm..."
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  disabled={isCreating}
                />
                {iconPreview && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">Preview:</p>
                    <IpfsImage
                      key={iconPreview}
                      src={iconPreview}
                      alt="Icon preview"
                      className="object-cover"
                      containerClassName="w-32 h-32 border rounded-lg overflow-hidden bg-muted"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center text-xs text-destructive p-2 text-center">
                          Failed to load image
                        </div>
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Funding Goal */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal Amount (ETH) *</Label>
                  <Input
                    id="goal"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="10"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={isCreating}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Campaign Duration (Days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    disabled={isCreating}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minContribution">
                  Minimum Contribution (ETH) *
                </Label>
                <Input
                  id="minContribution"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder={DEFAULT_MIN_CONTRIBUTION}
                  value={minContribution}
                  onChange={(e) => setMinContribution(e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Support Tiers - Collapsible */}
          <Collapsible open={isTiersOpen} onOpenChange={setIsTiersOpen}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Support Tiers (Optional)</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      {isTiersOpen ? "Hide" : "Show"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isTiersOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                {!isTiersOpen && tiers.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {tiers.length} tier{tiers.length !== 1 ? "s" : ""} added
                  </p>
                )}
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {tiers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No tiers added yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tiers.map((tier, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Tier {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTier(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Tier Name *</Label>
                              <Input
                                placeholder="e.g., Bronze Supporter"
                                value={tier.name}
                                onChange={(e) =>
                                  updateTier(index, "name", e.target.value)
                                }
                                disabled={isCreating}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Amount (ETH) *</Label>
                              <Input
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder="0.1"
                                value={tier.amount}
                                onChange={(e) =>
                                  updateTier(index, "amount", e.target.value)
                                }
                                disabled={isCreating}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTier}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tier
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Transaction Progress Indicator */}
          {isCreating && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">⏳ Transaction in progress</p>
              <p className="text-xs opacity-80">
                Please wait for the transaction to complete. This may take a few
                moments. Do not close this dialog.
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
