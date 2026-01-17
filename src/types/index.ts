import { Address } from "viem";

// 众筹状态枚举
export enum CampaignState {
  Active = 0,
  Successful = 1,
  Failed = 2,
}

// 工厂合约返回的 Campaign 结构体
export interface FactoryCampaign {
  campaignAddress: Address;
  owner: Address;
  name: string;
  createdAt: bigint;
}

// 档位信息
export interface Tier {
  name: string;
  amount: bigint;
  backers: bigint;
}

// 支持者信息
export interface BackerInfo {
  totalContribution: bigint;
  customContribution: bigint;
}

// 众筹统计信息
export interface CampaignStats {
  totalBackers: bigint;
  totalTierBackers: bigint;
  totalCustomBackers: bigint;
  currentBalance: bigint;
  remainingAmount: bigint;
}

// 众筹项目基础信息
export interface Campaign {
  address: Address;
  owner: Address;
  name: string;
  description: string;
  icon: string;
  goal: bigint;
  createdAt: bigint;
  deadline: bigint;
  minContribution: bigint;
  balance: bigint;
  state: CampaignState;
  paused: boolean;
  withdrawn: boolean;
  allowCustomAmount: boolean;
  tiers: Tier[];
  backerCount: bigint;
  customBackerCount: bigint;
}

// 众筹项目详细信息（包含统计数据）
export interface CampaignDetail extends Campaign {
  stats: CampaignStats;
  backers: Address[];
}

// 创建众筹项目的参数
export interface CreateCampaignParams {
  name: string;
  description: string;
  icon: string;
  goal: bigint;
  durationInDays: bigint;
  minContribution: bigint;
}

// 添加档位的参数
export interface AddTierParams {
  campaignAddress: Address;
  name: string;
  amount: bigint;
}

// 贡献参数
export interface ContributeParams {
  campaignAddress: Address;
  tierIndex: bigint;
  value: bigint;
}

// 表单数据类型
export interface CreateProjectFormData {
  name: string;
  description: string;
  icon: string;
  goal: string;
  duration: string;
  minContribution: string;
  allowCustomAmount: boolean;
  tiers: {
    name: string;
    amount: string;
  }[];
}

