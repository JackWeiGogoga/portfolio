import React from "react";
import { cn } from "@/lib/utils";

interface QuoteProps {
  children: React.ReactNode;
  author?: string;
  className?: string;
}

export function Quote({ children, author, className }: QuoteProps) {
  return (
    <figure
      className={cn(
        "rounded-lg bg-card-background px-5 py-4 font-mono",
        className
      )}
    >
      <blockquote className="text-xs text-text leading-relaxed">
        {children}
      </blockquote>
      {author ? (
        <figcaption className="mt-3 text-sm text-graytext">
          - {author}
        </figcaption>
      ) : null}
    </figure>
  );
}
