# Portfolio - Vite + React

基于 Vite 与 React 的个人作品集网站，包含多个链上交互的 side projects 演示。

[English](./README.md) | 简体中文

![React](https://img.shields.io/badge/react-19-blue)
![Vite](https://img.shields.io/badge/vite-7.x-646CFF)
![License](https://img.shields.io/badge/license-MIT-green)

[文档](./docs) · [页面](./src/pages) · [组件](./src/components) · [配置](./src/config) · [License](#license)

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS v4** - 样式框架
- **React Router** - 路由管理
- **Motion** - 动画
- **Radix UI** - 无障碍组件
- **Wagmi + RainbowKit + Viem** - 钱包与链上交互

## 功能特性

- ✅ 响应式布局与主题切换
- ✅ Side projects：众筹、Token、NFT、投票演示
- ✅ 钱包连接与链路校验
- ✅ Markdown 渲染与代码块展示
- ✅ IPFS 图片与资源预览

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建产物
pnpm preview
```

### 网络模式

```bash
pnpm dev:local
pnpm dev:sepolia
```

应用通过 `VITE_NETWORK` 切换链路配置。

## 项目结构

```
portfolio/
├── public/               # 静态资源
├── src/
│   ├── assets/           # 图片/图标
│   ├── components/       # React 组件
│   │   └── ui/           # UI 基础组件
│   ├── config/           # 链路、wagmi、合约配置
│   ├── hooks/            # 业务 hooks
│   ├── pages/            # 页面
│   │   └── sideprojects/ # 链上演示
│   ├── styles/           # 全局样式
│   ├── App.tsx           # 应用主组件
│   └── main.tsx          # 入口
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── postcss.config.mjs
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## License

MIT
