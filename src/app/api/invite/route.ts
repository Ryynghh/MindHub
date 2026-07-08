import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Invalid or missing token." }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Cek apakah user sedang login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Redirect ke login, lalu kembali ke halaman invite setelah login
    return NextResponse.redirect(new URL(`/login?redirect=/api/invite?token=${token}`, request.url));
  }

  // 2. Cek apakah token ada dan masih pending
  const { data: invitation, error: invError } = await supabase
    .from("workspace_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: "This invitation is no longer valid, expired, or has already been accepted." }, { status: 400 });
  }

  // 3. Cek apakah user sudah jadi member
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

  // 4. Masukkan user ke workspace
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

  // 5. Update status undangan menjadi accepted
  await supabase
    .from("workspace_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  // 6. Redirect ke halaman workspace
  return NextResponse.redirect(new URL(`/workspace/${invitation.workspace_id}`, request.url));
}
