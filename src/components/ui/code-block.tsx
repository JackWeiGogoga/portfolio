import { useEffect, useState } from "react";
import { Highlight, Language, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language: Language;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      setIsDark(root.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Highlight
      code={code.trimEnd()}
      language={language}
      theme={isDark ? themes.vsDark : themes.github}
    >
      {({
        className: prismClassName,
        style,
        tokens,
        getLineProps,
        getTokenProps,
      }) => (
        <pre
          className={cn(
            "rounded-lg border px-4 py-3 text-xs leading-relaxed overflow-x-auto",
            "bg-slate-50 border-slate-200 text-slate-900",
            "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
            prismClassName,
            className
          )}
          style={style}
        >
          {tokens.map((line, index) => (
            <div key={index} {...getLineProps({ line })}>
              {line.map((token, tokenIndex) => (
                <span key={tokenIndex} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
