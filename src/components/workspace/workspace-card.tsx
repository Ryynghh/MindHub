"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  MoreVertical,
  LayoutDashboard,
  Map as MapIcon,
  Edit2,
  Trash2,
  Loader2, // Tambahan icon spinner untuk loading
  UserPlus, // Icon untuk invite
  Copy, // Icon untuk copy link
  Check, // Icon untuk feedback copy
} from "lucide-react";

// Import komponen DropdownMenu dari Shadcn UI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tambahan: Import komponen Modal dari Shadcn UI
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Tambahan: Import Server Actions (Pastikan path ini sesuai dengan file actions kamu)
import {
  deleteWorkspace,
  updateWorkspace,
} from "@/app/(dashboard)/actions/workspace";

// --- FUNGSI BANTUAN FORMAT TANGGAL ---
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

// --- CSS WIREFRAME THUMBNAILS ---
const ThumbnailWireframe = ({
  type,
}: {
  type: "dashboard" | "roadmap" | string;
}) => {
  if (type === "dashboard") {
    return (
      <div className="w-full h-full p-3 flex flex-col gap-2">
        <div className="w-1/3 h-1.5 bg-neutral-700/50 rounded-full"></div>
        <div className="flex-1 grid grid-cols-2 gap-2 mt-1">
          <div className="bg-neutral-800/40 rounded flex items-center justify-center border border-neutral-700/30">
            <div className="w-8 h-8 rounded-full border-[3px] border-emerald-500/50 border-t-emerald-500"></div>
          </div>
          <div className="bg-neutral-800/40 rounded flex flex-col justify-end p-2 gap-1 border border-neutral-700/30">
            <div className="w-full h-1 bg-neutral-700 rounded-full"></div>
            <div className="w-4/5 h-1 bg-neutral-700 rounded-full"></div>
            <div className="w-full h-1 bg-neutral-700 rounded-full"></div>
          </div>
          <div className="bg-neutral-800/40 rounded flex items-end justify-around p-2 border border-neutral-700/30">
            <div className="w-1.5 h-3 bg-blue-400/50 rounded-sm"></div>
            <div className="w-1.5 h-6 bg-blue-400/80 rounded-sm"></div>
            <div className="w-1.5 h-4 bg-blue-400/60 rounded-sm"></div>
          </div>
          <div className="bg-neutral-800/40 rounded border border-neutral-700/30 p-2">
            <div className="w-1/2 h-1 bg-neutral-600 rounded-full mb-2"></div>
            <div className="w-full h-1 bg-neutral-700/50 rounded-full mb-1"></div>
            <div className="w-3/4 h-1 bg-neutral-700/50 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default to Roadmap/Gantt Wireframe
  return (
    <div className="w-full h-full p-3 flex flex-col">
      <div className="w-1/3 h-1.5 bg-neutral-700/50 rounded-full mb-3"></div>
      <div className="flex-1 flex flex-col gap-2 relative border-l border-neutral-700/50 pl-2">
        <div className="absolute inset-y-0 left-1/3 w-px bg-neutral-700/30 border-dashed"></div>
        <div className="absolute inset-y-0 left-2/3 w-px bg-neutral-700/30 border-dashed"></div>
        <div className="w-2/3 h-2 bg-blue-500/40 border border-blue-500/50 rounded-full mt-1"></div>
        <div className="w-1/2 h-2 bg-emerald-500/40 border border-emerald-500/50 rounded-full ml-4"></div>
        <div className="w-2/5 h-2 bg-amber-500/40 border border-amber-500/50 rounded-full ml-10"></div>
      </div>
    </div>
  );
};

export function WorkspaceCard({
  workspace,
  memberCount,
}: {
  workspace: any;
  memberCount: number;
}) {
  // --- TAMBAHAN LOGIC: STATE MANAGEMENT ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [editName, setEditName] = useState(workspace.name);
  const [editDescription, setEditDescription] = useState(
    workspace.description || "",
  );

  // --- TAMBAHAN LOGIC: EKSEKUSI SERVER ACTIONS ---
  const executeDelete = async () => {
    setIsPending(true);
    const result = await deleteWorkspace(workspace.id);
    setIsPending(false);

    if (result?.error) {
      alert(result.error);
    } else {
      setShowDeleteModal(false);
    }
  };

  const executeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setIsPending(true);
    const result = await updateWorkspace(
      workspace.id,
      editName,
      editDescription,
    );
    setIsPending(false);

    if (result?.error) {
      alert(result.error);
    } else {
      setShowEditModal(false);
    }
  };

  // Fungsi untuk mengcopy link invite
  const copyInviteLink = () => {
    // Generate URL invite, misalnya menggunakan origin dari window
    const inviteLink = `${window.location.origin}/invite/${workspace.id}`;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <div className="group flex flex-col bg-neutral-950/30 rounded-xl border border-neutral-800/60 hover:border-neutral-600 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(255,255,255,0.04)] overflow-hidden">
        {/* THUMBNAIL (Bisa diklik untuk buka project) */}
        <Link
          href={`/workspace/${workspace.id}`}
          className="h-36 w-full bg-neutral-900/50 border-b border-neutral-800/60 relative overflow-hidden group-hover:bg-neutral-900/80 transition-colors block cursor-pointer"
        >
          <ThumbnailWireframe type={workspace.type} />

          {/* Badge Tipe Template */}
          <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 px-2 py-1 rounded text-[10px] text-neutral-300 font-medium flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
            {workspace.type === "dashboard" ? (
              <LayoutDashboard className="w-3 h-3 text-blue-400" />
            ) : (
              <MapIcon className="w-3 h-3 text-amber-400" />
            )}
            {workspace.type}
          </div>
        </Link>

        {/* DETAIL PROJECT */}
        <div className="p-4 flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link
                href={`/workspace/${workspace.id}`}
                className="font-semibold text-sm text-neutral-200 group-hover:text-white truncate block cursor-pointer"
                title={workspace.name}
              >
                {workspace.name}
              </Link>
              {workspace.description && (
                <p
                  className="text-xs text-neutral-500 mt-0.5 line-clamp-1 truncate"
                  title={workspace.description}
                >
                  {workspace.description}
                </p>
              )}
            </div>

            {/* DROPDOWN MENU AKSI */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-1 rounded transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 bg-neutral-950 border-neutral-800 text-neutral-300 shadow-xl"
              >
                {/* 
                  Perubahan Logic: 
                  Gunakan onSelect untuk men-trigger state Modal. 
                  e.preventDefault() diperlukan agar dropdown tidak bentrok dengan fokus Modal.
                */}
                <DropdownMenuItem
                  onSelect={() => setShowEditModal(true)}
                  className="cursor-pointer hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 focus:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2 text-neutral-400" />
                  <span>Edit Workspace</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => setShowInviteModal(true)}
                  className="cursor-pointer hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 focus:text-white transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2 text-blue-400" />
                  <span>Invite Members</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-neutral-800/60" />

                <DropdownMenuItem
                  onSelect={() => setShowDeleteModal(true)}
                  className="cursor-pointer text-red-400 hover:bg-red-950/50 hover:text-red-300 focus:bg-red-950/50 focus:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Delete Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* METADATA BAWAH (Jumlah Member & Last Updated) */}
          <div className="flex justify-between items-center mt-2 pt-3 border-t border-neutral-800/50">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>
                {memberCount || 1} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
            <span
              className="text-[11px] text-neutral-600 font-medium"
              title={`Created: ${new Date(workspace.created_at).toLocaleDateString()}`}
            >
              Updated {timeAgo(workspace.updated_at)}
            </span>
          </div>
        </div>
      </div>

      {/* --- TAMBAHAN UI: MODALS --- */}

      {/* Modal Edit */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Ubah detail nama atau deskripsi dari workspace ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={executeEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Nama Workspace
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Misal: Proyek Alpha"
                className="bg-neutral-900 border-neutral-800 text-white"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Deskripsi (Opsional)
              </label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Tambahkan deskripsi singkat..."
                className="bg-neutral-900 border-neutral-800 text-white"
                disabled={isPending}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending || !editName.trim()}>
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Invite Link */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Bagikan link ini kepada tim Anda agar mereka dapat bergabung ke 
              <strong className="text-neutral-300 ml-1">{workspace.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/invite/${workspace.id}` : ''}
                className="bg-neutral-900 border-neutral-800 text-neutral-400 focus-visible:ring-0"
              />
              <Button 
                onClick={copyInviteLink}
                className="shrink-0 bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {isCopied && (
              <p className="text-xs text-emerald-400 animate-in fade-in slide-in-from-top-1">
                Link copied to clipboard!
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowInviteModal(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Delete Confirmation */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Hapus Workspace?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500">
              Tindakan ini tidak dapat dibatalkan. Workspace{" "}
              <strong className="text-neutral-300">{workspace.name}</strong>{" "}
              beserta seluruh isinya akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-neutral-800 hover:bg-neutral-900 text-neutral-300"
              disabled={isPending}
            >
              Batal
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={executeDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Ya, Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
