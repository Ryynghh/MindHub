"use client";

import React, { useEffect, useState } from "react";
import { MenuIcon, UserCircle } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetFooter } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/services/actions/auth";
import { createBrowserClient } from "@supabase/ssr";
import { ChatBotPopup } from "@/components/chat-bot-popup";

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Inisialisasi Supabase client untuk browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Cek apakah user yang sedang login adalah admin
  useEffect(() => {
    // 1. Langsung baca dari cache terlebih dahulu agar sangat cepat (menghindari kedipan panjang)
    const cached = sessionStorage.getItem("mindhub_is_admin");
    if (cached !== null) {
      setIsAdmin(cached === "true");
    }
    const cachedAvatar = sessionStorage.getItem("mindhub_user_avatar");
    if (cachedAvatar) {
      setAvatarUrl(cachedAvatar);
    }

    // 2. Lakukan validasi ke server di background
    async function checkUserRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      const adminStatus = user && user.email === "admin@gmail.com";
      setIsAdmin(!!adminStatus);
      
      if (user) {
        // Fetch custom avatar dari database
        const { data: dbUser } = await supabase
          .from("user")
          .select("avatar")
          .eq("user_id", user.id)
          .single();

        const avatar = dbUser?.avatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
        if (avatar) {
          setAvatarUrl(avatar);
          sessionStorage.setItem("mindhub_user_avatar", avatar);
        }
      }
      
      // Simpan ke session storage untuk navigasi selanjutnya
      sessionStorage.setItem("mindhub_is_admin", adminStatus ? "true" : "false");
    }
    checkUserRole();
  }, [supabase]);

  // 🚦 LOGIKA MENU DINAMIS: Jika admin, berikan menu khusus admin
  const links = isAdmin === true
    ? [
        { label: "Overview", href: "/admin/dashboard" },
        { label: "Users", href: "/admin/users" },
        { label: "Workspaces", href: "/admin/workspaces" },
        { label: "Payments", href: "/admin/payments" },
      ]
    : [
        { label: "Workspace", href: "/workspace" },
        { label: "Templates", href: "/templates" },
        { label: "Pricing", href: "/pricing" },
      ];

  return (
    <>
      <header
        className={cn(
          "sticky top-5 z-50",
          "mx-auto w-full max-w-4xl rounded-lg border border-white/20",
          "bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg",
          "shadow-[0_10px_40px_rgba(255,255,255,0.15)]",
        )}
      >
      <nav className="mx-auto flex items-center justify-between rounded-3xl h-15 p-1.5">
        {/* Logo Brand - Otomatis mengarah ke dashboard yang sesuai */}
        <Link
          href={isAdmin ? "/admin/dashboard" : "/dashboard"}
          className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100 transition-colors"
        >
          <p className="text-md font-mono text-base font-bold">
            MindHub{" "}
            {isAdmin && (
              <span className="text-xs text-amber-500 font-sans ml-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Admin
              </span>
            )}
          </p>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex min-w-[400px] justify-center">
          {isAdmin === null ? (
            <div className="flex gap-6">
              <div className="h-8 w-24 rounded-md bg-white/5 animate-pulse" />
              <div className="h-8 w-24 rounded-md bg-white/5 animate-pulse" />
              <div className="h-8 w-24 rounded-md bg-white/5 animate-pulse" />
            </div>
          ) : (
            links.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                className="text-md px-6 hover:bg-white/5 transition-colors"
                asChild
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))
          )}
        </div>

        {/* Call to Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {isAdmin !== null && !isAdmin && (
            <Link 
              href="/profile" 
              title="Profile Settings"
              className="flex items-center justify-center w-9 h-9 overflow-hidden rounded-full border border-white/20 bg-background/50 hover:bg-accent hover:border-white/40 transition-all mr-1"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              )}
            </Link>
          )}

          <form action={signOut}>
            <Button type="submit" variant="destructive" className="text-base">
              Logout
            </Button>
          </form>

          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen(!open)}
              className="lg:hidden"
            >
              <MenuIcon className="size-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>

            <SheetContent
              className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
              showClose={false}
              side="left"
            >
              <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                {isAdmin === null ? (
                  <>
                    <div className="h-10 w-full rounded-md bg-white/5 animate-pulse" />
                    <div className="h-10 w-full rounded-md bg-white/5 animate-pulse" />
                  </>
                ) : (
                  links.map((link) => (
                    <Button
                      key={link.label}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={link.href} onClick={() => setOpen(false)}>
                        {link.label}
                      </Link>
                    </Button>
                  ))
                )}
              </div>
              <SheetFooter className="px-4 pb-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
    <ChatBotPopup />
    </>
  );
}
