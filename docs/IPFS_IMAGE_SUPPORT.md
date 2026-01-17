# IPFS 图片支持

本项目已实现统一的 IPFS 图片支持。

## 📦 核心组件

### 1. IPFS 工具函数 (`src/lib/ipfs.ts`)

提供 IPFS URL 处理的核心功能：

```typescript
import { convertIpfsUrl, isIpfsUrl, extractIpfsHash } from "@/lib/ipfs";

// 转换 IPFS URL
const httpUrl = convertIpfsUrl("ipfs://QmXXX...");
// => https://ipfs.io/ipfs/QmXXX...

// 检查是否为 IPFS URL
const isIpfs = isIpfsUrl("ipfs://QmXXX...");
// => true

// 提取 IPFS hash
const hash = extractIpfsHash("ipfs://QmXXX...");
// => "QmXXX..."
```

### 2. IPFS 图片组件 (`src/components/IpfsImage.tsx`)

提供三个主要组件：

#### `IpfsImage` - 基础图片组件

```tsx
import IpfsImage from "@/components/IpfsImage";

// 基本使用
<IpfsImage
  src="ipfs://QmXXX..."
  alt="IPFS Image"
/>

// 自定义 fallback
<IpfsImage
  src="ipfs://QmXXX..."
  fallback={<span>🖼️</span>}
  className="w-32 h-32"
/>

// 使用 fallback URL
<IpfsImage
  src="ipfs://QmXXX..."
  fallbackSrc="https://example.com/default.png"
  showLoading={true}
/>
```

**Props:**

- `src` - 图片 URL（支持 IPFS 和普通 HTTP URL）
- `fallback` - 图片加载失败时的后备内容
- `fallbackSrc` - 图片加载失败时的后备 URL
- `containerClassName` - 图片容器类名
- `showLoading` - 是否显示加载状态
- 其他所有 HTML img 元素的标准属性

#### `IpfsAvatar` - 头像组件

```tsx
import { IpfsAvatar } from "@/components/IpfsImage";

<IpfsAvatar
  src="ipfs://QmXXX..."
  alt="User Avatar"
  size="md" // sm | md | lg | xl
/>;
```

#### `ProjectIcon` - 项目图标组件

```tsx
import { ProjectIcon } from "@/components/IpfsImage";

<ProjectIcon
  src="ipfs://QmXXX..."
  alt="Project Icon"
  size="md" // sm | md | lg | xl
/>;
```

## 🎯 使用场景

### 1. 项目卡片 (`ProjectCard.tsx`)

```tsx
import { ProjectIcon } from "@/components/IpfsImage";

<ProjectIcon src={campaign.icon} alt={campaign.name} size="md" />;
```

### 2. 项目详情页 (`CrowdfundingProjectDetail.tsx`)

```tsx
import { ProjectIcon } from "@/components/IpfsImage";

<ProjectIcon src={campaign.icon} alt={campaign.name} size="lg" />;
```

### 3. 创建项目模态框 (`CreateCampaignModal.tsx`)

```tsx
import IpfsImage from "@/components/IpfsImage";

<IpfsImage
  src={iconPreview}
  alt="Icon preview"
  className="object-cover"
  containerClassName="w-32 h-32 border rounded-lg"
  fallback={<div>Failed to load image</div>}
/>;
```

## ✨ 特性

### 1. 自动 URL 转换

- 自动检测 `ipfs://` 协议并转换为网关地址
- 支持已有的 IPFS 网关格式（如 `https://ipfs.io/ipfs/...`）
- 普通 HTTP URL 保持不变

### 2. 错误处理

- 图片加载失败时自动显示 fallback
- 支持 fallback URL 重试
- 优雅的错误提示

### 3. 加载状态

- 可选的加载动画
- 平滑的淡入过渡效果

### 4. 类型安全

- 完整的 TypeScript 类型定义
- 继承所有 HTML img 标准属性

## 🔧 配置

### 更改 IPFS 网关

在 `src/lib/ipfs.ts` 中修改网关地址：

```typescript
export function convertIpfsUrl(url: string): string {
  if (!url) return "";

  if (url.startsWith("ipfs://")) {
    const hash = url.replace("ipfs://", "");
    // 更改为你的网关地址
    return `https://your-gateway.com/ipfs/${hash}`;
  }

  // ...
}
```

### 自定义样式

所有组件都支持通过 `className` 和 `containerClassName` 自定义样式：

```tsx
<IpfsImage
  src="ipfs://QmXXX..."
  className="rounded-lg shadow-lg" // 图片样式
  containerClassName="p-4 bg-gray-100" // 容器样式
/>
```

## 📝 最佳实践

1. **使用专用组件**：根据场景选择合适的组件（`IpfsImage`、`IpfsAvatar`、`ProjectIcon`）
2. **提供 fallback**：总是提供 fallback 内容，确保用户体验
3. **优化加载**：对大图片使用 `showLoading` 属性
4. **错误处理**：为重要图片提供 `fallbackSrc`

## 🚀 未来扩展

可以考虑添加：

- 多个 IPFS 网关支持（自动 fallback）
- 图片缓存策略
- 懒加载支持
- 图片压缩/优化
- 进度条显示
