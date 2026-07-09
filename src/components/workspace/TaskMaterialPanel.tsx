"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  BookOpen,
  Target,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GraduationCap,
  ListChecks,
  Link2,
  RefreshCw,
  Layers,
} from "lucide-react";

// --- TYPE DEFINITIONS ---
interface KeyConcept {
  term: string;
  definition: string;
}

interface Step {
  title: string;
  content: string;
}

interface Resource {
  title: string;
  url: string;
  type: "article" | "video" | "documentation" | "tutorial";
}

interface MaterialData {
  title: string;
  summary: string;
  objectives: string[];
  keyConcepts: KeyConcept[];
  steps: Step[];
  resources: Resource[];
  tips: string[];
}

interface TaskMaterialPanelProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  parentName?: string;
}

// --- CACHE untuk menyimpan materi yang sudah di-generate ---
const materialsCache = new Map<string, MaterialData>();

export default function TaskMaterialPanel({
  isOpen,
  onClose,
  taskName,
  parentName,
}: TaskMaterialPanelProps) {
  const [materials, setMaterials] = useState<MaterialData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const cacheKey = `${taskName}__${parentName || "root"}`;

  useEffect(() => {
    if (isOpen && taskName) {
      // Cek cache dulu
      if (materialsCache.has(cacheKey)) {
        setMaterials(materialsCache.get(cacheKey)!);
        setError(null);
        return;
      }
      fetchMaterials();
    }
  }, [isOpen, taskName, parentName]);

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError(null);
    setMaterials(null);

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName, parentName }),
      });

      if (!response.ok) throw new Error("Failed to fetch materials");

      const data = await response.json();
      setMaterials(data.materials);
      materialsCache.set(cacheKey, data.materials);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Gagal memuat materi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    materialsCache.delete(cacheKey);
    fetchMaterials();
  };

  const resourceTypeConfig: Record<string, { color: string; label: string }> = {
    article: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Article" },
    video: { color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Video" },
    documentation: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Docs" },
    tutorial: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Tutorial" },
  };

  const sections = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "concepts", label: "Key Concepts", icon: GraduationCap },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "steps", label: "Step by Step", icon: ListChecks },
    { id: "resources", label: "Resources", icon: Link2 },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-[#0c0c0f] border-l border-neutral-800/60 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-neutral-800/60 bg-[#0c0c0f]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-neutral-100 truncate">
                  {taskName}
                </h2>
                {parentName && (
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {parentName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {materials && (
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  title="Regenerate materi"
                  className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          {materials && !isLoading && (
            <div className="flex gap-1 px-6 pb-3">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-neutral-800 text-neutral-100 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-violet-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500/30 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-200">
                  Megi AI sedang menyiapkan materi...
                </p>
                <p className="text-xs text-neutral-500 mt-1.5">
                  Menganalisis topik &quot;{taskName}&quot;
                </p>
              </div>
              {/* Loading skeleton */}
              <div className="w-full mt-4 space-y-3 px-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3 bg-neutral-800 rounded w-3/4" />
                    <div className="h-2 bg-neutral-900 rounded w-full" />
                    <div className="h-2 bg-neutral-900 rounded w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <X className="w-7 h-7 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-200">{error}</p>
                <p className="text-xs text-neutral-500 mt-1.5">
                  Pastikan koneksi internet kamu stabil.
                </p>
              </div>
              <button
                onClick={handleRegenerate}
                className="mt-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Materials Content */}
          {materials && !isLoading && (
            <div className="p-6 space-y-6">
              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Summary */}
                  <div className="rounded-xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-neutral-800/60 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-violet-400" />
                      <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Ringkasan
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {materials.summary}
                    </p>
                  </div>

                  {/* Learning Objectives */}
                  <div className="rounded-xl bg-neutral-900/40 border border-neutral-800/60 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Tujuan Pembelajaran
                      </h3>
                    </div>
                    <ul className="space-y-2.5">
                      {materials.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                          <div className="mt-1 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                            <span className="text-[10px] font-bold text-emerald-400">
                              {i + 1}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                            {obj}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  {materials.tips && materials.tips.length > 0 && (
                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                          Tips & Tricks
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {materials.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-neutral-400 leading-relaxed"
                          >
                            <span className="text-amber-400 mt-0.5 shrink-0">💡</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Key Concepts Section */}
              {activeSection === "concepts" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Konsep Utama
                    </h3>
                  </div>
                  {materials.keyConcepts.map((concept, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-neutral-900/40 border border-neutral-800/60 p-4 hover:bg-neutral-900/60 hover:border-neutral-700/60 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <span className="text-[10px] font-bold text-blue-400">
                            {i + 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-200">
                          {concept.term}
                        </h4>
                      </div>
                      <p className="text-sm text-neutral-400 leading-relaxed pl-8">
                        {concept.definition}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Flashcards Section */}
              {activeSection === "flashcards" && materials.keyConcepts && materials.keyConcepts.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="flex items-center gap-2 mb-2 w-full">
                    <Layers className="w-4 h-4 text-pink-400" />
                    <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Flashcard Latihan
                    </h3>
                    <span className="ml-auto text-[11px] text-neutral-500 font-bold bg-neutral-800 px-2 py-1 rounded-md">
                      {flashcardIndex + 1} / {materials.keyConcepts.length}
                    </span>
                  </div>
                  
                  {/* The Card */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full h-64 cursor-pointer group [perspective:1000px] mt-2"
                  >
                    <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      
                      {/* Front (Term) */}
                      <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] group-hover:border-pink-500/50 transition-colors">
                        <Sparkles className="w-6 h-6 text-pink-500/20 absolute top-4 left-4" />
                        <h4 className="text-xl font-bold text-white text-center">
                          {materials.keyConcepts[flashcardIndex].term}
                        </h4>
                        <p className="text-xs text-neutral-500 absolute bottom-5">Klik kartu untuk melihat definisi</p>
                      </div>

                      {/* Back (Definition) */}
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-900/20 to-neutral-900 border border-pink-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                        <p className="text-sm font-medium text-pink-50 text-center leading-relaxed">
                          {materials.keyConcepts[flashcardIndex].definition}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-3 w-full mt-4">
                    <button 
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={flashcardIndex === 0}
                      className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl disabled:opacity-50 hover:bg-neutral-700 transition-colors text-xs font-semibold"
                    >
                      Sebelumnya
                    </button>
                    <button 
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex(prev => Math.min(materials.keyConcepts.length - 1, prev + 1));
                      }}
                      disabled={flashcardIndex === materials.keyConcepts.length - 1}
                      className="flex-1 py-2.5 bg-pink-600/20 text-pink-400 border border-pink-500/20 rounded-xl disabled:opacity-50 hover:bg-pink-600/30 transition-colors text-xs font-bold"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}

              {/* Steps Section */}
              {activeSection === "steps" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <ListChecks className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Langkah Pembelajaran
                    </h3>
                  </div>
                  {materials.steps.map((step, i) => {
                    const isExpanded = expandedStep === i;
                    return (
                      <div
                        key={i}
                        className="rounded-xl bg-neutral-900/40 border border-neutral-800/60 overflow-hidden hover:border-neutral-700/60 transition-all"
                      >
                        <button
                          onClick={() => setExpandedStep(isExpanded ? null : i)}
                          className="w-full flex items-center gap-3 p-4 text-left group"
                        >
                          <div className="relative shrink-0">
                            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                              <span className="text-[10px] font-bold text-violet-400">
                                {i + 1}
                              </span>
                            </div>
                            {/* Connector line */}
                            {i < materials.steps.length - 1 && (
                              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-px h-3 bg-neutral-800" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-neutral-200 flex-1 group-hover:text-white transition-colors">
                            {step.title}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-neutral-600 transition-transform duration-200 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pl-14 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-sm text-neutral-400 leading-relaxed">
                              {step.content}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resources Section */}
              {activeSection === "resources" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Sumber Belajar
                    </h3>
                  </div>
                  {materials.resources.map((resource, i) => {
                    const config = resourceTypeConfig[resource.type] || resourceTypeConfig.article;
                    return (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl bg-neutral-900/40 border border-neutral-800/60 p-4 hover:bg-neutral-900/60 hover:border-neutral-700/60 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${config.color}`}
                              >
                                {config.label}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate">
                              {resource.title}
                            </h4>
                            <p className="text-[11px] text-neutral-600 truncate mt-1">
                              {resource.url}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors mt-1 shrink-0" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {materials && !isLoading && (
          <div className="shrink-0 border-t border-neutral-800/60 px-6 py-3 bg-[#0c0c0f]">
            <p className="text-[10px] text-neutral-600 text-center font-medium">
              ✨ Materi ini di-generate oleh Megi AI • Konten mungkin perlu verifikasi
            </p>
          </div>
        )}
      </div>
    </>
  );
}
