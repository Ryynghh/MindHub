"use client";

import React, { useState } from "react";
import { Plus, Loader2, Mail } from "lucide-react";
import { inviteUserToWorkspace } from "@/app/(dashboard)/actions/invite";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function InviteModal({ workspaceId }: { workspaceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Format email tidak valid.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await inviteUserToWorkspace(workspaceId, email);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.warning ? res.warning : "Undangan berhasil dikirim ke email!");
        setIsOpen(false);
        setEmail("");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengundang member.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="w-8 h-8 rounded-full border-2 border-dashed border-neutral-600 bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-400 hover:bg-neutral-800 transition-all z-0"
          title="Invite Member"
        >
          <Plus className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-neutral-950 border border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-500" />
            Invite Member
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Kirim undangan kolaborasi ke teman setim kamu melalui email.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">
              Email Address
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-neutral-800 text-neutral-300 hover:bg-neutral-900"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 text-white hover:bg-emerald-500 border-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Mengirim...</>
              ) : (
                "Kirim Undangan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
