import React, { useState } from "react";
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
    category: "Backend",
    type: "Language",
    name: "Java",
    icon: <FaJava />,
    level: 5,
  },
  {
    category: "Backend",
    type: "Language",
    name: "Python",
    icon: <FaPython />,
    level: 3.5,
  },
  {
    category: "Backend",
    type: "Framework",
    name: "Spring",
    icon: <SiSpring />,
    level: 5,
  },
  {
    category: "Backend",
    type: "Framework",
    name: "Flask",
    icon: <SiFlask />,
    level: 3,
  },
  {
    category: "Backend",
    type: "Framework",
    name: "FastAPI",
    icon: <SiFastapi />,
    level: 3,
  },
  {
    category: "Backend",
    type: "Database",
    name: "MySQL",
    icon: <SiMysql />,
    level: 5,
  },
  {
    category: "Backend",
    type: "Database",
    name: "Redis",
    icon: <SiRedis />,
    level: 5,
  },
  {
    category: "Backend",
    type: "Database",
    name: "SQLite",
    icon: <DiSqllite />,
    level: 3,
  },
  {
    category: "Backend",
    type: "MessageQueue",
    name: "Kafka",
    icon: <SiApachekafka />,
    level: 4,
  },
  {
    category: "Backend",
    type: "MessageQueue",
    name: "RabbitMQ",
    icon: <SiRabbitmq />,
    level: 3,
  },
  {
    category: "Frontend",
    type: "Language",
    name: "Html",
    icon: <FaHtml5 />,
    level: 5,
  },
  {
    category: "Frontend",
    type: "Language",
    name: "CSS",
    icon: <FaCss3 />,
    level: 4,
  },
  {
    category: "Frontend",
    type: "Language",
    name: "JavaScript",
    icon: <SiJavascript />,
    level: 4,
  },
  {
    category: "Frontend",
    type: "Language",
    name: "TypeScript",
    icon: <SiTypescript />,
    level: 3,
  },
  {
    category: "Frontend",
    type: "Framework",
    name: "React",
    icon: <FaReact />,
    level: 4,
  },
  {
    category: "Frontend",
    type: "Framework",
    name: "Vue",
    icon: <FaVuejs />,
    level: 3,
  },
  {
    category: "Frontend",
    type: "SSR",
    name: "Next.js",
    icon: <RiNextjsFill />,
    level: 3,
  },
  {
    category: "Frontend",
    type: "Build",
    name: "Vite",
    icon: <SiVite />,
    level: 4,
  },
  {
    category: "Frontend",
    type: "UI",
    name: "Ant Design",
    icon: <SiAntdesign />,
    level: 5,
  },
  {
    category: "Frontend",
    type: "UI",
    name: "Shadcn UI",
    icon: <SiShadcnui />,
    level: 4,
  },
  {
    category: "Frontend",
    type: "UI",
    name: "Tailwind CSS",
    icon: <SiTailwindcss />,
    level: 4,
  },
  {
    category: "Frontend",
    type: "Mini Program",
    name: "UniApp",
    icon: <PiUnionFill />,
    level: 4,
  },
  {
    category: "Web3",
    type: "Language",
    name: "Solidity",
    icon: <SiSolidity />,
    level: 4,
  },
  {
    category: "Web3",
    type: "Language",
    name: "Ethers.js",
    icon: <SiEthers />,
    level: 3.5,
  },
  {
    category: "Web3",
    type: "Test",
    name: "Hardhat",
    icon: <FaHardHat />,
    level: 4,
  },
  {
    category: "Web3",
    type: "Test",
    name: "Truffle",
    icon: <img src={truffleIcon} alt="truffle" width={14} height={14} />,
    level: 3,
  },
  {
    category: "Web3",
    type: "Build",
    name: "OpenZeppelin",
    icon: <SiOpenzeppelin />,
    level: 4,
  },
  {
    category: "Web3",
    type: "Build",
    name: "Chainlink",
    icon: <SiChainlink />,
    level: 3,
  },
  {
    category: "Web3",
    type: "Wallet",
    name: "Metamask",
    icon: <img src={metamaskIcon} alt="Metamask" width={14} height={14} />,
    level: 4,
  },
  {
    category: "Web3",
    type: "Wallet",
    name: "OKX Wallet",
    icon: <img src={okxIcon} alt="okx" width={14} height={14} />,
    level: 3,
  },
  {
    category: "Web3",
    type: "Storage",
    name: "IPFS",
    icon: <SiIpfs />,
    level: 3,
  },
  {
    category: "Web3",
    type: "Storage",
    name: "Pinata",
    icon: <GiPinata />,
    level: 3,
  },
  {
    category: "Web3",
    type: "Provider",
    name: "Infura",
    icon: <img src={infuraIcon} alt="infura" width={14} height={14} />,
    level: 3,
  },
  {
    category: "Web3",
    type: "Provider",
    name: "Ankr",
    icon: <img src={ankrIcon} alt="ankr" width={14} height={14} />,
    level: 3,
  },
  {
    category: "Web3",
    type: "Provider",
    name: "Alchemy",
    icon: <SiAlchemy />,
    level: 3,
  },
  {
    category: "AI",
    type: "Model",
    name: "Bert",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=bert",
    level: 4,
  },
  {
    category: "AI",
    type: "Model",
    name: "Qwen",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=qwen3",
    level: 5,
  },
  {
    category: "AI",
    type: "Model",
    name: "Deepseek",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=deepseek",
    level: 4,
  },
  {
    category: "AI",
    type: "Model",
    name: "GLM",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=glm",
    level: 4,
  },
  {
    category: "AI",
    type: "Model",
    name: "LLama",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/models?search=llama",
    level: 3,
  },
  {
    category: "AI",
    type: "Frameword",
    name: "LLaMA Factory",
    icon: <FaGithub />,
    url: "https://github.com/hiyouga/LLaMA-Factory",
    level: 5,
  },
  {
    category: "AI",
    type: "Frameword",
    name: "Unsloth",
    icon: <FaGithub />,
    url: "https://github.com/unslothai/unsloth",
    level: 4,
  },
  {
    category: "AI",
    type: "Train",
    name: "SFT",
    icon: <SiHuggingface />,

    url: "https://huggingface.co/docs/trl/main/en/sft_trainer",
    level: 4,
  },
  {
    category: "AI",
    type: "Train",
    name: "GRPO",
    icon: <SiHuggingface />,
    url: "https://huggingface.co/docs/trl/main/en/grpo_trainer",
    level: 3,
  },
];

const uniqueCategories = [...new Set(skillData.map((item) => item.category))];

const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Backend");

  return (
    <div className="my-6">
      <h5 className="mb-4 text-sm text-graytext font-mono">Skills</h5>
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="gap-0 mb-3"
      >
        <TabsList className="grid grid-cols-4">
          {uniqueCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeCategory} className="flex flex-col">
          <Skill
            skills={skillData.filter(
              (skill) => skill.category === activeCategory
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Skills;
