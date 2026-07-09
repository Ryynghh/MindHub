"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ArrowLeft,
  CalendarPlus,
  BookOpenCheck,
} from "lucide-react";
import { toast } from "sonner";
import { saveRoadmapData } from "@/app/(dashboard)/actions/roadmap";
import { WorkspaceMember, MembersGroup } from "./members-group";
import TaskMaterialPanel from "./TaskMaterialPanel";

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
  members?: WorkspaceMember[];
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
  members = [],
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
  // --- GOOGLE CALENDAR EXPORT ---
  const generateICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const exportToCalendar = () => {
    if (items.length === 0) {
      toast.error("No curriculum to export. Add some curriculum first!");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let events = '';
    const allTasks: { name: string; startOffset: number; duration: number }[] = [];

    // Flatten all parent + child items
    items.forEach((item) => {
      allTasks.push({ name: item.name, startOffset: item.startOffset, duration: item.duration });
      if (item.children) {
        item.children.forEach((child) => {
          allTasks.push({ name: child.name, startOffset: child.startOffset, duration: child.duration });
        });
      }
    });

    allTasks.forEach((task) => {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + Math.round(task.startOffset));
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.round(task.duration));

      events += `BEGIN:VEVENT\n`;
      events += `DTSTART;VALUE=DATE:${startDate.toISOString().split('T')[0].replace(/-/g, '')}\n`;
      events += `DTEND;VALUE=DATE:${endDate.toISOString().split('T')[0].replace(/-/g, '')}\n`;
      events += `SUMMARY:${task.name}\n`;
      events += `DESCRIPTION:MindHub Roadmap Task\n`;
      events += `STATUS:CONFIRMED\n`;
      events += `UID:${crypto.randomUUID()}@mindhub\n`;
      events += `END:VEVENT\n`;
    });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MindHub//Roadmap//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      events.trim(),
      'END:VCALENDAR'
    ].join('\n');

    // Download file .ics
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindhub-roadmap.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${allTasks.length} tasks exported! Open the downloaded .ics file to import into Google Calendar.`);
  };

  // States Interaksi
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // States Material Panel
  const [materialPanelOpen, setMaterialPanelOpen] = useState(false);
  const [selectedTaskName, setSelectedTaskName] = useState("");
  const [selectedParentName, setSelectedParentName] = useState<string | undefined>(undefined);

  const openMaterialPanel = (taskName: string, parentName?: string) => {
    setSelectedTaskName(taskName);
    setSelectedParentName(parentName);
    setMaterialPanelOpen(true);
  };

  // States Inline Edit
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");

  // States Progress Popover
  const [progressPopoverId, setProgressPopoverId] = useState<string | null>(null);
  const [progressPopoverPos, setProgressPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const dragStartRef = useRef<{
    x: number;
    offset: number;
    duration: number;
  } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // --- CRUD OPERATIONS ---

  // Tambah Release Baru (Parent)
  const addParentTask = () => {
    const newTask: GanttItem = {
      id: crypto.randomUUID(), // Standard industri untuk UUID di client
      name: "New Curriculum",
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
            name: "New Topic",
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

  // Close progress popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (progressPopoverId) {
        const popover = document.getElementById('progress-popover');
        if (popover && !popover.contains(e.target as Node)) {
          setProgressPopoverId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [progressPopoverId]);

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

  // --- PROGRESS POPOVER HANDLERS ---
  const openProgressPopover = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setProgressPopoverPos({
      top: rect.bottom + 6,
      left: Math.min(rect.left - 60, window.innerWidth - 260),
    });
    setProgressPopoverId(id);
  };

  const setProgress = (id: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    updateItem(id, { progress: clamped });
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return { ring: 'text-emerald-500', bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/15' };
    if (progress >= 60) return { ring: 'text-blue-500', bg: 'bg-blue-500', bgLight: 'bg-blue-500/15' };
    if (progress > 0) return { ring: 'text-amber-500', bg: 'bg-amber-500', bgLight: 'bg-amber-500/15' };
    return { ring: 'text-neutral-700', bg: 'bg-neutral-700', bgLight: 'bg-neutral-800' };
  };

  // Helper to find an item's progress by id
  const findItemProgress = (id: string): number => {
    for (const item of items) {
      if (item.id === id) return item.progress;
      if (item.children) {
        for (const child of item.children) {
          if (child.id === id) return child.progress;
        }
      }
    }
    return 0;
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
            <div className="flex items-center gap-4">
              <Link
                href="/workspace"
                title="Back to Workspace List"
                className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-400 hover:text-neutral-200 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-semibold text-neutral-100 flex items-center gap-3 tracking-tight">
                Learning Journey
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`transition-colors ${isStarred ? "text-yellow-500" : "text-neutral-600 hover:text-neutral-400"}`}
                ></button>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <MembersGroup members={members} workspaceId={workspaceId} />
              {/* TOMBOL TAMBAH RELEASE UTAMA */}
              <button
                onClick={addParentTask}
                className="px-4 py-1.5 flex items-center gap-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 border border-emerald-500/20 transition rounded text-xs font-semibold shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Curriculum
              </button>
              <button
                onClick={exportToCalendar}
                title="Export tasks to Google Calendar"
                className="px-4 py-1.5 flex items-center gap-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 transition rounded text-xs font-semibold shadow-sm"
              >
                <CalendarPlus className="w-4 h-4" /> Sync to Calendar
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
          <div className="w-[400px] flex-shrink-0 border-r border-neutral-900 flex flex-col bg-[#09090b] z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
            <div className="flex text-[10px] text-neutral-500 border-b border-neutral-900 uppercase font-bold tracking-wider bg-neutral-950/40">
              <div className="flex-1 p-3 pl-6">Curriculum / Topics</div>
              <div className="w-[120px] p-3 text-center">Mastery Level</div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-neutral-900/40 custom-scrollbar pb-24">
              {/* EMPTY STATE UI */}
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                  <p className="text-sm font-medium text-neutral-300">
                    No curriculum yet
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Click "Add Curriculum" at the top to start planning.
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
                      <div className="flex-1 min-w-0 px-4 pl-4 flex items-center gap-1">
                        <div
                          className="w-5 h-5 flex items-center justify-center cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors rounded hover:bg-neutral-800 shrink-0"
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
                        
                        <div className="flex-1 min-w-0 pr-2">
                          {editingNameId === item.id ? (
                            <input
                              ref={nameInputRef}
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              onBlur={saveEditingName}
                              onKeyDown={handleNameKeyDown}
                              className="w-full bg-neutral-800 text-white text-xs px-2 py-0.5 rounded border border-neutral-600 focus:outline-none"
                            />
                          ) : (
                            <span
                              className="text-neutral-200 text-xs font-medium truncate cursor-text hover:text-white block w-full pl-1"
                              onDoubleClick={() =>
                                startEditingName(item.id, item.name)
                              }
                            >
                              {item.name}
                            </span>
                          )}
                        </div>

                        {/* HOVER ACTIONS (Material, Add Child & Delete) */}
                        <div className="w-[76px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                          <button
                            onClick={() => openMaterialPanel(item.name)}
                            title="Lihat Materi"
                            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-violet-400"
                          >
                            <BookOpenCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => addChildTask(item.id)}
                            title="Add Topic"
                            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-emerald-400"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            title="Delete Curriculum"
                            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* PROGRESS CELL - Clickable Ring */}
                      <div className="w-[120px] shrink-0 px-4 flex items-center gap-2.5">
                        <button
                          onClick={(e) => openProgressPopover(e, item.id)}
                          className={`relative w-6 h-6 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                            progressPopoverId === item.id ? 'ring-2 ring-offset-1 ring-offset-[#09090b] ring-neutral-500' : ''
                          }`}
                          title="Update mastery level"
                        >
                          <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-800" />
                            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                              className={`${getProgressColor(item.progress).ring} transition-all duration-500`}
                              strokeDasharray={`${2 * Math.PI * 9}`}
                              strokeDashoffset={`${2 * Math.PI * 9 * (1 - item.progress / 100)}`}
                            />
                          </svg>
                          {item.progress === 100 && (
                            <CheckCircle2 className="w-2.5 h-2.5 absolute text-emerald-500" />
                          )}
                        </button>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className={`text-[11px] font-semibold tabular-nums leading-none ${
                            item.progress === 100 ? 'text-emerald-400' : item.progress > 0 ? 'text-neutral-300' : 'text-neutral-600'
                          }`}>
                            {item.progress}%
                          </span>
                          <div className="w-full h-[3px] rounded-full bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.progress).bg}`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CHILD ROWS */}
                    {isExpanded &&
                      item.children?.map((child) => (
                        <div
                          key={child.id}
                          className="flex h-[40px] items-center bg-neutral-950/20 hover:bg-neutral-900/30 transition-colors group"
                        >
                          <div className="flex-1 min-w-0 px-4 pl-12 flex items-center">
                            <div className="flex-1 min-w-0 pr-2">
                              {editingNameId === child.id ? (
                                <input
                                  ref={nameInputRef}
                                  value={editNameValue}
                                  onChange={(e) =>
                                    setEditNameValue(e.target.value)
                                  }
                                  onBlur={saveEditingName}
                                  onKeyDown={handleNameKeyDown}
                                  className="w-full bg-neutral-800 text-white text-xs px-2 py-0.5 rounded border border-neutral-600 focus:outline-none"
                                />
                              ) : (
                                <div
                                  className="text-xs text-neutral-400 truncate cursor-text hover:text-neutral-200 w-full relative flex items-center"
                                  onDoubleClick={() =>
                                    startEditingName(child.id, child.name)
                                  }
                                >
                                  <div className="absolute -left-3 top-1/2 w-2 h-px bg-neutral-800"></div>
                                  <div className="absolute -left-3 -top-6 bottom-1/2 w-px bg-neutral-800"></div>
                                  {child.name}
                                </div>
                              )}
                            </div>

                            {/* HOVER ACTIONS (Material & Delete Child) */}
                            <div className="w-[52px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                              <button
                                onClick={() => openMaterialPanel(child.name, item.name)}
                                title="Lihat Materi"
                                className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-violet-400"
                              >
                                <BookOpenCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteItem(child.id, item.id)}
                                title="Delete Topic"
                                className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {/* PROGRESS CELL - Clickable Ring (Child) */}
                          <div className="w-[120px] shrink-0 px-4 flex items-center gap-2.5">
                            <button
                              onClick={(e) => openProgressPopover(e, child.id)}
                              className={`relative w-6 h-6 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                                progressPopoverId === child.id ? 'ring-2 ring-offset-1 ring-offset-[#09090b] ring-neutral-500' : ''
                              }`}
                              title="Update mastery level"
                            >
                              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-neutral-800" />
                                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                  className={`${getProgressColor(child.progress).ring} transition-all duration-500`}
                                  strokeDasharray={`${2 * Math.PI * 9}`}
                                  strokeDashoffset={`${2 * Math.PI * 9 * (1 - child.progress / 100)}`}
                                />
                              </svg>
                              {child.progress === 100 && (
                                <CheckCircle2 className="w-2.5 h-2.5 absolute text-emerald-500" />
                              )}
                            </button>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <span className={`text-[11px] font-semibold tabular-nums leading-none ${
                                child.progress === 100 ? 'text-emerald-400' : child.progress > 0 ? 'text-neutral-400' : 'text-neutral-600'
                              }`}>
                                {child.progress}%
                              </span>
                              <div className="w-full h-[3px] rounded-full bg-neutral-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(child.progress).bg}`}
                                  style={{ width: `${child.progress}%` }}
                                />
                              </div>
                            </div>
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

      {/* Progress Popover (Portal-style, fixed position) */}
      {progressPopoverId && (
        <div
          id="progress-popover"
          className="fixed z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: progressPopoverPos.top, left: progressPopoverPos.left }}
        >
          <div className="bg-[#141417] border border-neutral-800 rounded-xl shadow-2xl shadow-black/50 p-4 w-[240px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Progress</span>
              <span className={`text-lg font-bold tabular-nums ${
                findItemProgress(progressPopoverId) === 100 ? 'text-emerald-400' :
                findItemProgress(progressPopoverId) >= 60 ? 'text-blue-400' :
                findItemProgress(progressPopoverId) > 0 ? 'text-amber-400' : 'text-neutral-500'
              }`}>
                {findItemProgress(progressPopoverId)}%
              </span>
            </div>

            {/* Slider */}
            <div className="relative mb-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={findItemProgress(progressPopoverId)}
                onChange={(e) => setProgress(progressPopoverId, parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-neutral-800
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-neutral-400
                  [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-neutral-400"
                style={{
                  background: `linear-gradient(to right, ${findItemProgress(progressPopoverId) === 100 ? '#10b981' : findItemProgress(progressPopoverId) >= 60 ? '#3b82f6' : findItemProgress(progressPopoverId) > 0 ? '#f59e0b' : '#404040'} ${findItemProgress(progressPopoverId)}%, #262626 ${findItemProgress(progressPopoverId)}%)`
                }}
              />
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setProgress(progressPopoverId, Math.max(0, findItemProgress(progressPopoverId) - 10))}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex gap-1 flex-1 justify-center">
                {[0, 25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setProgress(progressPopoverId, val)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                      findItemProgress(progressPopoverId) === val
                        ? 'bg-neutral-100 text-neutral-900 shadow-sm'
                        : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setProgress(progressPopoverId, Math.min(100, findItemProgress(progressPopoverId) + 10))}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Panel */}
      <TaskMaterialPanel
        isOpen={materialPanelOpen}
        onClose={() => setMaterialPanelOpen(false)}
        taskName={selectedTaskName}
        parentName={selectedParentName}
      />
    </div>
  );
}
