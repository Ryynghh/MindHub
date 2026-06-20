import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/services/actions/auth";
import { Button } from "@/components/ui/button";
import { DashboardSetup } from "@/components/dashboard-setup";
import { Suspense } from "react";
import { FloatingHeader } from "@/components/layouts/floating-header";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <FloatingHeader />
      <div className="flex flex-col items-center justify-center min-h-svh space-y-4">
        <Suspense fallback={null}>
          <DashboardSetup />
        </Suspense>

        <div className="text-center">
          <h1 className="text-3xl font-bold">Dashboard MindHub</h1>
          <p className="text-muted-foreground text-sm">
            Selamat datang, {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
