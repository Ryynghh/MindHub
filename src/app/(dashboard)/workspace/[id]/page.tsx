// src/app/workspace/[id]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GanttDashboard from "@/components/workspace/RoadmapView";
import DashboardView from "@/components/workspace/DashboardView";
import { MembersGroup } from "@/components/workspace/members-group";

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

  // Ambil data members dari view
  const { data: members, error: membersError } = await supabase
    .from("workspace_members_with_profiles")
    .select("*")
    .eq("workspace_id", params.id);

  if (membersError) {
    console.error("Error fetching members:", membersError);
  }

  return (
    <div className="relative">
      {workspace.type === "roadmap" ? (
        <GanttDashboard
          workspaceId={workspace.id}
          initialData={workspace.roadmap_data || []}
          members={members || []}
        />
      ) : (
        <DashboardView members={members || []} workspaceId={workspace.id} />
      )}
    </div>
  );
}
