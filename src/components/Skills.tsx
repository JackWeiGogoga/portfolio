import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaCss3,
  FaGithub,
  FaHardHat,
  FaHtml5,
  FaJava,
  FaPython,
  FaReact,
  FaVuejs,
} from "react-icons/fa";
import {
  SiAlchemy,
  SiAntdesign,
  SiApachekafka,
  SiChainlink,
  SiEthers,
  SiFastapi,
  SiFlask,
  SiHuggingface,
  SiIpfs,
  SiJavascript,
  SiLangchain,
  SiMysql,
  SiOpenzeppelin,
  SiRabbitmq,
  SiRedis,
  SiShadcnui,
  SiSolidity,
  SiSpring,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import Skill from "./Skill";
import { DiSqllite } from "react-icons/di";
import { RiNextjsFill } from "react-icons/ri";
import { PiUnionFill } from "react-icons/pi";
import { GiPinata } from "react-icons/gi";
import truffleIcon from "@/assets/images/logos/truffle.svg";
import metamaskIcon from "@/assets/images/logos/metamask.svg";
import okxIcon from "@/assets/images/logos/okx.png";
import infuraIcon from "@/assets/images/logos/infura.ico";
import ankrIcon from "@/assets/images/logos/ankr.svg";

const skillData = [
  {
    category: "backend",
    type: "language",
    name: "Java",
    icon: <FaJava />,
    level: 5,
  },
  {
    category: "backend",
    type: "language",
    name: "Python",
    icon: <FaPython />,
    level: 3.5,
  },
  {
    category: "backend",
    type: "framework",
    name: "Spring",
    icon: <SiSpring />,
    level: 5,
  },
  {
    category: "backend",
    type: "framework",
    name: "Flask",
    icon: <SiFlask />,
    level: 3,
  },
  {
    category: "backend",
    type: "framework",
    name: "FastAPI",
    icon: <SiFastapi />,
    level: 3,
  },
  {
    category: "backend",
    type: "database",
    name: "MySQL",
    icon: <SiMysql />,
    level: 5,
  },
  {
    category: "backend",
    type: "database",
    name: "Redis",
    icon: <SiRedis />,
    level: 5,
  },
  {
    category: "backend",
    type: "database",
    name: "SQLite",
    icon: <DiSqllite />,
    level: 3,
  },
  {
    category: "backend",
    type: "messageQueue",
    name: "Kafka",
    icon: <SiApachekafka />,
    level: 4,
  },
  {
    category: "backend",
    type: "messageQueue",
    name: "RabbitMQ",
    icon: <SiRabbitmq />,
    level: 3,
  },
  {
    category: "frontend",
    type: "language",
    name: "Html",
    icon: <FaHtml5 />,
    level: 5,
  },
  {
    category: "frontend",
    type: "language",
    name: "CSS",
    icon: <FaCss3 />,
    level: 4,
  },
  {
    category: "frontend",
    type: "language",
    name: "JavaScript",
    icon: <SiJavascript />,
    level: 4,
  },
  {
    category: "frontend",
    type: "language",
    name: "TypeScript",
    icon: <SiTypescript />,
    level: 3,
  },
  {
    category: "frontend",
    type: "framework",
    name: "React",
    icon: <FaReact />,
    level: 4,
  },
  {
    category: "frontend",
    type: "framework",
    name: "Vue",
    icon: <FaVuejs />,
    level: 3,
  },
  {
    category: "frontend",
    type: "ssr",
    name: "Next.js",
    icon: <RiNextjsFill />,
    level: 3,
  },
  {
    category: "frontend",
    type: "build",
    name: "Vite",
    icon: <SiVite />,
    level: 4,
  },
  {
    category: "frontend",
    type: "ui",
    name: "Ant Design",
    icon: <SiAntdesign />,
    level: 5,
  },
  {
    category: "frontend",
    type: "ui",
    name: "Shadcn UI",
    icon: <SiShadcnui />,
    level: 4,
  },
  {
    category: "frontend",
    type: "ui",
    name: "Tailwind CSS",
    icon: <SiTailwindcss />,
    level: 4,
  },
  {
    category: "frontend",
    type: "miniProgram",
    name: "UniApp",
    icon: <PiUnionFill />,
    level: 4,
  },
  {
    category: "web3",
    type: "language",
    name: "Solidity",
    icon: <SiSolidity />,
    level: 4,
  },
  {
    category: "web3",
    type: "language",
    name: "Ethers.js",
    icon: <SiEthers />,
    level: 3.5,
  },
  {
    category: "web3",
    type: "test",
    name: "Hardhat",
    icon: <FaHardHat />,
    level: 4,
  },
  {
    category: "web3",
    type: "test",
    name: "Truffle",
    icon: <img src={truffleIcon} alt="truffle" width={14} height={14} />,
    level: 3,
  },
  {
    category: "web3",
    type: "build",
    name: "OpenZeppelin",
    icon: <SiOpenzeppelin />,
    level: 4,
  },
  {
    category: "web3",
    type: "build",
    name: "Chainlink",
    icon: <SiChainlink />,
    level: 3,
  },
  {
    category: "web3",
    type: "wallet",
    name: "Metamask",
    icon: <img src={metamaskIcon} alt="Metamask" width={14} height={14} />,
    level: 4,
  },
  {
    category: "web3",
    type: "wallet",
    name: "OKX Wallet",
    icon: <img src={okxIcon} alt="okx" width={14} height={14} />,
    level: 3,
  },
  {
    category: "web3",
    type: "storage",
    name: "IPFS",
    icon: <SiIpfs />,
    level: 3,
  },
  {
    category: "web3",
    type: "storage",
    name: "Pinata",
    icon: <GiPinata />,
    level: 3,
  },
  {
    category: "web3",
    type: "provider",
    name: "Infura",
    icon: <img src={infuraIcon} alt="infura" width={14} height={14} />,
    level: 3,
  },
  {
    category: "web3",
    type: "provider",
    name: "Ankr",
    icon: <img src={ankrIcon} alt="ankr" width={14} height={14} />,
    level: 3,
  },
  {
    category: "web3",
    type: "provider",
    name: "Alchemy",
    icon: <SiAlchemy />,
    level: 3,
  },
  {
    category: "ai",
    type: "model",
    name: "Bert",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=bert",
    level: 4,
  },
  {
    category: "ai",
    type: "model",
    name: "Qwen",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=qwen3",
    level: 5,
  },
  {
    category: "ai",
    type: "model",
    name: "Deepseek",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=deepseek",
    level: 4,
  },
  {
    category: "ai",
    type: "model",
    name: "GLM",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=glm",
    level: 4,
  },
  {
    category: "ai",
    type: "model",
    name: "LLama",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=llama",
    level: 3,
  },
  {
    category: "ai",
    type: "framework",
    name: "LLaMA Factory",
    icon: <FaGithub />,
    url: "https://github.com/hiyouga/LLaMA-Factory",
    level: 5,
  },
  {
    category: "ai",
    type: "framework",
    name: "Unsloth",
    icon: <FaGithub />,
    url: "https://github.com/unslothai/unsloth",
    level: 4,
  },
  {
    category: "ai",
    type: "framework",
    name: "Langchain",
    icon: <SiLangchain />,
    url: "https://github.com/langchain-ai/langchain",
    level: 4,
  },
  {
    category: "ai",
    type: "train",
    name: "SFT",
    icon: <SiHuggingface />,

    url: "https://huggingface.co/docs/trl/main/en/sft_trainer",
    level: 4,
  },
  {
    category: "ai",
    type: "train",
    name: "GRPO",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/docs/trl/main/en/grpo_trainer",
    level: 3,
  },
];

const Skills: React.FC = () => {
  const { t } = useTranslation("home");
  const categoryLabels = t("skills.categories", {
    returnObjects: true,
  }) as Record<string, string>;
  const typeLabels = t("skills.types", {
    returnObjects: true,
  }) as Record<string, string>;
  const uniqueCategories = useMemo(
    () => [...new Set(skillData.map((item) => item.category))],
    [],
  );
  const [activeCategory, setActiveCategory] = useState<string>("backend");

  return (
    <div className="my-6">
      <h5 className="mb-4 text-sm text-graytext font-mono">
        {t("skills.title")}
      </h5>
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="gap-0 mb-3"
      >
        <TabsList className="grid grid-cols-4">
          {uniqueCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {categoryLabels[category] ?? category}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeCategory} className="flex flex-col">
          <Skill
            skills={skillData.filter(
              (skill) => skill.category === activeCategory,
            )}
            typeLabels={typeLabels}
            emptyText={t("skills.empty")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Skills;
