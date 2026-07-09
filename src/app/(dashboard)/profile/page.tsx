import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";

// 👇 1. Import komponen navbar dari folder layouts kamu
import { FloatingHeader } from "@/components/layouts/floating-header";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user")
    .select("user_id, full_name, username, bio, avatar, email")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-background w-full">
      {/* 👇 2. Letakkan Navbar di bagian paling atas */}
      <FloatingHeader />

      {/* 👇 3. Berikan pt-28 (padding-top) agar konten turun di bawah navbar melayang */}
      <div className="max-w-3xl mx-auto pt-28 pb-10 px-6 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan Profil</h1>
          <p className="text-muted-foreground mt-2">Kelola informasi publik dan pengaturan akunmu di sini.</p>
        </div>
        
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  );
}