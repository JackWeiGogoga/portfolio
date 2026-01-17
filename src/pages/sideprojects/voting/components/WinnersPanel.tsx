import {
  ProjectCard,
  ProjectCardContent,
  ProjectCardHeader,
  ProjectCardTitle,
} from "@/components/ui/project-card";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "@/components/AddressDisplay";
import { Trophy, Crown, Users } from "lucide-react";

type WinnersPanelProps = {
  winners: {
    winnerIds: readonly bigint[];
    winnerAddresses: readonly string[];
    winnerNames: readonly string[];
    highestVoteCount: bigint;
    isLoading: boolean;
  };
};

export function WinnersPanel({ winners }: WinnersPanelProps) {
  const hasWinners =
    winners.winnerIds.length > 0 && winners.highestVoteCount > 0n;
  const isTie = winners.winnerIds.length > 1;

  if (winners.isLoading) {
    return (
      <ProjectCard className="border-yellow-500/50 bg-linear-to-r from-yellow-500/5 to-amber-500/5">
        <ProjectCardContent className="py-8 text-center">
          <div className="animate-pulse">Loading results...</div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  if (!hasWinners) {
    return (
      <ProjectCard>
        <ProjectCardHeader>
          <ProjectCardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Final Results
          </ProjectCardTitle>
        </ProjectCardHeader>
        <ProjectCardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No votes were cast during this voting session.</p>
          </div>
        </ProjectCardContent>
      </ProjectCard>
    );
  }

  return (
    <ProjectCard className="border-yellow-500/50 bg-linear-to-r from-yellow-500/5 to-amber-500/5">
      <ProjectCardHeader>
        <ProjectCardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <Trophy className="w-5 h-5" />
          {isTie ? "Winners (Tie)" : "Winner"}
        </ProjectCardTitle>
      </ProjectCardHeader>
      <ProjectCardContent>
        <div className="space-y-4">
          {winners.winnerNames.map((name, index) => (
            <div
              key={winners.winnerIds[index].toString()}
              className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
            >
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold">{name}</span>
                  <Badge className="bg-yellow-500 text-white">🏆 Winner</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <AddressDisplay address={winners.winnerAddresses[index]} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {Number(winners.highestVoteCount)}
                </div>
                <div className="text-xs text-muted-foreground">votes</div>
              </div>
            </div>
          ))}

          {isTie && (
            <p className="text-sm text-center text-muted-foreground">
              Multiple candidates received the same number of votes
            </p>
          )}
        </div>
      </ProjectCardContent>
    </ProjectCard>
  );
}
