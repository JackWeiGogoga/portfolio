import type { ReactNode } from "react";
import { FaHardHat } from "react-icons/fa";
import { SiOpenzeppelin, SiSolidity, SiWagmi } from "react-icons/si";
import { ROUTES } from "@/config/constants";

export type SideProject = {
  title: string;
  description: string;
  type: string;
  tags: Array<{
    name: string;
    icon: ReactNode;
  }>;
  link: string;
  date: string;
};

export const SIDE_PROJECTS: SideProject[] = [
  {
    title: "Crowdfunding - Tier-based & Custom Funding",
    description:
      "A flexible crowdfunding system supporting multiple funding tiers, custom contributions, campaign management, and refunds for failed campaigns.",
    type: "Web3",
    tags: [
      {
        name: "Solidity",
        icon: <SiSolidity />,
      },
      {
        name: "Hardhat",
        icon: <FaHardHat />,
      },
      {
        name: "Wagmi",
        icon: <SiWagmi />,
      },
    ],
    link: ROUTES.PROJECTS,
    date: "Sep '25 - Dec '25",
  },
  {
    title: "Gogoga Token - ERC20 Token with Sale",
    description:
      "An ERC20 token implementation with built-in token sale functionality, featuring pausable transfers, minting capabilities, and configurable purchase limits.",
    type: "Web3",
    tags: [
      {
        name: "Solidity",
        icon: <SiSolidity />,
      },
      {
        name: "ERC20",
        icon: <SiOpenzeppelin />,
      },
      {
        name: "Wagmi",
        icon: <SiWagmi />,
      },
    ],
    link: ROUTES.GOGOGA_TOKEN,
    date: "Dec '25 - Jan '26",
  },
  {
    title: "Gogoga NFT - ERC721 Collection with Royalties",
    description:
      "An ERC721 NFT collection with EIP-2981 royalty support, pausable minting, batch operations, and burnable tokens for enhanced creator control.",
    type: "Web3",
    tags: [
      {
        name: "Solidity",
        icon: <SiSolidity />,
      },
      {
        name: "ERC721",
        icon: <SiOpenzeppelin />,
      },
      {
        name: "Wagmi",
        icon: <SiWagmi />,
      },
    ],
    link: ROUTES.GOGOGA_NFT,
    date: "Jan '26",
  },
  {
    title: "Voting System - On-chain Decentralized Voting",
    description:
      "A decentralized voting system with candidate and voter registration, time-limited voting sessions, pausable controls, and transparent result tallying.",
    type: "Web3",
    tags: [
      {
        name: "Solidity",
        icon: <SiSolidity />,
      },
      {
        name: "OpenZeppelin",
        icon: <SiOpenzeppelin />,
      },
      {
        name: "Wagmi",
        icon: <SiWagmi />,
      },
    ],
    link: ROUTES.VOTING,
    date: "Jan '26",
  },
];
