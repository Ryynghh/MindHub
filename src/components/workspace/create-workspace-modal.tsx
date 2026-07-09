"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkspace } from "@/app/(dashboard)/actions/workspace";
import { Plus, LayoutDashboard, Map, Loader2, Brain } from "lucide-react";
// Asumsikan kamu menggunakan Sonner atau Shadcn Toast
import { toast } from "sonner";

export function CreateWorkspaceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState<"dashboard" | "roadmap" | null>(
    null,
  );
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // PRD Rule: Template type wajib dipilih
    if (!template) {
      toast.error("Please select a template type.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("type", template);

    const result = await createWorkspace(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      // PRD Rule: Success Toast & Redirect
      toast.success("Workspace created successfully.");
      setIsOpen(false);
      router.push(`/workspace/${result.workspaceId}`);
    }

    setIsLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition-all hover:bg-neutral-200 active:scale-95 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Create Workspace
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0e] shadow-2xl animate-in zoom-in-95">
            <div className="border-b border-neutral-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Create New Workspace
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Setup your project environment.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Field: Workspace Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Workspace Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. Q3 Product Roadmap"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-colors"
                />
              </div>

              {/* Field: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Description{" "}
                  <span className="text-neutral-600">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  maxLength={200}
                  rows={3}
                  placeholder="Briefly describe this project..."
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-colors resize-none"
                />
              </div>

              {/* Field: Invite Members */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Invite Members{" "}
                  <span className="text-neutral-600">(Optional)</span>
                </label>
                <input
                  name="invitedEmails"
                  type="text"
                  placeholder="Enter email addresses separated by commas"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-colors"
                />
              </div>

              {/* Field: Template Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300">
                  Select Template <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setTemplate("dashboard")}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${template === "dashboard" ? "border-white bg-neutral-800" : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"}`}
                  >
                    <Brain
                      className={`mb-2 h-6 w-6 ${template === "dashboard" ? "text-white" : "text-neutral-500"}`}
                    />
                    <p className="text-sm font-medium text-white">Learning Space</p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Fokus & kelola materi belajar
                    </p>
                  </div>
                  <div
                    onClick={() => setTemplate("roadmap")}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${template === "roadmap" ? "border-white bg-neutral-800" : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"}`}
                  >
                    <Map
                      className={`mb-2 h-6 w-6 ${template === "roadmap" ? "text-white" : "text-neutral-500"}`}
                    />
                    <p className="text-sm font-medium text-white">Roadmap</p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Gantt & strategic planning
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-neutral-900 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center min-w-[140px] rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Workspace"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
