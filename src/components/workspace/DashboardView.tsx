"use client";

import React from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";
import { Brain, Sparkles } from "lucide-react";
import { WorkspaceMember, MembersGroup } from "./members-group";

export default function DashboardView({ members = [], workspaceId }: { members?: WorkspaceMember[], workspaceId: string }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 font-sans antialiased flex flex-col selection:bg-neutral-800 pb-12">
      <FloatingHeader />
      
      <main className="flex-1 flex flex-col mt-24 max-w-6xl mx-auto w-full px-6 animate-in fade-in duration-500">
        
        {/* Header Section */}
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
                Fokus dan eksplorasi potensimu hari ini.
              </p>
            </div>
            
            {/* Members Group */}
            <div className="mt-4 md:mt-0">
              <MembersGroup members={members} workspaceId={workspaceId} />
            </div>
          </div>
        </div>

        {/* Empty State / Blank Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
            <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-full mb-6 shadow-inner">
              <Sparkles className="w-12 h-12 text-neutral-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-200 mb-3">Kanvas Kosong</h2>
            <p className="text-neutral-500 max-w-lg mx-auto text-base leading-relaxed">
              Sesuai permintaanmu, fitur Pomodoro, Target Harian, dan Topik Pembelajaran telah dihapus. Halaman ini sekarang siap dirancang ulang menjadi apapun yang kamu inginkan.
            </p>
        </div>

      </main>
    </div>
  );
}
