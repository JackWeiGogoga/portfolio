import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// 定义共享的项目卡片样式
const PROJECT_CARD_STYLES = "border-gray-300 dark:border-white/12";

const PROJECT_CARD_HOVER_STYLES =
  "transition-colors hover:border-gray-500 dark:hover:border-white/30";

// ProjectCard - 带有项目主题样式的 Card
const ProjectCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Card> & {
    hover?: boolean;
  }
>(({ className, hover = false, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      PROJECT_CARD_STYLES,
      hover && PROJECT_CARD_HOVER_STYLES,
      className
    )}
    {...props}
  />
));
ProjectCard.displayName = "ProjectCard";

// ProjectCardHeader - 复用原始 CardHeader
const ProjectCardHeader = CardHeader;

// ProjectCardTitle - 复用原始 CardTitle
const ProjectCardTitle = CardTitle;

// ProjectCardContent - 复用原始 CardContent
const ProjectCardContent = CardContent;

export {
  ProjectCard,
  ProjectCardHeader,
  ProjectCardTitle,
  ProjectCardContent,
  PROJECT_CARD_STYLES,
};
