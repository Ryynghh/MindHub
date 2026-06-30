"use client";

import { FloatingHeader } from "@/components/layouts/floating-header";

export default function DashboardView() {
  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 font-sans antialiased flex flex-col">
      <FloatingHeader />
      <main className="flex-1 flex flex-col mt-7 p-8 animate-in fade-in duration-300">
        <h1 className="text-3xl font-bold text-white mb-4">
          Dashboard Workspace
        </h1>
        <p className="text-neutral-400">
          Tampilan khusus Dashboard akan dibangun di sini nantinya...
        </p>
      </main>
    </div>
  );
}
