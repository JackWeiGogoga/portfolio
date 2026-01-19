import { ROUTES } from "@/config/constants";

export type WhatIsItLesson = {
  title: string;
  description: string;
  tags: string[];
  level: string;
  duration: string;
  link: string;
  updated: string;
};

export const WHAT_IS_IT_LESSONS: WhatIsItLesson[] = [
  {
    title: "JVM 运行时世界",
    description:
      "用图形化方式理解 JVM 组成、运行时数据区与执行引擎的职责分工。",
    tags: ["Java", "JVM", "Runtime"],
    level: "入门",
    duration: "8-12 min",
    link: ROUTES.WHAT_IS_IT_JVM,
    updated: "2026.02",
  },
];
