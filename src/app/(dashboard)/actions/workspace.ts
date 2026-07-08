"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- FUNGSI MENGHAPUS WORKSPACE ---
export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient();

  // Gunakan ON DELETE CASCADE dari database langsung
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    console.error("Gagal menghapus workspace:", error);
    return { error: `Database Error: ${error.message}` };
  }

  // Membersihkan cache agar daftar workspace di UI langsung ter-update
  revalidatePath("/workspace");
  revalidatePath("/dashboard");
  return { success: true };
}

// --- FUNGSI MENGUPDATE WORKSPACE ---
export async function updateWorkspace(
  workspaceId: string,
  name: string,
  description: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .update({ name, description })
    .eq("id", workspaceId);

  if (error) {
    console.error("Gagal mengupdate workspace:", error);
    return { error: "Gagal menyimpan perubahan. Silakan coba lagi." };
  }

  // Membersihkan cache agar nama baru langsung muncul di UI
  revalidatePath("/workspace");
  revalidatePath("/dashboard");
  return { success: true };
}

// --- FUNGSI MEMBUAT WORKSPACE ---
export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";
  const type = formData.get("type") as string;

  if (!name || !type) {
    return { error: "Name and type are required" };
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert([
      {
        user_id: user.id,
        name,
        description,
        type,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat workspace:", error);
    return { error: error.message || "Gagal membuat workspace. Silakan coba lagi." };
  }

  // Otomatis masukkan pembuat workspace ke dalam tabel workspace_members
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert([
      {
        workspace_id: data.id,
        user_id: user.id,
        role: "owner",
      },
    ]);

  if (memberError) {
    console.error("Gagal menambahkan owner ke member:", memberError);
    // Kita tetap kembalikan success karena workspace berhasil dibuat,
    // tapi log errornya untuk debugging
  }

  revalidatePath("/workspace");
  revalidatePath("/dashboard");
  
  return { success: true, workspaceId: data.id };
}

// --- FUNGSI JOIN WORKSPACE (INVITE) ---
export async function joinWorkspace(workspaceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Cek apakah workspace ada
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .single();

  if (wsError || !workspace) {
    return { error: "Workspace tidak ditemukan." };
  }

  // Cek apakah user sudah menjadi member atau owner (misal: user_id dari workspace)
  // Insert ke tabel workspace_members
  const { error: insertError } = await supabase
    .from("workspace_members")
    .insert([
      {
        workspace_id: workspaceId,
        user_id: user.id,
        role: "member",
      },
    ]);

  // Jika error karena unique constraint (artinya sudah join), kita abaikan atau beri info
  if (insertError && insertError.code !== "23505") { // 23505 adalah kode untuk unique violation di Postgres
    console.error("Gagal join workspace:", insertError);
    return { error: "Gagal join workspace. Silakan coba lagi." };
  }

  revalidatePath("/workspace");
  revalidatePath(`/workspace/${workspaceId}`);
  
  return { success: true };
}

// --- FUNGSI MEMBUAT WORKSPACE DARI TEMPLATE (Atomic: Create + Inject Roadmap) ---
export async function createWorkspaceFromTemplate(
  name: string,
  description: string,
  roadmapData: any[]
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Step 1: Buat workspace dengan tipe roadmap + langsung isi roadmap_data
  const { data, error } = await supabase
    .from("workspaces")
    .insert([
      {
        user_id: user.id,
        name,
        description,
        type: "roadmap",
        roadmap_data: roadmapData,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Gagal membuat workspace dari template:", error);
    return { error: error.message || "Gagal membuat workspace." };
  }

  // Step 2: Masukkan pembuat sebagai owner
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert([
      {
        workspace_id: data.id,
        user_id: user.id,
        role: "owner",
      },
    ]);

  if (memberError) {
    console.error("Gagal menambahkan owner ke member:", memberError);
  }

  revalidatePath("/workspace");
  revalidatePath("/dashboard");

  return { success: true, workspaceId: data.id as string };
}
