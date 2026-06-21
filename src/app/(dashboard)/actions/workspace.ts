"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const workspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required.")
    .max(50, "Workspace name must be under 50 characters."),
  description: z.string().max(200).optional(),
  type: z.enum(["dashboard", "roadmap"], {
    required_error: "Please select a template type.",
  }),
  invitedEmails: z.string().optional(),
});

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();

  // 1. PERBAIKAN WARNING: Gunakan getUser() alih-alih getSession()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized" };

  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    type: formData.get("type"),
    invitedEmails: formData.get("invitedEmails"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, description, type, invitedEmails } = parsed.data;

  // 2. PERBAIKAN: Gunakan user.id (hasil dari getUser)
  const { count, error: countError } = await supabase
    .from("workspaces")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if (countError) return { error: "Failed to verify workspace limits." };

  if (count !== null && count >= 7) {
    return {
      error:
        "Workspace limit reached. Please delete an existing workspace before creating a new one.",
    };
  }

  // Insert Workspace
  const { data: workspace, error: insertError } = await supabase
    .from("workspaces")
    .insert({
      name,
      description,
      type,
      owner_id: user.id, // Pastikan ini menggunakan user.id
    })
    .select()
    .single();

  if (insertError) {
    console.error("🚨 SUPABASE INSERT ERROR:", insertError);
  }

  if (insertError || !workspace) {
    return { error: "Failed to create workspace. Please try again." };
  }

  // Insert ke workspace_members
  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id, // Pastikan ini menggunakan user.id
    role: "owner",
  });

  revalidatePath("/workspace");

  return { success: true, workspaceId: workspace.id };
}
