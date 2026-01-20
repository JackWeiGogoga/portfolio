import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClassFileInfo } from "@/pages/what-is-it/jvm/types";

type ClassFileVerifyLabels = {
  sectionTitle: string;
  structureTitle: string;
  constantPoolTitle: string;
};

type ClassFileVerifyProps = {
  classFile: ClassFileInfo;
  typeHints: Record<string, string>;
  labels: ClassFileVerifyLabels;
  getClassFileTypeTooltip: (type: string, hints: Record<string, string>) => string;
};

export default function ClassFileVerify({
  classFile,
  typeHints,
  labels,
  getClassFileTypeTooltip,
}: ClassFileVerifyProps) {
  return (
    <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
        {labels.sectionTitle}
      </div>
      <div className="p-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 overflow-x-auto">
          <div className="text-xs font-mono text-graytext mb-2">
            {labels.structureTitle}
          </div>
          <table className="w-full border-collapse text-xs text-graytext">
            <thead>
              <tr className="text-[10px] uppercase">
                {classFile.table.headers.map((head) => (
                  <th
                    key={head}
                    className="px-2 py-1 text-left border-b border-dashed border-gray-300 dark:border-white/10"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classFile.table.rows.map((row) => (
                <tr
                  key={`${row[0]}-${row[1]}`}
                  className="border-b border-dashed border-gray-300 dark:border-white/10"
                >
                  {row.map((cell, cellIndex) => {
                    const tooltip =
                      cellIndex === 2
                        ? getClassFileTypeTooltip(cell, typeHints)
                        : "";
                    const cellNode = (
                      <td
                        key={`${row[0]}-${cellIndex}`}
                        className={`px-2 py-1 ${
                          cellIndex === 1 ? "font-mono text-text" : ""
                        } ${tooltip ? "cursor-help" : ""}`}
                      >
                        {cell}
                      </td>
                    );
                    if (!tooltip) {
                      return cellNode;
                    }
                    return (
                      <Tooltip key={`${row[0]}-${cellIndex}`}>
                        <TooltipTrigger asChild>{cellNode}</TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="start"
                          sideOffset={6}
                          className="max-w-xs whitespace-pre-line"
                        >
                          {tooltip}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-2">
          <div className="text-xs font-mono text-graytext">
            {labels.constantPoolTitle}
          </div>
          <ul className="list-disc pl-4 space-y-1">
            {classFile.constantPool.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
