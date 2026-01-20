import { motion } from "motion/react";

type GcAlgorithmsData = {
  title: string;
  tabs: { id: string; label: string }[];
  youngTitle: string;
  oldTitle: string;
  steps: Record<string, string[]>;
  note: string;
};

type ControlLabels = {
  play: string;
  pause: string;
  step: string;
  back: string;
  reset: string;
  stepsTitle: string;
};

type GcAlgorithmsDemoProps = {
  gcAlgorithms: GcAlgorithmsData;
  activeGcAlgoId: string;
  setActiveGcAlgoId: (id: string) => void;
  gcAlgoStepIndex: number;
  setGcAlgoStepIndex: (next: (prev: number) => number) => void;
  isGcAlgoPlaying: boolean;
  setIsGcAlgoPlaying: (next: (prev: boolean) => boolean) => void;
  controls: ControlLabels;
};

const gcPalette = {
  idle: "bg-muted",
  live: "bg-accent",
  garbage: "bg-ring",
  moved: "bg-accent",
};

const copyObjects = [
  { id: "e1", from: { col: 1, row: 1 }, live: true, toIndex: 0 },
  { id: "e2", from: { col: 3, row: 1 }, live: true, toIndex: 1 },
  { id: "e3", from: { col: 7, row: 1 }, live: true, toIndex: 2 },
  { id: "e4", from: { col: 4, row: 2 }, live: true, toIndex: 3 },
  { id: "e5", from: { col: 6, row: 2 }, live: true, toIndex: 4 },
  { id: "e6", from: { col: 1, row: 4 }, live: true, toIndex: 5 },
  { id: "e7", from: { col: 5, row: 1 }, live: false },
  { id: "e8", from: { col: 2, row: 2 }, live: false },
  { id: "e9", from: { col: 8, row: 2 }, live: false },
  { id: "e10", from: { col: 3, row: 4 }, live: false },
  { id: "e11", from: { col: 6, row: 4 }, live: false },
  { id: "e12", from: { col: 8, row: 5 }, live: false },
  { id: "s1", from: { col: 9, row: 1 }, live: true, toIndex: 6 },
  { id: "s2", from: { col: 10, row: 2 }, live: true, toIndex: 7 },
  { id: "s3", from: { col: 9, row: 3 }, live: true, toIndex: 8 },
  { id: "s4", from: { col: 10, row: 4 }, live: true, toIndex: 9 },
  { id: "s5", from: { col: 10, row: 1 }, live: false },
  { id: "s6", from: { col: 9, row: 5 }, live: false },
];

const oldObjects = [
  { id: "o1", from: { col: 1, row: 1 }, live: false },
  { id: "o2", from: { col: 2, row: 1 }, live: true, toIndex: 0 },
  { id: "o3", from: { col: 4, row: 1 }, live: false },
  { id: "o4", from: { col: 6, row: 1 }, live: true, toIndex: 1 },
  { id: "o5", from: { col: 8, row: 1 }, live: false },
  { id: "o6", from: { col: 10, row: 1 }, live: true, toIndex: 2 },
  { id: "o7", from: { col: 12, row: 1 }, live: false },
  { id: "o8", from: { col: 3, row: 2 }, live: true, toIndex: 3 },
  { id: "o9", from: { col: 5, row: 2 }, live: false },
  { id: "o10", from: { col: 7, row: 2 }, live: true, toIndex: 4 },
  { id: "o11", from: { col: 9, row: 2 }, live: false },
  { id: "o12", from: { col: 11, row: 2 }, live: true, toIndex: 5 },
  { id: "o13", from: { col: 1, row: 3 }, live: true, toIndex: 6 },
  { id: "o14", from: { col: 4, row: 3 }, live: false },
  { id: "o15", from: { col: 6, row: 3 }, live: true, toIndex: 7 },
  { id: "o16", from: { col: 8, row: 3 }, live: false },
  { id: "o17", from: { col: 10, row: 3 }, live: true, toIndex: 8 },
  { id: "o18", from: { col: 2, row: 4 }, live: false },
  { id: "o19", from: { col: 5, row: 4 }, live: true, toIndex: 9 },
  { id: "o20", from: { col: 7, row: 4 }, live: false },
  { id: "o21", from: { col: 9, row: 4 }, live: true, toIndex: 10 },
  { id: "o22", from: { col: 11, row: 4 }, live: false },
  { id: "o23", from: { col: 3, row: 5 }, live: true, toIndex: 11 },
  { id: "o24", from: { col: 6, row: 5 }, live: false },
];

