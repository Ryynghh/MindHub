"use client";

import React, { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CameraIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // 👇 Ditambahkan untuk refresh halaman

export default function ProfileForm({ user, profile }: { user: any, profile: any }) {
  const supabase = createClient();
  const router = useRouter(); // 👇 Inisialisasi router
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk form
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || "");
  
  // State untuk loading
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 👇 Email diambil langsung dari user akun login agar PASTI MUNCUL dan tidak kosong
  const userEmail = user?.email || profile?.email || "";

  // Fungsi untuk Handle Upload Gambar
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`; // Unik menggunakan timestamp
      const filePath = `${fileName}`;

      // 1. Upload file fisik ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Dapatkan URL Public gambarnya
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Simpan URL ke database menggunakan UPSERT
      const { error: updateError } = await supabase
        .from('user')
        .upsert({ 
          user_id: user.id, 
          avatar: publicUrl,
          email: userEmail
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Profile picture updated successfully!");
      router.refresh(); // 🔥 Refresh data Next.js server
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to upload picture: " + (error.message || "Make sure RLS Policy Storage is enabled"));
    } finally {
      setIsUploading(false);
    }
  };

  // Fungsi untuk Menyimpan Data Profil (Teks)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 👇 Menggunakan UPSERT agar jika baris belum ada, otomatis dibuat baru
      const { error } = await supabase
        .from('user')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          username: username,
          bio: bio,
          email: userEmail // Ikut menyimpan email ke tabel user database
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast.success("Profile saved successfully!");
      router.refresh(); // 🔥 Refresh data agar perubahan permanen menetap
    } catch (error: any) {
      toast.error("Failed to save profile: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initial = fullName ? fullName.charAt(0).toUpperCase() : "?";

  return (
    <div className="space-y-8 bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
      
      {/* BAGIAN UPLOAD AVATAR */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border">
        <div className="relative group">
          <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-foreground overflow-hidden border-2 border-border shadow-inner">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
          >
            {isUploading ? <Loader2 className="size-6 animate-spin" /> : <CameraIcon className="size-6" />}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden" 
          />
        </div>
        <div className="text-center md:text-left">
          <h3 className="font-semibold text-lg">Profile Picture</h3>
          <p className="text-sm text-muted-foreground mb-3">Recommended size 256x256px. JPG, PNG formats.</p>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Change Picture"}
          </Button>
        </div>
      </div>

      {/* BAGIAN FORM DATA */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Account Email</label>
          <input 
            type="email" 
            value={userEmail} 
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">Email is automatically connected to your login.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., john_doe"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Bio (About Me)</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a little bit about yourself..."
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}