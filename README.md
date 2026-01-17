# Portfolio - Vite Version

这是从 Next.js 迁移到 Vite + React 的个人作品集网站。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS v4** - 样式框架
- **React Router** - 路由管理
- **Framer Motion** - 动画
- **Radix UI** - 无障碍 UI 组件
- **React Icons** - 图标库

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
portfolio-vite/
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件
│   │   ├── ui/         # UI 基础组件 (Radix UI)
│   │   ├── AnimationWrapper.tsx
│   │   ├── Contact.tsx
│   │   ├── Experiences.tsx
│   │   ├── Footer.tsx
│   │   ├── Intro.tsx
│   │   ├── NavMenu.tsx
│   │   ├── NewPost.tsx
│   │   ├── Profile.tsx
│   │   ├── SideProjects.tsx
│   │   ├── Skills.tsx
│   │   ├── Skill.tsx
│   │   ├── Works.tsx
│   │   └── theme-provider.tsx
│   ├── pages/          # 页面组件
│   │   └── Home.tsx
│   ├── styles/         # 样式文件
│   │   └── globals.css
│   ├── App.tsx         # 应用主组件
│   └── main.tsx        # 应用入口
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── postcss.config.mjs
```

## 主要变更

## 功能特性

- ✅ 深色/浅色主题切换
- ✅ 响应式设计
- ✅ 平滑滚动动画
- ✅ 命令面板 (⌘K)
- ✅ 技能展示（标签页切换）
- ✅ 项目作品展示
- ✅ 教育与工作经历时间线
- ✅ 联系信息

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## License

MIT
