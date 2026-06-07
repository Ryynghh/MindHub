import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Ambil URL lengkap saat user mengklik link di email
  const { searchParams, origin } = new URL(request.url);
  
  // Ambil parameter '?code=' dari URL
  const code = searchParams.get("code");
  // Ambil parameter '?next=' jika ada (default ke '/dashboard')
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    
    // Tukarkan kode rahasia dengan sesi login yang valid
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Jika berhasil, alihkan user ke halaman sukses/dashboard
      return NextResponse.redirect(`${origin}${next}?verified=true`);
    }
  }

  // Jika kode tidak valid atau kadaluarsa, kembalikan ke login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=Link_konfirmasi_tidak_valid`);
}