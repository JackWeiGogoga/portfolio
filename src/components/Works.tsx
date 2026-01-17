import React from "react";
import { FaGithub, FaJava, FaPython } from "react-icons/fa";
import { GoArrowUpRight } from "react-icons/go";
import {
  SiApachekafka,
  SiHuggingface,
  SiMysql,
  SiSpring,
} from "react-icons/si";

const works = [
  {
    title: "Content Moderation Model - SFT and GRPO Fine-tuning",
    description:
      "Fine-tuning a pre-trained model using supervised fine-tuning (SFT) and GRPO.",
    type: "AI",
    tags: [
      {
        name: "Python",
        icon: <FaPython />,
      },
      {
        name: "Unsloth",
        icon: <FaGithub />,
      },
      {
        name: "Qwen",
        icon: <SiHuggingface />,
      },
    ],
    link: "/works/ai",
    date: "June '25 - Aug '25",
  },
  {
    title: "Apollo - A Content Audit and Process Platform",
    description:
      "Fine-tuning a pre-trained model using supervised fine-tuning (SFT) and.",
    type: "Backend",
    tags: [
      {
        name: "Java",
        icon: <FaJava />,
      },
      {
        name: "Spring",
        icon: <SiSpring />,
      },
      {
        name: "MySQL",
        icon: <SiMysql />,
      },
      {
        name: "Kafka",
        icon: <SiApachekafka />,
      },
    ],
    link: "/#/works/flowlet",
    date: "Jun '25 - Aug '25",
  },
];

const Works: React.FC = () => {
  return (
    <div className="my-6">
      <h5 className="mb-2 text-sm text-graytext font-mono">Works</h5>

      {works.map((work, index) => (
        <a
          key={index}
          href={work.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group px-4 py-2 mb-1 -mx-4 hover:bg-card-background hover:rounded-sm relative no-underline"
        >
          <div className="group relative">
            <div className="inline font-medium">{work.title}</div>
          </div>
          <div className="flex items-center justify-between gap-2 my-1">
            <div className="flex flex-wrap gap-2">
              <div className="text-xs bg-accent rounded px-1">{work.type}</div>
              {work.tags.map((tag, tagIndex) => (
                <div
                  key={tagIndex}
                  className="flex items-center gap-1 bg-muted rounded px-1 text-xs"
                >
                  {tag.icon}
                  {tag.name}
                </div>
              ))}
            </div>
            {/* <div className="text-graytext text-xs text-right">{work.date}</div> */}
          </div>

          <p className="text-sm">{work.description}</p>

          <div className="absolute bottom-4 right-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-graytext">
            <GoArrowUpRight className="inline-block" />
          </div>
        </a>
      ))}
    </div>
  );
};

export default Works;
