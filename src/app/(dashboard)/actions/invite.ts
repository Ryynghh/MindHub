"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function inviteUserToWorkspace(workspaceId: string, email: string) {
  try {
    const supabase = await createClient();
    
    // Pastikan user login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in to invite members." };

    // Validasi apakah user adalah member dari workspace ini
    const { data: memberCheck } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();
      
    if (!memberCheck) return { error: "Access denied. You are not a member of this workspace." };

    // Cek apakah email yang diundang sudah jadi member
    const { data: existingUser } = await supabase
      .from("user")
      .select("user_id")
      .eq("email", email)
      .single();

    if (existingUser) {
      const { data: alreadyMember } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", existingUser.user_id)
        .single();
        
      if (alreadyMember) return { error: "This user is already a member of this workspace!" };
    }

    // Ambil nama workspace untuk email
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .single();

    const workspaceName = workspace?.name || "a workspace";
    const inviterName = user.user_metadata?.full_name || user.email || "Someone";

    // Generate Token
    const token = crypto.randomUUID();

    // Masukkan ke database
    const { error: insertError } = await supabase
      .from("workspace_invitations")
      .insert([
        {
          workspace_id: workspaceId,
          inviter_id: user.id,
          invitee_email: email,
          token: token,
          status: "pending"
        }
      ]);

    if (insertError) {
      console.error("Failed to create invitation in database:", insertError);
      return { error: "Failed to create invitation. Please check your database setup." };
    }

    // Kirim Email menggunakan Resend
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/invite?token=${token}`;

    if (!process.env.RESEND_API_KEY) {
      console.warn("=== RESEND_API_KEY NOT SET ===");
      console.warn(`Manual invite link: ${inviteUrl}`);
      return { success: true, warning: "RESEND_API_KEY not configured. Check server console for the invite link." };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "MindHub <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName} invited you to "${workspaceName}" on MindHub`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #d4d4d8; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #18181b; border-radius: 12px; border: 1px solid #27272a; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">🧠 MindHub</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Workspace Invitation</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 32px 24px;">
              <p style="color: #e5e5e5; font-size: 16px; margin: 0 0 8px;">Hi there! 👋</p>
              <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                <strong style="color: #e5e5e5;">${inviterName}</strong> has invited you to join 
                <strong style="color: #10b981;">"${workspaceName}"</strong> on MindHub.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                  Accept Invitation
                </a>
              </div>
              
              <p style="color: #737373; font-size: 12px; margin: 24px 0 0; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${inviteUrl}" style="color: #10b981; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="padding: 16px 24px; border-top: 1px solid #27272a; text-align: center;">
              <p style="color: #525252; font-size: 11px; margin: 0;">
                © MindHub — AI-Powered Learning Platform
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (emailError) {
      console.error("Resend API Error:", JSON.stringify(emailError, null, 2));
      return { error: `Invitation saved, but email failed: ${emailError.message}` };
    }

    console.log("Email sent successfully! ID:", emailData?.id);
    return { success: true };
  } catch (err: any) {
    console.error("Invite Error:", err);
    return { error: "An internal error occurred: " + err.message };
  }
}
