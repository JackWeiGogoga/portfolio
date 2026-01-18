import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import avatarImg from "@/assets/images/resume/avatar.jpg";

const resumeContent = {
  en: {
    name: "Jack Wei",
    headerInfo: [
      { label: "Phone", value: "+86 18500151385" },
      { label: "Email", value: "jackweigogoga@gmail.com" },
      { label: "Telegram", value: "@jackweigogoga" },
      { label: "Location", value: "Beijing, China" },
      { label: "Website", value: "https://gogoga.eth.limo/" },
      { label: "Github", value: "https://github.com/JackWeiGogoga" },
    ],
    sectionTitles: {
      personal: "Personal Info",
      education: "Education",
      work: "Work Experience",
      projects: "Personal Projects",
      skills: "Professional Skills",
      summary: "Summary",
    },
    metaLabels: {
      role: "Role",
      company: "Company",
      tech: "Tech Stack",
      responsibilities: "Responsibilities",
      impact: "Impact",
      highlights: "Highlights",
    },
    education: [
      {
        school: "Northeastern University",
        major: "Computer Technology",
        degree: "Master of Engineering",
        time: "2013.09-2015.07",
      },
      {
        school: "Northeastern University",
        major: "Computer Science and Technology",
        degree: "Bachelor of Engineering",
        time: "2009.09-2013.06",
      },
    ],
    workExperience: [
      {
        project: "Content Moderation LLM Fine-tuning",
        time: "2025.06-2026.01",
        role: "Project Lead",
        company: "NetEase",
        tech: ["Python", "SFT", "LlamaFactory"],
        responsibilities: [
          "Led fine-tuning of a moderation-focused LLM to improve domain precision and recall, raising overall review quality.",
          "Analyzed human review standards and defined a risk taxonomy; enhanced prompts with RAG and few-shot context to improve prompt quality.",
          "Used LLMs for data pre-labeling and built an annotation platform with AI-assisted coding, increasing labeling efficiency by 40%.",
          "Fine-tuned the Qwen3 model via SFT + GRPO to improve moderation accuracy on business-specific standards.",
          "Fine-tuned small-parameter models for simple scenarios to reduce hardware cost (e.g., BERT for AI-written copy and spam ads) with 90%+ accuracy.",
        ],
        impact: [
          "Risk identification accuracy improved from 60% to 80%; recall improved from 20% to 70%.",
        ],
      },
      {
        project: "Content Moderation Efficiency Initiative",
        time: "2021.06-2025.06",
        role: "Project Lead, Backend Engineer",
        company: "NetEase",
        tech: ["Java", "Agent", "BI", "Kafka"],
        responsibilities: [
          "Led the design of a machine moderation strategy to reduce manual review while ensuring safety and quality.",
          "Instrumented and analyzed the moderation pipeline to identify bottlenecks; designed and shipped 30+ automated rules covering 6+ business types.",
          "Built an LLM moderation platform with multi-agent configuration, model switching, and prompt tuning; covered ~100 policy scales.",
          "Refactored the manual review dispatch workflow, improving reviewer efficiency by 15% and reducing high-value content review time by 20%.",
          "Refactored the moderation console with AI-assisted coding to improve content presentation and interaction, cutting per-item review time by 18%.",
        ],
        impact: [
          "Manual review cost down 83%, backlog rate reduced from 20% to 0, and review time reduced by 40%.",
        ],
      },
      {
        project: "LLM-Powered Data Analysis Agent",
        time: "2023.10-2023.11",
        role: "Project Lead, Full-Stack Engineer",
        company: "NetEase",
        tech: ["Python", "LangChain", "React"],
        responsibilities: [
          "Built an LLM-based data analysis agent that answers natural-language questions, generates SQL, executes queries, and renders multiple visualization formats.",
          "Implemented a ReAct agent with LangChain; auto-ingested visible schemas into prompts and used RAG to inject domain knowledge.",
          "Implemented user memory with Redis to support multi-turn analysis.",
          "Developed a React UI with tables, bar charts, line charts, and pie charts.",
        ],
        impact: [
          "Replaced routine analyst tasks with an AI agent, improving product and operations efficiency by 30%, and filed a national patent.",
        ],
      },
      {
        project: "NetEase News",
        time: "2019.06-2021.06",
        role: "Backend Engineer",
        company: "NetEase",
        tech: ["SpringBoot", "MyBatis", "Redis", "Sentinel", "Hystrix"],
        responsibilities: [
          "Worked on the content distribution platform, contributing to Zhifou Q&A, recommendation integration, and dual-feed publishing.",
          "Optimized the publishing flow with unified video upload IDs and centralized processing to reduce complexity.",
          "Implemented traffic control with Sentinel and circuit breaking with Hystrix to ensure system stability.",
        ],
        impact: [
          "Reduced API latency by 20% by optimizing recommendation integration with CompletableFuture concurrency.",
        ],
      },
      {
        project: "Mint Live",
        time: "2016.11-2018.12",
        role: "Backend Engineer",
        company: "NetEase",
        tech: ["SpringBoot", "RabbitMQ", "FFmpeg"],
        responsibilities: [
          "Supported a live streaming product with PK, short video, replay, quizzes, and tasks across mobile SDK, PC OBS, and third-party relay pipelines.",
          "Built core backend services, designed live streaming workflows, integrated third-party services, and delivered real-name verification, resume streaming, push/pull switching, recording adaptation, and stream reuse.",
          "Implemented delayed queues with RabbitMQ dead-letter queues; built bot and red packet services.",
          "Led the NetEase Winner live quiz project, designing the settlement algorithm and guiding end-to-end streaming, quiz, and settlement flows without major incidents.",
        ],
        impact: [
          "Built the live backend from 0 to 1 and delivered the NetEase Winner quiz in 2 weeks after a 3-day settlement algorithm design.",
        ],
      },
      {
        project: "Qunar Mobile Hotel Project",
        time: "2015.07-2016.04",
        role: "Backend Engineer",
        company: "Qunar",
        tech: ["SpringMVC", "MyBatis", "Dozer"],
        responsibilities: [
          "Developed the TTS system to integrate supplier workflows, handling booking form, order placement, and order details to improve system completeness.",
          "Optimized order center data synchronization, fixed order loss issues, and supported production troubleshooting and maintenance.",
        ],
        impact: [
          "Built a low-coupling pipeline with hot-reloadable configurations to control feature flags and reduce maintenance cost.",
        ],
      },
    ],
    personalProjects: [
      {
        project: "Flowlet",
        time: "2025.12-2026.01",
        tech: ["Java", "Python", "React Flow"],
        url: "https://flowlet.gogoga.top/",
        highlights: [
          "Flowlet is a lightweight visual workflow orchestration system that lets you design and run data-processing pipelines via drag-and-drop.",
          "Provides nodes for LLM calls, API calls, Kafka async processing, sensitive word matching, and vector storage.",
        ],
      },
      {
        project: "Web3 Side Projects",
        time: "2025.09-2025.10",
        tech: ["Solidity", "Hardhat", "OpenZeppelin", "Wagmi"],
        url: "https://gogoga.eth.limo/#/side-projects",
        highlights: [
          "Crowdfunding: tiered and custom contributions, refunds on failure, withdrawals on goal reached; applied state machine + CEI with Pausable/Ownable for safety and fund-risk control.",
          "Gogoga Token: ERC20 extensions for sale, minting, and purchase limits with Sale/Airdrop/Faucet contracts; airdrop uses Merkle Tree whitelist validation for token issuance ops.",
          "Gogoga NFT: ERC721 preset/custom minting, IPFS metadata, and royalty strategy; batch minting, URI management, and pausing improve UX and content ops.",
          "Voting System: candidate/voter registration, time-window voting, and result tallying; batch registration and query APIs, on-chain governance auditability; custom errors reduce gas.",
        ],
      },
    ],
    skills: [
      {
        category: "Languages",
        items: ["Java", "TypeScript", "Python", "Solidity"],
      },
      {
        category: "Backend",
        items: ["Spring Boot", "Redis", "Kafka", "MySQL"],
      },
      {
        category: "Frontend",
        items: ["React", "Vite", "Tailwind", "Ant Design"],
      },
      {
        category: "Web3",
        items: ["Hardhat", "Wagmi", "IPFS", "Openzeppelin"],
      },
      {
        category: "AI / Machine Learning",
        items: ["LLM Fine-tuning", "AI Agent", "Langchain", "Dify"],
      },
      {
        category: "Tooling",
        items: ["Git", "Codex", "Docker"],
      },
    ],
    summary: [
      "Senior backend engineer with 11 years of experience, strong software engineering fundamentals, and a focus on code quality and architecture with solid full-stack capability.",
      "Proactive, accountable, and collaborative; communicates well, values knowledge sharing, and identifies business bottlenecks with product thinking.",
      "Strong interest in internet technologies, Web3, and AI, with continuous learning and a habit of adopting best practices from open-source projects.",
    ],
  },
  zh: {
    name: "魏东军",
    headerInfo: [
      { label: "手机号", value: "+86 18500151385" },
      { label: "邮箱", value: "jackweigogoga@gmail.com" },
      { label: "Telegram", value: "@jackweigogoga" },
      { label: "位置", value: "中国 北京" },
      { label: "个人网站", value: "https://gogoga.eth.limo/" },
      { label: "Github", value: "https://github.com/JackWeiGogoga" },
    ],
    sectionTitles: {
      personal: "个人信息",
      education: "教育经历",
      work: "工作经历",
      projects: "个人项目",
      skills: "专业技能",
      summary: "个人总结",
    },
    metaLabels: {
      role: "角色",
      company: "所属公司",
      tech: "主要技术",
      responsibilities: "主要职责",
      impact: "收益",
      highlights: "要点",
    },
    education: [
      {
        school: "东北大学",
        major: "计算机技术",
        degree: "工程硕士",
        time: "2013.09-2015.07",
      },
      {
        school: "东北大学",
        major: "计算机科学与技术",
        degree: "工学学士",
        time: "2009.09-2013.06",
      },
    ],
    workExperience: [
      {
        project: "审核大模型微调",
        time: "2025.06-2026.01",
        role: "项目负责人",
        company: "网易",
        tech: ["Python", "SFT", "LlamaFactory"],
        responsibilities: [
          "作为项目负责人，为了提升大模型在审核垂类领域的能力，主导了审核大模型微调工作，提升了大模型审核的准召率，提升了整体审核质量。",
          "分析审核尺度，梳理风险标签体系，通过 RAG 和 Few Shot 等方式，补充提示词上下文，提升提示词质量。",
          "使用大模型进行数据预标注，并借助 AI 辅助编程，快速搭建人工标注平台，提高标注效率 40%。",
          "通过 SFT + GRPO 的方式，对 Qwen3 模型进行微调，提升了通用模型对业务专有尺度的审核能力。",
          "针对简单场景，微调小参数模型，节约硬件成本，比如微调 bert 识别 AI 写稿和垃圾广告，准确率超过 90%。",
        ],
        impact: [
          "大模型风险识别准确率从 60% 提升到了 80%，召回率从 20% 提升到了 70%。",
        ],
      },
      {
        project: "内容审核提效",
        time: "2021.06-2025.06",
        role: "项目负责人，服务端开发",
        company: "网易",
        tech: ["Java", "Agent", "BI", "Kafka"],
        responsibilities: [
          "作为项目负责人，为了提升内容审核效率，节约人力成本，主导设计了使用机器代替人工审核的方案，在保障内容安全和质量的同时，减少人工审核。",
          "通过数据埋点和数据分析，挖掘内容审核流程中的效率瓶颈，设计并落地了超过 30 种机器审核规则。",
          "基于多 Agent 搭建大模型审核中台，支持模型切换和尺度提示词动态配置调优，覆盖了约 100 种审核尺度。",
          "重构人工审核派单流程，提高人工审核效率 15%，降低高价值内容审核耗时 20%。",
          "借助 AI 辅助编程，完成审核后台前端页面重构，优化内容展示和交互，减少单篇人审耗时 18%。",
        ],
        impact: [
          "人工审核成本降低 83%，审核积压率从 20% 降低到 0，审核耗时降低 40%。",
        ],
      },
      {
        project: "基于大语言模型的数据分析 Agent",
        time: "2023.10-2023.11",
        role: "项目负责人，全栈开发",
        company: "网易",
        tech: ["Python", "Langchain", "React"],
        responsibilities: [
          "为了提升数据分析效率，基于大语言模型搭建了一个数据分析 Agent，支持用户通过自然语言提问，自动生成 SQL 语句并执行，支持多种形式的数据展示。",
          "通过 Langchain 框架，基于 ReAct 原理实现了 Agent 的搭建，自动获取用户可见的数据库表结构，放到提示词上下文中，并使用 RAG 的方式，补充用户提问相关的领域知识。",
          "基于 Redis 实现用户记忆系统，支持多轮对话，方便用户进行复杂的数据分析。",
          "使用 React 搭建前端页面，支持表格、条形图、折线图、饼图等多种数据展示形式。",
        ],
        impact: [
          "使用 AI Agent 代替数据分析师完成日常数据分析工作，提升了产品、运营效率 30%。",
          "已申请国家专利。",
        ],
      },
      {
        project: "网易新闻",
        time: "2019.06-2021.06",
        role: "服务端开发",
        company: "网易",
        tech: ["SpringBoot", "MyBatis", "Redis", "Sentinel", "Hystrix"],
        responsibilities: [
          "网易新闻是网易旗下的一款内容分发平台，并提供类似社区的资源整合，倡导用户抒发观点。作为服务端开发，参与了知否问答、推荐系统接入、双列表发布等功能。",
          "梳理并优化发布流程，用户上传视频同步获取id，统一系统中的视频处理，降低逻辑复杂度。",
          "使用 Sentinel 实现流量控制，使用 Hystrix 实现服务降级，保证系统的稳定性。",
        ],
        impact: [
          "优化推荐系统接入流程，使用 CompletableFuture 实现并发调用，降低接口响应时间 20%。",
        ],
      },
      {
        project: "薄荷直播",
        time: "2016.11-2018.12",
        role: "服务端开发",
        company: "网易",
        tech: ["SpringBoot", "RabbitMQ", "FFmpeg"],
        responsibilities: [
          "薄荷直播是一款秀场类的直播产品，包括直播、PK、短视频、回放、答题、任务等玩法功能，涵盖了移动端SDK推流、PC端游戏OBS推流和转推第三方直播等主流直播途径。",
          "参与项目后台服务搭建，技术选型和直播流程设计，针对不同SDK梳理直播流程，对接第三方服务，实现主播芝麻认证、断线重连续播、推拉流切换、直播录制适配、直播链路复用等功能。",
          "基于RabbitMQ的死信队列实现延迟队列，构建机器人服务、红包服务。",
          "参与网易大赢家直播答题项目，在短暂时间内设计并实现了结算算法，并指导了整个直播答题流程，包括推流、发题、结算、发答案，未出现严重的线上问题。",
        ],
        impact: [
          "从 0 到 1 的搭建了直播后台服务，主导了网易大赢家直播答题项目，在 3 天时间内设计结算算法，2 周上线。",
        ],
      },
      {
        project: "去哪儿网无线酒店项目",
        time: "2015.07-2016.04",
        role: "服务端开发",
        company: "去哪儿网",
        tech: ["SpringMVC", "MyBatis", "Dozer"],
        responsibilities: [
          "去哪儿网无线酒店 TTS 系统负责整合各种供应商的业务逻辑，提供统一的接口服务。作为服务端开发，负责 TTS 系统的迭代开发，处理填单、下单、订单详情等操作，完善系统功能。",
          "无线订单中心数据同步优化，修复订单数据丢失问题。参与线上问题排查与系统维护。",
        ],
        impact: [
          "使用低耦合的处理链机制，结合可热发的配置文件，动态控制功能开关，降低了系统的维护成本。",
        ],
      },
    ],
    personalProjects: [
      {
        project: "Flowlet",
        time: "2025.12-2026.01",
        tech: ["Java", "Python", "React Flow"],
        url: "https://flowlet.gogoga.top/",
        highlights: [
          "Flowlet 是一款轻量级的可视化流程编排系统，支持通过拖拽方式设计和执行数据处理流程。",
          "支持 LLM 调用、API 调用、Kafka 异步处理、子流程调用、敏感词匹配、向量化存储等节点能力。",
          "集成调用日志和链路追踪能力，方便查看执行过程和排查问题。",
          "支持 AI Agent 辅助流程编排和 DSL 导入导出，结合版本管理，便捷地定制化内容处理流程。",
        ],
      },
      {
        project: "Web3 个人项目合集",
        time: "2025.09-2025.10",
        tech: ["Solidity", "Hardhat", "OpenZeppelin", "Wagmi"],
        url: "https://gogoga.eth.limo/#/side-projects",
        highlights: [
          "众筹系统：多档位与自定义出资，失败退款与目标达成提现；采用状态机与 CEI，结合 Pausable/Ownable 保障安全，理解资金流与合约风控。",
          "Gogoga Token：基于 ERC20 扩展售卖、铸造与限购，配套 Sale/Airdrop/Faucet 合约；空投使用 Merkle Tree 白名单校验，掌握代币发行与运营实践。",
          "Gogoga NFT：ERC721 预设/自定义双铸造，IPFS 元数据与版税策略；通过批量铸造、URI 管理和暂停机制优化体验，熟悉 NFT 标准与内容管理流程。",
          "投票系统：候选人与投票人注册、时间窗投票与结果统计；提供批量注册与查询接口，理解链上治理流程与可审计性设计；通过自定义 error 降低 gas 费。",
        ],
      },
    ],
    skills: [
      {
        category: "语言",
        items: ["Java", "TypeScript", "Python", "Solidity"],
      },
      {
        category: "后端",
        items: ["Spring Boot", "Redis", "Kafka", "MySQL"],
      },
      {
        category: "前端",
        items: ["React", "Vite", "Tailwind", "Ant Design"],
      },
      {
        category: "Web3",
        items: ["Hardhat", "Wagmi", "IPFS", "Openzeppelin"],
      },
      {
        category: "AI / 机器学习",
        items: ["LLM 微调", "AI Agent", "Langchain", "Dify"],
      },
      {
        category: "工程工具",
        items: ["Git", "Docker", "Codex"],
      },
    ],
    summary: [
      "拥有 11 年经验的资深服务端工程师，具备扎实的软件工程基础，注重代码质量和架构设计，具备一定的全栈开发能力。",
      "自学 Web3 相关知识，熟悉基于 Openzeppelin 的智能合约开发流程，了解基本的去中心化概念，部署了多个开源项目。",
      "在项目中主动承担责任，具备良好的沟通能力和团队合作精神，重视知识分享。善于主动发现业务瓶颈，具备一定的产品思维。",
      "对互联网技术、Web3 技术、AI 有着浓厚的兴趣，保持持续学习的热情，紧跟行业发展趋势，善于从开源项目中学习最佳实践。",
    ],
  },
};

