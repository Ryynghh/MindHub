// src/app/admin/users/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import {
  Users,
  Search,
  Shield,
  Sparkles,
  Mail,
  Calendar,
  UserCircle,
  FolderKanban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== "admin@gmail.com") {
    redirect("/dashboard");
  }

  // Use admin client (bypasses RLS) to fetch all data
  const adminDb = createAdminClient();

  const { data: allUsers } = await adminDb
    .from("user")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch workspace member counts per user
  const { data: memberCounts } = await adminDb
    .from("workspace_members")
    .select("user_id");

  // Count workspaces per user
  const workspaceCountMap: Record<string, number> = {};
  memberCounts?.forEach((m: any) => {
    workspaceCountMap[m.user_id] = (workspaceCountMap[m.user_id] || 0) + 1;
  });

  const users = allUsers || [];

  return (
    <main className="w-full px-8 py-10 pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-8 border-b border-neutral-900 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  User Management
                </h1>
              </div>
              <p className="text-neutral-400 mt-2 ml-14">
                View and manage all registered users on the platform.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{users.length}</p>
              <p className="text-xs text-neutral-500">Total Users</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Free", count: users.filter((u) => !u.subscription_tier || u.subscription_tier === "free").length, color: "neutral" },
            { label: "Plus", count: users.filter((u) => u.subscription_tier === "plus").length, color: "blue" },
            { label: "Pro", count: users.filter((u) => u.subscription_tier === "pro").length, color: "amber" },
            { label: "This Week", count: users.filter((u) => { const d = new Date(); d.setDate(d.getDate() - 7); return new Date(u.created_at) >= d; }).length, color: "emerald" },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex items-center justify-between`}>
              <span className="text-sm text-neutral-400">{stat.label}</span>
              <span className={`text-xl font-bold ${
                stat.color === "blue" ? "text-blue-400" :
                stat.color === "amber" ? "text-amber-400" :
                stat.color === "emerald" ? "text-emerald-400" :
                "text-white"
              }`}>{stat.count}</span>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-neutral-900/50 pb-4">
            <CardTitle className="text-base text-neutral-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-900/40 text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-900/50">
              <div className="col-span-4">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-1 text-center">Tier</div>
              <div className="col-span-2 text-center">Workspaces</div>
              <div className="col-span-2 text-right">Joined</div>
            </div>

            {/* Table Body */}
            {users.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No users registered yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-900/40">
                {users.map((u: any) => (
                  <div
                    key={u.user_id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-900/40 transition-colors items-center group"
                  >
                    {/* User Info */}
                    <div className="col-span-4 flex items-center gap-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border-2 border-neutral-800 group-hover:border-neutral-600 transition-colors"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white border-2 border-neutral-800">
                          {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-200 truncate max-w-[200px]">
                          {u.full_name || "Unnamed User"}
                        </p>
                        <p className="text-[11px] text-neutral-600">
                          ID: {u.user_id?.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                      <span className="text-sm text-neutral-400 truncate">{u.email}</span>
                    </div>

                    {/* Tier Badge */}
                    <div className="col-span-1 flex justify-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        u.subscription_tier === "pro"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : u.subscription_tier === "plus"
                          ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                          : "text-neutral-500 bg-neutral-800/50 border-neutral-700/30"
                      }`}>
                        {u.subscription_tier || "Free"}
                      </span>
                    </div>

                    {/* Workspace Count */}
                    <div className="col-span-2 flex items-center justify-center gap-1.5 text-sm text-neutral-400">
                      <FolderKanban className="w-3.5 h-3.5 text-neutral-600" />
                      {workspaceCountMap[u.user_id] || 0}
                    </div>

                    {/* Join Date */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5 text-sm text-neutral-500">
                      <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
  );
}
