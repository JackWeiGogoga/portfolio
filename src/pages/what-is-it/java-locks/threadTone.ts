export type ThreadTone = {
  border: string;
  text: string;
  dot: string;
};

const palette: ThreadTone[] = [
  {
    border: "border-emerald-400/60 dark:border-emerald-300/40",
    text: "text-emerald-700 dark:text-emerald-200",
    dot: "bg-emerald-400",
  },
  {
    border: "border-sky-400/60 dark:border-sky-300/40",
    text: "text-sky-700 dark:text-sky-200",
    dot: "bg-sky-400",
  },
  {
    border: "border-amber-400/60 dark:border-amber-300/40",
    text: "text-amber-700 dark:text-amber-200",
    dot: "bg-amber-400",
  },
  {
    border: "border-rose-400/60 dark:border-rose-300/40",
    text: "text-rose-700 dark:text-rose-200",
    dot: "bg-rose-400",
  },
  {
    border: "border-violet-400/60 dark:border-violet-300/40",
    text: "text-violet-700 dark:text-violet-200",
    dot: "bg-violet-400",
  },
  {
    border: "border-lime-400/60 dark:border-lime-300/40",
    text: "text-lime-700 dark:text-lime-200",
    dot: "bg-lime-400",
  },
];

const pickIndex = (thread: string | null) => {
  if (!thread) {
    return 0;
  }
  const match = thread.match(/^([A-Za-z]+)(\d+)?/);
  const prefix = match?.[1]?.toUpperCase() ?? "";
  const num = match?.[2] ? Number(match[2]) : 0;

  if (prefix === "T") {
    return num ? (num - 1) % 3 : 0;
  }
  if (prefix === "R") {
    return 1;
  }
  if (prefix === "W") {
    return 3;
  }

  const hash = thread.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % palette.length;
};

export const getThreadTone = (thread: string | null): ThreadTone =>
  palette[pickIndex(thread)] ?? palette[0];
