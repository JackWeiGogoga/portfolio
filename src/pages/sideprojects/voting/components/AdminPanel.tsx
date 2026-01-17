import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ProjectCard,
  ProjectCardContent,
  ProjectCardHeader,
  ProjectCardTitle,
} from "@/components/ui/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  VotingStatus,
  useRegisterCandidate,
  useRegisterVoter,
  useRegisterVoterBatch,
  useStartVoting,
  useEndVoting,
  useVotingPause,
  useCanEndVoting,
} from "@/hooks/useVoting";
import { formatErrorMessage, isValidAddress } from "../utils";
import {
  Settings,
  UserPlus,
  Users,
  Play,
  Square,
  Pause,
  PlayCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type AdminPanelProps = {
  votingInfo: {
    votingStatus?: number;
    isPaused?: boolean;
    isVotingExpired?: boolean;
  };
  onSuccess: () => void;
};

export function AdminPanel({ votingInfo, onSuccess }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("candidates");

  // 候选人注册
  const [candidateAddress, setCandidateAddress] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const registerCandidate = useRegisterCandidate();
  const lastRegCandidateHashRef = useRef<string | undefined>(undefined);

  // 选民注册
  const [voterAddress, setVoterAddress] = useState("");
  const [voterName, setVoterName] = useState("");
  const registerVoter = useRegisterVoter();
  const lastRegVoterHashRef = useRef<string | undefined>(undefined);

  // 批量注册选民
  const [batchVoters, setBatchVoters] = useState("");
  const registerVoterBatch = useRegisterVoterBatch();
  const lastRegBatchHashRef = useRef<string | undefined>(undefined);

  // 投票控制
  const [votingDuration, setVotingDuration] = useState("3600");
  const startVoting = useStartVoting();
  const endVoting = useEndVoting();
  const pauseControl = useVotingPause();
  const { canEnd, reason: canEndReason } = useCanEndVoting();
  const lastStartHashRef = useRef<string | undefined>(undefined);
  const lastEndHashRef = useRef<string | undefined>(undefined);
  const lastPauseHashRef = useRef<string | undefined>(undefined);

  const isNotStarted = votingInfo.votingStatus === VotingStatus.NotStarted;
  const isActive = votingInfo.votingStatus === VotingStatus.Active;
  const isEnded = votingInfo.votingStatus === VotingStatus.Ended;

  // 注册候选人
  const handleRegisterCandidate = () => {
    if (!isValidAddress(candidateAddress)) {
      toast.error("Invalid Ethereum address");
      return;
    }
    if (!candidateName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    registerCandidate.registerCandidate(candidateAddress, candidateName);
  };

  // 注册选民
  const handleRegisterVoter = () => {
    if (!isValidAddress(voterAddress)) {
      toast.error("Invalid Ethereum address");
      return;
    }
    if (!voterName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    registerVoter.registerVoter(voterAddress, voterName);
  };

  // 批量注册选民
  const handleRegisterVoterBatch = () => {
    try {
      const lines = batchVoters
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);

      const addresses: string[] = [];
      const names: string[] = [];

      for (const line of lines) {
        const [address, name] = line.split(",").map((s) => s.trim());
        if (!isValidAddress(address)) {
          toast.error(`Invalid address: ${address}`);
          return;
        }
        if (!name) {
          toast.error(`Missing name for address: ${address}`);
          return;
        }
        addresses.push(address);
        names.push(name);
      }

      if (addresses.length === 0) {
        toast.error("No valid entries found");
        return;
      }

      registerVoterBatch.registerVoterBatch(addresses, names);
    } catch {
      toast.error("Invalid format. Use: address,name (one per line)");
    }
  };

  // 开始投票
  const handleStartVoting = () => {
    const duration = parseInt(votingDuration);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }
    startVoting.startVoting(BigInt(duration));
  };

  // 结束投票
  const handleEndVoting = () => {
    endVoting.endVoting();
  };

  // 暂停/恢复
  const handlePause = () => {
    if (votingInfo.isPaused) {
      pauseControl.unpause();
    } else {
      pauseControl.pause();
    }
  };

  // 成功处理 - 候选人注册
  useEffect(() => {
    if (
      registerCandidate.isSuccess &&
      registerCandidate.hash &&
      lastRegCandidateHashRef.current !== registerCandidate.hash
    ) {
      lastRegCandidateHashRef.current = registerCandidate.hash;
      toast.success("Candidate registered successfully!");
      queueMicrotask(() => {
        setCandidateAddress("");
        setCandidateName("");
      });
      onSuccess();
    }
  }, [registerCandidate.isSuccess, registerCandidate.hash, onSuccess]);

  // 成功处理 - 选民注册
  useEffect(() => {
    if (
      registerVoter.isSuccess &&
      registerVoter.hash &&
      lastRegVoterHashRef.current !== registerVoter.hash
    ) {
      lastRegVoterHashRef.current = registerVoter.hash;
      toast.success("Voter registered successfully!");
      queueMicrotask(() => {
        setVoterAddress("");
        setVoterName("");
      });
      onSuccess();
    }
  }, [registerVoter.isSuccess, registerVoter.hash, onSuccess]);

  // 成功处理 - 批量注册
  useEffect(() => {
    if (
      registerVoterBatch.isSuccess &&
      registerVoterBatch.hash &&
      lastRegBatchHashRef.current !== registerVoterBatch.hash
    ) {
      lastRegBatchHashRef.current = registerVoterBatch.hash;
      toast.success("Voters registered successfully!");
      queueMicrotask(() => {
        setBatchVoters("");
      });
      onSuccess();
    }
  }, [registerVoterBatch.isSuccess, registerVoterBatch.hash, onSuccess]);

  // 成功处理 - 开始投票
  useEffect(() => {
    if (
      startVoting.isSuccess &&
      startVoting.hash &&
      lastStartHashRef.current !== startVoting.hash
    ) {
      lastStartHashRef.current = startVoting.hash;
      toast.success("Voting started successfully!");
      onSuccess();
    }
  }, [startVoting.isSuccess, startVoting.hash, onSuccess]);

  // 成功处理 - 结束投票
  useEffect(() => {
    if (
      endVoting.isSuccess &&
      endVoting.hash &&
      lastEndHashRef.current !== endVoting.hash
    ) {
      lastEndHashRef.current = endVoting.hash;
      toast.success("Voting ended successfully!");
      onSuccess();
    }
  }, [endVoting.isSuccess, endVoting.hash, onSuccess]);

  // 成功处理 - 暂停/恢复
  useEffect(() => {
    if (
      pauseControl.isSuccess &&
      pauseControl.hash &&
      lastPauseHashRef.current !== pauseControl.hash
    ) {
      lastPauseHashRef.current = pauseControl.hash;
      toast.success(votingInfo.isPaused ? "Voting resumed!" : "Voting paused!");
      onSuccess();
    }
  }, [
    pauseControl.isSuccess,
    pauseControl.hash,
    votingInfo.isPaused,
    onSuccess,
  ]);

  return (
    <ProjectCard>
      <ProjectCardHeader>
        <ProjectCardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Admin Panel
        </ProjectCardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Manage candidates, voters, and voting status
        </p>
      </ProjectCardHeader>
      <ProjectCardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="candidates">
              <UserPlus className="w-4 h-4 mr-1" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="voters">
              <Users className="w-4 h-4 mr-1" />
              Voters
            </TabsTrigger>
            <TabsTrigger value="control">
              <Play className="w-4 h-4 mr-1" />
              Control
            </TabsTrigger>
          </TabsList>

          {/* 候选人注册 */}
          <TabsContent value="candidates" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="candidateAddress">Candidate Address</Label>
                <Input
                  id="candidateAddress"
                  placeholder="0x..."
                  value={candidateAddress}
                  onChange={(e) => setCandidateAddress(e.target.value)}
                  disabled={!isNotStarted}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="candidateName">Candidate Name</Label>
                <Input
                  id="candidateName"
                  placeholder="John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  disabled={!isNotStarted}
                />
              </div>
              <Button
                onClick={handleRegisterCandidate}
                disabled={
                  !isNotStarted ||
                  registerCandidate.isPending ||
                  registerCandidate.isConfirming
                }
                className="w-full"
              >
                {registerCandidate.isPending ||
                registerCandidate.isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Candidate
                  </>
                )}
              </Button>

              {!isNotStarted && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Candidates can only be registered before voting starts.
                  </AlertDescription>
                </Alert>
              )}

              {registerCandidate.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formatErrorMessage(registerCandidate.error)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* 选民注册 */}
          <TabsContent value="voters" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Register Single Voter</h4>
              <div className="space-y-1.5">
                <Label htmlFor="voterAddress">Voter Address</Label>
                <Input
                  id="voterAddress"
                  placeholder="0x..."
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                  disabled={!isNotStarted}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="voterName">Voter Name</Label>
                <Input
                  id="voterName"
                  placeholder="Jane Doe"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  disabled={!isNotStarted}
                />
              </div>
              <Button
                onClick={handleRegisterVoter}
                disabled={
                  !isNotStarted ||
                  registerVoter.isPending ||
                  registerVoter.isConfirming
                }
                className="w-full"
              >
                {registerVoter.isPending || registerVoter.isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Voter
                  </>
                )}
              </Button>

              {registerVoter.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formatErrorMessage(registerVoter.error)}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Batch Register Voters</h4>
              <div className="space-y-1.5">
                <Label htmlFor="batchVoters">
                  Voters (address,name per line)
                </Label>
                <textarea
                  id="batchVoters"
                  className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm"
                  placeholder="0x123...,Alice&#10;0x456...,Bob&#10;0x789...,Charlie"
                  value={batchVoters}
                  onChange={(e) => setBatchVoters(e.target.value)}
                  disabled={!isNotStarted}
                />
              </div>
              <Button
                onClick={handleRegisterVoterBatch}
                disabled={
                  !isNotStarted ||
                  registerVoterBatch.isPending ||
                  registerVoterBatch.isConfirming
                }
                className="w-full"
              >
                {registerVoterBatch.isPending ||
                registerVoterBatch.isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Batch Register
                  </>
                )}
              </Button>

              {registerVoterBatch.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formatErrorMessage(registerVoterBatch.error)}
                  </AlertDescription>
                </Alert>
              )}

              {!isNotStarted && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Voters can only be registered before voting starts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* 投票控制 */}
          <TabsContent value="control" className="space-y-4">
            {/* 开始投票 */}
            {isNotStarted && (
              <div className="space-y-3 p-4 border rounded-xl">
                <h4 className="font-medium flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Start Voting
                </h4>
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="3600"
                    value={votingDuration}
                    onChange={(e) => setVotingDuration(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {parseInt(votingDuration)
                      ? `≈ ${Math.floor(parseInt(votingDuration) / 60)} minutes`
                      : ""}
                  </p>
                </div>
                <Button
                  onClick={handleStartVoting}
                  disabled={startVoting.isPending || startVoting.isConfirming}
                  className="w-full"
                >
                  {startVoting.isPending || startVoting.isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Voting
                    </>
                  )}
                </Button>

                {startVoting.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {formatErrorMessage(startVoting.error)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* 暂停/恢复 */}
            {isActive && (
              <div className="space-y-3 p-4 border rounded-xl">
                <h4 className="font-medium flex items-center gap-2">
                  {votingInfo.isPaused ? (
                    <PlayCircle className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  {votingInfo.isPaused ? "Resume Voting" : "Pause Voting"}
                </h4>
                <Button
                  onClick={handlePause}
                  disabled={pauseControl.isPending || pauseControl.isConfirming}
                  variant={votingInfo.isPaused ? "default" : "outline"}
                  className="w-full"
                >
                  {pauseControl.isPending || pauseControl.isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {votingInfo.isPaused ? "Resuming..." : "Pausing..."}
                    </>
                  ) : votingInfo.isPaused ? (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Resume Voting
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Voting
                    </>
                  )}
                </Button>

                {pauseControl.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {formatErrorMessage(pauseControl.error)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* 结束投票 */}
            {isActive && (
              <div className="space-y-3 p-4 border rounded-xl">
                <h4 className="font-medium flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  End Voting
                </h4>
                <Button
                  onClick={handleEndVoting}
                  disabled={
                    !canEnd || endVoting.isPending || endVoting.isConfirming
                  }
                  variant="destructive"
                  className="w-full"
                >
                  {endVoting.isPending || endVoting.isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ending...
                    </>
                  ) : (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      End Voting
                    </>
                  )}
                </Button>
                {!canEnd && canEndReason && (
                  <p className="text-xs text-muted-foreground">
                    {canEndReason}
                  </p>
                )}

                {endVoting.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {formatErrorMessage(endVoting.error)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* 投票已结束 */}
            {isEnded && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Voting has ended. No further actions available.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </ProjectCardContent>
    </ProjectCard>
  );
}
