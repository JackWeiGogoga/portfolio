# 链守卫（Chain Guard）使用指南

## 快速开始

链守卫已经自动集成到应用中，无需额外配置。当用户尝试切换到主网时，会自动切换回测试网并显示提示。

## 测试步骤

### 1. 启动应用

```bash
npm run dev:sepolia
```

### 2. 连接钱包

- 点击 "Connect Wallet" 按钮
- 选择你的钱包（如 MetaMask）
- 授权连接

### 3. 测试链守卫

**方式一：通过 RainbowKit UI 切换（如果可见）**

- 点击已连接的钱包地址
- 尝试从链选择器切换到 "Ethereum"
- 应该看到错误提示："⚠️ 主网暂未部署合约，已自动切换至测试网络"
- 链会自动切回 Sepolia 或 Hardhat Local

**方式二：通过钱包直接切换**

- 打开 MetaMask
- 手动切换到 "Ethereum Mainnet"
- 应用会检测到切换并自动切回测试网
- 显示错误提示

### 4. 测试 ENS 功能

即使在测试网环境下，ENS 查询仍然有效：

```tsx
import { useEnsName } from "wagmi";

function UserProfile() {
  const { data: ensName } = useEnsName({
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8",
  });

  return <div>ENS Name: {ensName || "No ENS"}</div>;
}
```

## 工作流程

```
┌─────────────────┐
│   用户连接钱包   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 应用默认使用测试网│ ← useChainGuard 自动保护
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  用户尝试切换链  │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │主网？   │
    └────┬───┘
         │
    ┌────┴────┐
    │ YES     │ NO
    ▼         ▼
┌─────────┐  正常
│链守卫触发│  使用
└────┬────┘
     │
     ├─→ 显示错误提示
     │
     └─→ 自动切回测试网
```

## 配置说明

### 修改允许的链

编辑 `src/config/wagmi.ts`：

```typescript
// 添加更多测试网
export const allowedChains =
  CURRENT_NETWORK === "localhost"
    ? ([hardhatLocal, sepolia, goerli] as const) // 添加 goerli
    : ([sepolia, goerli] as const);
```

### 禁用链守卫

如果需要临时禁用链守卫（比如调试），在 `src/App.tsx` 中注释掉：

```typescript
function AppContent() {
  // useChainGuard(); // 临时禁用
  return (
    // ...
  );
}
```

### 未来部署到主网

当合约部署到主网后：

1. **方式一：允许主网（推荐）**

```typescript
// src/config/wagmi.ts
export const allowedChains =
  CURRENT_NETWORK === "localhost"
    ? ([hardhatLocal, sepolia, mainnet] as const) // 添加 mainnet
    : ([sepolia, mainnet] as const);
```

2. **方式二：完全移除守卫**

```typescript
// src/App.tsx
function AppContent() {
  // useChainGuard(); // 删除或注释
  return (
    // ...
  );
}
```

## 自定义错误提示

编辑 `src/hooks/useChainGuard.ts`：

```typescript
toast.error("⚠️ 主网暂未部署合约，已自动切换至测试网络", {
  duration: 5000,
  position: "top-center",
  className: "font-bold",
  style: {
    background: "#EF4444", // 修改背景色
    color: "#fff", // 修改文字颜色
  },
});
```

## 扩展功能

### 添加多个禁止的链

```typescript
// src/config/wagmi.ts
export const FORBIDDEN_CHAIN_IDS = [
  mainnet.id, // 主网
  polygon.id, // Polygon 主网
  arbitrum.id, // Arbitrum 主网
];

// src/hooks/useChainGuard.ts
export function useChainGuard() {
  const { chain, isConnected } = useConnection();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chain && FORBIDDEN_CHAIN_IDS.includes(chain.id)) {
      toast.error("⚠️ 该网络暂未部署合约，已自动切换至测试网络");
      switchChain({ chainId: ALLOWED_CHAIN_IDS[0] });
    }
  }, [chain, isConnected, switchChain]);
}
```

### 添加白名单模式

```typescript
// 只允许特定地址访问主网
const WHITELIST_ADDRESSES = [
  "0x...", // 管理员地址
];

export function useChainGuard() {
  const { chain, address, isConnected } = useConnection();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const isWhitelisted = address && WHITELIST_ADDRESSES.includes(address);

    if (isConnected && chain?.id === MAINNET_CHAIN_ID && !isWhitelisted) {
      toast.error("⚠️ 您没有权限使用主网，已切换至测试网络");
      switchChain({ chainId: ALLOWED_CHAIN_IDS[0] });
    }
  }, [chain, address, isConnected, switchChain]);
}
```

## 常见问题

### Q: ENS 查询在测试网也能用吗？

A: 是的！即使你在 Sepolia 测试网，ENS 查询依然会从 mainnet 读取数据。

### Q: 用户能绕过链守卫吗？

A: 用户可以尝试通过钱包直接切换，但守卫会立即检测到并切换回测试网。

### Q: 会影响性能吗？

A: 不会。守卫只在链切换时触发，平时没有性能开销。

### Q: 支持多个 tab 页吗？

A: 是的。每个 tab 页都有独立的守卫，互不影响。

## 相关文件

- `src/config/wagmi.ts` - Wagmi 配置和链定义
- `src/hooks/useChainGuard.ts` - 链守卫 Hook
- `src/App.tsx` - 应用入口和守卫集成
- `docs/ENS_MAINNET_PROTECTION.md` - 技术方案文档
