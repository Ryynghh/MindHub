"use client";

import React, { useState, useEffect } from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";
import { ChevronRight, Loader2, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createWorkspaceFromTemplate } from "@/app/(dashboard)/actions/workspace";
import { toast } from "sonner";
import { templates, generateRoadmapData } from "@/config/templates-data";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function TemplatesPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null); // null = loading

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user plan on mount
  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setUserPlan("free"); return; }

      const { data } = await supabase
        .from("user")
        .select("plan")
        .eq("user_id", user.id)
        .single();

      setUserPlan(data?.plan || "free");
    }
    fetchPlan();
  }, [supabase]);

  const isPremium = userPlan === "plus" || userPlan === "pro";
  const freeLimit = Math.ceil(templates.length / 2); // First half is free

  async function handleUseTemplate(template: typeof templates[0], index: number) {
    // Gate check: if template is locked, redirect to pricing
    if (!isPremium && index >= freeLimit) {
      toast.error("Upgrade to Plus or Pro to unlock all templates!");
      router.push("/pricing");
      return;
    }

    setLoadingId(template.id);

    const roadmapData = generateRoadmapData(template.id);

    const result = await createWorkspaceFromTemplate(
      template.title,
      template.description,
      roadmapData
    );

    if (result.error) {
      toast.error(result.error);
      setLoadingId(null);
    } else {
      toast.success("Workspace created with daily learning roadmap!");
      router.push(`/workspace/${result.workspaceId}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 antialiased selection:bg-neutral-800">
      <FloatingHeader />

      <main className="mx-auto mt-24 max-w-6xl px-6 pb-12 animate-in fade-in duration-500">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 tracking-tight">
              Informatics Learning Templates
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Start your learning journey instantly with curated daily roadmaps for computer science students.
            </p>
          </div>
          {/* Premium badge */}
          {userPlan && !isPremium && (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors shrink-0"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Unlock All
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {templates.map((template, index) => {
            const isLocked = !isPremium && index >= freeLimit;

            return (
              <div
                key={template.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all ${
                  isLocked
                    ? "border-neutral-800/50 bg-neutral-900/20 opacity-70"
                    : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50"
                }`}
              >
                {/* Lock overlay for premium templates */}
                {isLocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-2xl">
                    <div className="flex flex-col items-center gap-3 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-sm font-medium text-neutral-200">Premium Template</p>
                      <Link
                        href="/pricing"
                        className="px-4 py-1.5 rounded-md bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400 transition-colors"
                      >
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 shadow-inner">
                      {template.icon}
                    </div>
                    {isLocked ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-semibold text-amber-400">PRO</span>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-neutral-500 group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                  
                  <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-neutral-800/50">
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-xs font-medium text-neutral-400 bg-neutral-800/50 rounded-md border border-neutral-700/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleUseTemplate(template, index)}
                    disabled={loadingId !== null}
                    className={`font-medium px-4 ml-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                      isLocked
                        ? "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
                        : "bg-white text-black hover:bg-neutral-200"
                    }`}
                  >
                    {loadingId === template.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                    ) : isLocked ? (
                      <><Lock className="w-3.5 h-3.5 mr-1.5" /> Locked</>
                    ) : (
                      "Use Template"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
