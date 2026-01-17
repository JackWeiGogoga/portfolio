import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { contracts } from "@/config/contracts";

// 投票状态枚举
export enum VotingStatus {
  NotStarted = 0,
  Active = 1,
  Ended = 2,
}

// 投票状态文本
export const VOTING_STATUS_TEXT = {
  [VotingStatus.NotStarted]: "Not Started",
  [VotingStatus.Active]: "Active",
  [VotingStatus.Ended]: "Ended",
};

// 候选人类型
export type Candidate = {
  id: bigint;
  candidateAddress: string;
  name: string;
  voteCount: bigint;
};

// 选民类型
export type Voter = {
  voterAddress: string;
  name: string;
  votedCandidateId: bigint;
  votedAt: bigint;
};

// 投票统计类型
export type VotingStatistics = {
  totalVoters: bigint;
  totalVotesCast: bigint;
  totalCandidates: bigint;
  participationRate: bigint;
};

// 获胜者类型
export type Winners = {
  winnerIds: readonly bigint[];
  winnerAddresses: readonly string[];
  winnerNames: readonly string[];
  highestVoteCount: bigint;
};

// 读取投票基本信息
export const useVotingInfo = () => {
  const { data: votingStatus, refetch: refetchStatus } = useReadContract({
    ...contracts.voting,
    functionName: "votingStatus",
  });

  const { data: votingStartTime } = useReadContract({
    ...contracts.voting,
    functionName: "votingStartTime",
  });

  const { data: votingEndTime } = useReadContract({
    ...contracts.voting,
    functionName: "votingEndTime",
  });

  const { data: candidateCount, refetch: refetchCandidateCount } =
    useReadContract({
      ...contracts.voting,
      functionName: "candidateCount",
    });

  const { data: isPaused, refetch: refetchPaused } = useReadContract({
    ...contracts.voting,
    functionName: "paused",
  });

  const { data: owner } = useReadContract({
    ...contracts.voting,
    functionName: "owner",
  });

  const { data: remainingTime, refetch: refetchRemainingTime } =
    useReadContract({
      ...contracts.voting,
      functionName: "getRemainingTime",
    });

  const { data: isVotingExpired, refetch: refetchIsVotingExpired } =
    useReadContract({
      ...contracts.voting,
      functionName: "isVotingExpired",
    });

  const refetch = async () => {
    await Promise.all([
      refetchStatus(),
      refetchCandidateCount(),
      refetchPaused(),
      refetchRemainingTime(),
      refetchIsVotingExpired(),
    ]);
  };

  return {
    votingStatus: votingStatus as number | undefined,
    votingStartTime: votingStartTime as bigint | undefined,
    votingEndTime: votingEndTime as bigint | undefined,
    candidateCount: candidateCount as bigint | undefined,
    isPaused: isPaused as boolean | undefined,
    owner: owner as string | undefined,
    remainingTime: remainingTime as bigint | undefined,
    isVotingExpired: isVotingExpired as boolean | undefined,
    refetch,
  };
};

// 获取投票统计
export const useVotingStatistics = () => {
  const { data, refetch } = useReadContract({
    ...contracts.voting,
    functionName: "getVotingStatistics",
  });

  const stats = data as [bigint, bigint, bigint, bigint] | undefined;

  return {
    totalVoters: stats?.[0] ?? 0n,
    totalVotesCast: stats?.[1] ?? 0n,
    totalCandidates: stats?.[2] ?? 0n,
    participationRate: stats?.[3] ?? 0n,
    refetch,
  };
};

// 获取所有候选人
export const useAllCandidates = () => {
  const { data, refetch, isLoading } = useReadContract({
    ...contracts.voting,
    functionName: "getAllCandidates",
  });

  const result = data as
    | [
        readonly bigint[],
        readonly string[],
        readonly string[],
        readonly bigint[]
      ]
    | undefined;

  const candidates: Candidate[] = [];
  if (result) {
    const [ids, addresses, names, voteCounts] = result;
    for (let i = 0; i < ids.length; i++) {
      candidates.push({
        id: ids[i],
        candidateAddress: addresses[i],
        name: names[i],
        voteCount: voteCounts[i],
      });
    }
  }

  return {
    candidates,
    refetch,
    isLoading,
  };
};

// 获取获胜者
export const useWinners = () => {
  const { data, refetch, isLoading } = useReadContract({
    ...contracts.voting,
    functionName: "getWinners",
  });

  const result = data as
    | [readonly bigint[], readonly string[], readonly string[], bigint]
    | undefined;

  return {
    winnerIds: result?.[0] ?? [],
    winnerAddresses: result?.[1] ?? [],
    winnerNames: result?.[2] ?? [],
    highestVoteCount: result?.[3] ?? 0n,
    refetch,
    isLoading,
  };
};

