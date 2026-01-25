import { motion } from "motion/react";
import { getThreadTone } from "./threadTone";

export type LockImplField = {
  label: string;
  value: string;
};

export type LockImplStep = {
  id: string;
  title: string;
  description: string;
  queue: string[];
  fields: LockImplField[];
};

type ControlLabels = {
  play: string;
  pause: string;
  step: string;
  back: string;
  reset: string;
};

type DemoLabels = {
  queueTitle: string;
  queueEmpty: string;
  fieldsTitle: string;
  stepsTitle: string;
};

type LockImplDemoProps = {
  steps: LockImplStep[];
  stepIndex: number;
  setStepIndex: (next: (prev: number) => number) => void;
  isPlaying: boolean;
  setIsPlaying: (next: (prev: boolean) => boolean) => void;
  controls: ControlLabels;
  labels: DemoLabels;
};

export default function LockImplDemo({
  steps,
  stepIndex,
  setStepIndex,
  isPlaying,
  setIsPlaying,
  controls,
  labels,
}: LockImplDemoProps) {
  const step = steps[stepIndex] ?? steps[0];
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
      <div className="p-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.fieldsTitle}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {step.fields.map((field) => (
                <motion.div
                  key={`${step.id}-${field.label}`}
                  layout
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-3 py-2 text-xs"
                >
                  <div className="text-[10px] uppercase text-graytext">
                    {field.label}
                  </div>
                  <div className="text-sm font-semibold text-text">
                    {field.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.queueTitle}
            </div>
            <div className="min-h-10 flex flex-wrap items-center gap-2">
              {step.queue.length ? (
                step.queue.map((thread) => (
                  <motion.div
                    key={`${step.id}-${thread}`}
                    layout
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`rounded-md border bg-muted px-2 py-1 text-xs font-mono text-text ${getThreadTone(thread).border}`}
                  >
                    {renderThread(thread)}
                  </motion.div>
                ))
              ) : (
                <div className="text-xs text-graytext">
                  {labels.queueEmpty}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext">
            <div className="text-text">{step.description}</div>
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
