import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type {
  DelegationDemoLoader,
  DelegationDemoScenario,
  DelegationDemoStep,
} from "@/pages/what-is-it/jvm/types";

type DelegationDemoData = {
  title: string;
  description: string;
  loaders: DelegationDemoLoader[];
  scenarios: DelegationDemoScenario[];
};

type DelegationDemoLabels = {
  overviewTitle: string;
  flowTitle: string;
  stepTitle: string;
  empty: string;
  loaded: string;
  loadedBy: string;
  controls: {
    play: string;
    pause: string;
    step: string;
    back: string;
    reset: string;
  };
};

type DelegationDemoProps = {
  data: DelegationDemoData;
  overviewItems: string[];
  labels: DelegationDemoLabels;
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  activeScenario?: DelegationDemoScenario;
  loadedById: string;
  hasResolvedLoad: boolean;
  currentDemoStep?: DelegationDemoStep;
  demoSteps: DelegationDemoStep[];
  demoStepIndex: number;
  isDemoPlaying: boolean;
  setIsDemoPlaying: (next: (prev: boolean) => boolean) => void;
  setDemoStepIndex: (next: (prev: number) => number) => void;
  activeConnectorIndex: number;
  visitedConnectors: { up: Set<number>; down: Set<number> };
};

export default function DelegationDemo({
  data,
  overviewItems,
  labels,
  activeScenarioId,
  onScenarioChange,
  activeScenario,
  loadedById,
  hasResolvedLoad,
  currentDemoStep,
  demoSteps,
  demoStepIndex,
  isDemoPlaying,
  setIsDemoPlaying,
  setDemoStepIndex,
  activeConnectorIndex,
  visitedConnectors,
}: DelegationDemoProps) {
  return (
    <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
        {data.title}
      </div>
      <div className="p-4 space-y-4">
        <div className="text-xs text-graytext">{data.description}</div>
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-2">
          <div className="text-xs font-mono text-graytext">
            {labels.overviewTitle}
          </div>
          <ul className="list-disc pl-4 space-y-1">
            {overviewItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenarioId;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onScenarioChange(scenario.id)}
                className={`rounded-md border px-3 py-1 text-xs ${
                  isActive
                    ? "border-gray-500 bg-accent text-text"
                    : "border-gray-300 dark:border-white/20 hover:bg-muted text-graytext"
                }`}
              >
                {scenario.label}
              </button>
            );
          })}
        </div>

        {activeScenario ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-text">
                {activeScenario.className}
              </div>
              {loadedById && hasResolvedLoad ? (
                <div className="rounded-full border border-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase text-emerald-600">
                  {labels.loadedBy} {data.loaders.find((loader) => loader.id === loadedById)?.title}
                </div>
              ) : null}
            </div>
            <div className="mt-1">{activeScenario.desc}</div>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
            <div className="text-xs font-mono text-graytext mb-3">
              {labels.flowTitle}
            </div>
            <div className="space-y-2">
              {data.loaders.map((loader, index) => {
                const isActive = loader.id === currentDemoStep?.loaderId;
                const isVisited =
                  demoSteps
                    .slice(0, demoStepIndex + 1)
                    .some((step) => step.loaderId === loader.id) ?? false;
                const isLoadedBy = hasResolvedLoad && loader.id === loadedById;
                const showConnector = index < data.loaders.length - 1;
                const isConnectorActive =
                  activeConnectorIndex === index &&
                  currentDemoStep?.direction !== "load";
                const isUpVisited = visitedConnectors.up.has(index);
                const isDownVisited = visitedConnectors.down.has(index);
                const isUpActive =
                  isConnectorActive && currentDemoStep?.direction === "up";
                const isDownActive =
                  isConnectorActive && currentDemoStep?.direction === "down";
                return (
                  <div key={loader.id}>
                    <div
                      className={`rounded-md border px-3 py-2 text-xs transition ${
                        isActive
                          ? "border-gray-500 bg-accent text-text"
                          : isLoadedBy
                            ? "border-emerald-500/80 bg-emerald-500/10 text-text"
                            : isVisited
                              ? "border-gray-400 bg-muted text-text"
                              : "border-gray-300 dark:border-white/12 bg-background text-graytext"
                      }`}
                    >
                      <div className="text-sm font-medium">{loader.title}</div>
                      <div className="mt-1 text-[11px]">{loader.desc}</div>
                      {isLoadedBy ? (
                        <div className="mt-2 inline-flex rounded-full border border-emerald-500/60 px-2 py-0.5 text-[10px] uppercase text-emerald-600">
                          {labels.loaded}
                        </div>
                      ) : null}
                    </div>
                    {showConnector ? (
                      <div className="flex items-center justify-center py-2 gap-1">
                        <ArrowUp
                          className={`h-3 w-3 ${
                            isUpVisited || isUpActive
                              ? "text-gray-500"
                              : "text-gray-300 dark:text-white/20"
                          }`}
                        />
                        <ArrowDown
                          className={`h-3 w-3 ${
                            isDownVisited || isDownActive
                              ? "text-gray-500"
                              : "text-gray-300 dark:text-white/20"
                          }`}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-graytext">
                  {labels.stepTitle}
                </div>
                <div className="text-xs text-graytext">
                  {demoSteps.length ? demoStepIndex + 1 : 0}/{demoSteps.length}
                </div>
              </div>
              {currentDemoStep ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text">
                    {currentDemoStep.direction === "up" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : currentDemoStep.direction === "down" ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    <span>{currentDemoStep.action}</span>
                  </div>
                  <div>{currentDemoStep.result}</div>
                </div>
              ) : (
                <div>{labels.empty}</div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDemoPlaying((prev) => !prev)}
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {isDemoPlaying ? labels.controls.pause : labels.controls.play}
              </button>
              <button
                type="button"
                onClick={() =>
                  setDemoStepIndex((prev) =>
                    prev < demoSteps.length - 1 ? prev + 1 : prev
                  )
                }
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {labels.controls.step}
              </button>
              <button
                type="button"
                onClick={() =>
                  setDemoStepIndex((prev) => (prev > 0 ? prev - 1 : prev))
                }
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {labels.controls.back}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDemoPlaying(() => false);
                  setDemoStepIndex(() => 0);
                }}
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {labels.controls.reset}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
