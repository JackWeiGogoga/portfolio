import { motion } from "motion/react";
import { getThreadTone } from "./threadTone";

export type AqsDemoStep = {
  id: string;
  title: string;
  description: string;
  state: number;
  owner: string | null;
  arrivingThread: string | null;
  queue: string[];
  parked: string[];
  signal?: string | null;
};

type ControlLabels = {
  play: string;
  pause: string;
  step: string;
  back: string;
  reset: string;
};

type DiagramLabels = {
  lockStateTitle: string;
  stateLabel: string;
  ownerLabel: string;
  ownerEmpty: string;
  queueTitle: string;
  queueEmpty: string;
  arrivingTitle: string;
  stepsTitle: string;
  headTag: string;
  tailTag: string;
  parkedTag: string;
  signalTitle: string;
};

type AqsDemoProps = {
  steps: AqsDemoStep[];
  stepIndex: number;
  setStepIndex: (next: (prev: number) => number) => void;
  isPlaying: boolean;
  setIsPlaying: (next: (prev: boolean) => boolean) => void;
  controls: ControlLabels;
  labels: DiagramLabels;
};

export default function AqsDemo({
  steps,
  stepIndex,
  setStepIndex,
  isPlaying,
  setIsPlaying,
  controls,
  labels,
}: AqsDemoProps) {
  const step = steps[stepIndex] ?? steps[0];
  const queueCount = step.queue.length;
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
        {step.title}
      </div>
      <div className="p-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.lockStateTitle}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-3 py-2">
                <div className="text-[10px] uppercase text-graytext">
                  {labels.stateLabel}
                </div>
                <div className="text-sm font-semibold text-text">
                  {step.state}
                </div>
              </div>
              <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-3 py-2">
                <div className="text-[10px] uppercase text-graytext">
                  {labels.ownerLabel}
                </div>
                <div className="text-sm font-semibold text-text">
                  {step.owner ? renderThread(step.owner) : labels.ownerEmpty}
                </div>
              </div>
            </div>
            {step.signal ? (
              <div className="mt-3 rounded-md border border-gray-300 dark:border-white/15 bg-card/80 px-3 py-2 text-xs text-graytext">
                <span className="text-[10px] uppercase text-graytext">
                  {labels.signalTitle}
                </span>
                <div className="text-text mt-1">{step.signal}</div>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.queueTitle}
            </div>
            <div className="min-h-12 flex flex-wrap items-center gap-2">
              {queueCount > 0 ? (
                step.queue.map((thread, index) => {
                  const isHead = index === 0;
                  const isTail = index === queueCount - 1;
                  const isParked = step.parked.includes(thread);
                  const tone = getThreadTone(thread);
                  const nodeClass = isHead
                    ? "bg-accent text-text"
                    : isParked
                      ? "bg-muted text-graytext"
                      : "bg-card-background text-text";
                  return (
                    <motion.div
                      key={thread}
                      layout
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className={`relative rounded-md border px-2 py-1 text-xs font-mono ${nodeClass} ${tone.border}`}
                    >
                      {renderThread(thread)}
                      <div className="absolute -top-2 left-1 flex gap-1 text-[9px] uppercase text-graytext">
                        {isHead ? <span>{labels.headTag}</span> : null}
                        {isTail ? <span>{labels.tailTag}</span> : null}
                      </div>
                      {isParked ? (
                        <div className="absolute -bottom-3 left-1 text-[9px] uppercase text-graytext">
                          {labels.parkedTag}
                        </div>
                      ) : null}
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-xs text-graytext">
                  {labels.queueEmpty}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.arrivingTitle}
            </div>
            <div className="min-h-9 flex items-center gap-2">
              {step.arrivingThread ? (
                <motion.div
                  key={step.arrivingThread}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`rounded-md border bg-card px-3 py-1 text-xs font-mono text-text ${getThreadTone(step.arrivingThread).border}`}
                >
                  {renderThread(step.arrivingThread)}
                </motion.div>
              ) : (
                <div className="text-xs text-graytext">-</div>
              )}
              <div className="text-xs text-graytext">{step.description}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-graytext">
          <div className="text-[11px] uppercase text-graytext">
            {labels.stepsTitle}
          </div>
          <ul className="list-disc pl-4 space-y-2">
            {steps.map((item, index) => (
              <li
                key={item.id}
                className={index === stepIndex ? "text-text" : "text-graytext"}
              >
                <span className="font-medium">{item.title}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2 pt-2">
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
                setIsPlaying(() => false);
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
      </div>
    </section>
  );
}
