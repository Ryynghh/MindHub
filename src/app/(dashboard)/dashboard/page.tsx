import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/services/actions/auth";
import { Button } from "@/components/ui/button";
import { DashboardSetup } from "@/components/dashboard-setup";
import { Suspense } from "react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh space-y-4">
      {/* Bungkus dengan Suspense agar tidak error saat di-build oleh Next.js */}
      <Suspense fallback={null}>
        <DashboardSetup />
      </Suspense>

      <div className="text-center">
        <h1 className="text-3xl font-bold">Dashboard MindHub</h1>
        <p className="text-muted-foreground text-sm">
          Selamat datang, {user.email}
        </p>
      </div>

      <form action={signOut}>
        <Button variant="destructive">Keluar Akun</Button>
      </form>
    </div>
  );
}
