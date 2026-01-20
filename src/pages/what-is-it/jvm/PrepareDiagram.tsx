type PrepareDiagramLabels = {
  title: string;
  jdk6Title: string;
  jdk8Title: string;
  jvmMemory: string;
  methodArea: string;
  metadata: string;
  runtimeData: string;
  heap: string;
  classObjects: string;
  nativeMemory: string;
  metaspace: string;
  note: string;
};

type PrepareDiagramProps = {
  labels: PrepareDiagramLabels;
};

export default function PrepareDiagram({ labels }: PrepareDiagramProps) {
  return (
    <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
        {labels.title}
      </div>
      <div className="p-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
          <div className="text-xs font-mono text-graytext mb-2">
            {labels.jdk6Title}
          </div>
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-card/80 p-3 space-y-3 text-xs text-graytext">
            <div className="text-[10px] uppercase tracking-wide text-graytext">
              {labels.jvmMemory}
            </div>
            <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-1">
              <div className="font-medium text-text">{labels.methodArea}</div>
              <div className="text-[11px]">{labels.metadata}</div>
              <div className="text-[11px]">{labels.runtimeData}</div>
            </div>
            <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext">
              <div className="font-medium text-text">{labels.heap}</div>
              <div className="text-[11px]">{labels.classObjects}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
          <div className="text-xs font-mono text-graytext mb-2">
            {labels.jdk8Title}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-card/80 p-3 space-y-2 text-xs text-graytext">
              <div className="text-[10px] uppercase tracking-wide text-graytext">
                {labels.jvmMemory}
              </div>
              <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext">
                <div className="font-medium text-text">{labels.heap}</div>
                <div className="text-[11px]">{labels.classObjects}</div>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-card/80 p-3 space-y-2 text-xs text-graytext">
              <div className="text-[10px] uppercase tracking-wide text-graytext">
                {labels.nativeMemory}
              </div>
              <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-1">
                <div className="font-medium text-text">{labels.metaspace}</div>
                <div className="text-[11px]">{labels.metadata}</div>
                <div className="text-[11px]">{labels.runtimeData}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 text-xs text-graytext">{labels.note}</div>
      </div>
    </section>
  );
}
