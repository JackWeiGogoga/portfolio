import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import { ROUTES } from "@/config/constants";
import AqsDemo, { type AqsDemoStep } from "@/pages/what-is-it/java-locks/AqsDemo";
import LockUpgradeDemo, {
  type LockUpgradeStep,
} from "@/pages/what-is-it/java-locks/LockUpgradeDemo";

type PageTab = {
  id: string;
  label: string;
  description?: string;
};

type TableData = {
  headers: string[];
  rows: string[][];
};

type QaItem = {
  question: string;
  answer: string;
};

type InterviewSection = {
  title: string;
  items: string[];
};

type CodeBlockProps = {
  title?: string;
  code: string;
};

function CodeBlock({ title, code }: CodeBlockProps) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
      {title ? (
        <div className="text-[11px] uppercase text-graytext mb-2">
          {title}
        </div>
      ) : null}
      <pre className="text-[11px] leading-5 text-text font-mono whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

type SimpleTableProps = {
  data: TableData;
};

function SimpleTable({ data }: SimpleTableProps) {
  const hasThreeColumns = data.headers.length === 3;
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background text-xs text-text overflow-x-auto">
      <table className="w-full border-collapse">
        {hasThreeColumns ? (
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[34%]" />
            <col className="w-[44%]" />
          </colgroup>
        ) : null}
        <thead>
          <tr className="text-graytext text-[10px] uppercase">
            {data.headers.map((header) => (
              <th key={header} className="text-left px-2 py-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr
              key={`${row.join("-")}-${rowIndex}`}
              className="border-t border-dashed border-gray-300 dark:border-white/10"
            >
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-2 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function JavaLocksLessonPage() {
  const { t } = useTranslation("javaLocks");
  const pageTabs = t("tabs", { returnObjects: true }) as PageTab[];
  const defaultTabId = pageTabs[0]?.id ?? "overview";
  const [activeTabId, setActiveTabId] = useState(defaultTabId);
  const activeTab = pageTabs.find((tab) => tab.id === activeTabId) || pageTabs[0];

  const overviewHighlights = t("overview.highlights", {
    returnObjects: true,
  }) as string[];
  const overviewCategories = t("overview.categories", {
    returnObjects: true,
  }) as { title: string; table: TableData }[];
  const overviewPillars = t("overview.pillars", {
    returnObjects: true,
  }) as string[];
  const overviewChecklist = t("overview.checklist", {
    returnObjects: true,
  }) as string[];
  const overviewLandscape = t("overview.landscape", {
    returnObjects: true,
  }) as TableData;

  const objectHeaderTable = t("synchronized.objectHeaderTable", {
    returnObjects: true,
  }) as TableData;
  const markWordTable = t("synchronized.markWordTable", {
    returnObjects: true,
  }) as TableData;
  const upgradeSteps = t("synchronized.upgradeSteps", {
    returnObjects: true,
  }) as string[];
  const syncOptimizations = t("synchronized.optimizations", {
    returnObjects: true,
  }) as string[];
  const syncPitfalls = t("synchronized.pitfalls", {
    returnObjects: true,
  }) as string[];
  const syncOptimizationExamples = t("synchronized.optimizationExamples", {
    returnObjects: true,
  }) as { title: string; summary: string; code: string }[];
  const syncScopeTabs = t("synchronized.scopeTabs", {
    returnObjects: true,
  }) as { id: string; label: string }[];
  const [activeSyncScopeId, setActiveSyncScopeId] = useState(
    syncScopeTabs[0]?.id ?? "object"
  );
  const syncScopeContent = t(
    `synchronized.scopeContent.${activeSyncScopeId}`,
    { returnObjects: true }
  ) as { summary: string; examples: { title: string; code: string }[] };
  const lockUpgradeSteps = t("synchronized.upgradeDemo.steps", {
    returnObjects: true,
  }) as LockUpgradeStep[];

  const lockComparison = t("lock.comparisonTable", {
    returnObjects: true,
  }) as TableData;
  const lockPractices = t("lock.bestPractices", {
    returnObjects: true,
  }) as string[];

  const aqsConcepts = t("aqs.concepts", { returnObjects: true }) as string[];
  const aqsNodeTable = t("aqs.nodeTable", { returnObjects: true }) as TableData;

  const interviewSections = t("interview.sections", {
    returnObjects: true,
  }) as InterviewSection[];
  const interviewQuestions = t("interview.questions", {
    returnObjects: true,
  }) as QaItem[];
  const interviewChecklist = t("interview.checklist", {
    returnObjects: true,
  }) as string[];

  const aqsStepText = t("aqs.demo.steps", {
    returnObjects: true,
  }) as Record<string, { title: string; description: string; signal?: string }>;

  const aqsSteps = useMemo<AqsDemoStep[]>(
    () => [
      {
        id: "t1-acquire",
        title: aqsStepText.t1Acquire.title,
        description: aqsStepText.t1Acquire.description,
        state: 1,
        owner: "T1",
        arrivingThread: "T1",
        queue: [],
        parked: [],
        signal: null,
      },
      {
        id: "t2-enqueue",
        title: aqsStepText.t2Enqueue.title,
        description: aqsStepText.t2Enqueue.description,
        state: 1,
        owner: "T1",
        arrivingThread: "T2",
        queue: ["T2"],
        parked: ["T2"],
        signal: null,
      },
      {
        id: "t3-enqueue",
        title: aqsStepText.t3Enqueue.title,
        description: aqsStepText.t3Enqueue.description,
        state: 1,
        owner: "T1",
        arrivingThread: "T3",
        queue: ["T2", "T3"],
        parked: ["T2", "T3"],
        signal: null,
      },
      {
        id: "t1-release",
        title: aqsStepText.t1Release.title,
        description: aqsStepText.t1Release.description,
        state: 1,
        owner: "T2",
        arrivingThread: null,
        queue: ["T3"],
        parked: ["T3"],
        signal: aqsStepText.t1Release.signal,
      },
      {
        id: "t2-release",
        title: aqsStepText.t2Release.title,
        description: aqsStepText.t2Release.description,
        state: 1,
        owner: "T3",
        arrivingThread: null,
        queue: [],
        parked: [],
        signal: aqsStepText.t2Release.signal,
      },
      {
        id: "t3-release",
        title: aqsStepText.t3Release.title,
        description: aqsStepText.t3Release.description,
        state: 0,
        owner: null,
        arrivingThread: null,
        queue: [],
        parked: [],
        signal: null,
      },
    ],
    [aqsStepText]
  );

  const [aqsStepIndex, setAqsStepIndex] = useState(0);
  const [isAqsPlaying, setIsAqsPlaying] = useState(false);
  const [lockUpgradeIndex, setLockUpgradeIndex] = useState(0);
  const [isLockUpgradePlaying, setIsLockUpgradePlaying] = useState(false);

  useEffect(() => {
    if (!isAqsPlaying) {
      return;
    }
    const timer = window.setInterval(() => {
      setAqsStepIndex((prev) => (prev < aqsSteps.length - 1 ? prev + 1 : 0));
    }, 1600);
    return () => window.clearInterval(timer);
  }, [isAqsPlaying, aqsSteps.length]);

  useEffect(() => {
    if (!isLockUpgradePlaying) {
      return;
    }
    const timer = window.setInterval(() => {
      setLockUpgradeIndex((prev) =>
        prev < lockUpgradeSteps.length - 1 ? prev + 1 : 0
      );
    }, 1600);
    return () => window.clearInterval(timer);
  }, [isLockUpgradePlaying, lockUpgradeSteps.length]);

  const aqsControls = {
    play: t("labels.controls.play"),
    pause: t("labels.controls.pause"),
    step: t("labels.controls.step"),
    back: t("labels.controls.back"),
    reset: t("labels.controls.reset"),
  };
  const lockUpgradeControls = {
    play: t("labels.controls.play"),
    pause: t("labels.controls.pause"),
    step: t("labels.controls.step"),
    back: t("labels.controls.back"),
    reset: t("labels.controls.reset"),
  };

  const aqsDiagramLabels = {
    lockStateTitle: t("aqs.demo.lockStateTitle"),
    stateLabel: t("aqs.demo.stateLabel"),
    ownerLabel: t("aqs.demo.ownerLabel"),
    ownerEmpty: t("aqs.demo.ownerEmpty"),
    queueTitle: t("aqs.demo.queueTitle"),
    queueEmpty: t("aqs.demo.queueEmpty"),
    arrivingTitle: t("aqs.demo.arrivingTitle"),
    stepsTitle: t("aqs.demo.stepsTitle"),
    headTag: t("aqs.demo.headTag"),
    tailTag: t("aqs.demo.tailTag"),
    parkedTag: t("aqs.demo.parkedTag"),
    signalTitle: t("aqs.demo.signalTitle"),
  };
  const lockUpgradeLabels = {
    markWordTitle: t("synchronized.upgradeDemo.title"),
    fieldsTitle: t("synchronized.upgradeDemo.fieldsTitle"),
    lockBits: t("synchronized.upgradeDemo.fields.lockBits"),
    biased: t("synchronized.upgradeDemo.fields.biased"),
    hash: t("synchronized.upgradeDemo.fields.hash"),
    age: t("synchronized.upgradeDemo.fields.age"),
    threadId: t("synchronized.upgradeDemo.fields.threadId"),
    ptr: t("synchronized.upgradeDemo.fields.ptr"),
    stepsTitle: t("synchronized.upgradeDemo.stepsTitle"),
    arrivingTitle: t("synchronized.upgradeDemo.arrivingTitle"),
    ownerTitle: t("synchronized.upgradeDemo.ownerTitle"),
    ownerEmpty: t("synchronized.upgradeDemo.ownerEmpty"),
    waitingTitle: t("synchronized.upgradeDemo.waitingTitle"),
    waitingEmpty: t("synchronized.upgradeDemo.waitingEmpty"),
    flowTitle: t("synchronized.upgradeDemo.flowTitle"),
    flowNote: t("synchronized.upgradeDemo.flowNote"),
  };

  return (
    <Layout variant="lesson">
      <div className="flex flex-col gap-3">
        <Link
          to={ROUTES.WHAT_IS_IT}
          className="inline-flex items-center gap-2 text-xs text-graytext hover:text-text no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("page.back")}
        </Link>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("page.title")}</h1>
          <p className="text-sm text-graytext">{t("page.subtitle")}</p>
        </header>

        <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {pageTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`rounded-md border px-3 py-1 text-xs ${
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
          {activeTab?.description ? (
            <div className="text-xs text-graytext">{activeTab.description}</div>
          ) : null}
        </section>

        {activeTabId === "overview" ? (
          <>
            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("overview.title")}
              </div>
              <div className="p-4 grid gap-4">
                <p className="text-sm text-graytext">{t("overview.intro")}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {overviewPillars.map((pillar) => (
                    <div
                      key={pillar}
                      className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext"
                    >
                      {pillar}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("overview.highlightsTitle")}
                  </div>
                  <ul className="list-disc pl-4 text-xs text-graytext space-y-1">
                    {overviewHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("overview.categoriesTitle")}
                  </div>
                  <div className="grid gap-3">
                    {overviewCategories.map((category) => (
                      <div
                        key={category.title}
                        className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 space-y-2"
                      >
                        <div className="text-xs font-medium text-text">
                          {category.title}
                        </div>
                        <SimpleTable data={category.table} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("overview.landscapeTitle")}
                  </div>
                  <SimpleTable data={overviewLandscape} />
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("overview.checklistTitle")}
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {overviewChecklist.map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeTabId === "synchronized" ? (
          <>
            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("synchronized.title")}
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-graytext">{t("synchronized.summary")}</p>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("synchronized.objectHeaderTitle")}
                  </div>
                  <SimpleTable data={objectHeaderTable} />
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("synchronized.markWordTitle")}
                  </div>
                  <SimpleTable data={markWordTable} />
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("synchronized.upgradeTitle")}
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {upgradeSteps.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("synchronized.upgradeDemo.note")}
                  </div>
                  <LockUpgradeDemo
                    steps={lockUpgradeSteps}
                    stepIndex={lockUpgradeIndex}
                    setStepIndex={setLockUpgradeIndex}
                    isPlaying={isLockUpgradePlaying}
                    setIsPlaying={setIsLockUpgradePlaying}
                    controls={lockUpgradeControls}
                    labels={lockUpgradeLabels}
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <CodeBlock
                    title={t("synchronized.bytecodeSourceTitle")}
                    code={t("synchronized.bytecodeSource")}
                  />
                  <CodeBlock
                    title={t("synchronized.bytecodeListingTitle")}
                    code={t("synchronized.bytecodeListing")}
                  />
                </div>
                <div className="space-y-3">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("synchronized.scopeTitle")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {syncScopeTabs.map((tab) => {
                      const isActive = tab.id === activeSyncScopeId;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveSyncScopeId(tab.id)}
                          className={`rounded-md border px-2 py-1 text-xs ${
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
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-3">
                    <div>{syncScopeContent.summary}</div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {syncScopeContent.examples.map((example) => (
                        <CodeBlock
                          key={example.title}
                          title={example.title}
                          code={example.code}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase text-graytext">
                      {t("synchronized.optimizationsTitle")}
                    </div>
                    <ul className="list-disc pl-4 text-xs text-graytext space-y-1">
                      {syncOptimizations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase text-graytext">
                      {t("synchronized.pitfallsTitle")}
                    </div>
                    <ul className="list-disc pl-4 text-xs text-graytext space-y-1">
                      {syncPitfalls.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("synchronized.optimizationExamplesTitle")}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {syncOptimizationExamples.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 space-y-2"
                      >
                        <div className="text-xs font-medium text-text">
                          {item.title}
                        </div>
                        <div className="text-xs text-graytext">
                          {item.summary}
                        </div>
                        <CodeBlock title={item.title} code={item.code} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeTabId === "lock" ? (
          <>
            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("lock.title")}
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-graytext">{t("lock.summary")}</p>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("lock.comparisonTitle")}
                  </div>
                  <SimpleTable data={lockComparison} />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <CodeBlock
                    title={t("lock.reentrantTitle")}
                    code={t("lock.reentrantCode")}
                  />
                  <CodeBlock
                    title={t("lock.conditionTitle")}
                    code={t("lock.conditionCode")}
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <CodeBlock
                    title={t("lock.readWriteTitle")}
                    code={t("lock.readWriteCode")}
                  />
                  <CodeBlock
                    title={t("lock.stampedTitle")}
                    code={t("lock.stampedCode")}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("lock.bestPracticesTitle")}
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {lockPractices.map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activeTabId === "aqs" ? (
          <>
            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("aqs.title")}
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-graytext">{t("aqs.summary")}</p>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase text-graytext">
                      {t("aqs.conceptsTitle")}
                    </div>
                    <ul className="list-disc pl-4 text-xs text-graytext space-y-1">
                      {aqsConcepts.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase text-graytext">
                      {t("aqs.nodeTableTitle")}
                    </div>
                    <SimpleTable data={aqsNodeTable} />
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <CodeBlock
                    title={t("aqs.acquireTitle")}
                    code={t("aqs.acquirePseudo")}
                  />
                  <CodeBlock
                    title={t("aqs.releaseTitle")}
                    code={t("aqs.releasePseudo")}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("aqs.demo.title")}
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-graytext">{t("aqs.demo.note")}</p>
                <AqsDemo
                  steps={aqsSteps}
                  stepIndex={aqsStepIndex}
                  setStepIndex={setAqsStepIndex}
                  isPlaying={isAqsPlaying}
                  setIsPlaying={setIsAqsPlaying}
                  controls={aqsControls}
                  labels={aqsDiagramLabels}
                />
              </div>
            </section>
          </>
        ) : null}

        {activeTabId === "interview" ? (
          <>
            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("interview.title")}
              </div>
              <div className="p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {interviewSections.map((section) => (
                    <div key={section.title} className="space-y-2">
                      <div className="text-[11px] uppercase text-graytext">
                        {section.title}
                      </div>
                      <ul className="list-disc pl-4 text-xs text-graytext space-y-1">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("interview.questionsTitle")}
                  </div>
                  <div className="grid gap-3">
                    {interviewQuestions.map((item) => (
                      <div
                        key={item.question}
                        className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs"
                      >
                        <div className="text-text font-medium">
                          {item.question}
                        </div>
                        <div className="text-graytext mt-1">{item.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] uppercase text-graytext">
                    {t("interview.checklistTitle")}
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {interviewChecklist.map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
