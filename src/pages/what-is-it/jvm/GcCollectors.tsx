type CollectorItem = {
  id: string;
  name: string;
  generations: string;
  algorithms: string;
  command?: string;
  focus: string;
  pros: string[];
  cons: string[];
  notes?: string[];
};

type GcCollectorsData = {
  title: string;
  subtitle?: string;
  labels?: {
    generations: string;
    algorithms: string;
    pros: string;
    cons: string;
    focus: string;
    command?: string;
  };
  items: CollectorItem[];
};

type GcCollectorsProps = {
  data: GcCollectorsData;
};

export default function GcCollectors({ data }: GcCollectorsProps) {
  return (
    <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
      <div className="text-xs font-mono text-graytext mb-2">{data.title}</div>
      {data.subtitle ? (
        <div className="text-[11px] text-graytext mb-3">{data.subtitle}</div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {data.items.map((collector) => (
          <div
            key={collector.id}
            className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-3 py-3 text-xs text-graytext space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-text">
                {collector.name}
              </div>
              <div className="rounded-full border border-gray-300 dark:border-white/15 px-2 py-0.5 text-[10px] uppercase text-graytext">
                {collector.focus}
              </div>
            </div>
            <div className="grid gap-1 text-[11px]">
              <div>
                <span className="font-medium text-text">
                  {data.labels?.generations ?? "Generations"}:{" "}
                </span>
                {collector.generations}
              </div>
              <div>
                <span className="font-medium text-text">
                  {data.labels?.algorithms ?? "Algorithms"}:{" "}
                </span>
                {collector.algorithms}
              </div>
              {collector.command ? (
                <div>
                  <span className="font-medium text-text">
                    {data.labels?.command ?? "Command"}:{" "}
                  </span>
                  <span className="font-mono text-[10px] text-text">
                    {collector.command}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <div className="text-[10px] uppercase text-graytext">
                  {data.labels?.pros ?? "Pros"}
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {collector.pros.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase text-graytext">
                  {data.labels?.cons ?? "Cons"}
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {collector.cons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {collector.notes?.length ? (
              <div className="text-[11px] text-graytext">
                {collector.notes.join(" ")}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
