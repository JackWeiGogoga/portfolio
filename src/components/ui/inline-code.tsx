import React from "react";
import { cn } from "@/lib/utils";

interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        "rounded-md border border-outline bg-card-background px-1.5 py-0.5",
        "font-mono text-[0.85em] text-[#e3116c] dark:text-[#ce9178]",
        className
      )}
    >
      {children}
    </code>
  );
}
