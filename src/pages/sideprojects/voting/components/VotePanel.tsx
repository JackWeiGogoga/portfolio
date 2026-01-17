import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ProjectCard,
  ProjectCardContent,
  ProjectCardHeader,
  ProjectCardTitle,
} from "@/components/ui/project-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Candidate,
  VotingStatus,
  useVote,
  useEndVoting,
  useCanEndVoting,
} from "@/hooks/useVoting";
import { formatErrorMessage } from "../utils";
import {
  Vote,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

type VotePanelProps = {
  candidates: Candidate[];
  votingInfo: {
    votingStatus?: number;
    isPaused?: boolean;
    isVotingExpired?: boolean;
  };
  voterInfo: {
    isRegistered: boolean;
    hasVoted: boolean;
    voter: {
      name: string;
      votedCandidateId: bigint;
    } | null;
  };
  isConnected: boolean;
  onVoteSuccess: () => void;
};

export function VotePanel({
  candidates,
  votingInfo,
  voterInfo,
  isConnected,
  onVoteSuccess,
}: VotePanelProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const vote = useVote();
  const endVoting = useEndVoting();
  const { canEnd, reason } = useCanEndVoting();
  const lastVoteHashRef = useRef<string | undefined>(undefined);
  const lastEndHashRef = useRef<string | undefined>(undefined);

  const isActive = votingInfo.votingStatus === VotingStatus.Active;
  const isNotStarted = votingInfo.votingStatus === VotingStatus.NotStarted;
  const isEnded = votingInfo.votingStatus === VotingStatus.Ended;

  // 获取已投票的候选人名字
  const getVotedCandidateName = () => {
    if (!voterInfo.voter?.votedCandidateId) return null;
    const candidate = candidates.find(
      (c) => c.id === voterInfo.voter?.votedCandidateId
    );
    return candidate?.name ?? `Candidate #${voterInfo.voter.votedCandidateId}`;
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }
    vote.voteById(BigInt(selectedCandidate));
  };

  const handleEndVoting = () => {
    endVoting.endVoting();
  };

  // 投票成功处理
  useEffect(() => {
    if (vote.isSuccess && vote.hash && lastVoteHashRef.current !== vote.hash) {
      lastVoteHashRef.current = vote.hash;
      toast.success("Vote cast successfully!");
      // 使用 queueMicrotask 避免在 effect 中同步调用 setState
      queueMicrotask(() => {
        setSelectedCandidate("");
      });
      onVoteSuccess();
    }
  }, [vote.isSuccess, vote.hash, onVoteSuccess]);

  // 结束投票成功处理
  useEffect(() => {
    if (
      endVoting.isSuccess &&
      endVoting.hash &&
      lastEndHashRef.current !== endVoting.hash
    ) {
      lastEndHashRef.current = endVoting.hash;
      toast.success("Voting ended successfully!");
      onVoteSuccess();
    }
  }, [endVoting.isSuccess, endVoting.hash, onVoteSuccess]);

  // 未连接钱包
  if (!isConnected) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Cast Your Vote
          </ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to vote
            </p>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  // 投票未开始
  if (isNotStarted) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Cast Your Vote
          </ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Voting Not Started</p>
            <p className="text-muted-foreground">
              The voting session has not started yet. Please wait for the
              administrator to start the voting.
            </p>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  // 投票已结束
  if (isEnded) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Cast Your Vote
          </ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium mb-2">Voting Has Ended</p>
            <p className="text-muted-foreground">
              The voting session has concluded. Check the results tab to see the
              winners.
            </p>
            {voterInfo.hasVoted && (
              <p className="text-sm text-muted-foreground mt-4">
                You voted for:{" "}
                <span className="font-medium text-primary">
                  {getVotedCandidateName()}
                </span>
              </p>
            )}
          </div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  // 未注册选民
  if (!voterInfo.isRegistered) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Cast Your Vote
          </ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
            <p className="text-lg font-medium mb-2">Not Registered</p>
            <p className="text-muted-foreground">
              You are not registered as a voter. Please contact the
              administrator to register.
            </p>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  // 已投票
  if (voterInfo.hasVoted) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Cast Your Vote
          </ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium mb-2">Vote Cast Successfully</p>
            <p className="text-muted-foreground">
              You have already voted for:{" "}
              <span className="font-medium text-primary">
                {getVotedCandidateName()}
              </span>
            </p>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  // 暂停状态
  if (votingInfo.isPaused) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Cast Your Vote
          </ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Voting is currently paused. Please wait for the administrator to
              resume.
            </AlertDescription>
          </Alert>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  return (
    <ProjectCard>
      <ProjectCardHeader>
        <ProjectCardTitle className="flex items-center gap-2">
          <Vote className="w-5 h-5" />
          Cast Your Vote
        </ProjectCardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Select a candidate and submit your vote
        </p>
      </ProjectCardHeader>
      <ProjectCardContent className="space-y-4">
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No candidates available
          </div>
        ) : (
          <>
            <RadioGroup
              value={selectedCandidate}
              onValueChange={setSelectedCandidate}
              className="space-y-3"
            >
              {candidates.map((candidate) => (
                <div
                  key={candidate.id.toString()}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedCandidate === candidate.id.toString()
                      ? "border-accent bg-accent scale-[1.02]"
                      : "border-border/50 hover:bg-accent hover:scale-[1.01]"
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id.toString())}
                >
                  <RadioGroupItem
                    value={candidate.id.toString()}
                    id={`candidate-${candidate.id}`}
                  />
                  <Label
                    htmlFor={`candidate-${candidate.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{candidate.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Number(candidate.voteCount)} votes
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              className="w-full"
              size="lg"
              onClick={handleVote}
              disabled={
                !selectedCandidate || vote.isPending || vote.isConfirming
              }
            >
              {vote.isPending || vote.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {vote.isPending ? "Confirming..." : "Processing..."}
                </>
              ) : (
                <>
                  <Vote className="mr-2 h-5 w-5" />
                  Submit Vote
                </>
              )}
            </Button>

            {vote.isError && (
              <Alert
                variant={
                  vote.error?.message?.includes("User rejected") ||
                  vote.error?.message?.includes("User denied")
                    ? "default"
                    : "destructive"
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {formatErrorMessage(vote.error)}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* 投票时间到期，可以结束投票 */}
        {votingInfo.isVotingExpired && isActive && (
          <div className="pt-4 border-t">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Voting time has expired. Anyone can end the voting now.
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={handleEndVoting}
              disabled={
                !canEnd || endVoting.isPending || endVoting.isConfirming
              }
            >
              {endVoting.isPending || endVoting.isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending...
                </>
              ) : (
                "End Voting"
              )}
            </Button>
            {!canEnd && reason && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {reason}
              </p>
            )}
          </div>
        )}
      </ProjectCardContent>
    </ProjectCard>
  );
}
