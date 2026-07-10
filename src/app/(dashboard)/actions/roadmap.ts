// src/app/(dashboard)/actions/roadmap.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveRoadmapData(workspaceId: string, roadmapData: any) {
  const supabase = await createClient();

  // Pastikan user sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verifikasi otorisasi: Apakah user ini owner atau member yang diundang?
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  let isAuthorized = workspace?.owner_id === user.id;

  if (!isAuthorized) {
    // Cek di tabel workspace_members jika bukan owner
    const { data: member } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (member) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return { error: "Forbidden: You don't have permission to edit this roadmap." };
  }

  // Gunakan Admin Client untuk update tabel `workspaces`
  // karena policy RLS default mungkin melarang member (bukan owner) untuk melakukan UPDATE pada row workspaces.
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("workspaces")
    .update({ roadmap_data: roadmapData })
    .eq("id", workspaceId);

  if (error) {
    console.error("Gagal menyimpan roadmap:", error);
    return { error: "Failed to save roadmap data" };
  }

  // Refresh cache halaman agar selalu up-to-date
  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}
