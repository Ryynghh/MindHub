"use client";

import React from "react";
import { Grid2x2PlusIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetFooter } from "@/components/sheet";
import { Button } from "@/components/ui/button"; // Hapus impor buttonVariants
import { cn } from "@/lib/utils";
import { signOut } from "@/services/actions/auth";

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);

  const links = [
    // 👇 Penulisan href /dashboard disarankan menggunakan huruf kecil
    { label: "Dashboard", href: "/dashboard" },
    { label: "Workspace", href: "/workspace" },
    { label: "Chat bot", href: "/chat" },
    // 👇 Kapitalisasi pada label dirapikan
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header
      className={cn(
        "sticky top-5 z-50",
        "mx-auto w-full max-w-4xl rounded-lg border border-white/20", // Border dinaikkan ke 20%
        "bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg",
        "shadow-[0_10px_40px_rgba(255,255,255,0.15)]", // Shadow lebih tebal (15%) dan lebih menyebar (40px)
      )}
    >
      <nav className="mx-auto flex items-center justify-between rounded-3xl h-15 p-1.5">
        {/* 👇 Logo Brand dibungkus dengan Link */}
        <Link
          href="/dashboard"
          className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100 transition-colors"
        >
          <p className="text-md font-mono text-base font-bold">MindHub</p>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            // Menggunakan asChild untuk membungkus komponen Link Next.js
            <Button
              key={link.label}
              variant="ghost"
              className="text-md"
              asChild
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>

        {/* Call to Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
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
                {links.map((link) => (
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
                ))}
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
  );
}
