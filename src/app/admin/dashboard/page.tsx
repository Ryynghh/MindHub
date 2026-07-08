// src/app/admin/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import {
  Users,
  TrendingUp,
  Activity,
  Sparkles,
  FolderKanban,
  Brain,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingHeader } from "@/components/layouts/floating-header";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Security: Admin-only access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== "admin@gmail.com") {
    redirect("/dashboard");
  }

  // 2. Use admin client (bypasses RLS) to fetch all data
  const adminDb = createAdminClient();

  const { count: totalUsers } = await adminDb
    .from("user")
    .select("*", { count: "exact", head: true });

  const { count: totalWorkspaces } = await adminDb
    .from("workspaces")
    .select("*", { count: "exact", head: true });

  const { data: allUsers } = await adminDb
    .from("user")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: allWorkspaces } = await adminDb
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: false });

  // Calculate tier distribution
  const freeUsers = allUsers?.filter((u) => !u.subscription_tier || u.subscription_tier === "free").length || 0;
  const plusUsers = allUsers?.filter((u) => u.subscription_tier === "plus").length || 0;
  const proUsers = allUsers?.filter((u) => u.subscription_tier === "pro").length || 0;

  // Recent users (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentNewUsers = allUsers?.filter(
    (u) => new Date(u.created_at) >= sevenDaysAgo
  ).length || 0;

  // Workspace type distribution
  const roadmapWorkspaces = allWorkspaces?.filter((w) => w.type === "roadmap").length || 0;
  const dashboardWorkspaces = allWorkspaces?.filter((w) => w.type === "dashboard").length || 0;

  // Recent 5 users
  const recentUsers = allUsers?.slice(0, 5) || [];
  // Recent 5 workspaces
  const recentWorkspaces = allWorkspaces?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200 font-sans antialiased">
      <FloatingHeader />

      <main className="mx-auto mt-28 max-w-7xl px-6 pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-10 border-b border-neutral-900 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Brain className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Admin Command Center
            </h1>
          </div>
          <p className="text-neutral-400 mt-2 ml-14">
            Platform overview and performance metrics for MindHub.
          </p>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Total Users */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-all shadow-lg group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Total Users
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalUsers || 0}</div>
              <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{recentNewUsers} this week
              </p>
            </CardContent>
          </Card>

          {/* Free Users */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-all shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Free Tier
              </CardTitle>
              <div className="p-2 bg-neutral-500/10 rounded-lg border border-neutral-500/20">
                <Users className="w-4 h-4 text-neutral-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{freeUsers}</div>
              <p className="text-xs text-neutral-500 mt-2">
                {totalUsers ? Math.round((freeUsers / (totalUsers || 1)) * 100) : 0}% of total users
              </p>
            </CardContent>
          </Card>

          {/* Premium Users */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-all shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Premium Users
              </CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{plusUsers + proUsers}</div>
              <p className="text-xs text-neutral-500 mt-2">
                {plusUsers} Plus · {proUsers} Pro
              </p>
            </CardContent>
          </Card>

          {/* Total Workspaces */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 transition-all shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Workspaces
              </CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <FolderKanban className="w-4 h-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalWorkspaces || 0}</div>
              <p className="text-xs text-neutral-500 mt-2">
                {roadmapWorkspaces} Roadmap · {dashboardWorkspaces} Dashboard
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TIER DISTRIBUTION BAR */}
        <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-lg mb-10">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-neutral-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              User Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-neutral-900 mb-4">
              {freeUsers > 0 && (
                <div
                  className="bg-neutral-500 transition-all duration-700"
                  style={{ width: `${(freeUsers / (totalUsers || 1)) * 100}%` }}
                  title={`Free: ${freeUsers}`}
                />
              )}
              {plusUsers > 0 && (
                <div
                  className="bg-blue-500 transition-all duration-700"
                  style={{ width: `${(plusUsers / (totalUsers || 1)) * 100}%` }}
                  title={`Plus: ${plusUsers}`}
                />
              )}
              {proUsers > 0 && (
                <div
                  className="bg-amber-500 transition-all duration-700"
                  style={{ width: `${(proUsers / (totalUsers || 1)) * 100}%` }}
                  title={`Pro: ${proUsers}`}
                />
              )}
            </div>
            <div className="flex gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-neutral-500" />
                <span className="text-neutral-400">Free ({freeUsers})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-neutral-400">Plus ({plusUsers})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-neutral-400">Pro ({proUsers})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TWO COLUMN: Recent Users + Recent Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-lg">
            <CardHeader className="border-b border-neutral-900/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-neutral-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Recent Users
                </CardTitle>
                <Link
                  href="/admin/users"
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  View All <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-neutral-500 p-6 text-center">No users yet.</p>
              ) : (
                <div className="divide-y divide-neutral-900/50">
                  {recentUsers.map((u: any) => (
                    <div key={u.user_id} className="flex items-center justify-between p-4 hover:bg-neutral-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-neutral-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-neutral-200 truncate max-w-[180px]">
                            {u.full_name || "Unnamed User"}
                          </p>
                          <p className="text-xs text-neutral-500 truncate max-w-[180px]">{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                        u.subscription_tier === "pro"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : u.subscription_tier === "plus"
                          ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                          : "text-neutral-500 bg-neutral-800/50 border-neutral-700/30"
                      }`}>
                        {u.subscription_tier || "Free"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workspaces */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-lg">
            <CardHeader className="border-b border-neutral-900/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-neutral-100 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-purple-400" />
                  Recent Workspaces
                </CardTitle>
                <Link
                  href="/admin/workspaces"
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  View All <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentWorkspaces.length === 0 ? (
                <p className="text-sm text-neutral-500 p-6 text-center">No workspaces yet.</p>
              ) : (
                <div className="divide-y divide-neutral-900/50">
                  {recentWorkspaces.map((w: any) => {
                    const taskCount = w.roadmap_data?.length || 0;
                    return (
                      <div key={w.id} className="flex items-center justify-between p-4 hover:bg-neutral-900/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${
                            w.type === "roadmap"
                              ? "bg-amber-500/10 border-amber-500/20"
                              : "bg-blue-500/10 border-blue-500/20"
                          }`}>
                            <FolderKanban className={`w-4 h-4 ${
                              w.type === "roadmap" ? "text-amber-400" : "text-blue-400"
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-200 truncate max-w-[200px]">
                              {w.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {taskCount} tasks · {w.type}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          {new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
