import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/config/constants";
import {
  bytecodeLines,
  executionStepsException,
  executionStepsNormal,
  getOpcodeFromLine,
  sourceLines,
} from "@/config/jvmLesson";

const parseLocals = (locals: string[]) =>
  locals.map((entry, index) => {
    const [slot, ...rest] = entry.split(":");
    if (rest.length === 0) {
      return { index: String(index), value: entry };
    }
    return { index: slot.trim(), value: rest.join(":").trim() };
  });

const parseExceptionTable = (exceptionTable: string) => {
  if (exceptionTable === "none") {
    return [];
  }
  const match = exceptionTable.match(/(\d+)\.\.(\d+)\s*->\s*(\d+)\s*\((.+)\)/);
  if (!match) {
    return [
      {
        label: exceptionTable,
        startPc: "-",
        endPc: "-",
        handlerPc: "-",
      },
    ];
  }
  return [
    {
      label: match[4],
      startPc: match[1],
      endPc: match[2],
      handlerPc: match[3],
    },
  ];
};

const getClassFileTypeTooltip = (
  type: string,
  hints: Record<string, string>
) => {
  const entries = Object.entries(hints);
  for (const [key, value] of entries) {
    if (type.startsWith(key)) {
      return value;
    }
  }
  return "";
};

type RuntimeArea = {
  id: string;
  name: string;
  stored: string;
  ownership: string;
  notes: string[];
  scopeTag: string;
};

type DetailTab = {
  id: string;
  label: string;
  items?: string[];
  diagram?: string[];
};

type PageTab = {
  id: string;
  label: string;
  description?: string;
};

type ClassLoadingStep = {
  id: string;
  title: string;
  summary: string;
  items: string[];
};

type DelegationDemoLoader = {
  id: string;
  title: string;
  desc: string;
};

type DelegationDemoStep = {
  loaderId: string;
  direction: "up" | "down" | "load";
  action: string;
  result: string;
};

type DelegationDemoScenario = {
  id: string;
  label: string;
  className: string;
  desc: string;
  steps: DelegationDemoStep[];
};

type ClassFileInfo = {
  table: {
    headers: string[];
    rows: string[][];
  };
  constantPool: string[];
};

type ResolutionInfo = {
  constantTypes: string[];
  deferred: string[];
  note?: string;
};

type GcSection = {
  title: string;
  items: string[];
};

type RuntimeAreaDetail = {
  summary: string;
  tabs: DetailTab[];
};

