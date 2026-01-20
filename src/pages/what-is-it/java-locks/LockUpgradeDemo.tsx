import { motion } from "motion/react";

export type LockUpgradeStep = {
  id: string;
  title: string;
  description: string;
  arrivingThread: string | null;
  contenders: string[];
  ownerThread: string | null;
  lockBits: string;
  biased: string;
  hash: string;
  age: string;
  threadId: string;
  ptr: string;
};

type ControlLabels = {
  play: string;
  pause: string;
  step: string;
  back: string;
  reset: string;
};

type DiagramLabels = {
  markWordTitle: string;
  fieldsTitle: string;
  lockBits: string;
  biased: string;
  hash: string;
  age: string;
  threadId: string;
  ptr: string;
  stepsTitle: string;
  arrivingTitle: string;
  ownerTitle: string;
  ownerEmpty: string;
  waitingTitle: string;
  waitingEmpty: string;
  flowTitle: string;
  flowNote: string;
};

type LockUpgradeDemoProps = {
  steps: LockUpgradeStep[];
  stepIndex: number;
  setStepIndex: (next: (prev: number) => number) => void;
  isPlaying: boolean;
  setIsPlaying: (next: (prev: boolean) => boolean) => void;
  controls: ControlLabels;
  labels: DiagramLabels;
};

export default function LockUpgradeDemo({
  steps,
  stepIndex,
  setStepIndex,
  isPlaying,
  setIsPlaying,
  controls,
  labels,
}: LockUpgradeDemoProps) {
  const step = steps[stepIndex] ?? steps[0];
  const fields = [
    { label: labels.lockBits, value: step.lockBits, tone: "bg-accent" },
    { label: labels.biased, value: step.biased, tone: "bg-card-background" },
    { label: labels.hash, value: step.hash, tone: "bg-card" },
    { label: labels.age, value: step.age, tone: "bg-card/80" },
    { label: labels.threadId, value: step.threadId, tone: "bg-muted" },
    { label: labels.ptr, value: step.ptr, tone: "bg-ring/20" },
  ];

  return (
    <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
        {labels.markWordTitle}
      </div>
      <div className="p-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.flowTitle}
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card/80 px-3 py-2">
                <div className="text-[10px] uppercase text-graytext">
                  {labels.ownerTitle}
                </div>
                <div className="min-h-8 flex items-center gap-2">
                  {step.ownerThread ? (
                    <motion.div
                      key={`owner-${step.ownerThread}`}
                      layout
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="rounded-md border border-gray-300 dark:border-white/15 bg-accent px-2 py-1 text-xs font-mono text-text"
                    >
                      {step.ownerThread}
                    </motion.div>
                  ) : (
                    <div className="text-xs text-graytext">
                      {labels.ownerEmpty}
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card/80 px-3 py-2">
                <div className="text-[10px] uppercase text-graytext">
                  {labels.arrivingTitle}
                </div>
                <div className="min-h-8 flex items-center gap-2">
                  {step.arrivingThread ? (
                    <motion.div
                      key={`arrive-${step.arrivingThread}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-2 py-1 text-xs font-mono text-text"
                    >
                      {step.arrivingThread}
                    </motion.div>
                  ) : (
                    <div className="text-xs text-graytext">-</div>
                  )}
                </div>
              </div>
              <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card/80 px-3 py-2">
                <div className="text-[10px] uppercase text-graytext">
                  {labels.waitingTitle}
                </div>
                <div className="min-h-8 flex flex-wrap items-center gap-2">
                  {step.contenders.length ? (
                    step.contenders.map((thread) => (
                      <motion.div
                        key={`wait-${thread}`}
                        layout
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="rounded-md border border-gray-300 dark:border-white/15 bg-muted px-2 py-1 text-xs font-mono text-text"
                      >
                        {thread}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-xs text-graytext">
                      {labels.waitingEmpty}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-graytext">
              {labels.flowNote}
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-2">
              {labels.fieldsTitle}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((field) => (
                <motion.div
                  key={`${step.id}-${field.label}`}
                  layout
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={`rounded-md border border-gray-300 dark:border-white/15 px-3 py-2 text-xs ${field.tone}`}
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
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext">
            <div className="text-[11px] uppercase text-graytext mb-2">
              {step.title}
            </div>
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
                setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
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
      </div>
    </section>
  );
}
