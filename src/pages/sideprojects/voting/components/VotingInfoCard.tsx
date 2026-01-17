import { ProjectCard, ProjectCardContent } from "@/components/ui/project-card";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "@/components/AddressDisplay";
import { VOTING_ADDRESS } from "@/config/contracts";
import { VotingStatus, VOTING_STATUS_TEXT } from "@/hooks/useVoting";
import { formatDuration, formatTimestamp } from "../utils";
import { Vote, Users, Clock, CheckCircle2, XCircle } from "lucide-react";

type VotingInfoCardProps = {
  votingInfo: {
    votingStatus?: number;
    votingStartTime?: bigint;
    votingEndTime?: bigint;
    candidateCount?: bigint;
    isPaused?: boolean;
    remainingTime?: bigint;
    isVotingExpired?: boolean;
  };
  statistics: {
    totalVoters: bigint;
    totalVotesCast: bigint;
    totalCandidates: bigint;
    participationRate: bigint;
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
  isOwner: boolean;
};

export function VotingInfoCard({
  votingInfo,
  statistics,
  voterInfo,
  isConnected,
  isOwner,
}: VotingInfoCardProps) {
  const getStatusBadgeVariant = () => {
    if (votingInfo.isPaused) return "destructive";
    switch (votingInfo.votingStatus) {
      case VotingStatus.Active:
        return "default";
      case VotingStatus.Ended:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = () => {
    if (votingInfo.isPaused) return "Paused";
    return (
      VOTING_STATUS_TEXT[votingInfo.votingStatus as VotingStatus] || "Unknown"
    );
  };

  return (
    <ProjectCard className="mb-4">
      <ProjectCardContent>
        <div className="flex items-start gap-4 md:gap-6">
          <div className="shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Vote className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
              <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                Decentralized Voting
              </h1>
              <Badge variant={getStatusBadgeVariant()} className="text-xs">
                {getStatusText()}
              </Badge>
              {votingInfo.isVotingExpired &&
                votingInfo.votingStatus === VotingStatus.Active && (
                  <Badge variant="secondary" className="text-xs">
                    Awaiting End
                  </Badge>
                )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              A transparent and secure on-chain voting system powered by smart
              contracts
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Candidates
                </div>
                <div className="font-bold text-sm md:text-base">
                  {Number(statistics.totalCandidates)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Voters
                </div>
                <div className="font-bold text-sm md:text-base">
                  {Number(statistics.totalVoters)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Number(statistics.totalVotesCast)} voted
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {votingInfo.votingStatus === VotingStatus.Active
                    ? "Time Left"
                    : "Duration"}
                </div>
                <div className="font-bold text-sm md:text-base text-primary">
                  {votingInfo.votingStatus === VotingStatus.Active
                    ? formatDuration(votingInfo.remainingTime ?? 0n)
                    : votingInfo.votingEndTime && votingInfo.votingStartTime
                    ? formatDuration(
                        votingInfo.votingEndTime - votingInfo.votingStartTime
                      )
                    : "Not set"}
                </div>
                {votingInfo.votingStatus === VotingStatus.Active && (
                  <div className="text-xs text-muted-foreground">
                    Ends: {formatTimestamp(votingInfo.votingEndTime ?? 0n)}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Participation
                </div>
                <div className="font-bold text-sm md:text-base">
                  {(Number(statistics.participationRate) / 100).toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  of registered voters
                </div>
              </div>
            </div>

            {/* 用户状态 */}
            {isConnected && (
              <div className="flex items-center gap-4 text-sm mb-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {voterInfo.isRegistered ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      voterInfo.isRegistered
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }
                  >
                    {voterInfo.isRegistered
                      ? "Registered Voter"
                      : "Not Registered"}
                  </span>
                </div>
                {voterInfo.isRegistered && (
                  <div className="flex items-center gap-1.5">
                    {voterInfo.hasVoted ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span
                      className={
                        voterInfo.hasVoted
                          ? "text-blue-500"
                          : "text-muted-foreground"
                      }
                    >
                      {voterInfo.hasVoted ? "Vote Cast" : "Not Voted Yet"}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground">Contract:</span>
              <AddressDisplay address={VOTING_ADDRESS} />
              {isOwner && (
                <Badge variant="outline" className="text-xs">
                  Owner
                </Badge>
              )}
            </div>
          </div>
        </div>
      </ProjectCardContent>
    </ProjectCard>
  );
}
