"use client";

import React, { useState, useEffect } from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";
import {
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Circle,
  Trophy,
  Flame,
  Brain,
  Clock,
  CalendarDays,
  Target,
  Sparkles,
  Trash2,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkspaceMember } from "./members-group";
import { MembersGroup } from "./members-group";

export default function DashboardView({ members = [], workspaceId }: { members?: WorkspaceMember[], workspaceId: string }) {
  // --- STATE FOR POMODORO TIMER ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<"focus" | "break">("focus");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerType === "focus" ? 25 * 60 : 5 * 60);
  };

  const switchTimerMode = (mode: "focus" | "break") => {
    setIsRunning(false);
    setTimerType(mode);
    setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- STATE FOR STUDY GOALS ---
  const [goals, setGoals] = useState([
    { id: 1, text: "Selesaikan Modul React Hooks", completed: false },
    { id: 2, text: "Kerjakan Kuis Database SQL", completed: true },
    { id: 3, text: "Baca Artikel tentang Next.js App Router", completed: false },
  ]);
  const [newGoal, setNewGoal] = useState("");

  const toggleGoal = (id: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
    setGoals([...goals, { id: newId, text: newGoal.trim(), completed: false }]);
    setNewGoal("");
  };

  const deleteGoal = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setGoals(goals.filter(g => g.id !== id));
  };

  const completedGoalsCount = goals.filter(g => g.completed).length;
  const progressPercentage = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  // --- STATE FOR LEARNING TOPICS (MATERIALS) ---
  const [materials, setMaterials] = useState([
    { id: 1, title: "Fundamental UI/UX Design", type: "video", progress: 75 },
    { id: 2, title: "Advanced State Management", type: "reading", progress: 30 },
    { id: 3, title: "Weekly Coding Challenge", type: "practice", progress: 0 },
  ]);
  const [newTopic, setNewTopic] = useState("");
  const [newTopicType, setNewTopicType] = useState("reading");

  const addTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    const newId = materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1;
    setMaterials([...materials, { id: newId, title: newTopic.trim(), type: newTopicType, progress: 0 }]);
    setNewTopic("");
  };

  const deleteTopic = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setMaterials(materials.filter(m => m.id !== id));
  };

  const getMaterialIcon = (type: string) => {
    if (type === "video") return <Brain className="w-5 h-5 text-purple-400" />;
    if (type === "reading") return <BookOpen className="w-5 h-5 text-blue-400" />;
    return <Target className="w-5 h-5 text-emerald-400" />;
  };

  const getMaterialLabel = (type: string) => {
    if (type === "video") return "Video Course";
    if (type === "reading") return "Reading";
    return "Practice";
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 font-sans antialiased flex flex-col selection:bg-neutral-800 pb-12">
      <FloatingHeader />
      
      <main className="flex-1 flex flex-col mt-24 max-w-6xl mx-auto w-full px-6 animate-in fade-in duration-500">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-900 pb-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between w-full">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Brain className="w-6 h-6" />
                </span>
                Learning Space
              </h1>
              <p className="text-neutral-400 mt-3 text-lg">
                Fokus, selesaikan target, dan pantau progres belajarmu hari ini.
              </p>
            </div>
            
            {/* Tampilkan Members Group di samping kanan header */}
            <div className="mt-4 md:mt-0">
              <MembersGroup members={members} workspaceId={workspaceId} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: TIMER & GOALS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Pomodoro Timer */}
            <Card className="bg-neutral-950/60 border-neutral-800/80 overflow-hidden shadow-xl relative backdrop-blur-sm">
              <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-[100px] -mr-16 -mt-16 pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-neutral-100">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Focus Timer
                </CardTitle>
                <CardDescription className="text-neutral-500">Tingkatkan produktivitas dengan teknik Pomodoro.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-4">
                
                {/* Mode Selector */}
                <div className="flex bg-neutral-900/80 p-1.5 rounded-full mb-8 border border-neutral-800 shadow-inner">
                  <button 
                    onClick={() => switchTimerMode("focus")}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                      timerType === "focus" ? "bg-emerald-600 text-white shadow-md scale-105" : "text-neutral-400 hover:text-neutral-200"
                    )}
                  >
                    Focus (25m)
                  </button>
                  <button 
                    onClick={() => switchTimerMode("break")}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                      timerType === "break" ? "bg-blue-600 text-white shadow-md scale-105" : "text-neutral-400 hover:text-neutral-200"
                    )}
                  >
                    Break (5m)
                  </button>
                </div>

                {/* Timer Display */}
                <div className="text-7xl font-bold font-mono tracking-tighter text-white mb-8 drop-shadow-2xl">
                  {formatTime(timeLeft)}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={toggleTimer}
                    size="lg"
                    className={cn(
                      "w-36 h-12 rounded-full font-bold text-white transition-all duration-300",
                      isRunning 
                        ? "bg-amber-500 hover:bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                        : "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    )}
                  >
                    {isRunning ? (
                      <><Pause className="w-5 h-5 mr-2" /> Pause</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" /> Start</>
                    )}
                  </Button>
                  <Button 
                    onClick={resetTimer}
                    variant="outline" 
                    size="icon"
                    className="w-12 h-12 rounded-full border-neutral-700 hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Daily Goals */}
            <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-xl flex-1 backdrop-blur-sm flex flex-col">
              <CardHeader className="pb-4 border-b border-neutral-900/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2 text-neutral-100">
                    <Target className="w-5 h-5 text-blue-400" />
                    Target Hari Ini
                  </CardTitle>
                  <span className="text-xs font-bold font-mono bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">
                    {completedGoalsCount} / {goals.length}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-neutral-900 rounded-full mt-4 overflow-hidden border border-neutral-800/50">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                {goals.length === 0 ? (
                  <p className="text-center text-sm text-neutral-500 my-4">Belum ada target. Tambahkan satu!</p>
                ) : (
                  goals.map((goal) => (
                    <div 
                      key={goal.id} 
                      onClick={() => toggleGoal(goal.id)}
                      className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-neutral-900/80 transition-all duration-200 cursor-pointer border border-transparent hover:border-neutral-800 group"
                    >
                      <div className="mt-0.5 shrink-0">
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 transition-transform scale-110" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-600 group-hover:text-blue-400 transition-colors" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-all duration-300 leading-relaxed flex-1",
                        goal.completed ? "text-neutral-500 line-through" : "text-neutral-200 group-hover:text-white"
                      )}>
                        {goal.text}
                      </span>
                      <button
                        onClick={(e) => deleteGoal(e, goal.id)}
                        className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="p-4 border-t border-neutral-900/50 mt-auto bg-neutral-950/30">
                <form onSubmit={addGoal} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Tambah target baru..."
                    className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 shrink-0" disabled={!newGoal.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>

          </div>

          {/* RIGHT COLUMN: MATERIALS & SCHEDULE */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-colors shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3.5 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400 shadow-inner">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{materials.length}</h3>
                  <p className="text-sm font-medium text-neutral-500">Topik Terdaftar</p>
                </CardContent>
              </Card>
              <Card className="bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-colors shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 shadow-inner">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">24j 30m</h3>
                  <p className="text-sm font-medium text-neutral-500">Total Waktu Belajar</p>
                </CardContent>
              </Card>
            </div>

            {/* Resume Learning Section */}
            <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-xl flex-1 backdrop-blur-sm flex flex-col">
              <CardHeader className="border-b border-neutral-900/60 pb-5">
                <CardTitle className="text-lg flex items-center gap-2 text-neutral-100">
                  <CalendarDays className="w-5 h-5 text-purple-400" />
                  Topik Pembelajaran
                </CardTitle>
                <CardDescription className="text-neutral-500">Akses dan kelola materi yang sedang kamu pelajari.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex flex-col flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                {materials.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada topik pembelajaran.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {materials.map((mat) => (
                      <div 
                        key={mat.id}
                        className="flex items-center gap-4 p-5 border-b border-neutral-900/50 last:border-0 hover:bg-neutral-900/60 transition-all duration-300 group"
                      >
                        <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 group-hover:scale-110 group-hover:border-neutral-700 transition-all shadow-sm">
                          {getMaterialIcon(mat.type)}
                        </div>
                        <div className="flex-1 cursor-pointer">
                          <h4 className="font-semibold text-neutral-200 group-hover:text-white transition-colors text-base line-clamp-1">
                            {mat.title}
                          </h4>
                          <p className="text-sm font-medium text-neutral-500 mt-1">{getMaterialLabel(mat.type)}</p>
                        </div>
                        
                        {/* Progress and Delete Actions */}
                        <div className="flex items-center gap-4">
                          <div className="w-24 sm:w-32 flex flex-col gap-2 items-end cursor-pointer">
                            <span className="text-xs font-bold font-mono text-neutral-400 bg-neutral-900 px-2 py-1 rounded-md">
                              {mat.progress}%
                            </span>
                            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/50">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out"
                                style={{ width: `${mat.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => deleteTopic(e, mat.id)}
                            className="p-2 bg-neutral-900/50 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Hapus Topik"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              
              {/* Add New Topic Form */}
              <div className="p-4 border-t border-neutral-900/60 mt-auto bg-neutral-950/30">
                <form onSubmit={addTopic} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Judul Topik Pembelajaran..."
                    className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newTopicType}
                      onChange={(e) => setNewTopicType(e.target.value)}
                      className="bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="video">Video Course</option>
                      <option value="reading">Reading</option>
                      <option value="practice">Practice</option>
                    </select>
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 shrink-0" disabled={!newTopic.trim()}>
                      <Plus className="w-4 h-4 mr-1.5" /> Tambah
                    </Button>
                  </div>
                </form>
              </div>
            </Card>

            {/* Inspirational Quote / Tips */}
            <Card className="bg-gradient-to-br from-emerald-900/30 via-neutral-950 to-neutral-950 border-emerald-900/40 shadow-xl overflow-hidden relative mt-auto">
              <div className="absolute -right-6 -top-6 text-emerald-500/10">
                <Sparkles className="w-32 h-32" />
              </div>
              <CardContent className="p-6 flex gap-5 items-center relative z-10">
                <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-100 mb-1.5 text-base">Tips Hari Ini</h4>
                  <p className="text-sm text-emerald-200/70 font-medium leading-relaxed">
                    "Pecah materi yang sulit menjadi bagian-bagian kecil. Jangan lupa beristirahat 5 menit setelah 25 menit fokus penuh!"
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
