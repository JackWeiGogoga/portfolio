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
  impact: string[];
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
  };
  education: ResumeEducation[];
  workExperience: ResumeWork[];
  personalProjects: ResumeProject[];
  skills: ResumeSkill[];
  summary: string[];
};

const sectionTitleClass = "text-graytext font-mono uppercase";

export default function Resume() {
  const { t } = useTranslation("resume");
  const content = t("content", { returnObjects: true }) as ResumeContent;

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
