const graphEdges = [
  { from: "R", to: "A" },
  { from: "R", to: "B" },
  { from: "A", to: "C" },
  { from: "A", to: "D" },
  { from: "B", to: "E" },
  { from: "C", to: "F" },
  { from: "E", to: "G" },
] as const;

const graphNodes = [
  { id: "R", x: 20, y: 8 },
  { id: "A", x: 110, y: 48 },
  { id: "B", x: 210, y: 48 },
  { id: "C", x: 70, y: 118 },
  { id: "D", x: 150, y: 118 },
  { id: "E", x: 230, y: 118 },
  { id: "F", x: 50, y: 168 },
  { id: "G", x: 190, y: 168 },
] as const;

const graphPositions: Record<
  (typeof graphNodes)[number]["id"],
  { x: number; y: number }
> = {
  R: { x: 30, y: 20 },
  A: { x: 120, y: 60 },
  B: { x: 220, y: 60 },
  C: { x: 80, y: 130 },
  D: { x: 160, y: 130 },
  E: { x: 240, y: 130 },
  F: { x: 60, y: 180 },
  G: { x: 200, y: 180 },
};

const frameStates = [
  {
    R: "root",
    A: "white",
    B: "white",
    C: "white",
    D: "white",
    E: "white",
    F: "white",
    G: "white",
  },
  {
    R: "root",
    A: "gray",
    B: "gray",
    C: "white",
    D: "white",
    E: "white",
    F: "white",
    G: "white",
  },
  {
    R: "root",
    A: "black",
    B: "gray",
    C: "gray",
    D: "gray",
    E: "white",
    F: "white",
    G: "white",
  },
  {
    R: "root",
    A: "black",
    B: "black",
    C: "black",
    D: "gray",
    E: "gray",
    F: "white",
    G: "white",
  },
  {
    R: "root",
    A: "black",
    B: "black",
    C: "black",
    D: "black",
    E: "black",
    F: "gray",
    G: "gray",
  },
  {
    R: "root",
    A: "black",
    B: "black",
    C: "black",
    D: "black",
    E: "black",
    F: "black",
    G: "black",
  },
] as const;

const nodeFills: Record<
  (typeof frameStates)[number][keyof (typeof frameStates)[number]],
  { fill: string; stroke: string; text: string }
> = {
  root: { fill: "#d1fae5", stroke: "#9ca3af", text: "#111827" },
  gray: { fill: "#fde68a", stroke: "#9ca3af", text: "#111827" },
  black: { fill: "#374151", stroke: "#111827", text: "#f9fafb" },
  white: { fill: "#f3f4f6", stroke: "#9ca3af", text: "#111827" },
};

type ReachabilityLegend = { label: string; color: string };

type ReachabilityLabels = {
  rootsTitle: string;
  tricolorTitle: string;
  cardTableTitle: string;
  writeBarrierTitle: string;
  cardTableOldGen: string;
  cardTableYoungGen: string;
  cardTableNote: string;
};

type ControlLabels = {
  play: string;
  pause: string;
  step: string;
  back: string;
  reset: string;
};

type GcReachabilityProps = {
  roots: string[];
  steps: string[];
  barriers: string[];
  cardTableWhy: string[];
  legend?: ReachabilityLegend[];
  labels: ReachabilityLabels;
  controls: ControlLabels;
  gcMarkStepIndex: number;
  setGcMarkStepIndex: (next: (prev: number) => number) => void;
  isGcMarkPlaying: boolean;
  setIsGcMarkPlaying: (next: (prev: boolean) => boolean) => void;
};