// 获取选民信息
export const useVoterInfo = (address?: string) => {
  const { data, refetch } = useReadContract({
    ...contracts.voting,
    functionName: "getVoter",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const voter = data as
    | {
        voterAddress: string;
        name: string;
        votedCandidateId: bigint;
        votedAt: bigint;
      }
    | undefined;

  return {
    voter: voter
      ? {
          voterAddress: voter.voterAddress,
          name: voter.name,
          votedCandidateId: voter.votedCandidateId,
          votedAt: voter.votedAt,
        }
      : null,
    isRegistered:
      voter?.voterAddress !== "0x0000000000000000000000000000000000000000",
    hasVoted: voter?.votedCandidateId !== 0n,
    refetch,
  };
};

// 检查是否是候选人
export const useIsCandidate = (address?: string) => {
  const { data } = useReadContract({
    ...contracts.voting,
    functionName: "isCandidate",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isCandidate: data as boolean | undefined,
  };
};

// 检查是否是注册选民
export const useIsVoter = (address?: string) => {
  const { data } = useReadContract({
    ...contracts.voting,
    functionName: "isVoter",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isVoter: data as boolean | undefined,
  };
};

// 检查是否是 owner
export const useIsVotingOwner = () => {
  const { address } = useConnection();
  const { data: owner } = useReadContract({
    ...contracts.voting,
    functionName: "owner",
  });

  return {
    isOwner:
      address && owner
        ? address.toLowerCase() === (owner as string).toLowerCase()
        : false,
    owner: owner as string,
  };
};

// 投票功能
export const useVote = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const voteById = (candidateId: bigint) => {
    writeContract({
      ...contracts.voting,
      functionName: "voteById",
      args: [candidateId],
    });
  };

  const voteByAddress = (candidateAddress: string) => {
    writeContract({
      ...contracts.voting,
      functionName: "vote",
      args: [candidateAddress],
    });
  };

  return {
    voteById,
    voteByAddress,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
};

// Owner: 注册候选人
export const useRegisterCandidate = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerCandidate = (candidateAddress: string, name: string) => {
    writeContract({
      ...contracts.voting,
      functionName: "registerCandidate",
      args: [candidateAddress, name],
    });
  };

  return {
    registerCandidate,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
};

// Owner: 注册选民
export const useRegisterVoter = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerVoter = (voterAddress: string, name: string) => {
    writeContract({
      ...contracts.voting,
      functionName: "registerVoter",
      args: [voterAddress, name],
    });
  };

  return {
    registerVoter,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
};

// Owner: 批量注册选民
export const useRegisterVoterBatch = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerVoterBatch = (addresses: string[], names: string[]) => {
    writeContract({
      ...contracts.voting,
      functionName: "registerVoterBatch",
      args: [addresses, names],
    });
  };

  return {
    registerVoterBatch,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
};

// Owner: 开始投票
export const useStartVoting = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const startVoting = (durationInSeconds: bigint) => {
    writeContract({
      ...contracts.voting,
      functionName: "startVoting",
      args: [durationInSeconds],
    });
  };

  return {
    startVoting,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
};

// 结束投票（任何人在时间结束后都可以调用）
export const useEndVoting = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const endVoting = () => {
    writeContract({
      ...contracts.voting,
      functionName: "endVoting",
    });
  };

  return {
    endVoting,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
};

// 检查是否可以结束投票
export const useCanEndVoting = () => {
  const { address } = useConnection();

  const { data: owner } = useReadContract({
    ...contracts.voting,
    functionName: "owner",
  });

  const { data: votingStatus } = useReadContract({
    ...contracts.voting,
    functionName: "votingStatus",
  });

  const { data: isExpired } = useReadContract({
    ...contracts.voting,
    functionName: "isVotingExpired",
  });

  const isOwner =
    address && owner
      ? address.toLowerCase() === (owner as string).toLowerCase()
      : false;
  const isActive = (votingStatus as number) === VotingStatus.Active;

  // Owner 可以随时结束投票，其他人只有在时间到期后才能结束
  if (!isActive) {
    return {
      canEnd: false,
      reason: "Voting is not active",
    };
  }

  if (isOwner) {
    return {
      canEnd: true,
      reason: "Owner can end voting at any time",
    };
  }

  if (isExpired) {
    return {
      canEnd: true,
      reason: "Voting period has ended, anyone can trigger settlement",
    };
  }

  return {
    canEnd: false,
    reason: "Voting period not ended yet, only owner can end early",
  };
};

// Owner: 暂停/恢复
export const useVotingPause = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    isError,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const pause = () => {
    writeContract({
      ...contracts.voting,
      functionName: "pause",
    });
  };

  const unpause = () => {
    writeContract({
      ...contracts.voting,
      functionName: "unpause",
    });
  };

  return {
    pause,
    unpause,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
    reset,
  };
};
