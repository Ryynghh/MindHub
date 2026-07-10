import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Invalid or missing token." }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Cek apakah token ada dan masih pending (lakukan di awal agar kita tahu email tujuannya)
  const { data: invitation, error: invError } = await supabase
    .from("workspace_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: "This invitation is no longer valid, expired, or has already been accepted." }, { status: 400 });
  }

  // 2. Cek apakah user sedang login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirect ke login, lalu kembali ke halaman invite setelah login
    return NextResponse.redirect(new URL(`/login?redirect=/api/invite?token=${token}`, request.url));
  }

  // 3. VALIDASI PENTING: Apakah email user yang sedang login SAMA dengan email tujuan undangan?
  if (user.email !== invitation.invitee_email) {
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Akses Ditolak</title>
        </head>
        <body style="font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #09090b; color: #d4d4d8;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #18181b; padding: 30px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #f87171; margin-top: 0;">Akses Ditolak</h2>
            <p>Undangan ini dikhususkan untuk email: <br/><strong style="color: #10b981;">${invitation.invitee_email}</strong></p>
            <p>Saat ini kamu sedang login sebagai: <br/><strong style="color: #e5e5e5;">${user.email}</strong></p>
            <p style="margin-top: 30px; font-size: 14px; color: #a3a3a3;">
              Silakan kembali ke <a href="/dashboard" style="color: #10b981;">Dashboard</a>, lakukan <strong>Logout</strong>, lalu klik link undangan ini lagi.
            </p>
          </div>
        </body>
      </html>
    `, {
      status: 403,
      headers: { "Content-Type": "text/html" }
    });
  }

  // 4. Cek apakah user sudah jadi member
  const { data: alreadyMember } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", invitation.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (alreadyMember) {
    // User sudah member, langsung redirect ke workspace
    return NextResponse.redirect(new URL(`/workspace/${invitation.workspace_id}`, request.url));
  }

  // 5. Masukkan user ke workspace
  const { error: insertError } = await supabase
    .from("workspace_members")
    .insert([
      {
        workspace_id: invitation.workspace_id,
        user_id: user.id,
        role: "member"
      }
    ]);

  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: "Failed to join workspace." }, { status: 500 });
  }

  // 6. Update status undangan menjadi accepted
  await supabase
    .from("workspace_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  // 7. Redirect ke halaman workspace
  return NextResponse.redirect(new URL(`/workspace/${invitation.workspace_id}`, request.url));
}
