import { useCallback } from "react";
import { useConnection } from "wagmi";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useVotingInfo,
  useVotingStatistics,
  useAllCandidates,
  useVoterInfo,
  useIsVotingOwner,
  useWinners,
  VotingStatus,
} from "@/hooks/useVoting";
import {
  VotingInfoCard,
  CandidatesList,
  VotePanel,
  AdminPanel,
  WinnersPanel,
} from "./components";
import { Vote, BarChart3, Settings } from "lucide-react";

export default function VotingPage() {
  const { address, isConnected } = useConnection();

  // 获取投票合约数据
  const votingInfo = useVotingInfo();
  const statistics = useVotingStatistics();
  const {
    candidates,
    isLoading: candidatesLoading,
    refetch: refetchCandidates,
  } = useAllCandidates();
  const voterInfo = useVoterInfo(address);
  const { isOwner } = useIsVotingOwner();
  const winners = useWinners();

  const isEnded = votingInfo.votingStatus === VotingStatus.Ended;

  // 刷新数据
  const handleRefresh = useCallback(() => {
    votingInfo.refetch();
    statistics.refetch();
    refetchCandidates();
    voterInfo.refetch();
    winners.refetch();
  }, [votingInfo, statistics, refetchCandidates, voterInfo, winners]);

  return (
    <Layout variant="crowdfunding">
      <div className="space-y-6">
        {/* 投票信息卡片 */}
        <VotingInfoCard
          votingInfo={votingInfo}
          statistics={{
            totalVoters: statistics.totalVoters ?? 0n,
            totalVotesCast: statistics.totalVotesCast ?? 0n,
            totalCandidates: statistics.totalCandidates ?? 0n,
            participationRate: statistics.participationRate ?? 0n,
          }}
          voterInfo={{
            isRegistered: voterInfo.isRegistered,
            hasVoted: voterInfo.hasVoted,
            voter: voterInfo.voter,
          }}
          isConnected={isConnected}
          isOwner={isOwner}
        />

        {/* 主内容区 */}
        <Tabs defaultValue={isEnded ? "results" : "vote"} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="vote" className="flex items-center gap-2">
              <Vote className="w-4 h-4" />
              Vote
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          {/* 投票面板 */}
          <TabsContent value="vote" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VotePanel
                candidates={candidates}
                votingInfo={votingInfo}
                voterInfo={{
                  isRegistered: voterInfo.isRegistered,
                  hasVoted: voterInfo.hasVoted,
                  voter: voterInfo.voter,
                }}
                isConnected={isConnected}
                onVoteSuccess={handleRefresh}
              />
              <CandidatesList
                candidates={candidates}
                isLoading={candidatesLoading}
                totalVotes={statistics.totalVotesCast ?? 0n}
              />
            </div>
          </TabsContent>

          {/* 结果面板 */}
          <TabsContent value="results" className="space-y-4">
            {isEnded && <WinnersPanel winners={winners} />}
            <CandidatesList
              candidates={candidates}
              isLoading={candidatesLoading}
              totalVotes={statistics.totalVotesCast ?? 0n}
              showRanking={true}
            />
          </TabsContent>

          {/* 管理面板 */}
          {isOwner && (
            <TabsContent value="admin">
              <AdminPanel votingInfo={votingInfo} onSuccess={handleRefresh} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
