// import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    // Main Container: Full screen, background gelap premium
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090b] selection:bg-neutral-800 selection:text-white">
      {/* --- BACKGROUND EFFECTS --- */}
      {/* Pola Grid / Kotak-kotak khas website developer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]">
        {/* Radial Gradient Mask: Membuat grid hanya terlihat di tengah/atas dan memudar ke bawah */}
        <div className="absolute inset-0 bg-[#09090b] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* --- HERO CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Top Badge (Pita Status) */}
        <div className="mb-8 inline-flex cursor-default items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-md transition-colors hover:bg-neutral-800/80">
          <Sparkles className="mr-2 h-3.5 w-3.5 text-emerald-500" />
          <span className="tracking-wide">
            The Ultimate Productivity Platform
          </span>
        </div>

        {/* Main Title */}
        <h1 className="bg-gradient-to-br from-white via-neutral-200 to-neutral-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
          Welcome to MindHub
        </h1>

        {/* Subtitle / Deskripsi */}
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-neutral-400 sm:text-xl leading-relaxed">
          Elevate your study sessions. Share materials, manage your roadmap, and
          track your focus time seamlessly in one modern workspace.
        </p>

        {/* Call To Action (CTA) Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
          {/* Primary Button: Get Started */}
          <Link
            href="/signup"
            className="group flex h-11 w-full sm:w-auto items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-neutral-950 transition-all hover:bg-neutral-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-[#09090b] active:scale-95"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>

          {/* Secondary Button: Sign In / Documentation Style */}
          <Link
            href="/login"
            className="flex h-11 w-full sm:w-auto items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 px-8 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-[#09090b] active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Decorative Glow di belakang teks */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]"></div>
    </div>
  );
}
