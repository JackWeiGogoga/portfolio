import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ExecutionStep = {
  sourceLineIndex: number;
  bytecodeLineIndex: number;
  bytecode: string;
};

type ExecutionLabels = {
  sectionTitle: string;
  sourceLabel: string;
  bytecodeLabel: string;
  currentInstruction: string;
  instructionNote: string;
};

type ExecutionDemoProps = {
  sourceLines: string[];
  bytecodeLines: string[];
  sourceLineTooltips: Record<string, string>;
  sourceLineToStep: Map<number, number>;
  bytecodeLineToStep: Map<number, number>;
  currentStep: ExecutionStep;
  currentStepTitle: string;
  getOpcodeFromLine: (line: string) => string | null;
  getBytecodeTooltip: (line: string) => string;
  isStackFloating: boolean;
  controlsContent: ReactNode;
  callStackContent: ReactNode;
  setIsPlaying: (value: boolean) => void;
  setStepIndex: (value: number) => void;
  labels: ExecutionLabels;
};

export default function ExecutionDemo({
  sourceLines,
  bytecodeLines,
  sourceLineTooltips,
  sourceLineToStep,
  bytecodeLineToStep,
  currentStep,
  currentStepTitle,
  getOpcodeFromLine,
  getBytecodeTooltip,
  isStackFloating,
  controlsContent,
  callStackContent,
  setIsPlaying,
  setStepIndex,
  labels,
}: ExecutionDemoProps) {
  const handleJump = (targetStepIndex?: number) => {
    if (targetStepIndex === undefined) {
      return;
    }
    setIsPlaying(false);
    setStepIndex(targetStepIndex);
  };

  return (
    <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
        {labels.sectionTitle}
      </div>
      <div className="p-4 grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.sourceLabel}
            </div>
            <div className="text-xs leading-6 text-text overflow-x-auto font-mono whitespace-pre">
              {sourceLines.map((line, index) => {
                const targetStepIndex = sourceLineToStep.get(index);
                const isClickable = targetStepIndex !== undefined;
                const tooltipText = sourceLineTooltips[String(index)];
                const lineNode = (
                  <div
                    onClick={() => handleJump(targetStepIndex)}
                    className={`px-2 rounded border border-transparent hover:border-gray-300 dark:hover:border-white/15 ${
                      index === currentStep.sourceLineIndex
                        ? "bg-accent text-text"
                        : ""
                    } ${isClickable ? "cursor-pointer" : ""}`}
                  >
                    <span className="inline-block w-6 text-graytext">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {tooltipText ? (
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{line}</span>
                      </TooltipTrigger>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                );

                if (!tooltipText) {
                  return <div key={`${line}-${index}`}>{lineNode}</div>;
                }

                return (
                  <Tooltip key={`${line}-${index}`}>
                    {lineNode}
                    <TooltipContent
                      side="top"
                      align="start"
                      sideOffset={6}
                      className="max-w-xs whitespace-pre-line"
                    >
                      {tooltipText}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.bytecodeLabel}
            </div>
            <div className="text-xs leading-6 text-text overflow-x-auto font-mono whitespace-pre">
              {bytecodeLines.map((line, index) => {
                const opcode = getOpcodeFromLine(line);
                const tooltipText = getBytecodeTooltip(line);
                const targetStepIndex = bytecodeLineToStep.get(index);
                const isClickable = targetStepIndex !== undefined;

                if (!opcode) {
                  return (
                    <div
                      key={`${line}-${index}`}
                      onClick={() => handleJump(targetStepIndex)}
                      className={`px-2 rounded border border-transparent hover:border-gray-300 dark:hover:border-white/15 ${
                        index === currentStep.bytecodeLineIndex
                          ? "bg-accent text-text"
                          : ""
                      } ${isClickable ? "cursor-pointer" : ""}`}
                    >
                      <span className="inline-block w-6 text-graytext">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {line}
                    </div>
                  );
                }

                return (
                  <Tooltip key={`${line}-${index}`}>
                    <div
                      onClick={() => handleJump(targetStepIndex)}
                      className={`px-2 rounded border border-transparent hover:border-gray-300 dark:hover:border-white/15 ${
                        index === currentStep.bytecodeLineIndex
                          ? "bg-accent text-text"
                          : ""
                      } ${isClickable ? "cursor-pointer" : ""}`}
                    >
                      <span className="inline-block w-6 text-graytext">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">{line}</span>
                      </TooltipTrigger>
                    </div>
                    <TooltipContent
                      side="top"
                      align="start"
                      sideOffset={6}
                      className="max-w-xs whitespace-pre-line"
                    >
                      {tooltipText}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {!isStackFloating ? controlsContent : null}

        {!isStackFloating ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-sm">
            <div className="text-xs font-mono text-graytext">
              {labels.currentInstruction}
            </div>
            <div className="mt-1 font-mono text-sm">{currentStep.bytecode}</div>
            <div className="mt-1 text-xs text-graytext">
              {currentStepTitle}
            </div>
          </div>
        ) : null}

        {!isStackFloating ? callStackContent : null}

        <div className="text-xs text-graytext">{labels.instructionNote}</div>
      </div>
    </section>
  );
}
