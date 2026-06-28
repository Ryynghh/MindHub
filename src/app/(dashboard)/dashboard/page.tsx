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

  // 2. Ambil 1 Workspace yang paling terakhir diupdate (Jump back in)
  const { data: recentWorkspace } = await supabase
    .from("workspaces")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  // 3. Ekstrak data task/roadmap (jika ada)
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
            Masuk sebagai{" "}
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
                      Terakhir diedit pada{" "}
                      {new Date(
                        recentWorkspace.updated_at,
                      ).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Link
                    href={`/workspace/${recentWorkspace.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/20 shrink-0"
                  >
                    Lanjutkan Pekerjaan <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <h3 className="text-xs font-semibold text-neutral-500 mb-4 uppercase tracking-wider">
                  Tugas / Rilis Teratas
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
                        + {tasks.length - 4} tugas lainnya di dalam workspace
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-neutral-800 rounded-lg bg-neutral-900/20">
                    <p className="text-sm text-neutral-500">
                      Belum ada tugas yang dibuat di workspace ini.
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
                  Belum ada workspace
                </h3>
                <p className="text-sm text-neutral-500 mt-1 mb-6 max-w-sm">
                  Buat workspace pertamamu untuk mulai merencanakan roadmap dan
                  mengelola tugas harian.
                </p>
                <Link
                  href="/workspace"
                  className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  Menuju Halaman Workspace
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