export default function JvmLessonPage() {
  const { t } = useTranslation("jvm");
  const runtimeAreas = t("runtimeAreas", {
    returnObjects: true,
  }) as RuntimeArea[];
  const pageTabs = t("pageTabs", { returnObjects: true }) as PageTab[];
  const runtimeAreaDetails = t("runtimeAreaDetails", {
    returnObjects: true,
  }) as Record<string, RuntimeAreaDetail>;
  const flowSteps = t("flowSteps", { returnObjects: true }) as string[];
  const classLoadingSteps = t("classLoading.steps", {
    returnObjects: true,
  }) as ClassLoadingStep[];
  const classLoadingClassFile = t("classLoading.classFile", {
    returnObjects: true,
  }) as ClassFileInfo;
  const classFileTypeHints = t("classLoading.classFile.typeHints", {
    returnObjects: true,
  }) as Record<string, string>;
  const classLoadingResolution = t("classLoading.resolution", {
    returnObjects: true,
  }) as ResolutionInfo;
  const delegationDemo = t("classLoading.delegationDemo", {
    returnObjects: true,
  }) as {
    title: string;
    description: string;
    loaders: DelegationDemoLoader[];
    scenarios: DelegationDemoScenario[];
  };
  const classLoadingOverviewItems = t("classLoading.overview.items", {
    returnObjects: true,
  }) as string[];
  const gcSections = t("gc.sections", { returnObjects: true }) as GcSection[];
  const [activeLoadingStepId, setActiveLoadingStepId] = useState(
    classLoadingSteps[0]?.id ?? "load"
  );
  const activeLoadingStep =
    classLoadingSteps.find((step) => step.id === activeLoadingStepId) ||
    classLoadingSteps[0];
  const [activeScenarioId, setActiveScenarioId] = useState(
    delegationDemo.scenarios[0]?.id ?? "jdk-core"
  );
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const activeScenario =
    delegationDemo.scenarios.find(
      (scenario) => scenario.id === activeScenarioId
    ) || delegationDemo.scenarios[0];
  const demoSteps = activeScenario?.steps ?? [];
  const currentDemoStep = demoSteps[demoStepIndex];
  const loadedById =
    demoSteps.find((step) => step.direction === "load")?.loaderId ?? "";
  const hasResolvedLoad =
    demoSteps
      .slice(0, demoStepIndex + 1)
      .some((step) => step.direction === "load") ?? false;
  const loaderIndexMap = new Map(
    delegationDemo.loaders.map((loader, index) => [loader.id, index])
  );
  const currentLoaderIndex = currentDemoStep
    ? (loaderIndexMap.get(currentDemoStep.loaderId) ?? -1)
    : -1;
  const nextLoaderIndex =
    currentDemoStep?.direction === "up"
      ? currentLoaderIndex - 1
      : currentDemoStep?.direction === "down"
        ? currentLoaderIndex - 1
        : currentLoaderIndex;
  const activeConnectorIndex =
    currentLoaderIndex >= 0 && nextLoaderIndex >= 0
      ? Math.min(currentLoaderIndex, nextLoaderIndex)
      : -1;
  const visitedConnectors = (() => {
    const visitedUp = new Set<number>();
    const visitedDown = new Set<number>();
    demoSteps.slice(0, demoStepIndex + 1).forEach((step) => {
      if (step.direction === "load") {
        return;
      }
      const fromIndex = loaderIndexMap.get(step.loaderId);
      if (fromIndex === undefined) {
        return;
      }
      const toIndex = fromIndex - 1;
      const connectorIndex = Math.min(fromIndex, toIndex);
      if (connectorIndex < 0) {
        return;
      }
      if (step.direction === "up") {
        visitedUp.add(connectorIndex);
        return;
      }
      visitedDown.add(connectorIndex);
    });
    return { up: visitedUp, down: visitedDown };
  })();
  const sourceLineTooltips = t("sourceLineTooltips", {
    returnObjects: true,
  }) as Record<string, string>;
  const opcodeDescriptions = t("opcodeDescriptions", {
    returnObjects: true,
  }) as Record<string, string>;
  const defaultPageTabId =
    pageTabs.find((tab) => tab.id === "memory")?.id ??
    pageTabs[0]?.id ??
    "memory";
  const [activePageTabId, setActivePageTabId] = useState(defaultPageTabId);
  const activePageTab =
    pageTabs.find((tab) => tab.id === activePageTabId) || pageTabs[0];
  const [activeAreaId, setActiveAreaId] = useState(
    runtimeAreas[0]?.id ?? "heap"
  );
  const handleScenarioChange = (scenarioId: string) => {
    setIsDemoPlaying(false);
    setDemoStepIndex(0);
    setActiveScenarioId(scenarioId);
  };
  const [activeDetailTabId, setActiveDetailTabId] = useState(() => {
    const firstAreaId = runtimeAreas[0]?.id;
    const firstTab = firstAreaId
      ? runtimeAreaDetails[firstAreaId]?.tabs[0]?.id
      : undefined;
    return firstTab || "overview";
  });
  const activeArea =
    runtimeAreas.find((area) => area.id === activeAreaId) || runtimeAreas[0];
  const activeAreaDetail = runtimeAreaDetails[activeAreaId];
  const activeDetailTab =
    activeAreaDetail?.tabs.find((tab) => tab.id === activeDetailTabId) ||
    activeAreaDetail?.tabs[0];
  const [runMode, setRunMode] = useState<"normal" | "exception">("normal");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStackFloating, setIsStackFloating] = useState(false);
  const [hasManualSize, setHasManualSize] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(800);
  const defaultFloatingWidth = 420;
  const defaultFloatingHeight = 600;
  const defaultFloatingY = 64;
  const [floatingPosition, setFloatingPosition] = useState(() => {
    if (typeof window === "undefined") {
      return { x: 32, y: defaultFloatingY };
    }
    const rightX = Math.max(16, window.innerWidth - defaultFloatingWidth - 16);
    return { x: rightX, y: defaultFloatingY };
  });
  const [floatingSize, setFloatingSize] = useState({
    width: defaultFloatingWidth,
    height: defaultFloatingHeight,
  });
  const dragStateRef = useRef({
    mode: "none" as "none" | "move" | "resize",
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });
  const positionRef = useRef(floatingPosition);
  const sizeRef = useRef(floatingSize);
  const steps =
    runMode === "normal" ? executionStepsNormal : executionStepsException;
  const currentStep = steps[stepIndex];
  const currentStepTitle = t(currentStep.titleKey);
  const sourceLineToStep = useMemo(() => {
    const map = new Map<number, number>();
    steps.forEach((step, index) => {
      if (!map.has(step.sourceLineIndex)) {
        map.set(step.sourceLineIndex, index);
      }
    });
    return map;
  }, [steps]);
  const getBytecodeTooltip = (line: string) => {
    const opcode = getOpcodeFromLine(line);
    if (!opcode) {
      return line;
    }
    const desc = opcodeDescriptions[opcode];
    if (!desc) {
      return `${line}\n${t("bytecodeTooltip.opcode")}: ${opcode}`;
    }
    return `${line}\n${t("bytecodeTooltip.opcode")}: ${opcode}\n${t(
      "bytecodeTooltip.meaning"
    )}: ${desc}`;
  };
  const bytecodeLineToStep = useMemo(() => {
    const map = new Map<number, number>();
    steps.forEach((step, index) => {
      if (!map.has(step.bytecodeLineIndex)) {
        map.set(step.bytecodeLineIndex, index);
      }
    });
    return map;
  }, [steps]);
  const autoHeight = useMemo(() => {
    const frameCount = currentStep.stack.length;
    const baseHeight = 240;
    const perFrameHeight = 240;
    const desiredHeight = baseHeight + frameCount * perFrameHeight;
    const maxHeight = viewportHeight ? viewportHeight * 0.9 : 720;
    return Math.min(Math.max(320, desiredHeight), maxHeight);
  }, [currentStep.stack.length, viewportHeight]);

  useEffect(() => {
    positionRef.current = floatingPosition;
  }, [floatingPosition]);

  useEffect(() => {
    sizeRef.current = {
      width: floatingSize.width,
      height: hasManualSize ? floatingSize.height : autoHeight,
    };
  }, [floatingSize, hasManualSize, autoHeight]);

  const handleRunModeChange = (mode: "normal" | "exception") => {
    setRunMode(mode);
    setStepIndex(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
    }, 1400);
    return () => window.clearInterval(timer);
  }, [isPlaying, steps.length]);

  useEffect(() => {
    if (!isDemoPlaying) {
      return;
    }
    const timer = window.setInterval(() => {
      setDemoStepIndex((prev) => (prev < demoSteps.length - 1 ? prev + 1 : 0));
    }, 1400);
    return () => window.clearInterval(timer);
  }, [isDemoPlaying, demoSteps.length]);

  useEffect(() => {
    const updateViewport = () => {
      setViewportHeight(window.innerHeight);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (dragStateRef.current.mode === "none") {
        return;
      }
      if (dragStateRef.current.mode === "move") {
        const nextX = event.clientX - dragStateRef.current.offsetX;
        const nextY = event.clientY - dragStateRef.current.offsetY;
        const maxX = Math.max(0, window.innerWidth - sizeRef.current.width);
        const maxY = Math.max(0, window.innerHeight - sizeRef.current.height);
        setFloatingPosition({
          x: Math.min(Math.max(0, nextX), maxX),
          y: Math.min(Math.max(0, nextY), maxY),
        });
        return;
      }
      const deltaX = event.clientX - dragStateRef.current.startX;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const nextWidth = Math.max(300, dragStateRef.current.startWidth + deltaX);
      const nextHeight = Math.max(
        260,
        dragStateRef.current.startHeight + deltaY
      );
      const maxWidth = Math.max(320, window.innerWidth - positionRef.current.x);
      const maxHeight = Math.max(
        260,
        Math.min(
          window.innerHeight * 0.9,
          window.innerHeight - positionRef.current.y
        )
      );
      setFloatingSize({
        width: Math.min(nextWidth, maxWidth),
        height: Math.min(nextHeight, maxHeight),
      });
    };

    const handlePointerUp = () => {
      dragStateRef.current.mode = "none";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activePageTabId === "class-loading") {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setDemoStepIndex((prev) =>
            prev < demoSteps.length - 1 ? prev + 1 : prev
          );
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          setDemoStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePageTabId, demoSteps.length, steps.length]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    dragStateRef.current = {
      ...dragStateRef.current,
      mode: "move",
      offsetX: event.clientX - positionRef.current.x,
      offsetY: event.clientY - positionRef.current.y,
    };
  };

  const handleResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    setHasManualSize(true);
    dragStateRef.current = {
      ...dragStateRef.current,
      mode: "resize",
      startX: event.clientX,
      startY: event.clientY,
      startWidth: sizeRef.current.width,
      startHeight: sizeRef.current.height,
    };
  };

  const callStackContent = (
    <div className="grid gap-3">
      <div className="text-xs text-graytext">{t("stack.titleHint")}</div>
      {currentStep.stack.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-6 text-center text-sm text-graytext">
          {t("stack.emptyStack")}
        </div>
      ) : (
        [...currentStep.stack].reverse().map((frame, index) => {
          const isTop = index === 0;
          return (
            <div
              key={`${frame.method}-${index}`}
              className={`rounded-lg border ${
                isTop
                  ? "border-gray-500 bg-accent"
                  : "border-gray-300 dark:border-white/12 bg-background"
              } px-3 py-3 text-sm`}
            >
              <div className="flex items-center justify-between text-xs text-graytext">
                <span className="font-mono">{frame.method}</span>
                <span>
                  {isTop ? t("stack.topFrame") : t("stack.frameLabel")}
                </span>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-graytext">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <div className="text-[11px] uppercase">{t("stack.pc")}</div>
                    <div className="text-[10px] text-text">{frame.pc}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase">
                      {t("stack.dynamicLink")}
                    </div>
                    <div className="text-[10px] text-text">
                      {frame.dynamicLink}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase">
                      {t("stack.methodExit")}
                    </div>
                    <div className="text-[10px] text-text">
                      {frame.returnAddress}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase">
                      {t("stack.locals")}
                    </div>
                    <div className="rounded-md border border-dashed border-gray-300 dark:border-white/15 bg-background text-xs text-text">
                      {frame.locals.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-graytext text-[10px] uppercase">
                              <th className="text-left px-2 py-1">
                                {t("stack.table.slot")}
                              </th>
                              <th className="text-left px-2 py-1">
                                {t("stack.table.value")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseLocals(frame.locals).map((local) => (
                              <tr
                                key={`${local.index}-${local.value}`}
                                className="border-t border-dashed border-gray-300 dark:border-white/10"
                              >
                                <td className="px-2 py-1">{local.index}</td>
                                <td className="px-2 py-1">{local.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="px-2 py-2 text-graytext">
                          {t("stack.empty")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase">
                      {t("stack.operandStack")}
                    </div>
                    <div className="rounded-md border border-dashed border-gray-300 dark:border-white/15 bg-background px-2 py-2 text-xs text-text min-h-11">
                      {frame.stack.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {[...frame.stack].reverse().map((item, itemIndex) => (
                            <div
                              key={`${item}-${itemIndex}`}
                              className="flex items-center justify-between rounded border border-gray-200 dark:border-white/10 px-2 py-1"
                            >
                              <span>{item}</span>
                              {itemIndex === 0 ? (
                                <span className="text-[10px] text-graytext">
                                  {t("stack.top")}
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-graytext">{t("stack.empty")}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase">
                    {t("stack.exceptionTable")}
                  </div>
                  <div className="rounded-md border border-dashed border-gray-300 dark:border-white/15 bg-background text-xs text-text">
                    {parseExceptionTable(frame.exceptionTable).length > 0 ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-graytext text-[10px] uppercase">
                            <th className="text-left px-2 py-1">
                              {t("stack.table.label")}
                            </th>
                            <th className="text-left px-2 py-1">
                              {t("stack.table.startPc")}
                            </th>
                            <th className="text-left px-2 py-1">
                              {t("stack.table.endPc")}
                            </th>
                            <th className="text-left px-2 py-1">
                              {t("stack.table.handlerPc")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseExceptionTable(frame.exceptionTable).map(
                            (row) => (
                              <tr
                                key={`${row.label}-${row.startPc}-${row.handlerPc}`}
                                className="border-t border-dashed border-gray-300 dark:border-white/10"
                              >
                                <td className="px-2 py-1">{row.label}</td>
                                <td className="px-2 py-1">{row.startPc}</td>
                                <td className="px-2 py-1">{row.endPc}</td>
                                <td className="px-2 py-1">{row.handlerPc}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-2 py-2 text-graytext">
                        {t("stack.none")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
  const controlsContent = (
    <div className="flex flex-wrap items-center gap-2">
      {!isStackFloating ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-graytext">{t("execution.runModeLabel")}</span>
          <button
            type="button"
            onClick={() => handleRunModeChange("normal")}
            className={`rounded-md border px-3 py-1 ${
              runMode === "normal"
                ? "border-gray-500 bg-accent text-text"
                : "border-gray-300 dark:border-white/20 hover:bg-muted"
            }`}
          >
            {t("execution.runMode.normal")}
          </button>
          <button
            type="button"
            onClick={() => handleRunModeChange("exception")}
            className={`rounded-md border px-3 py-1 ${
              runMode === "exception"
                ? "border-gray-500 bg-accent text-text"
                : "border-gray-300 dark:border-white/20 hover:bg-muted"
            }`}
          >
            {t("execution.runMode.exception")}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setIsPlaying((prev) => !prev)}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        {isPlaying
          ? t("execution.controls.pause")
          : t("execution.controls.play")}
      </button>
      <button
        type="button"
        onClick={() =>
          setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
        }
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        {t("execution.controls.step")}
      </button>
      <button
        type="button"
        onClick={() => setStepIndex((prev) => (prev > 0 ? prev - 1 : prev))}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        {t("execution.controls.back")}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsPlaying(false);
          setStepIndex(0);
        }}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        {t("execution.controls.reset")}
      </button>
      <button
        type="button"
        onClick={() => setIsStackFloating((prev) => !prev)}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        {isStackFloating
          ? t("execution.controls.dockStack")
          : t("execution.controls.floatStack")}
      </button>
      <div className="text-xs text-graytext">
        {stepIndex + 1}/{steps.length}
      </div>
    </div>
  );

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
              const isActive = tab.id === activePageTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePageTabId(tab.id)}
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
          {activePageTab?.description ? (
            <div className="text-xs text-graytext">
              {activePageTab.description}
            </div>
          ) : null}
        </section>

        {activePageTabId === "class-loading" ? (
          <>
            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("classLoading.sections.process")}
              </div>
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0">
                  {classLoadingSteps.map((step, index) => {
                    const isActive = step.id === activeLoadingStep?.id;
                    return (
                      <div key={step.id} className="flex items-stretch">
                        <button
                          type="button"
                          onClick={() => setActiveLoadingStepId(step.id)}
                          className={`group relative rounded-lg border px-4 py-3 text-left transition md:rounded-none md:first:rounded-l-lg md:last:rounded-r-lg ${
                            isActive
                              ? "border-gray-500 bg-accent text-text"
                              : "border-gray-300 dark:border-white/12 bg-background hover:bg-muted text-graytext"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide">
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <span className="text-[10px] text-graytext group-hover:text-graytext">
                              Step
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-medium text-text">
                            {step.title}
                          </div>
                        </button>
                        {index < classLoadingSteps.length - 1 ? (
                          <div className="hidden md:flex items-center px-2">
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {activeLoadingStep ? (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-4 py-4 text-xs text-graytext space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-gray-400 px-2 py-0.5 text-[10px] uppercase text-graytext">
                        {activeLoadingStep.title}
                      </div>
                      <div className="text-sm font-medium text-text">
                        {activeLoadingStep.summary}
                      </div>
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      {activeLoadingStep.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>

            {activeLoadingStepId === "load" ? (
              <>
                <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                    {delegationDemo.title}
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="text-xs text-graytext">
                      {delegationDemo.description}
                    </div>
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-2">
                      <div className="text-xs font-mono text-graytext">
                        {t("classLoading.overview.title")}
                      </div>
                      <ul className="list-disc pl-4 space-y-1">
                        {classLoadingOverviewItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {delegationDemo.scenarios.map((scenario) => {
                        const isActive = scenario.id === activeScenarioId;
                        return (
                          <button
                            key={scenario.id}
                            type="button"
                            onClick={() => handleScenarioChange(scenario.id)}
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
                              {t("classLoading.delegationDemo.loadedBy")}{" "}
                              {
                                delegationDemo.loaders.find(
                                  (loader) => loader.id === loadedById
                                )?.title
                              }
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1">{activeScenario.desc}</div>
                      </div>
                    ) : null}

                    <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
                      <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
                        <div className="text-xs font-mono text-graytext mb-3">
                          {t("classLoading.delegationDemo.flowTitle")}
                        </div>
                        <div className="space-y-2">
                          {delegationDemo.loaders.map((loader, index) => {
                            const isActive =
                              loader.id === currentDemoStep?.loaderId;
                            const isVisited =
                              demoSteps
                                .slice(0, demoStepIndex + 1)
                                .some((step) => step.loaderId === loader.id) ??
                              false;
                            const isLoadedBy =
                              hasResolvedLoad && loader.id === loadedById;
                            const showConnector =
                              index < delegationDemo.loaders.length - 1;
                            const isConnectorActive =
                              activeConnectorIndex === index &&
                              currentDemoStep?.direction !== "load";
                            const isUpVisited = visitedConnectors.up.has(index);
                            const isDownVisited =
                              visitedConnectors.down.has(index);
                            const isUpActive =
                              isConnectorActive &&
                              currentDemoStep?.direction === "up";
                            const isDownActive =
                              isConnectorActive &&
                              currentDemoStep?.direction === "down";
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
                                  <div className="text-sm font-medium">
                                    {loader.title}
                                  </div>
                                  <div className="mt-1 text-[11px]">
                                    {loader.desc}
                                  </div>
                                  {isLoadedBy ? (
                                    <div className="mt-2 inline-flex rounded-full border border-emerald-500/60 px-2 py-0.5 text-[10px] uppercase text-emerald-600">
                                      {t("classLoading.delegationDemo.loaded")}
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
                              {t("classLoading.delegationDemo.stepTitle")}
                            </div>
                            <div className="text-xs text-graytext">
                              {demoSteps.length ? demoStepIndex + 1 : 0}/
                              {demoSteps.length}
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
                            <div>{t("classLoading.delegationDemo.empty")}</div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsDemoPlaying((prev) => !prev)}
                            className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
                          >
                            {isDemoPlaying
                              ? t("classLoading.delegationDemo.controls.pause")
                              : t("classLoading.delegationDemo.controls.play")}
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
                            {t("classLoading.delegationDemo.controls.step")}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDemoStepIndex((prev) =>
                                prev > 0 ? prev - 1 : prev
                              )
                            }
                            className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
                          >
                            {t("classLoading.delegationDemo.controls.back")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsDemoPlaying(false);
                              setDemoStepIndex(0);
                            }}
                            className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
                          >
                            {t("classLoading.delegationDemo.controls.reset")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {activeLoadingStepId === "verify" ? (
              <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                  {t("classLoading.sections.classFile")}
                </div>
                <div className="p-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 overflow-x-auto">
                    <div className="text-xs font-mono text-graytext mb-2">
                      {t("classLoading.classFile.structureTitle")}
                    </div>
                    <table className="w-full border-collapse text-xs text-graytext">
                      <thead>
                        <tr className="text-[10px] uppercase">
                          {classLoadingClassFile.table.headers.map((head) => (
                            <th
                              key={head}
                              className="px-2 py-1 text-left border-b border-dashed border-gray-300 dark:border-white/10"
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {classLoadingClassFile.table.rows.map((row) => (
                          <tr
                            key={`${row[0]}-${row[1]}`}
                            className="border-b border-dashed border-gray-300 dark:border-white/10"
                          >
                            {row.map((cell, cellIndex) => {
                              const tooltip =
                                cellIndex === 2
                                  ? getClassFileTypeTooltip(
                                      cell,
                                      classFileTypeHints
                                    )
                                  : "";
                              const cellNode = (
                                <td
                                  key={`${row[0]}-${cellIndex}`}
                                  className={`px-2 py-1 ${
                                    cellIndex === 1 ? "font-mono text-text" : ""
                                  } ${tooltip ? "cursor-help" : ""}`}
                                >
                                  {cell}
                                </td>
                              );
                              if (!tooltip) {
                                return cellNode;
                              }
                              return (
                                <Tooltip key={`${row[0]}-${cellIndex}`}>
                                  <TooltipTrigger asChild>
                                    {cellNode}
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    align="start"
                                    sideOffset={6}
                                    className="max-w-xs whitespace-pre-line"
                                  >
                                    {tooltip}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-2">
                    <div className="text-xs font-mono text-graytext">
                      {t("classLoading.classFile.constantPoolTitle")}
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      {classLoadingClassFile.constantPool.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            ) : null}

            {activeLoadingStepId === "prepare" ? (
              <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                  {t("classLoading.prepareDiagram.title")}
                </div>
                <div className="p-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
                    <div className="text-xs font-mono text-graytext mb-2">
                      {t("classLoading.prepareDiagram.jdk6Title")}
                    </div>
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-card/80 p-3 space-y-3 text-xs text-graytext">
                      <div className="text-[10px] uppercase tracking-wide text-graytext">
                        {t("classLoading.prepareDiagram.labels.jvmMemory")}
                      </div>
                      <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-1">
                        <div className="font-medium text-text">
                          {t("classLoading.prepareDiagram.labels.methodArea")}
                        </div>
                        <div className="text-[11px]">
                          {t("classLoading.prepareDiagram.labels.metadata")}
                        </div>
                        <div className="text-[11px]">
                          {t("classLoading.prepareDiagram.labels.runtimeData")}
                        </div>
                      </div>
                      <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext">
                        <div className="font-medium text-text">
                          {t("classLoading.prepareDiagram.labels.heap")}
                        </div>
                        <div className="text-[11px]">
                          {t("classLoading.prepareDiagram.labels.classObjects")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
                    <div className="text-xs font-mono text-graytext mb-2">
                      {t("classLoading.prepareDiagram.jdk8Title")}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-card/80 p-3 space-y-2 text-xs text-graytext">
                        <div className="text-[10px] uppercase tracking-wide text-graytext">
                          {t("classLoading.prepareDiagram.labels.jvmMemory")}
                        </div>
                        <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-xs text-graytext">
                          <div className="font-medium text-text">
                            {t("classLoading.prepareDiagram.labels.heap")}
                          </div>
                          <div className="text-[11px]">
                            {t(
                              "classLoading.prepareDiagram.labels.classObjects"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-card/80 p-3 space-y-2 text-xs text-graytext">
                        <div className="text-[10px] uppercase tracking-wide text-graytext">
                          {t("classLoading.prepareDiagram.labels.nativeMemory")}
                        </div>
                        <div className="rounded-md border border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-1">
                          <div className="font-medium text-text">
                            {t("classLoading.prepareDiagram.labels.metaspace")}
                          </div>
                          <div className="text-[11px]">
                            {t("classLoading.prepareDiagram.labels.metadata")}
                          </div>
                          <div className="text-[11px]">
                            {t(
                              "classLoading.prepareDiagram.labels.runtimeData"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-xs text-graytext">
                    {t("classLoading.prepareDiagram.note")}
                  </div>
                </div>
              </section>
            ) : null}

            {activeLoadingStepId === "resolve" ? (
              <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                  {t("classLoading.sections.resolution")}
                </div>
                <div className="p-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-2">
                    <div className="text-xs font-mono text-graytext">
                      {t("classLoading.resolution.constantTypesTitle")}
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      {classLoadingResolution.constantTypes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-2">
                    <div className="text-xs font-mono text-graytext">
                      {t("classLoading.resolution.deferredTitle")}
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      {classLoadingResolution.deferred.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {classLoadingResolution.note ? (
                      <div className="text-[11px] text-graytext">
                        {classLoadingResolution.note}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {activePageTabId === "memory" ? (
          <>
            <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <div className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                  {t("sections.runtimeDiagram")}
                </div>
                <div className="p-4 grid gap-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_2fr_1fr]">
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                      <div className="text-xs font-mono text-graytext">
                        {t("diagram.classLoader.title")}
                      </div>
                      <div className="text-sm mt-2">
                        {t("diagram.classLoader.desc")}
                      </div>
                      <div className="mt-3 rounded-md border border-dashed border-gray-300 dark:border-white/15 bg-background px-2 py-2 text-xs text-graytext">
                        <div>{t("diagram.classLoader.delegation")}</div>
                        <div className="mt-1">
                          {t("diagram.classLoader.delegationChain")}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                      <div className="text-xs font-mono text-graytext">
                        {t("diagram.runtimeDataAreas.title")}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-graytext">
                        <span className="rounded-full border border-gray-300 dark:border-white/20 px-2 py-0.5">
                          {t("diagram.runtimeDataAreas.scopeShared")}
                        </span>
                        <span className="rounded-full border border-gray-300 dark:border-white/20 px-2 py-0.5">
                          {t("diagram.runtimeDataAreas.scopePrivate")}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {runtimeAreas.map((area) => {
                          const isActive = area.id === activeAreaId;
                          return (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => {
                                setActiveAreaId(area.id);
                                const defaultTab =
                                  runtimeAreaDetails[area.id]?.tabs[0]?.id;
                                if (defaultTab) {
                                  setActiveDetailTabId(defaultTab);
                                }
                              }}
                              aria-pressed={isActive}
                              className={`w-full text-left rounded-md border px-3 py-2 text-sm transition ${
                                isActive
                                  ? "border-gray-500 bg-accent text-text"
                                  : "border-gray-300 dark:border-white/12 bg-background hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{area.name}</span>
                                <span
                                  className={`text-[11px] rounded-full px-2 py-0.5 border ${
                                    area.scopeTag === "Shared"
                                      ? "border-gray-400 text-graytext"
                                      : "border-gray-300 text-graytext"
                                  }`}
                                >
                                  {area.scopeTag}
                                </span>
                              </div>
                              <div className="text-xs text-graytext mt-1">
                                {area.stored}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                      <div className="text-xs font-mono text-graytext">
                        {t("diagram.executionEngine.title")}
                      </div>
                      <div className="text-sm mt-2">
                        {t("diagram.executionEngine.desc")}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                      <div className="text-xs font-mono text-graytext">
                        {t("diagram.jni.title")}
                      </div>
                      <div className="text-sm mt-2">
                        {t("diagram.jni.desc")}
                      </div>
                    </div>
                    <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                      <div className="text-xs font-mono text-graytext">
                        {t("diagram.nativeLibraries.title")}
                      </div>
                      <div className="text-sm mt-2">
                        {t("diagram.nativeLibraries.desc")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                  {t("sections.runtimeDetails")}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-sm font-medium">{activeArea.name}</div>
                    <div className="text-xs text-graytext mt-1">
                      {activeArea.stored}
                    </div>
                  </div>
                  <div className="text-xs text-graytext space-y-2">
                    <div>
                      {t("runtimeDetailMeta.scopeLabel")}：
                      {activeArea.ownership}
                    </div>
                    {activeAreaDetail?.summary ? (
                      <div>{activeAreaDetail.summary}</div>
                    ) : null}
                    <ul className="list-disc pl-4">
                      {activeArea.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                  {activeAreaDetail?.tabs?.length ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {activeAreaDetail.tabs.map((tab) => {
                          const isActive = tab.id === activeDetailTab?.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveDetailTabId(tab.id)}
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
                      {activeDetailTab ? (
                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-3">
                          {activeDetailTab.diagram ? (
                            <pre className="text-[11px] leading-5 text-text font-mono whitespace-pre">
                              {activeDetailTab.diagram.join("\n")}
                            </pre>
                          ) : null}
                          {activeDetailTab.items ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {activeDetailTab.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="text-xs text-graytext">
                    {t("runtimeDetailMeta.tip")}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("sections.flow")}
              </div>
              <div className="p-4 grid gap-2 text-sm">
                {flowSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-3 rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2"
                  >
                    <div className="text-xs font-mono text-graytext mt-1">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>{step}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
                {t("sections.execution")}
              </div>
              <div className="p-4 grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
                    <div className="text-xs font-mono text-graytext mb-2">
                      {t("execution.sourceLabel")}
                    </div>
                    <div className="text-xs leading-6 text-text overflow-x-auto font-mono whitespace-pre">
                      {sourceLines.map((line, index) => {
                        const targetStepIndex = sourceLineToStep.get(index);
                        const isClickable = targetStepIndex !== undefined;
                        const tooltipText = sourceLineTooltips[String(index)];
                        const lineNode = (
                          <div
                            onClick={() => {
                              if (!isClickable) {
                                return;
                              }
                              setIsPlaying(false);
                              setStepIndex(targetStepIndex);
                            }}
                            className={`px-2 rounded border border-transparent hover:border-gray-300 dark:hover:border-white/15 ${
                              index === currentStep.sourceLineIndex
                                ? "bg-accent text-text"
                                : ""
                            } ${isClickable ? "cursor-pointer" : ""}`}
                          >
                            <span className="inline-block w-6 text-graytext">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {tooltipText ? (
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{line}</span>
                              </TooltipTrigger>
                            ) : (
                              <span>{line}</span>
                            )}
                          </div>
                        );

                        if (!tooltipText) {
                          return <div key={`${line}-${index}`}>{lineNode}</div>;
                        }

                        return (
                          <Tooltip key={`${line}-${index}`}>
                            {lineNode}
                            <TooltipContent
                              side="top"
                              align="start"
                              sideOffset={6}
                              className="max-w-xs whitespace-pre-line"
                            >
                              {tooltipText}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
                    <div className="text-xs font-mono text-graytext mb-2">
                      {t("execution.bytecodeLabel")}
                    </div>
                    <div className="text-xs leading-6 text-text overflow-x-auto font-mono whitespace-pre">
                      {bytecodeLines.map((line, index) => {
                        const opcode = getOpcodeFromLine(line);
                        const tooltipText = getBytecodeTooltip(line);
                        const targetStepIndex = bytecodeLineToStep.get(index);
                        const isClickable = targetStepIndex !== undefined;
                        const handleJump = () => {
                          if (!isClickable) {
                            return;
                          }
                          setIsPlaying(false);
                          setStepIndex(targetStepIndex);
                        };

                        if (!opcode) {
                          return (
                            <div
                              key={`${line}-${index}`}
                              onClick={handleJump}
                              className={`px-2 rounded border border-transparent hover:border-gray-300 dark:hover:border-white/15 ${
                                index === currentStep.bytecodeLineIndex
                                  ? "bg-accent text-text"
                                  : ""
                              } ${isClickable ? "cursor-pointer" : ""}`}
                            >
                              <span className="inline-block w-6 text-graytext">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              {line}
                            </div>
                          );
                        }

                        return (
                          <Tooltip key={`${line}-${index}`}>
                            <div
                              onClick={handleJump}
                              className={`px-2 rounded border border-transparent hover:border-gray-300 dark:hover:border-white/15 ${
                                index === currentStep.bytecodeLineIndex
                                  ? "bg-accent text-text"
                                  : ""
                              } ${isClickable ? "cursor-pointer" : ""}`}
                            >
                              <span className="inline-block w-6 text-graytext">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{line}</span>
                              </TooltipTrigger>
                            </div>
                            <TooltipContent
                              side="top"
                              align="start"
                              sideOffset={6}
                              className="max-w-xs whitespace-pre-line"
                            >
                              {tooltipText}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {!isStackFloating ? controlsContent : null}

                {!isStackFloating ? (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-sm">
                    <div className="text-xs font-mono text-graytext">
                      {t("execution.currentInstruction")}
                    </div>
                    <div className="mt-1 font-mono text-sm">
                      {currentStep.bytecode}
                    </div>
                    <div className="mt-1 text-xs text-graytext">
                      {currentStepTitle}
                    </div>
                  </div>
                ) : null}

                {!isStackFloating ? callStackContent : null}

                <div className="text-xs text-graytext">
                  {t("execution.instructionNote")}
                </div>
              </div>
            </section>
          </>
        ) : null}

        {activePageTabId === "gc" ? (
          <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
              {t("gc.title")}
            </div>
            <div className="p-4 grid gap-3 md:grid-cols-3">
              {gcSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-xs text-graytext space-y-2"
                >
                  <div className="text-sm font-medium text-text">
                    {section.title}
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {isStackFloating ? (
        <div
          className="fixed z-50 rounded-xl border border-gray-300 dark:border-white/12 bg-card shadow-lg"
          style={{
            left: floatingPosition.x,
            top: floatingPosition.y,
            width: floatingSize.width,
            height: hasManualSize ? floatingSize.height : autoHeight,
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 text-xs text-graytext border-b border-gray-200 dark:border-white/10 cursor-move"
            onPointerDown={handleDragStart}
          >
            <span>{t("execution.controls.stackTitle")}</span>
            <button
              type="button"
              onClick={() => setIsStackFloating(false)}
              className="rounded-md border border-gray-300 dark:border-white/20 px-2 py-0.5 text-[10px] hover:bg-muted"
            >
              {t("execution.controls.dock")}
            </button>
          </div>
          <div className="h-[calc(100%-36px)] overflow-auto p-3 space-y-3">
            {controlsContent}
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-sm">
              <div className="text-xs font-mono text-graytext">
                {t("execution.currentInstruction")}
              </div>
              <div className="mt-1 font-mono text-sm">
                {currentStep.bytecode}
              </div>
              <div className="mt-1 text-xs text-graytext">
                {currentStepTitle}
              </div>
            </div>
            {callStackContent}
          </div>
          <div
            className="absolute bottom-1 right-1 h-3 w-3 cursor-se-resize"
            onPointerDown={handleResizeStart}
          />
        </div>
      ) : null}
    </Layout>
  );
}
