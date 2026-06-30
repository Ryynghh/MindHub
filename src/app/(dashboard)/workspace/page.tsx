import React from "react";
import { createClient } from "@/lib/supabase/server";
import { FloatingHeader } from "@/components/layouts/floating-header";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";
import { LayoutDashboard } from "lucide-react";

export default async function WorkspacePage() {
  const supabase = await createClient();

  // Fetch workspaces dengan jumlah member menggunakan relasi join
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select(
      `
      *,
      workspace_members (count)
    `,
    )
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 antialiased selection:bg-neutral-800">
      <FloatingHeader />

      <main className="mx-auto mt-24 max-w-6xl px-6 pb-12 animate-in fade-in duration-500">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 tracking-tight">
              Workspaces
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Manage your projects and collaborate with your team.
            </p>
          </div>
          {/* Tombol Triger Modal Create Workspace */}
          <CreateWorkspaceModal />
        </div>

        {workspaces?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/20 py-24 text-center">
            <LayoutDashboard className="mb-4 h-10 w-10 text-neutral-600" />
            <h3 className="text-lg font-medium text-neutral-200">
              No workspaces found
            </h3>
            <p className="mt-1 text-sm text-neutral-500 max-w-sm">
              Get started by creating a new workspace to manage your dashboard
              or roadmap.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces?.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                memberCount={ws.workspace_members[0].count}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
