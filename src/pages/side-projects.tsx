import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import Layout from "@/components/Layout";
import {
  ProjectCard,
  ProjectCardContent,
} from "@/components/ui/project-card";
import { SIDE_PROJECTS } from "@/config/sideProjects";

export default function SideProjectsPage() {
  return (
    <Layout variant="portfolio">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Side Projects</h1>
          <p className="text-sm text-graytext mt-2">
            A collection of experiments and web3 prototypes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SIDE_PROJECTS.map((project) => (
            <Link
              key={project.title}
              to={project.link}
              className="no-underline"
            >
              <ProjectCard hover className="h-full">
                <ProjectCardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-medium leading-snug">
                      {project.title}
                    </div>
                    <GoArrowUpRight className="text-graytext mt-1" />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="bg-accent rounded px-1">
                      {project.type}
                    </div>
                    {project.tags.map((tag) => (
                      <div
                        key={tag.name}
                        className="flex items-center gap-1 bg-muted rounded px-1"
                      >
                        {tag.icon}
                        {tag.name}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-graytext">
                    {project.description}
                  </p>
                  <div className="text-xs text-graytext font-mono">
                    {project.date}
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
