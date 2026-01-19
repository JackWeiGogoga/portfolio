export const ROUTES = {
  HOME: "/",
  RESUME: "/resume",
  WORK_FLOWLET: "/works/flowlet",
  WHAT_IS_IT: "/what-is-it",
  WHAT_IS_IT_JVM: "/what-is-it/jvm",

  SIDE_PROJECTS: "/side-projects",
  PROJECTS: "/side-projects/crowdfunding/projects",
  PROJECT_DETAIL: "/side-projects/crowdfunding/project",
  GOGOGA_TOKEN: "/side-projects/gogoga-token",
  GOGOGA_NFT: "/side-projects/gogoga-nft",
  VOTING: "/side-projects/voting",
} as const;

export const CHAIN_CONFIG = {
  localhost: {
    chainId: 31337,
    name: "Hardhat Local",
    blockExplorerUrl: "",
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    blockExplorerUrl: "https://sepolia.etherscan.io",
  },
} as const;

export const CURRENT_NETWORK = (import.meta.env.VITE_NETWORK ||
  "localhost") as keyof typeof CHAIN_CONFIG;
export const CHAIN_ID = CHAIN_CONFIG[CURRENT_NETWORK].chainId;
export const BLOCK_EXPLORER_URL =
  CHAIN_CONFIG[CURRENT_NETWORK].blockExplorerUrl;

export enum CampaignState {
  Active = 0,
  Successful = 1,
  Failed = 2,
}

export const CAMPAIGN_STATE_TEXT = {
  [CampaignState.Active]: "Active",
  [CampaignState.Successful]: "Successful",
  [CampaignState.Failed]: "Failed",
};

export const CAMPAIGN_STATE_COLORS = {
  [CampaignState.Active]: "bg-green-700",
  [CampaignState.Successful]: "bg-blue-700 dark:bg-[#FFD866]",
  [CampaignState.Failed]: "bg-gray-700",
} as const;

export const DEFAULT_MIN_CONTRIBUTION = "0.001";
