// src/services/actions/auth.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // 1. Proses login standar via Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Jika gagal, kembalikan pesan error ke form
  if (error) {
    return { error: error.message };
  }

  // 2. LOGIKA ROUTING ADMIN VS USER BIASA
  if (email === "admin@gmail.com") {
    // Jika admin yang login, lempar ke Dashboard Admin
    redirect("/admin/dashboard");
  } else {
    // Jika user biasa, lempar ke Workspace/Dashboard standar
    redirect("/dashboard");
  }
}
/**
 * Logika Bisnis untuk Sign Up (Daftar Akun Baru)
 */
export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  // Validasi dasar di sisi server
  if (!email || !password || !name) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (password !== confirmPassword) {
    return { error: "Password dan konfirmasi password tidak cocok." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name, // Menyimpan nama ke dalam raw_user_meta_data Supabase
      },
      // Hapus atau sesuaikan emailRedirectTo ini jika kamu belum mengatur URL di Supabase
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Account created successfully! Please sign in.",
  };
}

/**
 * Logika Bisnis untuk Sign Out (Keluar)
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  // Meminta URL OAuth dari Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Arahkan kembali ke Route Handler callback yang sudah kita buat sebelumnya
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/callback`,
    },
  });

  if (error) {
    console.error("Google OAuth error:", error.message);
    return { error: "Failed to connect to Google." };
  }

  // Lakukan redirect ke halaman otentikasi Google
  if (data.url) {
    redirect(data.url);
  }
}