// 贡献表单数据
export interface ContributeFormData {
  tierIndex: number;
  customAmount?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 筛选参数
export interface FilterParams {
  state?: CampaignState;
  owner?: Address;
  search?: string;
}

// 排序参数
export type SortBy = "newest" | "oldest" | "mostFunded" | "endingSoon";

export interface SortParams {
  sortBy: SortBy;
}

// 查询参数（组合分页、筛选、排序）
export interface QueryParams
  extends PaginationParams,
    FilterParams,
    SortParams {}

// Hook 返回类型
export interface UseContractReturn {
  isLoading: boolean;
  error: Error | null;
}

export interface UseCampaignsReturn extends UseContractReturn {
  campaigns: Campaign[];
  totalCount: number;
  refetch: () => void;
}

export interface UseCampaignDetailReturn extends UseContractReturn {
  campaign: CampaignDetail | null;
  refetch: () => void;
}

// 交易结果类型
export interface TransactionResult {
  hash: Address;
  success: boolean;
  error?: string;
}

// 钱包相关类型
export interface WalletInfo {
  address: Address;
  chainId: number;
  isConnected: boolean;
}

// ========== 合约事件类型 ==========

// 资助事件（基础）
export interface FundedEvent {
  backer: Address;
  tierIndex: bigint;
  amount: bigint;
  totalContribution: bigint;
  blockNumber: bigint;
  transactionHash: string;
  timestamp?: number;
}

// 提款事件
export interface FundsWithdrawnEvent {
  owner: Address;
  amount: bigint;
  timestamp: bigint;
}

// 退款事件
export interface RefundedEvent {
  backer: Address;
  amount: bigint;
}

// 档位添加事件
export interface TierAddedEvent {
  tierIndex: bigint;
  name: string;
  amount: bigint;
}

// 档位移除事件
export interface TierRemovedEvent {
  tierIndex: bigint;
  name: string;
}

// 暂停状态切换事件
export interface CampaignPausedToggledEvent {
  isPaused: boolean;
}

// 截止时间延长事件
export interface DeadlineExtendedEvent {
  oldDeadline: bigint;
  newDeadline: bigint;
  daysAdded: bigint;
}

// 最小贡献更新事件
export interface MinContributionUpdatedEvent {
  oldMinContribution: bigint;
  newMinContribution: bigint;
}

// 自定义金额切换事件
export interface CustomAmountToggledEvent {
  isAllowed: boolean;
}

// 图标更新事件
export interface IconUpdatedEvent {
  oldIcon: string;
  newIcon: string;
}

// ========== 操作参数类型 ==========

// 移除档位参数
export interface RemoveTierParams {
  campaignAddress: Address;
  tierIndex: bigint;
}

// 延长截止时间参数
export interface ExtendDeadlineParams {
  campaignAddress: Address;
  daysToAdd: bigint;
}

// 更新最小贡献参数
export interface UpdateMinContributionParams {
  campaignAddress: Address;
  newMinContribution: bigint;
}

// 更新图标参数
export interface UpdateIconParams {
  campaignAddress: Address;
  newIcon: string;
}

// 扩展的支持者信息（包含资助的档位）
export interface ExtendedBackerInfo extends BackerInfo {
  address: Address;
  fundedTiers: number[]; // 已资助的档位索引数组
}

// ========== Gogoga Token 相关类型 ==========

// Token Sale 合约信息（从 getContractInfo 返回）
export type TokenSaleContractInfo = readonly [
  string, // tokenAddress
  string, // tokenSymbol
  number, // tokenDecimals
  bigint, // contractTokenBalance
  bigint, // priceInEth
  bigint, // totalSold
  bigint, // totalRaised
  bigint, // minPurchase
  bigint, // maxPurchase
  boolean // isPaused
];

// Token 合约信息（从 getTokenInfo 返回）
export type TokenContractInfo = readonly [
  string, // name
  string, // symbol
  number, // decimals
  bigint, // totalSupply
  bigint, // maxSupply
  boolean // isPaused
];

// ========== Gogoga NFT 相关类型 ==========

// NFT 基础信息
export interface Nft {
  tokenId: bigint;
  owner: Address;
  minter?: Address; // 铸造者地址
  tokenURI: string;
  metadata?: NftMetadata;
}

// NFT 元数据（从 tokenURI 获取）
export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

// NFT 合约信息
export interface NftContractInfo {
  name: string;
  symbol: string;
  totalSupply: bigint;
  maxSupply: bigint;
  // Preset NFT 相关
  presetMintPrice: bigint;
  presetSupply: bigint;
  remainingPresetSupply: bigint;
  // Custom NFT 相关
  customMintPrice: bigint;
  customSupply: bigint;
  remainingCustomSupply: bigint;
  // 状态
  isPaused: boolean;
}

// Mint 表单数据
export interface MintNftFormData {
  quantity: number;
}

// NFT 事件类型
export interface MintedEvent {
  to: Address;
  tokenId: bigint;
  transactionHash: string;
  blockNumber: bigint;
  timestamp?: number;
  tokenURI?: string; // CustomMinted 事件包含此字段
}

export interface TransferEvent {
  from: Address;
  to: Address;
  tokenId: bigint;
  transactionHash: string;
  blockNumber: bigint;
  timestamp?: number;
}

// Hook 返回类型
export interface UseNftsReturn extends UseContractReturn {
  nfts: Nft[];
  totalCount: number;
  refetch: () => void;
}

export interface UseNftContractInfoReturn extends UseContractReturn {
  contractInfo: NftContractInfo | null;
  refetch: () => void;
}

// NFT 排序类型
export type NftSortBy = "newest" | "oldest" | "tokenId";
