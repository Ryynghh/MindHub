"use client";

import React from "react";
import { Users } from "lucide-react";
import { InviteModal } from "./invite-modal";

export interface WorkspaceMember {
  member_id: string;
  workspace_id: string;
  role: string;
  user_id: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
}

export function MembersGroup({ members, workspaceId }: { members: WorkspaceMember[], workspaceId: string }) {
  if (!members || members.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-neutral-950/80 border border-neutral-800/80 px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center text-sm font-medium text-neutral-400 mr-2">
        <Users className="w-4 h-4 mr-1.5" />
        <span className="hidden sm:inline">Members</span>
      </div>
      <div className="flex -space-x-2">
        {members.map((member, index) => {
          // Buat inisial dari nama atau email
          const displayName = member.full_name || member.email;
          const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";

          return (
            <div
              key={member.member_id}
              className="relative group z-10 hover:z-20 transition-all duration-300 hover:-translate-y-1"
              title={`${displayName} (${member.role})`}
            >
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border-2 border-neutral-900 object-cover shadow-sm bg-neutral-800"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-neutral-900 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {initial}
                </div>
              )}
              
              {/* Tooltip Kustom (opsional jika title kurang bagus) */}
              <div className="absolute top-10 right-0 md:left-1/2 md:-translate-x-1/2 w-max px-2 py-1 bg-neutral-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-neutral-700/50">
                <p className="font-semibold">{displayName}</p>
                <p className="text-neutral-400 text-[10px]">{member.email}</p>
                <span className="text-[10px] uppercase text-blue-400 font-bold tracking-wider mt-1 block">
                  {member.role}
                </span>
              </div>
            </div>
          );
        })}
        {workspaceId && <InviteModal workspaceId={workspaceId} />}
      </div>
    </div>
  );
}
