import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import Layout from "@/components/Layout";
import {
  ProjectCard,
  ProjectCardContent,
} from "@/components/ui/project-card";
import { WHAT_IS_IT_LESSONS } from "@/config/whatIsIt";

export default function WhatIsItPage() {
  return (
    <Layout variant="portfolio">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">What is it</h1>
          <p className="text-sm text-graytext mt-2">
            教学页面合集，用前端网页把一个知识点讲清楚。
          </p>
        </div>

        <div className="grid gap-4">
          {WHAT_IS_IT_LESSONS.map((lesson) => (
            <Link key={lesson.title} to={lesson.link} className="no-underline">
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
                    Updated {lesson.updated}
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
