import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/config/constants";
import {
  bytecodeLines,
  exampleMappings,
  executionStepsException,
  executionStepsNormal,
  flowSteps,
  getBytecodeTooltip,
  getOpcodeFromLine,
  runtimeAreas,
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

export default function JvmLessonPage() {
  const [activeAreaId, setActiveAreaId] = useState(runtimeAreas[0].id);
  const activeArea =
    runtimeAreas.find((area) => area.id === activeAreaId) || runtimeAreas[0];
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
  const sourceLineToStep = useMemo(() => {
    const map = new Map<number, number>();
    steps.forEach((step, index) => {
      if (!map.has(step.sourceLineIndex)) {
        map.set(step.sourceLineIndex, index);
      }
    });
    return map;
  }, [steps]);
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
  }, [steps.length]);

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
      <div className="text-xs text-graytext">
        调用栈（上方为栈顶，返回时弹栈）
      </div>
      {currentStep.stack.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-6 text-center text-sm text-graytext">
          栈已清空
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
                <span>{isTop ? "Top Frame" : "Frame"}</span>
              </div>
              <div className="mt-2 grid gap-2 text-xs text-graytext">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <div className="text-[11px] uppercase">PC</div>
                    <div className="text-[10px] text-text">{frame.pc}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase">Dynamic Link</div>
                    <div className="text-[10px] text-text">
                      {frame.dynamicLink}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase">Method Exit</div>
                    <div className="text-[10px] text-text">
                      {frame.returnAddress}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase">Locals</div>
                    <div className="rounded-md border border-dashed border-gray-300 dark:border-white/15 bg-background text-xs text-text">
                      {frame.locals.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-graytext text-[10px] uppercase">
                              <th className="text-left px-2 py-1">Slot</th>
                              <th className="text-left px-2 py-1">Value</th>
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
                        <div className="px-2 py-2 text-graytext">empty</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase">Operand Stack</div>
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
                                  TOP
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-graytext">empty</div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase">Exception Table</div>
                  <div className="rounded-md border border-dashed border-gray-300 dark:border-white/15 bg-background text-xs text-text">
                    {parseExceptionTable(frame.exceptionTable).length > 0 ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-graytext text-[10px] uppercase">
                            <th className="text-left px-2 py-1">Label</th>
                            <th className="text-left px-2 py-1">Start PC</th>
                            <th className="text-left px-2 py-1">End PC</th>
                            <th className="text-left px-2 py-1">Handler PC</th>
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
                      <div className="px-2 py-2 text-graytext">none</div>
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
          <span className="text-graytext">运行路径</span>
          <button
            type="button"
            onClick={() => handleRunModeChange("normal")}
            className={`rounded-md border px-3 py-1 ${
              runMode === "normal"
                ? "border-gray-500 bg-accent text-text"
                : "border-gray-300 dark:border-white/20 hover:bg-muted"
            }`}
          >
            正常
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
            异常
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setIsPlaying((prev) => !prev)}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        onClick={() =>
          setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
        }
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        Step
      </button>
      <button
        type="button"
        onClick={() => setStepIndex((prev) => (prev > 0 ? prev - 1 : prev))}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        Back
      </button>
      <button
        type="button"
        onClick={() => {
          setIsPlaying(false);
          setStepIndex(0);
        }}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={() => setIsStackFloating((prev) => !prev)}
        className="rounded-md border border-gray-300 dark:border-white/20 px-3 py-1 text-xs hover:bg-muted"
      >
        {isStackFloating ? "Dock Stack" : "Float Stack"}
      </button>
      <div className="text-xs text-graytext">
        {stepIndex + 1}/{steps.length}
      </div>
    </div>
  );

  return (
    <Layout variant="lesson">
      <div className="flex flex-col gap-8">
        <Link
          to={ROUTES.WHAT_IS_IT}
          className="inline-flex items-center gap-2 text-xs text-graytext hover:text-text no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          返回 What is it
        </Link>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">JVM 运行时世界</h1>
          <p className="text-sm text-graytext">
            目标：理解 JVM 的组成、运行时数据区存储内容与执行流程。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
              JVM 组成示意图（点击运行时数据区查看细节）
            </div>
            <div className="p-4 grid gap-4">
              <div className="grid gap-3 md:grid-cols-[1fr_2fr_1fr]">
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                  <div className="text-xs font-mono text-graytext">
                    Class Loader
                  </div>
                  <div className="text-sm mt-2">加载 .class、链接、初始化</div>
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                  <div className="text-xs font-mono text-graytext">
                    Runtime Data Areas
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-graytext">
                    <span className="rounded-full border border-gray-300 dark:border-white/20 px-2 py-0.5">
                      Shared = 线程共享
                    </span>
                    <span className="rounded-full border border-gray-300 dark:border-white/20 px-2 py-0.5">
                      Private = 线程私有
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {runtimeAreas.map((area) => {
                      const isActive = area.id === activeAreaId;
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => setActiveAreaId(area.id)}
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
                    Execution Engine
                  </div>
                  <div className="text-sm mt-2">
                    解释执行、JIT 编译、GC 协同
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                  <div className="text-xs font-mono text-graytext">
                    Native Interface (JNI)
                  </div>
                  <div className="text-sm mt-2">Java 与本地方法桥接</div>
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-3 bg-background">
                  <div className="text-xs font-mono text-graytext">
                    Native Libraries
                  </div>
                  <div className="text-sm mt-2">OS / C / C++ 库调用</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
              运行时数据区细节
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-sm font-medium">{activeArea.name}</div>
                <div className="text-xs text-graytext mt-1">
                  {activeArea.stored}
                </div>
              </div>
              <div className="text-xs text-graytext space-y-2">
                <div>作用域：{activeArea.ownership}</div>
                <ul className="list-disc pl-4">
                  {activeArea.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-graytext">
                Tip：堆负责“对象”，栈负责“方法执行上下文”。
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
            JVM 执行流程（缩略版）
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

        <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
              示例：一段代码在 JVM 中去哪了？
            </div>
            <div className="p-4 grid gap-4">
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3 text-sm">
                <div className="text-xs font-mono text-graytext mb-2">
                  Example.java
                </div>
                <pre className="text-xs leading-6 text-text overflow-x-auto">
                  {`class A {
  static int count = 1;
  int x = 2;
  void foo(int y) {
    A obj = new A();
  }
}`}
                </pre>
              </div>
              <div className="grid gap-2 text-sm">
                {exampleMappings.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2"
                  >
                    <div className="flex items-center justify-between text-xs text-graytext">
                      <span>{item.label}</span>
                      <span className="rounded-full border border-gray-300 dark:border-white/20 px-2 py-0.5">
                        {item.location}
                      </span>
                    </div>
                    <div className="text-sm">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
              类加载器双亲委派
            </div>
            <div className="p-4 text-sm text-graytext space-y-3">
              <div>核心规则：先委派给父加载器，父找不到才由子加载器加载。</div>
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2">
                <div className="text-xs font-mono text-graytext mb-2">
                  Delegation Path
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-graytext">1</span>
                    Bootstrap ClassLoader（核心类库）
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-graytext">2</span>
                    Platform / Extension ClassLoader
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-graytext">3</span>
                    Application ClassLoader
                  </div>
                </div>
              </div>
              <div>作用：保证核心类库优先加载，避免类被重复或篡改。</div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
            记住这三点
          </div>
          <div className="p-4 text-sm text-graytext space-y-2">
            <div>1. JVM = 类加载 + 运行时数据区 + 执行引擎 + JNI。</div>
            <div>2. 线程私有：PC/栈/本地栈；线程共享：堆/方法区。</div>
            <div>3. 性能优化常从“对象分配与 GC”入手。</div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-300 dark:border-white/12 bg-card">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
            字节码执行动画：逐条执行与栈帧变化
          </div>
          <div className="p-4 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
                <div className="text-xs font-mono text-graytext mb-2">
                  App.java (源代码)
                </div>
                <div className="text-xs leading-6 text-text overflow-x-auto font-mono whitespace-pre">
                  {sourceLines.map((line, index) => {
                    const targetStepIndex = sourceLineToStep.get(index);
                    const isClickable = targetStepIndex !== undefined;
                    return (
                      <div
                        key={`${line}-${index}`}
                        title={line}
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
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-3">
                <div className="text-xs font-mono text-graytext mb-2">
                  javap -c (节选)
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
                <div className="text-xs font-mono text-graytext">当前指令</div>
                <div className="mt-1 font-mono text-sm">
                  {currentStep.bytecode}
                </div>
                <div className="mt-1 text-xs text-graytext">
                  {currentStep.title}
                </div>
              </div>
            ) : null}

            {!isStackFloating ? callStackContent : null}

            <div className="text-xs text-graytext">
              说明：支持正常与异常路径，逐条展示字节码的执行过程。
            </div>
          </div>
        </section>
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
            <span>调用栈</span>
            <button
              type="button"
              onClick={() => setIsStackFloating(false)}
              className="rounded-md border border-gray-300 dark:border-white/20 px-2 py-0.5 text-[10px] hover:bg-muted"
            >
              Dock
            </button>
          </div>
          <div className="h-[calc(100%-36px)] overflow-auto p-3 space-y-3">
            {controlsContent}
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-background px-3 py-2 text-sm">
              <div className="text-xs font-mono text-graytext">当前指令</div>
              <div className="mt-1 font-mono text-sm">
                {currentStep.bytecode}
              </div>
              <div className="mt-1 text-xs text-graytext">
                {currentStep.title}
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
