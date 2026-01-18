import React from "react";
import { FaGithub, FaJava, FaPython, FaReact } from "react-icons/fa";
import { GoArrowUpRight } from "react-icons/go";
import { SiApachekafka, SiHuggingface, SiSpring } from "react-icons/si";

const works = [
  {
    title: "Content Moderation LLM Fine-tuning",
    description:
      "Led fine-tuning of a moderation-focused LLM to improve precision and recall, with SFT and GRPO for business-specific standards.",
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
    title: "Content Moderation Efficiency Initiative",
    description:
      "Led a machine moderation strategy and LLM platform to reduce manual review, improve throughput, and raise review quality.",
    type: "Backend",
    tags: [
      {
        name: "Java",
        icon: <FaJava />,
      },
      {
        name: "Kafka",
        icon: <SiApachekafka />,
      },
      {
        name: "Spring",
        icon: <SiSpring />,
      },
    ],
    link: "/#/resume",
    date: "Jun '21 - Jun '25",
  },
  {
    title: "LLM-Powered Data Analysis Agent",
    description:
      "Built an LLM agent that answers questions, generates SQL, runs queries, and renders rich visualizations.",
    type: "AI",
    tags: [
      {
        name: "Python",
        icon: <FaPython />,
      },
      {
        name: "React",
        icon: <FaReact />,
      },
      {
        name: "LLM",
        icon: <SiHuggingface />,
      },
    ],
    link: "/#/resume",
    date: "Oct '23 - Nov '23",
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
