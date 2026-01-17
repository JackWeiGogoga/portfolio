import {
  ProjectCard,
  ProjectCardContent,
  ProjectCardHeader,
  ProjectCardTitle,
} from "@/components/ui/project-card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "@/components/AddressDisplay";
import { Candidate } from "@/hooks/useVoting";
import { calculateVotePercentage } from "../utils";
import { Trophy, User, Medal } from "lucide-react";

type CandidatesListProps = {
  candidates: Candidate[];
  isLoading: boolean;
  totalVotes: bigint;
  showRanking?: boolean;
};

export function CandidatesList({
  candidates,
  isLoading,
  totalVotes,
  showRanking = false,
}: CandidatesListProps) {
  // 按票数排序
  const sortedCandidates = showRanking
    ? [...candidates].sort((a, b) => Number(b.voteCount - a.voteCount))
    : candidates;

  // 获取排名图标
  const getRankIcon = (index: number) => {
    if (index === 0 && sortedCandidates[0]?.voteCount > 0n) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    }
    if (index === 1 && sortedCandidates[1]?.voteCount > 0n) {
      return <Medal className="w-5 h-5 text-gray-400" />;
    }
    if (index === 2 && sortedCandidates[2]?.voteCount > 0n) {
      return <Medal className="w-5 h-5 text-amber-600" />;
    }
    return (
      <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">
        #{index + 1}
      </span>
    );
  };

  if (isLoading) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle>Candidates</ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  if (candidates.length === 0) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle>Candidates</ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No candidates registered yet</p>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  return (
    <ProjectCard>
      <ProjectCardHeader>
        <ProjectCardTitle>
          {showRanking ? "Results & Rankings" : "Candidates"}
        </ProjectCardTitle>
      </ProjectCardHeader>
      <ProjectCardContent className="space-y-3">
        {sortedCandidates.map((candidate, index) => {
          const percentage = calculateVotePercentage(
            candidate.voteCount,
            totalVotes
          );
          const isLeading =
            showRanking && index === 0 && candidate.voteCount > 0n;

          return (
            <div
              key={candidate.id.toString()}
              className={`p-4 rounded-xl border transition-all ${
                isLeading
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {showRanking && getRankIcon(index)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">
                      {candidate.name}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      ID: {candidate.id.toString()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <AddressDisplay address={candidate.candidateAddress} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-lg">
                    {Number(candidate.voteCount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </ProjectCardContent>
    </ProjectCard>
  );
}
