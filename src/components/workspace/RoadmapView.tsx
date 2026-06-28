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
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { saveRoadmapData } from "@/app/(dashboard)/actions/roadmap";

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

interface RoadmapViewProps {
  workspaceId: string;
  initialData: GanttItem[];
}

type DragMode = "move" | "resize-left" | "resize-right" | null;

// --- KONFIGURASI ENGINE KALENDER ---
const DAY_WIDTH = 32;
// Default kalender dimulai dari hari ini agar relevan dengan project nyata
const BASE_DATE = new Date();
BASE_DATE.setHours(0, 0, 0, 0);

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

export default function RoadmapView({
  workspaceId,
  initialData,
}: RoadmapViewProps) {
  // 1. STATE DIKOSONGKAN (Empty State)
  const [items, setItems] = useState<GanttItem[]>(initialData);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveRoadmapData(workspaceId, items);
    setIsSaving(false);

    if (result.error) {
      alert("Gagal menyimpan data!");
    } else {
      // (Opsional) Kamu bisa ganti alert ini dengan toast UI modern
      console.log("Tersimpan permanen!");
    }
  };
  // States Interaksi
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // States Inline Edit
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");
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

  // --- CRUD OPERATIONS ---

  // Tambah Release Baru (Parent)
  const addParentTask = () => {
    const newTask: GanttItem = {
      id: crypto.randomUUID(), // Standard industri untuk UUID di client
      name: "New Release",
      progress: 0,
      type: "parent",
      startOffset: 0, // Mulai dari hari pertama
      duration: 14, // Default durasi 2 minggu
      children: [],
    };
    setItems([...items, newTask]);
  };

  // Tambah Feature Baru (Child)
  const addChildTask = (parentId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === parentId) {
          const newChild: GanttItem = {
            id: crypto.randomUUID(),
            name: "New Feature",
            progress: 0,
            type: "child",
            startOffset: item.startOffset, // Samakan start date dengan parent
            duration: 7, // Default 1 minggu
          };
          // Otomatis expand parent ketika child ditambah
          setExpandedIds((prevSet) => new Set(prevSet).add(parentId));
          return { ...item, children: [...(item.children || []), newChild] };
        }
        return item;
      }),
    );
  };

  // Hapus Task (Parent atau Child)
  const deleteItem = (id: string, parentId?: string) => {
    setItems((prev) => {
      if (parentId) {
        // Hapus Child
        return prev.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              children: item.children?.filter((child) => child.id !== id),
            };
          }
          return item;
        });
      } else {
        // Hapus Parent (beserta semua child-nya)
        return prev.filter((item) => item.id !== id);
      }
    });
  };

  // --- KALKULASI KALENDER DINAMIS ---
  const { totalDays, calendarDates, months } = useMemo(() => {
    let maxEndDay = 0;
    const traverse = (list: GanttItem[]) => {
      list.forEach((item) => {
        const endDay = item.startOffset + item.duration;
        if (endDay > maxEndDay) maxEndDay = endDay;
        if (item.children) traverse(item.children);
      });
    };
    traverse(items);

    // Pastikan kalender memiliki minimal 60 hari meski kosong
    const calculatedTotalDays = Math.max(Math.ceil(maxEndDay) + 30, 60);
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

  // --- FOKUS OTOMATIS & UPDATE LOKAL ---
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

  // --- HANDLERS: EDIT NAMA & PROGRESS (Disembunyikan untuk keringkasan logic, sama seperti sebelumnya) ---
  const startEditingName = (id: string, currentName: string) => {
    setEditingNameId(id);
    setEditNameValue(currentName);
  };
  const saveEditingName = () => {
    if (editingNameId && editNameValue.trim() !== "")
      updateItem(editingNameId, { name: editNameValue.trim() });
    setEditingNameId(null);
  };
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEditingName();
    if (e.key === "Escape") setEditingNameId(null);
  };

  const startEditingProgress = (id: string, currentProgress: number) => {
    setEditingProgressId(id);
    setEditProgressValue(currentProgress.toString());
  };
  const saveEditingProgress = () => {
    if (editingProgressId) {
      let numValue = parseInt(editProgressValue, 10);
      if (isNaN(numValue) || numValue < 0) numValue = 0;
      if (numValue > 100) numValue = 100;
      updateItem(editingProgressId, { progress: numValue });
    }
    setEditingProgressId(null);
  };
  const handleProgressKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEditingProgress();
    if (e.key === "Escape") setEditingProgressId(null);
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
    dragStartRef.current = { x: e.clientX, offset: startOffset, duration };
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
              Workspace Roadmap
              <button
                onClick={() => setIsStarred(!isStarred)}
                className={`transition-colors ${isStarred ? "text-yellow-500" : "text-neutral-600 hover:text-neutral-400"}`}
              ></button>
            </h1>
            <div className="flex items-center gap-3">
              {/* TOMBOL TAMBAH RELEASE UTAMA */}
              <button
                onClick={addParentTask}
                className="px-4 py-1.5 flex items-center gap-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 border border-emerald-500/20 transition rounded text-xs font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Release
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 flex items-center gap-2 bg-neutral-100 text-neutral-950 hover:bg-neutral-200 transition rounded text-xs font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden bg-[#09090b]">
          {/* LEFT PANEL: Data Table */}
          <div className="w-[350px] flex-shrink-0 border-r border-neutral-900 flex flex-col bg-[#09090b] z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
            <div className="flex text-[10px] text-neutral-500 border-b border-neutral-900 uppercase font-bold tracking-wider bg-neutral-950/40">
              <div className="flex-1 p-3 pl-6">Release / Features</div>
              <div className="w-[80px] p-3 text-right pr-6">Progress</div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-neutral-900/40 custom-scrollbar pb-24">
              {/* EMPTY STATE UI */}
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                  <p className="text-sm font-medium text-neutral-300">
                    No releases yet
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Click "Add Release" at the top to start planning.
                  </p>
                </div>
              )}

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
                        {editingNameId === item.id ? (
                          <input
                            ref={nameInputRef}
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            onBlur={saveEditingName}
                            onKeyDown={handleNameKeyDown}
                            className="flex-1 bg-neutral-800 text-white text-xs px-2 py-0.5 rounded border border-neutral-600 focus:outline-none"
                          />
                        ) : (
                          <span
                            className="text-neutral-200 text-xs font-medium truncate cursor-text hover:text-white flex-1 pl-1"
                            onDoubleClick={() =>
                              startEditingName(item.id, item.name)
                            }
                          >
                            {item.name}
                          </span>
                        )}

                        {/* HOVER ACTIONS (Add Child & Delete) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-2 gap-1">
                          <button
                            onClick={() => addChildTask(item.id)}
                            title="Add Feature"
                            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-emerald-400"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            title="Delete Release"
                            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="w-[80px] px-4 text-right pr-6 text-xs flex items-center justify-end gap-1.5 font-mono text-neutral-400">
                        {item.progress > 0 && item.progress < 100 ? (
                          <Circle className="w-3 h-3 text-blue-500 fill-blue-500/20" />
                        ) : item.progress === 100 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Circle className="w-3 h-3 text-neutral-700" />
                        )}
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
                          className="flex h-[40px] items-center bg-neutral-950/20 hover:bg-neutral-900/30 transition-colors group"
                        >
                          <div className="flex-1 px-4 pl-12 flex items-center">
                            {editingNameId === child.id ? (
                              <input
                                ref={nameInputRef}
                                value={editNameValue}
                                onChange={(e) =>
                                  setEditNameValue(e.target.value)
                                }
                                onBlur={saveEditingName}
                                onKeyDown={handleNameKeyDown}
                                className="flex-1 bg-neutral-800 text-white text-xs px-2 py-0.5 rounded border border-neutral-600 focus:outline-none"
                              />
                            ) : (
                              <div
                                className="text-xs text-neutral-400 truncate cursor-text hover:text-neutral-200 flex-1 relative flex items-center justify-between"
                                onDoubleClick={() =>
                                  startEditingName(child.id, child.name)
                                }
                              >
                                <div className="flex items-center flex-1">
                                  <div className="absolute -left-3 top-1/2 w-2 h-px bg-neutral-800"></div>
                                  <div className="absolute -left-3 -top-6 bottom-1/2 w-px bg-neutral-800"></div>
                                  {child.name}
                                </div>
                              </div>
                            )}

                            {/* HOVER ACTIONS (Delete Child) */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-2">
                              <button
                                onClick={() => deleteItem(child.id, item.id)}
                                title="Delete Feature"
                                className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="w-[80px] px-4 text-right pr-6 text-xs flex items-center justify-end gap-1.5 font-mono text-neutral-500">
                            {child.progress > 0 && child.progress < 100 ? (
                              <Circle className="w-3 h-3 text-blue-500 fill-blue-500/20" />
                            ) : child.progress === 100 ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Circle className="w-3 h-3 text-neutral-700" />
                            )}
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
                            className={`absolute h-2.5 bg-neutral-800 border border-neutral-700 rounded-md flex items-center transition-all duration-300 ease-out overflow-hidden ${draggingId === item.id && dragMode === "move" ? "shadow-[0_0_12px_rgba(255,255,255,0.15)] z-20 bg-neutral-700 border-neutral-400 !transition-none" : "hover:bg-neutral-700/50 hover:border-neutral-500"}`}
                            style={{
                              left: item.startOffset * DAY_WIDTH,
                              width: item.duration * DAY_WIDTH,
                            }}
                          >
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
                                className={`absolute h-1.5 bg-neutral-900 border border-neutral-700 rounded-full transition-all duration-300 ease-out overflow-hidden ${draggingId === child.id && dragMode === "move" ? "shadow-[0_0_10px_rgba(255,255,255,0.1)] z-20 bg-neutral-600 border-neutral-300 !transition-none" : "hover:bg-neutral-800 hover:border-neutral-400"}`}
                                style={{
                                  left: child.startOffset * DAY_WIDTH,
                                  width: child.duration * DAY_WIDTH,
                                }}
                              >
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
