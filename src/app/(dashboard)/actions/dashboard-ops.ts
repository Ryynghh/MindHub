"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. UPDATE WORKSPACE INFO
// ==========================================
export async function updateWorkspaceSettings(workspaceId: string, name: string, description: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (!name) return { error: "Nama workspace tidak boleh kosong." };

  const { error } = await supabase
    .from("workspaces")
    .update({ name, description })
    .eq("id", workspaceId);

  if (error) return { error: error.message };
  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}

// ==========================================
// 2. CREATE TOPIC (SOLUSI NOT-NULL CONSTRAINT)
// ==========================================
export async function createWorkspaceTopic(workspaceId: string, title: string, description: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (!title) return { error: "Judul topik wajib diisi." };

  // SOLUSI: Karena kolom 'created_at' di tabel topic bertipe TEXT dan NON-NULLABLE,
  // kita wajib mengirimkan string tanggal secara manual saat melakukan .insert()
  const { error } = await supabase
    .from("topic")
    .insert({
      workspace_id: workspaceId,
      title: title,
      description: description || "", 
      position: "1", 
      created_at: new Date().toISOString(), // 👈 Mengamankan error null value
    });

  if (error) {
    console.error("🚨 DATABASE TOPIC INSERT ERROR:", error);
    return { error: error.message }; 
  }

  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}

// ==========================================
// 3. INVITE MEMBER
// ==========================================
export async function addWorkspaceMember(workspaceId: string, email: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (!email) return { error: "Email wajib diisi." };

  const { data: userData, error: userError } = await supabase
    .from("user")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (userError || !userData) {
    return { error: "User tidak ditemukan. Pastikan email terdaftar di tabel 'user'." };
  }

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      user_id: userData.user_id,
      role: "member"
    });

  if (memberError) {
    if (memberError.code === "23505") return { error: "User sudah ada di workspace ini." };
    return { error: memberError.message };
  }

  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}

// ==========================================
// 4. CREATE SUBTASK
// ==========================================
export async function createSubtask(workspaceId: string, topicId: string, title: string, deadline: string | null) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (!title) return { error: "Judul subtask wajib diisi." };

  const { error } = await supabase
    .from("subtask")
    .insert({
      topic_id: topicId,
      title: title,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: "To Do",
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("🚨 SUBTASK INSERT ERROR:", error);
    return { error: error.message };
  }

  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}