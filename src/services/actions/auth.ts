"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Logika Bisnis untuk Sign In (Masuk)
 */
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Jika sukses, arahkan pengguna ke halaman dashboard
  redirect("/dashboard");
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

  return { success: "Akun berhasil dibuat! Silakan login (atau cek email jika konfirmasi diaktifkan)." };
}

/**
 * Logika Bisnis untuk Sign Out (Keluar)
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}