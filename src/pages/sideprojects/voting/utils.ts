// 格式化时间（秒转为可读格式）
export const formatDuration = (seconds: bigint | number): string => {
  const totalSeconds = typeof seconds === "bigint" ? Number(seconds) : seconds;

  if (totalSeconds <= 0) return "0s";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && days === 0) parts.push(`${secs}s`);

  return parts.join(" ") || "0s";
};

// 格式化时间戳为日期字符串
export const formatTimestamp = (timestamp: bigint | number): string => {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  if (ts === 0) return "Not set";
  return new Date(ts * 1000).toLocaleString();
};

// 格式化地址（缩短显示）
export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// 格式化百分比
export const formatPercentage = (
  value: bigint | number,
  decimals = 1
): string => {
  const num = typeof value === "bigint" ? Number(value) : value;
  return `${num.toFixed(decimals)}%`;
};

// 计算投票百分比
export const calculateVotePercentage = (
  voteCount: bigint,
  totalVotes: bigint
): number => {
  if (totalVotes === 0n) return 0;
  return Number((voteCount * 10000n) / totalVotes) / 100;
};

// 格式化错误信息
export const formatErrorMessage = (error: Error | null): string => {
  if (!error) return "Transaction failed";

  const message = error.message;

  if (message.includes("User rejected") || message.includes("User denied")) {
    return "Transaction cancelled by user";
  }

  if (message.includes("denied request signature")) {
    return "Transaction cancelled by user";
  }

  if (message.includes("NotRegisteredVoter")) {
    return "You are not a registered voter";
  }

  if (message.includes("AlreadyVoted")) {
    return "You have already voted";
  }

  if (message.includes("VotingNotActive")) {
    return "Voting is not active";
  }

  if (message.includes("VotingNotStarted")) {
    return "Voting has not started yet";
  }

  if (message.includes("VotingAlreadyEnded")) {
    return "Voting has already ended";
  }

  if (message.includes("InvalidCandidate")) {
    return "Invalid candidate";
  }

  if (message.includes("CandidateAlreadyRegistered")) {
    return "Candidate is already registered";
  }

  if (message.includes("VoterAlreadyRegistered")) {
    return "Voter is already registered";
  }

  const firstLine = message.split("\n")[0];

  if (firstLine.length > 100) {
    if (message.includes("Details:")) {
      const details = message.split("Details:")[1]?.split("\n")[0]?.trim();
      if (details) return details;
    }
    if (message.includes("Error:")) {
      const errorPart = message.split("Error:")[1]?.split("\n")[0]?.trim();
      if (errorPart) return errorPart;
    }

    return `${firstLine.substring(0, 100)}...`;
  }

  return firstLine;
};

// 验证以太坊地址
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
