import CrowdfundingFactoryABI from "../../../contracts/artifacts/contracts/crowdfunding/CrowdfundingFactory.sol/CrowdfundingFactory.json";
import CrowdfundingABI from "../../../contracts/artifacts/contracts/crowdfunding/Crowdfunding.sol/Crowdfunding.json";
import GogogaTokenABI from "../../../contracts/artifacts/contracts/gogoga-token/GogogaToken.sol/GogogaToken.json";
import GogogaTokenSaleABI from "../../../contracts/artifacts/contracts/gogoga-token/GogogaTokenSale.sol/GogogaTokenSale.json";
import GogogaTokenAirdropABI from "../../../contracts/artifacts/contracts/gogoga-token/GogogaTokenAirdrop.sol/GogogaTokenAirdrop.json";
import GogogaTokenFaucetABI from "../../../contracts/artifacts/contracts/gogoga-token/GogogaTokenFaucet.sol/GogogaTokenFaucet.json";
import GogogaNftABI from "../../../contracts/artifacts/contracts/gogoga-nft/GogogaNft.sol/GogogaNFT.json";
import VotingABI from "../../../contracts/artifacts/contracts/voting/Voting.sol/Voting.json";
import { CURRENT_NETWORK } from "./constants";
import type { Abi } from "viem";

// 不同网络的合约地址配置
const CONTRACT_ADDRESSES = {
  localhost: {
    crowdfundingFactory: (import.meta.env.VITE_CONTRACT_ADDRESS_LOCALHOST ||
      "") as `0x${string}`,
    gogogaToken: (import.meta.env.VITE_GOGOGA_TOKEN_ADDRESS_LOCALHOST ||
      "") as `0x${string}`,
    gogogaTokenSale: (import.meta.env
      .VITE_GOGOGA_TOKEN_SALE_ADDRESS_LOCALHOST || "") as `0x${string}`,
    gogogaTokenAirdrop: (import.meta.env
      .VITE_GOGOGA_TOKEN_AIRDROP_ADDRESS_LOCALHOST || "") as `0x${string}`,
    gogogaTokenFaucet: (import.meta.env
      .VITE_GOGOGA_TOKEN_FAUCET_ADDRESS_LOCALHOST || "") as `0x${string}`,
    gogogaNft: (import.meta.env.VITE_GOGOGA_NFT_ADDRESS_LOCALHOST ||
      "") as `0x${string}`,
    voting: (import.meta.env.VITE_VOTING_ADDRESS_LOCALHOST ||
      "") as `0x${string}`,
  },
  sepolia: {
    crowdfundingFactory: (import.meta.env.VITE_CONTRACT_ADDRESS_SEPOLIA ||
      "") as `0x${string}`,
    gogogaToken: (import.meta.env.VITE_GOGOGA_TOKEN_ADDRESS_SEPOLIA ||
      "") as `0x${string}`,
    gogogaTokenSale: (import.meta.env.VITE_GOGOGA_TOKEN_SALE_ADDRESS_SEPOLIA ||
      "") as `0x${string}`,
    gogogaTokenAirdrop: (import.meta.env
      .VITE_GOGOGA_TOKEN_AIRDROP_ADDRESS_SEPOLIA || "") as `0x${string}`,
    gogogaTokenFaucet: (import.meta.env
      .VITE_GOGOGA_TOKEN_FAUCET_ADDRESS_SEPOLIA || "") as `0x${string}`,
    gogogaNft: (import.meta.env.VITE_GOGOGA_NFT_ADDRESS_SEPOLIA ||
      "") as `0x${string}`,
    voting: (import.meta.env.VITE_VOTING_ADDRESS_SEPOLIA ||
      "") as `0x${string}`,
  },
} as const;

