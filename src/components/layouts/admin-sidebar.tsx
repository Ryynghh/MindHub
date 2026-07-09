"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FolderKanban, CreditCard, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/services/actions/auth";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Workspaces", href: "/admin/workspaces", icon: FolderKanban },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:text-white"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-neutral-800/80 bg-neutral-950/60 backdrop-blur-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-[10px_0_40px_rgba(0,0,0,0.2)]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-20 flex items-center px-6 border-b border-neutral-900/50">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="font-bold text-black font-mono">M</span>
              </div>
              <p className="text-xl font-bold font-mono text-white flex items-center gap-2">
                MindHub
                <span className="text-[10px] uppercase tracking-wider text-amber-500 font-sans bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-1">
                  Admin
                </span>
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm" 
                      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors", 
                    isActive ? "text-amber-500" : "text-neutral-500 group-hover:text-neutral-300"
                  )} />
                  <span className="font-medium text-sm">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-neutral-900/50">
            <form action={signOut}>
              <Button 
                type="submit" 
                variant="destructive" 
                className="w-full flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/30 transition-all shadow-none"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