export default function GcReachability({
  roots,
  steps,
  barriers,
  cardTableWhy,
  legend,
  labels,
  controls,
  gcMarkStepIndex,
  setGcMarkStepIndex,
  isGcMarkPlaying,
  setIsGcMarkPlaying,
}: GcReachabilityProps) {
  const stateFrame = frameStates[gcMarkStepIndex % frameStates.length];
  return (
    <>
      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.rootsTitle}
        </div>
        <div className="grid gap-2 sm:grid-cols-3 text-xs text-graytext">
          {roots.map((root) => (
            <div
              key={root}
              className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-2 py-1 text-[11px] text-text"
            >
              {root}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.tricolorTitle}
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card p-2">
            <svg viewBox="0 0 300 200" className="w-full h-56" aria-hidden="true">
              <defs>
                <marker
                  id="arrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="#9ca3af" />
                </marker>
              </defs>
              {graphEdges.map((edge) => {
                const from = graphPositions[edge.from];
                const to = graphPositions[edge.to];
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#9ca3af"
                    strokeWidth="1"
                    markerEnd="url(#arrow)"
                  />
                );
              })}
              {graphNodes.map((node) => {
                const state = stateFrame[node.id];
                const style = nodeFills[state];
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x}
                      y={node.y}
                      rx="6"
                      ry="6"
                      width="32"
                      height="24"
                      fill={style.fill}
                      stroke={style.stroke}
                    />
                    <text
                      x={node.x + 16}
                      y={node.y + 16}
                      textAnchor="middle"
                      fontSize="10"
                      fill={style.text}
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              {legend?.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1 rounded-full border border-gray-300 dark:border-white/15 px-2 py-0.5"
                >
                  <span className={`inline-block h-2 w-2 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid gap-2">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-md border px-2 py-1 text-[11px] ${
                    index === gcMarkStepIndex
                      ? "border-gray-500 bg-accent text-text"
                      : "border-gray-300 dark:border-white/15 bg-background text-graytext"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGcMarkPlaying((prev) => !prev)}
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {isGcMarkPlaying ? controls.pause : controls.play}
              </button>
              <button
                type="button"
                onClick={() =>
                  setGcMarkStepIndex((prev) =>
                    prev < steps.length - 1 ? prev + 1 : prev
                  )
                }
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {controls.step}
              </button>
              <button
                type="button"
                onClick={() =>
                  setGcMarkStepIndex((prev) => (prev > 0 ? prev - 1 : prev))
                }
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {controls.back}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGcMarkPlaying(() => false);
                  setGcMarkStepIndex(() => 0);
                }}
                className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
              >
                {controls.reset}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.cardTableTitle}
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-2 py-2">
            <svg viewBox="0 0 340 150" className="w-full h-40" aria-hidden="true">
              <defs>
                <marker
                  id="card-arrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
                </marker>
              </defs>
              <rect
                x="8"
                y="18"
                width="200"
                height="128"
                rx="8"
                fill="#f8fafc"
                stroke="#cbd5f5"
              />
              <text x="18" y="34" fontSize="10" fill="#64748b">
                {labels.cardTableOldGen}
              </text>
              {Array.from({ length: 40 }).map((_, idx) => {
                const col = idx % 8;
                const row = Math.floor(idx / 8);
                const x = 20 + col * 22;
                const y = 46 + row * 18;
                const isDirty = [3, 7, 12, 18, 24, 29].includes(idx);
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width="18"
                    height="14"
                    rx="3"
                    fill={isDirty ? "#fecaca" : "#f1f5f9"}
                    stroke={isDirty ? "#f43f5e" : "#cbd5f5"}
                  />
                );
              })}
              <text x="238" y="28" fontSize="10" fill="#0e7490">
                {labels.cardTableYoungGen}
              </text>
              <rect
                x="230"
                y="50"
                width="110"
                height="44"
                rx="10"
                fill="#ecfeff"
                stroke="#67e8f9"
              />
              <line
                x1="318"
                y1="50"
                x2="318"
                y2="94"
                stroke="#67e8f9"
                strokeWidth="1"
              />
              <line
                x1="329"
                y1="50"
                x2="329"
                y2="94"
                stroke="#67e8f9"
                strokeWidth="1"
              />
              <text x="242" y="76" fontSize="10" fill="#0e7490">
                Eden
              </text>
              <text x="323.5" y="76" fontSize="8" textAnchor="middle" fill="#0e7490">
                S0
              </text>
              <text x="334.5" y="76" fontSize="8" textAnchor="middle" fill="#0e7490">
                S1
              </text>
              {[
                { idx: 7, target: { x: 260, y: 72 } },
                { idx: 29, target: { x: 324, y: 72 } },
              ].map((edge) => {
                const col = edge.idx % 8;
                const row = Math.floor(edge.idx / 8);
                const x1 = 20 + col * 22 + 9;
                const y1 = 46 + row * 18 + 7;
                return (
                  <line
                    key={edge.idx}
                    x1={x1}
                    y1={y1}
                    x2={edge.target.x}
                    y2={edge.target.y}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    markerEnd="url(#card-arrow)"
                  />
                );
              })}
            </svg>
          </div>
          <div className="text-[11px] text-graytext space-y-2">
            <div>{labels.cardTableNote}</div>
            <ul className="list-disc pl-4 space-y-1">
              {cardTableWhy.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
        <div className="text-xs font-mono text-graytext mb-2">
          {labels.writeBarrierTitle}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-graytext">
          {barriers.map((item) => (
            <div
              key={item}
              className="rounded-md border border-gray-300 dark:border-white/15 bg-card px-2 py-1 text-[11px]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