export default function GcAlgorithmsDemo({
  gcAlgorithms,
  activeGcAlgoId,
  setActiveGcAlgoId,
  gcAlgoStepIndex,
  setGcAlgoStepIndex,
  isGcAlgoPlaying,
  setIsGcAlgoPlaying,
  controls,
}: GcAlgorithmsDemoProps) {
  const isCopyAlgo = activeGcAlgoId === "copy";
  const isMarkSweepAlgo = activeGcAlgoId === "mark-sweep";
  const copyFromIsS0 = gcAlgoStepIndex < 3;
  const copyShowMarked = gcAlgoStepIndex >= 1;
  const copyShowCopy = gcAlgoStepIndex >= 2;
  const copyCleared = gcAlgoStepIndex >= 3;
  const markCompactMarked = gcAlgoStepIndex >= 1;
  const markCompactCompacted = gcAlgoStepIndex >= 2;
  const markSweepMarked = gcAlgoStepIndex >= 1;
  const markSweepSwept = gcAlgoStepIndex >= 2;

  return (
    <>
      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {gcAlgorithms.title}
        </div>
        <div className="flex flex-wrap gap-2">
          {gcAlgorithms.tabs.map((tab) => {
            const isActive = tab.id === activeGcAlgoId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setIsGcAlgoPlaying(() => false);
                  setGcAlgoStepIndex(() => 0);
                  setActiveGcAlgoId(tab.id);
                }}
                className={`rounded-md border px-2 py-1 text-[11px] ${
                  isActive
                    ? "border-gray-500 bg-accent text-text"
                    : "border-gray-300 dark:border-white/20 hover:bg-muted text-graytext"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card p-2">
            {isCopyAlgo ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-graytext">
                  <span>{gcAlgorithms.youngTitle}</span>
                  <span>8:1:1</span>
                </div>
                <div className="relative rounded-md border border-gray-300 dark:border-white/15 bg-background p-3">
                  <div className="grid grid-cols-12 grid-rows-5 gap-1 h-36">
                    <div className="col-span-8 row-span-5 rounded-md border border-gray-300 dark:border-white/15 bg-card relative">
                      <span className="absolute left-2 top-1 text-[10px] text-gray-300">
                        Eden
                      </span>
                    </div>
                    <div className="col-span-2 row-span-5 rounded-md border border-gray-300 dark:border-white/15 bg-card/80 relative">
                      <span className="absolute left-2 top-1 text-[10px] text-gray-300">
                        S0
                      </span>
                      <span
                        className={`absolute left-2 bottom-1 text-[10px] ${
                          copyFromIsS0 ? "text-text" : "text-gray-500"
                        }`}
                      >
                        {copyFromIsS0 ? "From" : "To"}
                      </span>
                    </div>
                    <div className="col-span-2 row-span-5 rounded-md border border-gray-300 dark:border-white/15 bg-card/80 relative">
                      <span className="absolute left-2 top-1 text-[10px] text-gray-300">
                        S1
                      </span>
                      <span
                        className={`absolute left-2 bottom-1 text-[10px] ${
                          copyFromIsS0 ? "text-gray-500" : "text-text"
                        }`}
                      >
                        {copyFromIsS0 ? "To" : "From"}
                      </span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-3 grid grid-cols-12 grid-rows-5 gap-1 h-36">
                    {copyObjects.map((obj) => {
                      const target =
                        obj.live && obj.toIndex !== undefined
                          ? {
                              col: 11 + (obj.toIndex % 2),
                              row: Math.floor(obj.toIndex / 2) + 1,
                            }
                          : obj.from;
                      const position =
                        copyShowCopy && obj.live ? target : obj.from;
                      const fillClass =
                        copyShowCopy && obj.live
                          ? gcPalette.moved
                          : copyShowMarked
                            ? obj.live
                              ? gcPalette.live
                              : gcPalette.garbage
                            : gcPalette.idle;
                      const opacity = copyCleared && !obj.live ? 0 : 1;
                      return (
                        <motion.div
                          key={obj.id}
                          layout
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className={`w-full h-full rounded-[3px] border border-gray-300 dark:border-white/15 ${fillClass}`}
                          style={{
                            gridColumnStart: position.col,
                            gridRowStart: position.row,
                            opacity,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : isMarkSweepAlgo ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-graytext">
                  <span>{gcAlgorithms.oldTitle}</span>
                </div>
                <div className="relative rounded-md border border-gray-300 dark:border-white/15 bg-background p-3">
                  <div className="grid grid-cols-12 grid-rows-5 gap-1 h-36">
                    <div className="col-span-12 row-span-5 rounded-md border border-gray-300 dark:border-white/15 bg-card relative">
                      <span className="absolute left-2 top-1 text-[10px] text-gray-300">
                        {gcAlgorithms.oldTitle}
                      </span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-3 grid grid-cols-12 grid-rows-5 gap-1 h-36">
                    {oldObjects.map((obj) => {
                      const fillClass = markSweepMarked
                        ? obj.live
                          ? gcPalette.live
                          : gcPalette.garbage
                        : gcPalette.idle;
                      const opacity = markSweepSwept && !obj.live ? 0 : 1;
                      return (
                        <motion.div
                          key={obj.id}
                          layout
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className={`w-full h-full rounded-[3px] border border-gray-300 dark:border-white/15 ${fillClass}`}
                          style={{
                            gridColumnStart: obj.from.col,
                            gridRowStart: obj.from.row,
                            opacity,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-graytext">
                  <span>{gcAlgorithms.oldTitle}</span>
                </div>
                <div className="relative rounded-md border border-gray-300 dark:border-white/15 bg-background p-3">
                  <div className="grid grid-cols-12 grid-rows-5 gap-1 h-36">
                    <div className="col-span-12 row-span-5 rounded-md border border-gray-300 dark:border-white/15 bg-card relative">
                      <span className="absolute left-2 top-1 text-[10px] text-gray-300">
                        {gcAlgorithms.oldTitle}
                      </span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-3 grid grid-cols-12 grid-rows-5 gap-1 h-36">
                    {oldObjects.map((obj) => {
                      const target =
                        obj.live && obj.toIndex !== undefined
                          ? {
                              col: (obj.toIndex % 12) + 1,
                              row: Math.floor(obj.toIndex / 12) + 1,
                            }
                          : obj.from;
                      const position =
                        markCompactCompacted && obj.live ? target : obj.from;
                      const fillClass =
                        markCompactCompacted && obj.live
                          ? gcPalette.moved
                          : markCompactMarked
                            ? obj.live
                              ? gcPalette.live
                              : gcPalette.garbage
                            : gcPalette.idle;
                      const opacity =
                        markCompactCompacted && !obj.live ? 0 : 1;
                      return (
                        <motion.div
                          key={obj.id}
                          layout
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className={`w-full h-full rounded-[3px] border border-gray-300 dark:border-white/15 ${fillClass}`}
                          style={{
                            gridColumnStart: position.col,
                            gridRowStart: position.row,
                            opacity,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2 text-xs text-graytext">
            <div className="text-[11px] uppercase text-graytext">
              {controls.stepsTitle}
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {(gcAlgorithms.steps[activeGcAlgoId] ?? []).map((item, index) => (
                <li
                  key={item}
                  className={
                    index === gcAlgoStepIndex ? "text-text" : "text-graytext"
                  }
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGcAlgoPlaying((prev) => !prev)}
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {isGcAlgoPlaying ? controls.pause : controls.play}
              </button>
              <button
                type="button"
                onClick={() =>
                  setGcAlgoStepIndex((prev) =>
                    prev < (gcAlgorithms.steps[activeGcAlgoId]?.length ?? 0) - 1
                      ? prev + 1
                      : prev
                  )
                }
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {controls.step}
              </button>
              <button
                type="button"
                onClick={() =>
                  setGcAlgoStepIndex((prev) => (prev > 0 ? prev - 1 : prev))
                }
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {controls.back}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGcAlgoPlaying(() => false);
                  setGcAlgoStepIndex(() => 0);
                }}
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {controls.reset}
              </button>
            </div>
            <div className="pt-2 text-[11px] text-graytext">
              {gcAlgorithms.note}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
