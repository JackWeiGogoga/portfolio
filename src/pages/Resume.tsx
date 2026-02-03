import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import avatarImg from "@/assets/images/resume/avatar.jpg";

type ResumeHeaderInfo = {
  label: string;
  value: string;
};

type ResumeEducation = {
  school: string;
  major: string;
  degree: string;
  time: string;
};

type ResumeWork = {
  project: string;
  time: string;
  role: string;
  company: string;
  tech: string[];
  responsibilities: string[];
  impact?: string[];
};

type ResumeProject = {
  project: string;
  time: string;
  tech: string[];
  url: string;
  highlights: string[];
};

type ResumeSkill = {
  category: string;
  items: string[];
};

type ResumeContent = {
  name: string;
  headerInfo: ResumeHeaderInfo[];
  sectionTitles: {
    personal: string;
    education: string;
    work: string;
    projects: string;
    skills: string;
    summary: string;
  };
  metaLabels: {
    role: string;
    company: string;
    tech: string;
    responsibilities: string;
    impact: string;
    highlights: string;
    present: string;
  };
  education: ResumeEducation[];
  workExperience: ResumeWork[];
  personalProjects: ResumeProject[];
  skills: ResumeSkill[];
  summary: string[];
};

const sectionTitleClass = "text-graytext font-mono uppercase";
const timelineLineClass = "absolute left-3 top-2 bottom-2 w-px bg-outline";
const timelineDotClass =
  "absolute left-3 top-[5px] h-2 w-2 -translate-x-1/2 rounded-full bg-text";
const timelineTimeClass =
  "text-graytext font-mono whitespace-nowrap text-[10px] tracking-wide";

type ResumeWorkGroup = {
  company: string;
  items: ResumeWork[];
};

const parseMonthKey = (value: string) => {
  const [year, month] = value.split(".");
  const yearNum = Number(year);
  const monthNum = Number(month);
  if (!yearNum || !monthNum) {
    return null;
  }
  return yearNum * 12 + monthNum;
};

const getCompanyTimeRange = (
  items: ResumeWork[],
  company: string,
  presentLabel: string,
) => {
  if (items.length === 0) {
    return "";
  }

  let minStart = items[0].time.split("-")[0];
  let maxEnd = items[0].time.split("-")[1] ?? "";
  let minStartKey = parseMonthKey(minStart);
  let maxEndKey = parseMonthKey(maxEnd);

  items.forEach((item) => {
    const [start, end] = item.time.split("-");
    const startKey = parseMonthKey(start);
    const endKey = parseMonthKey(end);

    if (startKey !== null && (minStartKey === null || startKey < minStartKey)) {
      minStart = start;
      minStartKey = startKey;
    }

    if (endKey !== null && (maxEndKey === null || endKey > maxEndKey)) {
      maxEnd = end;
      maxEndKey = endKey;
    }
  });

  if (!minStart || !maxEnd) {
    return items[0].time;
  }

  const currentCompanies = new Set(["网易", "NetEase"]);
  const endLabel = currentCompanies.has(company) ? presentLabel : maxEnd;

  return `${minStart}-${endLabel}`;
};

export default function Resume() {
  const { t } = useTranslation("resume");
  const content = t("content", { returnObjects: true }) as ResumeContent;
  const companyTitles: Record<string, string> = {
    网易: "技术专家",
    NetEase: "Technical Expert",
    去哪儿网: "Java开发工程师",
    Qunar: "Java Engineer",
  };
  const workGroups = content.workExperience.reduce<ResumeWorkGroup[]>(
    (groups, item) => {
      const group = groups.find((entry) => entry.company === item.company);
      if (group) {
        group.items.push(item);
        return groups;
      }
      return [...groups, { company: item.company, items: [item] }];
    },
    [],
  );

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
          <h2 className={sectionTitleClass}>{content.sectionTitles.skills}</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {content.skills.map((skill) => (
              <li key={skill.category}>
                <span className="font-mono uppercase text-graytext">
                  {skill.category}
                </span>
                <span className="mx-2 text-graytext">:</span>
                <span className="text-text">{skill.items.join(" · ")}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>
            {content.sectionTitles.projects}
          </h2>
          <div className="mt-3 relative space-y-4">
            <div className={timelineLineClass} />
            {content.personalProjects.map((project) => (
              <div key={project.project} className="relative">
                <span className={timelineDotClass} />
                <div className="grid gap-2 pl-6 sm:grid-cols-1 sm:items-start">
                  <div className="min-w-0 space-y-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-medium">{project.project}</span>
                        <span className={timelineTimeClass}>
                          {project.time}
                          {project.url ? (
                            <span className="text-graytext">
                              {" "}
                              · {project.url}
                            </span>
                          ) : null}
                        </span>
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
                    <div className="font-mono uppercase text-graytext">
                      {content.metaLabels.highlights}:
                    </div>
                    <ul className="list-disc space-y-1 pl-5">
                      {project.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>{content.sectionTitles.work}</h2>
          <div className="mt-3 space-y-6">
            {workGroups.map((group) => (
              <div key={group.company} className="space-y-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm font-semibold">
                    {group.company}
                    {companyTitles[group.company] ? (
                      <span className="text-graytext">
                        {" "}
                        · {companyTitles[group.company]}
                      </span>
                    ) : null}
                  </span>
                  <span className={timelineTimeClass}>
                    {getCompanyTimeRange(
                      group.items,
                      group.company,
                      content.metaLabels.present,
                    )}
                  </span>
                </div>
                <div className="relative space-y-4">
                  <div className={timelineLineClass} />
                  {group.items.map((work) => (
                    <div
                      key={`${work.project}-${work.time}`}
                      className="relative"
                    >
                      <span className={timelineDotClass} />
                      <div className="grid gap-2 pl-6 sm:grid-cols-1 sm:items-start">
                        <div className="min-w-0 space-y-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span className="font-medium">
                                {work.project}
                                {work.role ? (
                                  <span className="text-graytext">
                                    {" "}
                                    ({work.role})
                                  </span>
                                ) : null}
                              </span>
                              <span className={timelineTimeClass}>
                                {work.time}
                              </span>
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
                          {work.impact && work.impact.length > 0 ? (
                            <div className="gap-3">
                              <div className="font-mono uppercase text-graytext">
                                {content.metaLabels.impact}:
                              </div>
                              <ul className="mt-2 list-disc space-y-1 pl-5 font-semibold">
                                {work.impact.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>
            {content.sectionTitles.education}
          </h2>
          <div className="mt-3 relative space-y-4">
            <div className={timelineLineClass} />
            {content.education.map((item) => (
              <div
                key={`${item.school}-${item.degree}-${item.time}`}
                className="relative"
              >
                <span className={timelineDotClass} />
                <div className="grid gap-2 pl-6 sm:grid-cols-1 sm:items-baseline">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-medium">{item.school}</span>
                      <span className={timelineTimeClass}>{item.time}</span>
                    </div>
                    <div className="text-graytext">
                      <span>{item.degree}</span>
                      <span className="mx-1">·</span>
                      <span>{item.major}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <h2 className={sectionTitleClass}>{content.sectionTitles.summary}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {content.summary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