// 导出 ABI
export const crowdfundingFactoryABI = CrowdfundingFactoryABI.abi as Abi;
export const crowdfundingABI = CrowdfundingABI.abi as Abi;
export const gogogaTokenABI = GogogaTokenABI.abi as Abi;
export const gogogaTokenSaleABI = GogogaTokenSaleABI.abi as Abi;
export const gogogaTokenAirdropABI = GogogaTokenAirdropABI.abi as Abi;
export const gogogaTokenFaucetABI = GogogaTokenFaucetABI.abi as Abi;
export const gogogaNftABI = GogogaNftABI.abi as Abi;
export const votingABI = VotingABI.abi as Abi;

// 获取当前网络的合约地址
export const CROWDFUNDING_FACTORY_ADDRESS =
  CONTRACT_ADDRESSES[CURRENT_NETWORK].crowdfundingFactory;
export const GOGOGA_TOKEN_ADDRESS =
  CONTRACT_ADDRESSES[CURRENT_NETWORK].gogogaToken;
export const GOGOGA_TOKEN_SALE_ADDRESS =
  CONTRACT_ADDRESSES[CURRENT_NETWORK].gogogaTokenSale;
export const GOGOGA_TOKEN_AIRDROP_ADDRESS =
  CONTRACT_ADDRESSES[CURRENT_NETWORK].gogogaTokenAirdrop;
export const GOGOGA_TOKEN_FAUCET_ADDRESS =
  CONTRACT_ADDRESSES[CURRENT_NETWORK].gogogaTokenFaucet;
export const GOGOGA_NFT_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].gogogaNft;
export const VOTING_ADDRESS = CONTRACT_ADDRESSES[CURRENT_NETWORK].voting;

// 合约配置
export const contracts = {
  crowdfundingFactory: {
    address: CROWDFUNDING_FACTORY_ADDRESS,
    abi: crowdfundingFactoryABI,
  },
  gogogaToken: {
    address: GOGOGA_TOKEN_ADDRESS,
    abi: gogogaTokenABI,
  },
  gogogaTokenSale: {
    address: GOGOGA_TOKEN_SALE_ADDRESS,
    abi: gogogaTokenSaleABI,
  },
  gogogaTokenAirdrop: {
    address: GOGOGA_TOKEN_AIRDROP_ADDRESS,
    abi: gogogaTokenAirdropABI,
  },
  gogogaTokenFaucet: {
    address: GOGOGA_TOKEN_FAUCET_ADDRESS,
    abi: gogogaTokenFaucetABI,
  },
  gogogaNft: {
    address: GOGOGA_NFT_ADDRESS,
    abi: gogogaNftABI,
  },
  voting: {
    address: VOTING_ADDRESS,
    abi: votingABI,
  },
} as const;

// 验证合约地址是否已配置
if (!CROWDFUNDING_FACTORY_ADDRESS) {
  console.warn(
    `⚠️ 未配置 ${CURRENT_NETWORK} 网络的合约地址，请先部署合约并设置环境变量 VITE_CONTRACT_ADDRESS_${CURRENT_NETWORK.toUpperCase()}`
  );
}

if (!GOGOGA_TOKEN_ADDRESS || !GOGOGA_TOKEN_SALE_ADDRESS) {
  console.warn(
    `⚠️ 未配置 ${CURRENT_NETWORK} 网络的 Gogoga Token 合约地址，请先部署合约并设置环境变量`
  );
}

if (!GOGOGA_TOKEN_AIRDROP_ADDRESS) {
  console.warn(
    `⚠️ 未配置 ${CURRENT_NETWORK} 网络的 Gogoga Token Airdrop 合约地址，请先部署合约并设置环境变量`
  );
}

if (!GOGOGA_TOKEN_FAUCET_ADDRESS) {
  console.warn(
    `⚠️ 未配置 ${CURRENT_NETWORK} 网络的 Gogoga Token Faucet 合约地址，请先部署合约并设置环境变量`
  );
}

if (!GOGOGA_NFT_ADDRESS) {
  console.warn(
    `⚠️ 未配置 ${CURRENT_NETWORK} 网络的 Gogoga NFT 合约地址，请先部署合约并设置环境变量`
  );
}