const sectionTitleClass = "text-graytext font-mono uppercase";

export default function Resume() {
  const [searchParams] = useSearchParams();
  const language = searchParams.get("lang") === "zh" ? "zh" : "en";
  const content = resumeContent[language];

  return (
    <Layout variant="resume">
      <div className="mx-auto w-full max-w-[794px] text-xs box-border px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid items-end gap-20 sm:grid-cols-[1fr_auto]">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-semibold leading-tight font-mono">
              {content.name}
            </h1>
            <div className="mt-2 grid gap-y-1 text-graytext sm:grid-cols-2">
              {content.headerInfo.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="min-w-13 text-graytext">{item.label}:</span>
                  <span className="text-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center p-1">
            <img src={avatarImg} width={88} height={88} alt="Profile" />
          </div>
        </div>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>
            {content.sectionTitles.education}
          </h2>
          <div className="mt-2 rounded-sm border border-outline bg-background px-4 py-2.5">
            <div className="divide-y divide-outline">
              {content.education.map((item) => (
                <div
                  key={`${item.school}-${item.degree}-${item.time}`}
                  className="grid gap-1 py-2 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,2.9fr)_minmax(110px,140px)] sm:items-baseline sm:gap-2"
                >
                  <div className="font-medium">{item.school}</div>
                  <div className="text-graytext">
                    <span>{item.degree}</span>
                    <span className="mx-1">·</span>
                    <span>{item.major}</span>
                  </div>
                  <div className="text-graytext font-mono whitespace-nowrap sm:text-right">
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>{content.sectionTitles.work}</h2>
          <div className="mt-2 space-y-1">
            {content.workExperience.map((work) => (
              <div
                key={work.project}
                className="rounded-sm border border-outline px-4 py-2.5 space-y-2"
              >
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(110px,140px)] sm:items-start sm:gap-2">
                  <div className="min-w-0 font-medium">{work.project}</div>
                  <div className="min-w-0 text-graytext">{work.company}</div>
                  <div className="text-graytext font-mono whitespace-nowrap sm:text-right">
                    {work.time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-mono uppercase text-graytext">
                    {content.metaLabels.tech}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {work.tech.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-outline bg-background px-2 py-0.5 text-[10px] font-mono"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="gap-3">
                  <div>
                    <div className="font-mono uppercase text-graytext">
                      {content.metaLabels.responsibilities}:
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {work.responsibilities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="gap-3">
                  <div className="font-mono uppercase text-graytext">
                    {content.metaLabels.impact}:
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {work.impact.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>
            {content.sectionTitles.projects}
          </h2>
          <div className="mt-2 space-y-1">
            {content.personalProjects.map((project) => (
              <div
                key={project.project}
                className="rounded-sm border border-outline px-4 py-2.5 space-y-2"
              >
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(110px,140px)] sm:items-start sm:gap-4">
                  <div className="font-medium">{project.project}</div>
                  <div className="text-graytext sm:justify-self-start">
                    {project.url}
                  </div>
                  <div className="text-graytext font-mono whitespace-nowrap sm:justify-self-end">
                    {project.time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-mono uppercase text-graytext">
                    {content.metaLabels.tech}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.tech.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-outline bg-background px-2 py-0.5 text-[10px] font-mono"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <ul className="list-disc space-y-1 pl-5">
                  {project.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>{content.sectionTitles.skills}</h2>
          <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {content.skills.map((skill) => (
              <div
                key={skill.category}
                className="rounded-sm border border-outline bg-background px-4 py-2.5"
              >
                <div className="font-mono uppercase text-graytext">
                  {skill.category}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {skill.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-outline bg-card-background px-2 py-0.5 text-[10px] font-mono"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>{content.sectionTitles.summary}</h2>
          <div className="mt-2 rounded-sm border border-outline px-4 py-2.5">
            <ul className="list-disc space-y-1 pl-5">
              {content.summary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}
