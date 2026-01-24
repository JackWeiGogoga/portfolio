import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getThreadTone } from "./threadTone";

type ControlLabels = {
  play: string;
  pause: string;
  step: string;
  back: string;
  reset: string;
};

type NodeFieldsLabels = {
  waitStatus: string;
  prev: string;
  next: string;
  thread: string;
  nextWaiter: string;
};

export type ReentrantAqsNode = {
  id: string;
  waitStatus: string;
  prev: string;
  next: string;
  thread: string;
  nextWaiter: string;
};

export type ReentrantAqsStep = {
  id: string;
  title: string;
  description: string;
  codeLineIndex: number;
  state: string;
  owner: string;
  headId: string | null;
  tailId: string | null;
  nodes: ReentrantAqsNode[];
};

type ReentrantAqsDemoProps = {
  codeLines: string[];
  codeTooltips: Record<number, string>;
  steps: ReentrantAqsStep[];
  stepIndex: number;
  setStepIndex: (next: (prev: number) => number) => void;
  isPlaying: boolean;
  setIsPlaying: (next: (prev: boolean) => boolean) => void;
  controls: ControlLabels;
  labels: {
    title: string;
    note: string;
    codeTitle: string;
    stateLabel: string;
    ownerLabel: string;
    queueTitle: string;
    nodeFieldsTitle: string;
    stepsTitle: string;
    headTag: string;
    tailTag: string;
    fields: NodeFieldsLabels;
  };
};

export default function ReentrantAqsDemo({
  codeLines,
  codeTooltips,
  steps,
  stepIndex,
  setStepIndex,
  isPlaying,
  setIsPlaying,
  controls,
  labels,
}: ReentrantAqsDemoProps) {
  const step = steps[stepIndex] ?? steps[0];
  const nodeFields = [
    { key: "waitStatus", label: labels.fields.waitStatus },
    { key: "prev", label: labels.fields.prev },
    { key: "next", label: labels.fields.next },
    { key: "thread", label: labels.fields.thread },
    { key: "nextWaiter", label: labels.fields.nextWaiter },
  ] as const;
  const renderThread = (thread: string) => {
    const tone = getThreadTone(thread);
    return (
      <span className={`inline-flex items-center gap-1 ${tone.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
        {thread}
      </span>
    );
  };

  return (
    <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
        {labels.title}
      </div>
      <div className="p-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext">
            {labels.note}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-3 py-2 text-xs">
              <div className="text-[10px] uppercase text-graytext">
                {labels.stateLabel}
              </div>
              <div className="text-sm font-semibold text-text">
                {step.state}
              </div>
            </div>
            <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-3 py-2 text-xs">
              <div className="text-[10px] uppercase text-graytext">
                {labels.ownerLabel}
              </div>
              <div className="text-sm font-semibold text-text">
                {step.owner && step.owner !== "-" ? renderThread(step.owner) : step.owner}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.queueTitle}
            </div>
            <div className="text-[10px] uppercase text-graytext mb-2">
              {labels.nodeFieldsTitle}
            </div>
            <div className="flex flex-wrap items-start gap-2">
              {step.nodes.length ? (
                step.nodes.map((node, index) => {
                  const isHead = step.headId === node.id;
                  const isTail = step.tailId === node.id;
                  const nodeTone =
                    node.thread !== "-" ? getThreadTone(node.thread) : null;
                  return (
                    <div key={`${step.id}-${node.id}`} className="flex items-center gap-2">
                      <motion.div
                        layout
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className={`relative rounded-md border bg-card px-3 py-2 text-xs min-w-44 ${
                          nodeTone?.border ?? "border-gray-300 dark:border-white/15"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] uppercase text-graytext">
                            Node {node.id}
                          </div>
                          <div className="flex gap-1 text-[9px] uppercase text-graytext">
                            {isHead ? <span>{labels.headTag}</span> : null}
                            {isTail ? <span>{labels.tailTag}</span> : null}
                          </div>
                        </div>
                        <div className="mt-2 grid gap-1">
                          {nodeFields.map((field) => (
                            <div
                              key={`${node.id}-${field.key}`}
                              className="flex items-center justify-between"
                            >
                              <span className="text-[10px] text-graytext">
                                {field.label}
                              </span>
                              {field.key === "thread" &&
                              node.thread !== "-" ? (
                                <span className="text-[11px]">
                                  {renderThread(node.thread)}
                                </span>
                              ) : (
                                <span className="text-[11px] text-text">
                                  {node[field.key]}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-[10px] text-graytext">
                          {node.prev !== "-" ? `prev -> ${node.prev}` : "prev -> -"}
                          {"  "}
                          {node.next !== "-" ? `next -> ${node.next}` : "next -> -"}
                        </div>
                      </motion.div>
                      {index < step.nodes.length - 1 ? (
                        <div className="text-xs text-graytext">&lt;-&gt;</div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-graytext">-</div>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs">
            <div className="text-[11px] uppercase text-graytext mb-1">
              {labels.stepsTitle}
            </div>
            <div className="text-text font-medium">{step.title}</div>
            <div className="text-graytext mt-1">{step.description}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
            >
              {isPlaying ? controls.pause : controls.play}
            </button>
            <button
              type="button"
              onClick={() =>
                setStepIndex((prev) =>
                  prev < steps.length - 1 ? prev + 1 : prev
                )
              }
              className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
            >
              {controls.step}
            </button>
            <button
              type="button"
              onClick={() => setStepIndex((prev) => (prev > 0 ? prev - 1 : prev))}
              className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
            >
              {controls.back}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIndex(() => 0);
              }}
              className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
            >
              {controls.reset}
            </button>
            <div className="text-xs text-graytext">
              {stepIndex + 1}/{steps.length}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
          <div className="text-xs font-mono text-graytext mb-2">
            {labels.codeTitle}
          </div>
          <div className="text-xs leading-6 text-text overflow-x-auto font-mono whitespace-pre">
            {codeLines.map((line, index) => {
              const tooltipText = codeTooltips[index];
              const lineNode = (
                <div
                  className={`px-2 rounded border border-transparent ${
                    index === step.codeLineIndex
                      ? "bg-accent text-text"
                      : "hover:border-gray-300 dark:hover:border-white/15"
                  }`}
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
      </div>
    </section>
  );
}
