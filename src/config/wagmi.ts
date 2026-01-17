import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import { defineChain } from "viem";
import { CURRENT_NETWORK } from "./constants";

// 定义 Hardhat 本地链
export const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  testnet: true,
});

// 根据环境变量选择链
// 注意：始终包含 mainnet 用于 ENS 查询
const chains =
  CURRENT_NETWORK === "localhost"
    ? ([hardhatLocal, sepolia, mainnet] as const)
    : ([sepolia, mainnet] as const);

// 允许用户实际使用的链（不包括 mainnet）
export const allowedChains =
  CURRENT_NETWORK === "localhost"
    ? ([hardhatLocal, sepolia] as const)
    : ([sepolia] as const);

// 导出链 ID 用于验证
export const ALLOWED_CHAIN_IDS = allowedChains.map((chain) => chain.id);
export const MAINNET_CHAIN_ID = mainnet.id;

export const wagmiConfig = getDefaultConfig({
  appName: "JackWei Crowdfunding",
  projectId: "f2010210e99d2f8ef5fa736e7a10d1cd",
  chains: chains,
  ssr: false,
});
