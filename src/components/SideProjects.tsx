import { GoArrowRight, GoArrowUpRight } from "react-icons/go";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/config/constants";
import { SIDE_PROJECTS } from "@/config/sideProjects";

const SideProjects: React.FC = () => {
  const { t } = useTranslation("home");
  const items = t("sideProjects.items", { returnObjects: true }) as Array<{
    title: string;
    description: string;
    type: string;
  }>;

  return (
    <div className="my-6">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-sm text-graytext font-mono">
          {t("sideProjects.title")}
        </h5>
        <Link
          to={ROUTES.SIDE_PROJECTS}
          className="text-xs text-graytext font-mono no-underline hover:text-text flex items-center"
        >
          {t("sideProjects.seeAll")}
          <GoArrowRight />
        </Link>
      </div>

      {SIDE_PROJECTS.map((project, index) => {
        const content = items[index];
        const title = content?.title ?? project.title;
        const description = content?.description ?? project.description;
        const type = content?.type ?? project.type;

        return (
          <a
            key={project.title}
            href={`/#${project.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group px-4 py-2 mb-1 -mx-4 hover:bg-card-background hover:rounded-sm relative no-underline"
          >
            <div className="group relative">
              <div className="inline font-medium">{title}</div>
            </div>
            <div className="flex items-center justify-between gap-2 my-1">
              <div className="flex flex-wrap gap-2">
                <div className="text-xs bg-accent rounded px-1">{type}</div>
                {project.tags.map((tag, tagIndex) => (
                  <div
                    key={tagIndex}
                    className="flex items-center gap-1 bg-muted rounded px-1 text-xs"
                  >
                    {tag.icon}
                    {tag.name}
                  </div>
                ))}
              </div>
              {/* <div className="text-graytext text-xs text-right">
                {project.date}
              </div> */}
            </div>

            <p className="text-sm">{description}</p>

            <div className="absolute bottom-4 right-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-graytext">
              <GoArrowUpRight className="inline-block" />
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default SideProjects;
