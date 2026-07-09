import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";
import { DashboardSetup } from "@/components/dashboard-setup";
import {
  Clock,
  ArrowRight,
  LayoutDashboard,
  Map as MapIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Verifikasi User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Ambil Semua Workspaces
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .order("updated_at", { ascending: false });

  const recentWorkspace = workspaces?.[0] || null;

  // 3. Ekstrak data task/roadmap (jika ada) untuk recentWorkspace
  const tasks = recentWorkspace?.roadmap_data || [];
  // Tampilkan maksimal 4 task teratas agar UI tidak terlalu panjang
  const recentTasks = tasks.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200 font-sans antialiased selection:bg-neutral-800">
      <FloatingHeader />

      <main className="mx-auto mt-28 max-w-5xl px-6 pb-12 animate-in fade-in duration-500">
        <Suspense fallback={null}>
          <DashboardSetup />
        </Suspense>

        {/* --- HEADER WELCOME --- */}
        <div className="mb-10 border-b border-neutral-900 pb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back!
          </h1>
          <p className="text-neutral-400 mt-2">
            Logged in as{" "}
            <span className="text-neutral-300 font-medium">{user.email}</span>
          </p>
        </div>

        {/* --- QUICK ACCESS SECTION --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-neutral-300">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold tracking-tight">
              Jump back in
            </h2>
          </div>

          {recentWorkspace ? (
            /* JIKA ADA WORKSPACE */
            <Card className="bg-neutral-950/50 border-neutral-800 hover:border-neutral-700 transition-all overflow-hidden shadow-lg">
              <CardHeader className="border-b border-neutral-900/50 bg-neutral-900/20 pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <CardTitle className="text-xl text-neutral-100 flex items-center gap-2">
                      {recentWorkspace.type === "dashboard" ? (
                        <LayoutDashboard className="w-5 h-5 text-blue-400" />
                      ) : (
                        <MapIcon className="w-5 h-5 text-amber-400" />
                      )}
                      {recentWorkspace.name}
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-neutral-500">
                      Last edited on{" "}
                      {new Date(
                        recentWorkspace.updated_at,
                      ).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Link
                    href={`/workspace/${recentWorkspace.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/20 shrink-0"
                  >
                    Continue Working <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <h3 className="text-xs font-semibold text-neutral-500 mb-4 uppercase tracking-wider">
                  Top Tasks / Releases
                </h3>

                {recentTasks.length > 0 ? (
                  <div className="space-y-3">
                    {recentTasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/50 hover:bg-neutral-900/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {task.progress === 100 ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : task.progress > 0 ? (
                            <Circle className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="font-medium text-neutral-200">
                            {task.name}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-500 font-mono flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-neutral-400"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          {task.progress}%
                        </div>
                      </div>
                    ))}

                    {/* Indikator sisa task jika lebih dari 4 */}
                    {tasks.length > 4 && (
                      <p className="text-xs text-neutral-500 text-center pt-2">
                        + {tasks.length - 4} more tasks in this workspace
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-neutral-800 rounded-lg bg-neutral-900/20">
                    <p className="text-sm text-neutral-500">
                      No tasks have been created in this workspace yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* JIKA WORKSPACE KOSONG SAMA SEKALI */
            <Card className="bg-neutral-950/50 border-neutral-800 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <LayoutDashboard className="w-12 h-12 text-neutral-700 mb-4" />
                <h3 className="text-lg font-medium text-neutral-200">
                  No workspaces yet
                </h3>
                <p className="text-sm text-neutral-500 mt-1 mb-6 max-w-sm">
                  Create your first workspace to start planning your roadmap and
                  managing daily tasks.
                </p>
                <Link
                  href="/workspace"
                  className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  Go to Workspaces
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* --- YOUR ROADMAPS & WORKSPACES SECTION --- */}
        {workspaces && workspaces.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-300">
                <MapIcon className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold tracking-tight">
                  Your Roadmaps & Workspaces
                </h2>
              </div>
              <Link
                href="/workspace"
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors bg-neutral-900/50 hover:bg-neutral-800 px-3 py-1.5 rounded-md border border-neutral-800"
              >
                Manage All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((ws: any) => {
                const wsTasks = ws.roadmap_data || [];
                const isComplete = wsTasks.length > 0 && wsTasks.every((t: any) => t.progress === 100);
                const progress = wsTasks.length > 0 
                  ? Math.round(wsTasks.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / wsTasks.length)
                  : 0;

                return (
                  <Link href={`/workspace/${ws.id}`} key={ws.id}>
                    <Card className="bg-neutral-950/40 border-neutral-800/60 hover:bg-neutral-900/60 hover:border-neutral-700 transition-all h-full group shadow-sm hover:shadow-md cursor-pointer">
                      <CardContent className="p-5 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-neutral-900/80 rounded-lg group-hover:bg-neutral-800 transition-colors border border-neutral-800/50">
                              {ws.type === "dashboard" ? (
                                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                              ) : (
                                <MapIcon className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500 font-medium">
                              {new Date(ws.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="font-semibold text-neutral-200 truncate mb-1">
                            {ws.name}
                          </h3>
                          <p className="text-xs text-neutral-500 mb-5">
                            {wsTasks.length} Items inside
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
                            <span className="text-neutral-500">Progress</span>
                            <span className={isComplete ? "text-emerald-400" : "text-neutral-300"}>
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/50">
                            <div 
                              className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'} transition-all`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
