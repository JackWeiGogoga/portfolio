# Web3 交易最佳实践指南

## 🎯 问题背景

在 Web3 应用中，当用户发起一笔交易（如支持项目）后，交易需要经过以下阶段：

1. **发送 (Pending)** - 交易发送到内存池，等待矿工打包
2. **确认中 (Confirming)** - 交易被打包进区块，等待确认
3. **已确认 (Confirmed)** - 交易获得足够的区块确认

**核心问题**：如果在交易确认之前就刷新页面数据，用户将看不到更新后的合约状态！

## ✅ 本项目的解决方案

### 1. 使用 `waitForTransactionReceipt` 等待交易确认

在 `useCampaignActions.ts` 中：

```typescript
import { usePublicClient } from "wagmi";

export const useBackTier = (campaignAddress: Address | undefined) => {
  const publicClient = usePublicClient();

  const backTier = async (tierId: number, amount: string) => {
    // 1. 发送交易
    const hash = await writeContractAsync({
      address: campaignAddress,
      abi: crowdfundingABI,
      functionName: "fund",
      args: [BigInt(tierId)],
      value: parseEther(amount),
    });

    // 2. 🔥 关键：等待交易确认
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1, // 至少等待1个区块确认
      });
    }

    return hash;
  };
};
```

### 2. 在交易确认后再调用数据刷新

在 `BackProjectDialog.tsx` 中：

```typescript
const handleBack = async () => {
  try {
    // 显示 Pending 状态
    toast({
      title: "Transaction Pending",
      description: "Please confirm in your wallet...",
    });

    // 等待交易确认（内部已经调用了 waitForTransactionReceipt）
    await backTier(selectedTier, amount);

    // 交易确认成功
    toast({
      title: "Backing Successful! ✅",
      description: "The page will refresh shortly.",
    });

    // 🔥 只有在交易确认后才刷新数据
    onSuccess?.(); // 这会调用 refetch()
  } catch (error) {
    // 处理错误
  }
};
```

## 📊 交易流程图

```
用户点击支持按钮
    ↓
打开钱包确认弹窗 (MetaMask等)
    ↓
用户确认 → 发送交易到链上
    ↓
显示 "Transaction Pending" 提示
    ↓
⏳ 等待区块确认 (Sepolia ~15秒, Mainnet ~12秒)
    ↓
waitForTransactionReceipt 返回
    ↓
显示 "Backing Successful" 提示
    ↓
调用 refetch() 刷新页面数据
    ↓
✅ 用户看到最新的合约金额
```

## 🎨 用户体验优化建议

### 1. 多阶段状态提示

```typescript
// 阶段1: 等待钱包确认
toast({ title: "Waiting for wallet confirmation..." });

// 阶段2: 交易已发送，等待链上确认
toast({ title: "Transaction sent! Waiting for confirmation..." });

// 阶段3: 交易已确认
toast({ title: "Transaction confirmed! ✅" });
```

### 2. 显示交易哈希链接

```typescript
toast({
  title: "Transaction Sent",
  description: (
    <a
      href={`https://sepolia.etherscan.io/tx/${hash}`}
      target="_blank"
      className="underline"
    >
      View on Etherscan →
    </a>
  ),
});
```

### 3. 使用乐观更新 (Advanced)

对于更好的体验，可以在交易发送后立即更新 UI（乐观更新），然后在后台等待确认：

```typescript
// 立即更新 UI
setOptimisticBalance(prevBalance + amount);

try {
  await backTier(tierId, amount);
  // 确认成功，刷新真实数据
  refetch();
} catch (error) {
  // 回滚乐观更新
  setOptimisticBalance(prevBalance);
}
```

## ⚙️ 配置确认数量

不同场景需要不同的确认数量：

```typescript
// 开发/测试环境 - 1个确认即可
confirmations: 1;

// 小额交易 - 1-3个确认
confirmations: 3;

// 大额交易 - 6+个确认
confirmations: 6;

// 极高安全性 - 12+个确认
confirmations: 12;
```

**本项目配置**：使用 `confirmations: 1`（适合众筹场景）

## 🔄 自动刷新机制 (可选)

### 方案 1: 轮询刷新

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 10000); // 每10秒刷新一次

  return () => clearInterval(interval);
}, []);
```

