// src/app/workspace/[id]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GanttDashboard from "@/components/workspace/RoadmapView";
import DashboardView from "@/components/workspace/DashboardView";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !workspace) {
    notFound();
  }

  if (workspace.type === "roadmap") {
    // 👇 PERUBAHAN DI SINI: Kita kirimkan ID dan Data Roadmap dari database ke komponen
    return (
      <GanttDashboard
        workspaceId={workspace.id}
        initialData={workspace.roadmap_data || []}
      />
    );
  } else {
    return <DashboardView />;
  }
}
