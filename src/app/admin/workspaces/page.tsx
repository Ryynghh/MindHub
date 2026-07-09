// src/app/admin/workspaces/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import {
  FolderKanban,
  Map as MapIcon,
  LayoutDashboard,
  Calendar,
  Users,
  ListChecks,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminWorkspacesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== "admin@gmail.com") {
    redirect("/dashboard");
  }

  // Use admin client (bypasses RLS) to fetch all data
  const adminDb = createAdminClient();

  // Fetch all workspaces
  const { data: allWorkspaces } = await adminDb
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch member data
  const { data: memberData } = await adminDb
    .from("workspace_members")
    .select("workspace_id, user_id, role");

  // Fetch all users for owner mapping
  const { data: allUsers } = await adminDb
    .from("user")
    .select("user_id, full_name, email");

  const memberCountMap: Record<string, number> = {};
  memberData?.forEach((m: any) => {
    memberCountMap[m.workspace_id] = (memberCountMap[m.workspace_id] || 0) + 1;
  });

  const workspaces = allWorkspaces || [];
  const roadmapCount = workspaces.filter((w) => w.type === "roadmap").length;
  const dashboardCount = workspaces.filter((w) => w.type === "dashboard").length;
  const totalTasks = workspaces.reduce((sum, w) => sum + (w.roadmap_data?.length || 0), 0);

  return (
    <main className="w-full px-8 py-10 pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-8 border-b border-neutral-900 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <FolderKanban className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Workspace Management
                </h1>
              </div>
              <p className="text-neutral-400 mt-2 ml-14">
                Monitor and oversee all workspaces created across the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between">
            <span className="text-sm text-neutral-400">Total</span>
            <span className="text-xl font-bold text-white">{workspaces.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between">
            <span className="text-sm text-neutral-400 flex items-center gap-1.5"><MapIcon className="w-3.5 h-3.5 text-amber-400" /> Roadmap</span>
            <span className="text-xl font-bold text-amber-400">{roadmapCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between">
            <span className="text-sm text-neutral-400 flex items-center gap-1.5"><LayoutDashboard className="w-3.5 h-3.5 text-blue-400" /> Dashboard</span>
            <span className="text-xl font-bold text-blue-400">{dashboardCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between">
            <span className="text-sm text-neutral-400 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5 text-emerald-400" /> Total Tasks</span>
            <span className="text-xl font-bold text-emerald-400">{totalTasks}</span>
          </div>
        </div>

        {/* Workspace Table */}
        <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-neutral-900/50 pb-4">
            <CardTitle className="text-base text-neutral-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              All Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-900/40 text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-900/50">
              <div className="col-span-4">Workspace</div>
              <div className="col-span-2 text-center">Type</div>
              <div className="col-span-2 text-center">Tasks</div>
              <div className="col-span-2 text-center">Members</div>
              <div className="col-span-2 text-right">Created</div>
            </div>

            {workspaces.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No workspaces created yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-900/40">
                {workspaces.map((w: any) => {
                  const taskCount = w.roadmap_data?.length || 0;
                  const members = memberCountMap[w.id] || 0;
                  const avgProgress = taskCount > 0
                    ? Math.round(w.roadmap_data.reduce((acc: number, t: any) => acc + (t.progress || 0), 0) / taskCount)
                    : 0;

                  return (
                    <div
                      key={w.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-900/40 transition-colors items-center group"
                    >
                      {/* Name */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg border shrink-0 ${
                          w.type === "roadmap"
                            ? "bg-amber-500/10 border-amber-500/20"
                            : "bg-blue-500/10 border-blue-500/20"
                        }`}>
                          {w.type === "roadmap" ? (
                            <MapIcon className="w-4 h-4 text-amber-400" />
                          ) : (
                            <LayoutDashboard className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-200 truncate max-w-[250px] group-hover:text-white transition-colors">
                            {w.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${avgProgress === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                                style={{ width: `${avgProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-neutral-600">{avgProgress}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-2 flex justify-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                          w.type === "roadmap"
                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        }`}>
                          {w.type}
                        </span>
                      </div>

                      {/* Tasks */}
                      <div className="col-span-2 flex items-center justify-center gap-1.5 text-sm text-neutral-400">
                        <ListChecks className="w-3.5 h-3.5 text-neutral-600" />
                        {taskCount}
                      </div>

                      {/* Members */}
                      <div className="col-span-2 flex items-center justify-center gap-1.5 text-sm text-neutral-400">
                        <Users className="w-3.5 h-3.5 text-neutral-600" />
                        {members}
                      </div>

                      {/* Created */}
                      <div className="col-span-2 flex items-center justify-end gap-1.5 text-sm text-neutral-500">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        {new Date(w.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
  );
}
