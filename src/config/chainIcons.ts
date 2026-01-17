// Chain icon URLs mapping
// 这些 icon URL 来自 RainbowKit 的默认配置
export const CHAIN_ICONS: Record<number, string> = {
  // Mainnet
  1: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",

  // Sepolia
  11155111:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",

  // Hardhat Local (使用 Ethereum icon)
  31337:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",

  // Polygon
  137: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",

  // Optimism
  10: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png",

  // Arbitrum
  42161:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",

  // Base
  8453: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
};

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  11155111: "Sepolia",
  31337: "Hardhat Local",
  137: "Polygon",
  10: "Optimism",
  42161: "Arbitrum",
  8453: "Base",
};

// 获取 chain icon URL 的辅助函数
export function getChainIcon(chainId: number): string | undefined {
  return CHAIN_ICONS[chainId];
}

// 获取 chain name 的辅助函数
export function getChainName(chainId: number): string | undefined {
  return CHAIN_NAMES[chainId];
}

export const ethereumIcon = getChainIcon(1);
export const optimismIcon = getChainIcon(10);
export const polygonIcon = getChainIcon(137);
export const arbitrumIcon = getChainIcon(42161);
export const baseIcon = getChainIcon(8453);
