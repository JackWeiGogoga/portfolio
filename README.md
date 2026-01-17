# Portfolio - Vite + React

Personal portfolio site built with Vite and React, featuring side projects that integrate on-chain experiences.

English | [简体中文](./README.zh-CN.md)

![React](https://img.shields.io/badge/react-19-blue)
![Vite](https://img.shields.io/badge/vite-7.x-646CFF)
![License](https://img.shields.io/badge/license-MIT-green)

[Docs](./docs) · [Pages](./src/pages) · [Components](./src/components) · [Config](./src/config) · [License](#license)

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - type safety
- **Vite** - build tooling
- **Tailwind CSS v4** - styling
- **React Router** - routing
- **Motion** - animation
- **Radix UI** - accessible primitives
- **Wagmi + RainbowKit + Viem** - wallet and on-chain integration

## Features

- ✅ Responsive layout and theme switching
- ✅ Side projects: crowdfunding, token, NFT, voting demos
- ✅ Wallet connect and chain guard
- ✅ Markdown rendering and code blocks
- ✅ IPFS image support and asset preview

## Development

```bash
# install dependencies
pnpm install

# start dev server
pnpm dev

# build for production
pnpm build

# preview build
pnpm preview
```

### Network Modes

```bash
pnpm dev:local
pnpm dev:sepolia
```

The app reads `VITE_NETWORK` to switch chain configs.

## Project Structure

```
portfolio/
├── public/               # static assets
├── src/
│   ├── assets/           # images/icons
│   ├── components/       # React components
│   │   └── ui/           # UI primitives
│   ├── config/           # chain, wagmi, contracts
│   ├── hooks/            # feature hooks
│   ├── pages/            # route pages
│   │   └── sideprojects/ # on-chain demos
│   ├── styles/           # global styles
│   ├── App.tsx           # app root
│   └── main.tsx          # entry
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── postcss.config.mjs
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
