import React from "react";
import { createClient } from "@/lib/supabase/server";
import { FloatingHeader } from "@/components/layouts/floating-header";
import { joinWorkspace } from "@/app/(dashboard)/actions/workspace";
import { redirect } from "next/navigation";
import { Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${params.id}`);
  }

  // Ambil detail workspace
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("name, description")
    .eq("id", params.id)
    .single();

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-[#09090b] text-neutral-300 antialiased flex items-center justify-center">
        <FloatingHeader />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-900/50 bg-red-950/20 p-8 max-w-md text-center">
          <AlertTriangle className="mb-4 h-10 w-10 text-red-500" />
          <h3 className="text-lg font-medium text-neutral-200">
            Workspace Not Found
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            The workspace you are trying to join does not exist or the invite link is invalid.
          </p>
          <a
            href="/workspace"
            className="mt-6 px-4 py-2 bg-neutral-800 text-white rounded-md text-sm hover:bg-neutral-700 transition-colors"
          >
            Go to Workspaces
          </a>
        </div>
      </div>
    );
  }

  // Eksekusi join langsung di Server Component bisa diubah menjadi Client Component jika perlu konfirmasi
  // Untuk flow ini kita akan membuat Client Component yang menampilkan tombol "Accept Invite"

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300 antialiased flex flex-col items-center justify-center">
      <FloatingHeader />
      
      <div className="bg-neutral-950/50 border border-neutral-800/80 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in duration-500 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Join Workspace</h1>
        <p className="text-neutral-400 mb-6 text-sm">
          You have been invited to join <span className="font-semibold text-neutral-200">{workspace.name}</span>.
        </p>

        {workspace.description && (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mb-8 text-sm text-neutral-500 text-left">
            {workspace.description}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            const result = await joinWorkspace(params.id);
            if (result.success) {
              redirect(`/workspace/${params.id}`);
            } else {
              // Jika gagal, redirect ke error page atau kembali dengan error
              redirect(`/workspace?error=join_failed`);
            }
          }}
        >
          <Button type="submit" className="w-full py-6 text-base font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
            Accept Invite & Join
          </Button>
        </form>
        
        <div className="mt-6 text-xs text-neutral-600">
          If you don't want to join this workspace, you can safely ignore this page.
        </div>
      </div>
    </div>
  );
}