### 方案 2: 监听合约事件

```typescript
import { useWatchContractEvent } from "wagmi";

useWatchContractEvent({
  address: campaignAddress,
  abi: crowdfundingABI,
  eventName: "Funded",
  onLogs(logs) {
    // 监听到 Funded 事件，自动刷新
    refetch();
  },
});
```

**本项目选择**：交易确认后手动刷新（最可靠的方式）

## 🛡️ 错误处理

```typescript
try {
  await backTier(tierId, amount);
} catch (error) {
  if (error.code === 4001) {
    // 用户拒绝交易
    toast({ title: "Transaction rejected" });
  } else if (error.code === -32603) {
    // 合约执行失败
    toast({ title: "Contract execution failed" });
  } else {
    // 其他错误
    toast({ title: "Transaction failed" });
  }
}
```

## 📝 总结

### ✅ 当前实现

- ✅ 使用 `waitForTransactionReceipt` 等待交易确认
- ✅ 交易确认后才调用 `refetch()` 刷新数据
- ✅ 显示清晰的加载状态和成功提示
- ✅ 正确的错误处理

### 🎯 回答原始问题

**Q: 点击支持，钱包确认成功后，页面会自动更新合约金额等信息吗？**

A: **会！** 在新的实现中，交易确认后会自动调用 `refetch()` 刷新数据，用户会看到最新的合约金额。

**Q: 还是需要手动刷新？**

A: **不需要！** 交易确认后会自动刷新数据。

**Q: web3 链上确认一般需要些时间，最佳实践上怎么处理？**

A:

1. 使用 `waitForTransactionReceipt` 等待确认
2. 显示清晰的加载状态（"Confirming Transaction..."）
3. 确认后才刷新数据
4. 提供交易哈希链接供用户查看
5. 合理设置确认数量（1-12 个区块）

**Q: 其他操作（如暂停、提款、退款）有没有类似问题？**

A: **已全部优化！** 所有操作都实现了：

- ✅ 等待交易确认后刷新
- ✅ 显示加载状态（按钮图标 + 文字变化）
- ✅ 显示交易状态提示（Pending → Successful）

### ⏱️ 预期等待时间

- **Sepolia 测试网**: ~15 秒/区块
- **Ethereum 主网**: ~12 秒/区块
- **Polygon**: ~2 秒/区块
- **BSC**: ~3 秒/区块

### 📊 已优化的操作列表

| 操作           | Hook               | UI 组件             | 状态提示 | 加载图标 | 自动刷新 |
| -------------- | ------------------ | ------------------- | -------- | -------- | -------- |
| 支持项目       | `useBackTier`      | `BackProjectDialog` | ✅       | ✅       | ✅       |
| 自定义金额支持 | `useBackCustom`    | `BackProjectDialog` | ✅       | ✅       | ✅       |
| 暂停/恢复项目  | `useTogglePause`   | `ProjectDetailPage` | ✅       | ✅       | ✅       |
| 提取资金       | `useWithdraw`      | `ProjectDetailPage` | ✅       | ✅       | ✅       |
| 申请退款       | `useRequestRefund` | `ProjectDetailPage` | ✅       | ✅       | ✅       |

### 🎨 用户体验示例

#### 暂停项目

```
1. 点击 "Pause Project" 按钮
2. 💡 提示: "Transaction Pending - Please confirm in wallet"
3. 🔄 按钮显示: "Pausing..." + 旋转图标
4. ⏳ 等待约 15 秒（Sepolia）
5. ✅ 提示: "Project Paused ✅"
6. 自动刷新，项目状态更新为 "Paused"
```

#### 提取资金

```
1. 点击 "Withdraw Funds" 按钮
2. 确认弹窗
3. 💡 提示: "Transaction Pending"
4. 🔄 按钮显示: "Withdrawing..." + 旋转图标
5. ⏳ 等待交易确认
6. ✅ 提示: "Withdrawal Successful! Funds withdrawn to wallet"
7. 自动刷新，余额更新
```

## 🔗 相关资源

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Transaction Receipts](https://viem.sh/docs/actions/public/waitForTransactionReceipt)
- [Ethereum Block Confirmations](https://ethereum.org/en/developers/docs/blocks/#block-time)
