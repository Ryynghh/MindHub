// src/app/(dashboard)/actions/roadmap.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveRoadmapData(workspaceId: string, roadmapData: any) {
  const supabase = await createClient();

  // Pastikan user sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Update menggunakan client normal (mengandalkan policy RLS di database)
  const { error } = await supabase
    .from("workspaces")
    .update({ roadmap_data: roadmapData })
    .eq("id", workspaceId);

  if (error) {
    console.error("Gagal menyimpan roadmap:", error);
    return { error: "Failed to save roadmap data: " + error.message };
  }

  // Refresh cache halaman agar selalu up-to-date
  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}
