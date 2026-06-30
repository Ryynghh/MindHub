"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  MoreVertical,
  LayoutDashboard,
  Map as MapIcon,
} from "lucide-react";

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
  // Sesuai PRD: Arahkan user ke halaman project saat diklik
  const destination =
    workspace.type === "roadmap" ? `/roadmap` : `/dashboard/${workspace.id}`;

  return (
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
          <div>
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

          {/* Sesuai PRD: Menu Aksi (Edit/Delete Project) */}
          <button className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-1 rounded transition-colors shrink-0">
            <MoreVertical className="w-4 h-4" />
          </button>
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
  );
}
