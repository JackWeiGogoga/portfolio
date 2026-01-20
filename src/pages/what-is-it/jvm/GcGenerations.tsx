import type { ReactNode } from "react";

type SafepointTab = { id: string; label: string };

type GcGenerationsLabels = {
  whyTitle: string;
  triggersTitle: string;
  youngTitle: string;
  oldTitle: string;
  promoteTitle: string;
  stwTitle: string;
  safepointTabs: SafepointTab[];
  safepointTitle: string;
  safepointSummary: string;
  safepointItems: string[];
};

type GcGenerationsProps = {
  labels: GcGenerationsLabels;
  whyItems: string[];
  triggersYoung: string[];
  triggersOld: string[];
  promoteItems: string[];
  activeSafepointTabId: string;
  onSafepointTabChange: (tabId: string) => void;
  stwContent: ReactNode;
};

export default function GcGenerations({
  labels,
  whyItems,
  triggersYoung,
  triggersOld,
  promoteItems,
  activeSafepointTabId,
  onSafepointTabChange,
  stwContent,
}: GcGenerationsProps) {
  return (
    <>
      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.whyTitle}
        </div>
        <ul className="list-disc pl-4 text-xs text-graytext space-y-1">
          {whyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.triggersTitle}
        </div>
        <div className="grid gap-3 lg:grid-cols-2 text-xs text-graytext">
          <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-2 py-2 space-y-2">
            <div className="text-[11px] uppercase text-graytext">
              {labels.youngTitle}
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {triggersYoung.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-2 py-2 space-y-2">
            <div className="text-[11px] uppercase text-graytext">
              {labels.oldTitle}
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {triggersOld.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.promoteTitle}
        </div>
        <ul className="list-disc pl-4 text-xs text-graytext space-y-1">
          {promoteItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.stwTitle}
        </div>
        <div className="flex flex-wrap gap-2">
          {labels.safepointTabs.map((tab) => {
            const isActive = tab.id === activeSafepointTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSafepointTabChange(tab.id)}
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
        {stwContent}
      </section>
    </>
  );
}
