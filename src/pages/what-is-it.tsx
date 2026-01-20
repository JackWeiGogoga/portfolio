import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import {
  ProjectCard,
  ProjectCardContent,
} from "@/components/ui/project-card";
import { ROUTES } from "@/config/constants";

type WhatIsItLesson = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  level: string;
  duration: string;
  updated: string;
};

export default function WhatIsItPage() {
  const { t } = useTranslation("whatIsIt");
  const lessons = t("lessons", { returnObjects: true }) as WhatIsItLesson[];
  const lessonRoutes: Record<string, string> = {
    jvm: ROUTES.WHAT_IS_IT_JVM,
    "java-locks": ROUTES.WHAT_IS_IT_JAVA_LOCKS,
  };

  return (
    <Layout variant="portfolio">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-graytext mt-2">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={lessonRoutes[lesson.id] ?? ROUTES.WHAT_IS_IT_JVM}
              className="no-underline"
            >
              <ProjectCard hover className="h-full">
                <ProjectCardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-medium leading-snug">
                      {lesson.title}
                    </div>
                    <GoArrowUpRight className="text-graytext mt-1" />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="bg-accent rounded px-1">
                      {lesson.level}
                    </div>
                    <div className="bg-muted rounded px-1">
                      {lesson.duration}
                    </div>
                    {lesson.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 bg-card-background rounded px-1"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-graytext">
                    {lesson.description}
                  </p>
                  <div className="text-xs text-graytext font-mono">
                    {t("lessonMeta.updated")} {lesson.updated}
                  </div>
                </ProjectCardContent>
              </ProjectCard>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
