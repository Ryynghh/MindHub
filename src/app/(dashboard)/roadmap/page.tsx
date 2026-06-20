"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";
import {
  Share,
  Layers,
  CheckCircle2,
  Circle,
  HelpCircle,
  Star,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// --- TYPE DEFINITIONS ---
interface GanttItem {
  id: string;
  name: string;
  progress: number;
  type: "parent" | "child";
  startOffset: number;
  duration: number;
  children?: GanttItem[];
}

type DragMode = "move" | "resize-left" | "resize-right" | null;

// --- KONFIGURASI ENGINE KALENDER ---
const DAY_WIDTH = 32;
const BASE_DATE = new Date("2024-05-01T00:00:00");
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// --- MOCK DATA ---
const mockData: GanttItem[] = [
  {
    id: "1",
    name: "Month 1 - Web Foundations",
    progress: 0,
    type: "parent",
    startOffset: 2,
    duration: 25,
  },
  {
    id: "2",
    name: "Example release 1",
    progress: 25,
    type: "parent",
    startOffset: 10,
    duration: 45,
    children: [
      {
        id: "2-1",
        name: "PROD-1 Example feature 1",
        progress: 60,
        type: "child",
        startOffset: 10,
        duration: 20,
      },
      {
        id: "2-2",
        name: "PROD-2 Example feature 2",
        progress: 10,
        type: "child",
        startOffset: 15,
        duration: 25,
      },
      {
        id: "2-3",
        name: "PROD-3 Example feature 3",
        progress: 0,
        type: "child",
        startOffset: 25,
        duration: 27,
      },
      {
        id: "2-4",
        name: "PROD-4 Example feature 4",
        progress: 0,
        type: "child",
        startOffset: 35,
        duration: 15,
      },
    ],
  },
  {
    id: "3",
    name: "Example release 2",
    progress: 100,
    type: "parent",
    startOffset: 50,
    duration: 30,
  },
];

export default function GanttDashboard() {
  const [items, setItems] = useState<GanttItem[]>(mockData);

  // States Interaksi
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(
      mockData.filter((item) => item.children?.length).map((item) => item.id),
    ),
  );

  // States Inline Edit untuk Nama
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");

  // States Inline Edit untuk Progress
  const [editingProgressId, setEditingProgressId] = useState<string | null>(
    null,
  );
  const [editProgressValue, setEditProgressValue] = useState<string>("");

  const dragStartRef = useRef<{
    x: number;
    offset: number;
    duration: number;
  } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const progressInputRef = useRef<HTMLInputElement>(null);

  // --- KALKULASI KALENDER ---
  const { totalDays, calendarDates, months } = useMemo(() => {
    let maxEndDay = 60;
    const traverse = (list: GanttItem[]) => {
      list.forEach((item) => {
        const endDay = item.startOffset + item.duration;
        if (endDay > maxEndDay) maxEndDay = endDay;
        if (item.children) traverse(item.children);
      });
    };
    traverse(items);

    const calculatedTotalDays = Math.ceil(maxEndDay) + 30;
    const dates = Array.from({ length: calculatedTotalDays }).map((_, i) => {
      const d = new Date(BASE_DATE);
      d.setDate(d.getDate() + i);
      return d;
    });

    const groupedMonths: { label: string; count: number }[] = [];
    let currentMonth = dates[0].getMonth();
    let currentYear = dates[0].getFullYear();
    let count = 0;

    dates.forEach((d) => {
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        count++;
      } else {
        groupedMonths.push({
          label: `${MONTH_NAMES[currentMonth]} '${currentYear.toString().slice(2)}`,
          count,
        });
        currentMonth = d.getMonth();
        currentYear = d.getFullYear();
        count = 1;
      }
    });
    if (count > 0)
      groupedMonths.push({
        label: `${MONTH_NAMES[currentMonth]} '${currentYear.toString().slice(2)}`,
        count,
      });

    return {
      totalDays: calculatedTotalDays,
      calendarDates: dates,
      months: groupedMonths,
    };
  }, [items]);

  // --- FOKUS OTOMATIS INPUT ---
  useEffect(() => {
    if (editingNameId && nameInputRef.current) nameInputRef.current.focus();
  }, [editingNameId]);
  useEffect(() => {
    if (editingProgressId && progressInputRef.current)
      progressInputRef.current.focus();
  }, [editingProgressId]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const updateItem = useCallback((id: string, updates: Partial<GanttItem>) => {
    setItems((prevItems) => {
      const updateRecursive = (list: GanttItem[]): GanttItem[] => {
        return list.map((item) => {
          if (item.id === id) return { ...item, ...updates };
          if (item.children)
            return { ...item, children: updateRecursive(item.children) };
          return item;
        });
      };
      return updateRecursive(prevItems);
    });
  }, []);

  // --- HANDLERS: EDIT NAMA ---
  const startEditingName = (id: string, currentName: string) => {
    setEditingNameId(id);
    setEditNameValue(currentName);
  };
  const saveEditingName = () => {
    if (editingNameId && editNameValue.trim() !== "")
      updateItem(editingNameId, { name: editNameValue.trim() });
    setEditingNameId(null);
  };
  const cancelEditingName = () => {
    setEditingNameId(null);
    setEditNameValue("");
  };
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveEditingName();
    if (e.key === "Escape") cancelEditingName();
  };

  // --- HANDLERS: EDIT PROGRESS ---
  const startEditingProgress = (id: string, currentProgress: number) => {
    setEditingProgressId(id);
    setEditProgressValue(currentProgress.toString());
  };
  const saveEditingProgress = () => {
    if (editingProgressId) {
      // Validasi agar nilai mentok di 0 - 100
      let numValue = parseInt(editProgressValue, 10);
      if (isNaN(numValue)) numValue = 0;
      if (numValue < 0) numValue = 0;
      if (numValue > 100) numValue = 100;
      updateItem(editingProgressId, { progress: numValue });
    }
    setEditingProgressId(null);
  };
  const cancelEditingProgress = () => {
    setEditingProgressId(null);
    setEditProgressValue("");
  };
  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveEditingProgress();
    if (e.key === "Escape") cancelEditingProgress();
  };

  // --- HANDLERS: DRAG ---
  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    startOffset: number,
    duration: number,
    mode: DragMode,
  ) => {
    e.stopPropagation();
    if (!timelineRef.current) return;
    setDraggingId(id);
    setDragMode(mode);
    dragStartRef.current = {
      x: e.clientX,
      offset: startOffset,
      duration: duration,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !dragStartRef.current || !dragMode) return;
      const { x, offset, duration } = dragStartRef.current;
      const deltaX = e.clientX - x;
      const deltaDays = deltaX / DAY_WIDTH;

      if (dragMode === "move") {
        let newOffset = offset + deltaDays;
        if (newOffset < 0) newOffset = 0;
        updateItem(draggingId, { startOffset: newOffset });
      } else if (dragMode === "resize-left") {
        let newOffset = offset + deltaDays;
        let newDuration = duration - deltaDays;
        if (newOffset < 0) {
          newDuration = duration + offset;
          newOffset = 0;
        }
        if (newDuration < 1) {
          newDuration = 1;
          newOffset = offset + duration - 1;
        }
        updateItem(draggingId, {
          startOffset: newOffset,
          duration: newDuration,
        });
      } else if (dragMode === "resize-right") {
        let newDuration = duration + deltaDays;
        if (newDuration < 1) newDuration = 1;
        updateItem(draggingId, { duration: newDuration });
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setDragMode(null);
      dragStartRef.current = null;
    };

    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, dragMode, updateItem]);

  return (
    <div
      className={`min-h-screen bg-[#09090b] text-neutral-300 font-sans antialiased flex flex-col overflow-hidden ${draggingId ? (dragMode === "move" ? "cursor-grabbing select-none" : "cursor-ew-resize select-none") : ""}`}
    >
      <FloatingHeader />

      <main className="flex-1 flex flex-col mt-7 overflow-hidden animate-in fade-in duration-300">
        <div className="px-6 py-4 flex flex-col gap-4 border-b border-neutral-900 bg-[#09090b]">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-neutral-100 flex items-center gap-3 tracking-tight">
              Make Your Own Roadmap
              <button
                onClick={() => setIsStarred(!isStarred)}
                className={`transition-colors ${isStarred ? "text-yellow-500" : "text-neutral-600 hover:text-neutral-400"}`}
              ></button>
            </h1>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 bg-neutral-100 text-neutral-950 hover:bg-neutral-200 transition rounded text-xs font-semibold shadow-sm">
                Save changes
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden bg-[#09090b]">
          {/* LEFT PANEL: Data Table */}
          <div className="w-[350px] flex-shrink-0 border-r border-neutral-900 flex flex-col bg-[#09090b] z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
            <div className="flex text-[10px] text-neutral-500 border-b border-neutral-900 uppercase font-bold tracking-wider bg-neutral-950/40">
              <div className="flex-1 p-3 pl-6">Release</div>
              <div className="w-[80px] p-3 text-right pr-6">Progress</div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-neutral-900/40 hide-scrollbar">
              {items.map((item) => {
                const isExpanded = expandedIds.has(item.id);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <React.Fragment key={item.id}>
                    {/* PARENT ROW */}
                    <div className="flex h-[40px] items-center hover:bg-neutral-900/40 transition-colors group bg-[#09090b]">
                      <div className="flex-1 px-4 pl-4 flex items-center gap-1">
                        <div
                          className="w-5 h-5 flex items-center justify-center cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors rounded hover:bg-neutral-800"
                          onClick={() => hasChildren && toggleExpand(item.id)}
                        >
                          {hasChildren ? (
                            isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )
                          ) : (
                            <Circle className="w-1.5 h-1.5 fill-neutral-700 text-transparent" />
                          )}
                        </div>
                        {/* Nama Parent */}
                        {editingNameId === item.id ? (
                          <input
                            ref={nameInputRef}
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onBlur={saveEditingName}
                            onKeyDown={handleNameKeyDown}
                            className="flex-1 bg-neutral-800 text-white text-xs px-2 py-0.5 rounded border border-neutral-600 focus:outline-none focus:border-neutral-400"
                          />
                        ) : (
                          <span
                            className="text-neutral-200 text-xs font-medium truncate cursor-text hover:text-white flex-1 pl-1"
                            onDoubleClick={() =>
                              startEditingName(item.id, item.name)
                            }
                            title="Double click to edit"
                          >
                            {item.name}
                          </span>
                        )}
                      </div>
                      <div className="w-[80px] px-4 text-right pr-6 text-xs flex items-center justify-end gap-1.5 font-mono text-neutral-400">
                        {item.progress > 0 && item.progress < 100 ? (
                          <Circle className="w-3 h-3 text-blue-500 fill-blue-500/20" />
                        ) : item.progress === 100 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Circle className="w-3 h-3 text-neutral-700" />
                        )}
                        {/* Progress Parent */}
                        {editingProgressId === item.id ? (
                          <div className="flex items-center w-12">
                            <input
                              ref={progressInputRef}
                              type="number"
                              min="0"
                              max="100"
                              value={editProgressValue}
                              onChange={(e) =>
                                setEditProgressValue(e.target.value)
                              }
                              onBlur={saveEditingProgress}
                              onKeyDown={handleProgressKeyDown}
                              className="w-full bg-neutral-800 text-white text-xs px-1 py-0.5 rounded border border-neutral-600 focus:outline-none text-right"
                            />
                            <span className="ml-0.5">%</span>
                          </div>
                        ) : (
                          <span
                            className="cursor-text hover:text-white min-w-[20px]"
                            onDoubleClick={() =>
                              startEditingProgress(item.id, item.progress)
                            }
                            title="Double click to edit"
                          >
                            {item.progress}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CHILD ROWS */}
                    {isExpanded &&
                      item.children?.map((child) => (
                        <div
                          key={child.id}
                          className="flex h-[40px] items-center bg-neutral-950/20 hover:bg-neutral-900/30 transition-colors"
                        >
                          <div className="flex-1 px-4 pl-12 flex items-center">
                            {/* Nama Child */}
                            {editingNameId === child.id ? (
                              <input
                                ref={nameInputRef}
                                value={editNameValue}
                                onChange={(e) =>
                                  setEditNameValue(e.target.value)
                                }
                                onBlur={saveEditingName}
                                onKeyDown={handleNameKeyDown}
                                className="flex-1 bg-neutral-800 text-white text-xs px-2 py-0.5 rounded border border-neutral-600 focus:outline-none focus:border-neutral-400"
                              />
                            ) : (
                              <div
                                className="text-xs text-neutral-400 truncate cursor-text hover:text-neutral-200 flex-1 relative"
                                onDoubleClick={() =>
                                  startEditingName(child.id, child.name)
                                }
                                title="Double click to edit"
                              >
                                <div className="absolute -left-3 top-1/2 w-2 h-px bg-neutral-800"></div>
                                <div className="absolute -left-3 -top-6 bottom-1/2 w-px bg-neutral-800"></div>
                                {child.name}
                              </div>
                            )}
                          </div>
                          <div className="w-[80px] px-4 text-right pr-6 text-xs flex items-center justify-end gap-1.5 font-mono text-neutral-500">
                            {child.progress > 0 && child.progress < 100 ? (
                              <Circle className="w-3 h-3 text-blue-500 fill-blue-500/20" />
                            ) : child.progress === 100 ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Circle className="w-3 h-3 text-neutral-700" />
                            )}
                            {/* Progress Child */}
                            {editingProgressId === child.id ? (
                              <div className="flex items-center w-12">
                                <input
                                  ref={progressInputRef}
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={editProgressValue}
                                  onChange={(e) =>
                                    setEditProgressValue(e.target.value)
                                  }
                                  onBlur={saveEditingProgress}
                                  onKeyDown={handleProgressKeyDown}
                                  className="w-full bg-neutral-800 text-white text-xs px-1 py-0.5 rounded border border-neutral-600 focus:outline-none text-right"
                                />
                                <span className="ml-0.5 text-neutral-400">
                                  %
                                </span>
                              </div>
                            ) : (
                              <span
                                className="cursor-text hover:text-neutral-200 min-w-[20px]"
                                onDoubleClick={() =>
                                  startEditingProgress(child.id, child.progress)
                                }
                                title="Double click to edit"
                              >
                                {child.progress}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Gantt Timeline */}
          <div className="flex-1 overflow-auto bg-neutral-950/20 relative border-t border-neutral-900 custom-scrollbar">
            <div
              style={{ width: totalDays * DAY_WIDTH }}
              className="min-h-full"
            >
              <div className="border-b border-neutral-900 sticky top-0 bg-[#09090b] z-20 shadow-sm">
                <div className="flex text-[11px] text-neutral-400 font-medium border-b border-neutral-900 bg-neutral-950/40">
                  {months.map((m, i) => (
                    <div
                      key={i}
                      style={{ width: m.count * DAY_WIDTH }}
                      className="shrink-0 p-2 pl-3 border-r border-neutral-900/60 overflow-hidden"
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
                <div className="flex text-[9px] text-neutral-600 font-mono bg-neutral-950/20">
                  {calendarDates.map((d, i) => (
                    <div
                      key={i}
                      style={{ width: DAY_WIDTH }}
                      className="shrink-0 border-r border-neutral-900/40 text-center py-1.5 flex flex-col items-center"
                    >
                      <span
                        className={
                          d.getDay() === 0 || d.getDay() === 6
                            ? "text-red-900/80 font-bold"
                            : ""
                        }
                      >
                        {d.getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={timelineRef}
                className="relative bg-neutral-950/10"
                style={{ height: "calc(100vh - 240px)" }}
              >
                <div className="absolute inset-0 flex pointer-events-none">
                  {calendarDates.map((d, i) => (
                    <div
                      key={i}
                      style={{ width: DAY_WIDTH }}
                      className={`shrink-0 border-r border-neutral-900/30 ${d.getDay() === 0 || d.getDay() === 6 ? "bg-red-950/5" : "border-dashed"}`}
                    ></div>
                  ))}
                </div>

                <div className="absolute inset-0 py-0">
                  {items.map((item) => {
                    const isExpanded = expandedIds.has(item.id);
                    return (
                      <React.Fragment key={item.id}>
                        {/* PARENT BAR */}
                        <div className="h-[40px] flex items-center relative border-b border-neutral-900/20 group hover:bg-neutral-900/10 transition-colors">
                          <div
                            className={`absolute h-2.5 bg-neutral-800 border border-neutral-700 rounded-md flex items-center transition-all duration-300 ease-out overflow-hidden ${
                              draggingId === item.id && dragMode === "move"
                                ? "shadow-[0_0_12px_rgba(255,255,255,0.15)] z-20 bg-neutral-700 border-neutral-400 !transition-none"
                                : "hover:bg-neutral-700/50 hover:border-neutral-500"
                            }`}
                            style={{
                              left: item.startOffset * DAY_WIDTH,
                              width: item.duration * DAY_WIDTH,
                            }}
                          >
                            {/* INDIKATOR PROGRESS PUTIH DI DALAM BAR */}
                            {item.progress > 0 && (
                              <div
                                className={`h-full bg-neutral-200 pointer-events-none transition-all duration-500 ease-out`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            )}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 z-10 rounded-l-md"
                              onMouseDown={(e) =>
                                handleMouseDown(
                                  e,
                                  item.id,
                                  item.startOffset,
                                  item.duration,
                                  "resize-left",
                                )
                              }
                            />
                            <div
                              className="absolute left-2 right-2 top-0 bottom-0 cursor-grab active:cursor-grabbing z-0"
                              onMouseDown={(e) =>
                                handleMouseDown(
                                  e,
                                  item.id,
                                  item.startOffset,
                                  item.duration,
                                  "move",
                                )
                              }
                            />
                            <div
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 z-10 rounded-r-md"
                              onMouseDown={(e) =>
                                handleMouseDown(
                                  e,
                                  item.id,
                                  item.startOffset,
                                  item.duration,
                                  "resize-right",
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* CHILD BARS */}
                        {isExpanded &&
                          item.children?.map((child) => (
                            <div
                              key={child.id}
                              className="h-[40px] flex items-center relative border-b border-neutral-900/20 bg-neutral-950/5 hover:bg-neutral-900/10 transition-colors"
                            >
                              <div
                                className={`absolute h-1.5 bg-neutral-900 border border-neutral-700 rounded-full transition-all duration-300 ease-out overflow-hidden ${
                                  draggingId === child.id && dragMode === "move"
                                    ? "shadow-[0_0_10px_rgba(255,255,255,0.1)] z-20 bg-neutral-600 border-neutral-300 !transition-none"
                                    : "hover:bg-neutral-800 hover:border-neutral-400"
                                }`}
                                style={{
                                  left: child.startOffset * DAY_WIDTH,
                                  width: child.duration * DAY_WIDTH,
                                }}
                              >
                                {/* INDIKATOR PROGRESS PUTIH DI DALAM CHILD BAR */}
                                {child.progress > 0 && (
                                  <div
                                    className={`h-full bg-neutral-300 pointer-events-none transition-all duration-500 ease-out`}
                                    style={{ width: `${child.progress}%` }}
                                  ></div>
                                )}
                                <div
                                  className="absolute -left-1 -top-2 -bottom-2 w-3 cursor-ew-resize z-10 rounded-l-full"
                                  onMouseDown={(e) =>
                                    handleMouseDown(
                                      e,
                                      child.id,
                                      child.startOffset,
                                      child.duration,
                                      "resize-left",
                                    )
                                  }
                                />
                                <div
                                  className="absolute left-2 right-2 -top-2 -bottom-2 cursor-grab active:cursor-grabbing z-0"
                                  onMouseDown={(e) =>
                                    handleMouseDown(
                                      e,
                                      child.id,
                                      child.startOffset,
                                      child.duration,
                                      "move",
                                    )
                                  }
                                />
                                <div
                                  className="absolute -right-1 -top-2 -bottom-2 w-3 cursor-ew-resize z-10 rounded-r-full"
                                  onMouseDown={(e) =>
                                    handleMouseDown(
                                      e,
                                      child.id,
                                      child.startOffset,
                                      child.duration,
                                      "resize-right",
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
