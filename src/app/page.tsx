import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Target,
  CalendarDays,
  Brain,
  Rocket,
} from "lucide-react";
import { pricingTiers } from "@/config/pricing-data";
import { PricingCard } from "@/components/pricing/pricing-card";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-neutral-200 selection:bg-neutral-800 selection:text-white">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none fixed">
        <div className="absolute inset-0 bg-[#09090b] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto pt-32 pb-24">
        {/* --- HERO SECTION --- */}
        <section className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out mb-48 w-full">
          <div className="mb-8 inline-flex cursor-default items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-md transition-colors hover:bg-neutral-800/80">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-emerald-500" />
            <span className="tracking-wide">
              The Ultimate Learning Platform for IT Students
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-outfit)] text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6 leading-[1.1]">
            Structure your learning<br className="hidden sm:block" />
             journey with <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">MindHub</span>.
          </h1>

          <p className="mx-auto max-w-2xl text-lg tracking-tight text-neutral-400 sm:text-xl leading-relaxed mb-10">
            MindHub is built to help Computer Science students and developers
            structure their learning journeys, manage roadmaps, and track
            progress effortlessly.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
            <Link
              href="/signup"
              className="group flex h-11 w-full sm:w-auto items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-neutral-950 transition-all hover:bg-neutral-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
            <Link
              href="/login"
              className="flex h-11 w-full sm:w-auto items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 px-8 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              Sign In
            </Link>
          </div>

          <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]"></div>
        </section>

        {/* --- THE STORY (BACKGROUND) --- */}
        <section className="mb-48 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="flex flex-col md:flex-row gap-12 items-center bg-neutral-900/30 border border-neutral-800 rounded-3xl p-8 sm:p-12 hover:border-neutral-700 transition-colors">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center rounded-lg bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 border border-emerald-500/20">
                Our Story
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
                Born from the struggles of learning tech.
              </h2>
              <p className="text-neutral-400 leading-relaxed">
                As IT students, we constantly found ourselves overwhelmed by the
                sheer volume of technologies to learn. Tutorials were scattered,
                roadmaps were generic, and tracking progress was a mess of
                disconnected spreadsheets and note-taking apps.
              </p>
              <p className="text-neutral-400 leading-relaxed">
                MindHub was created to solve this. We wanted a single,
                beautifully designed space where learning isn't just about
                reading documentation, but about structured, actionable daily
                plans.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-gradient-to-tr from-emerald-900/20 to-neutral-800 border border-neutral-700/50 flex items-center justify-center overflow-hidden shadow-2xl">
                <Brain className="w-32 h-32 text-neutral-300 opacity-20" />
                <div className="absolute inset-0 bg-neutral-950/20 backdrop-blur-sm mix-blend-overlay"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT HELPS (FEATURES) --- */}
        <section className="mb-48 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Our platform provides all the tools necessary to turn your
              learning goals into achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:bg-neutral-900/60 hover:border-neutral-700 transition-all">
              <div className="h-12 w-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-6 shadow-inner">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Structured Roadmaps
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Stop wondering what to learn next. Access curated, step-by-step
                daily roadmaps for Web Dev, DSA, Machine Learning, and more.
              </p>
            </div>

            <div className="flex flex-col p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:bg-neutral-900/60 hover:border-neutral-700 transition-all">
              <div className="h-12 w-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-6 shadow-inner">
                <CalendarDays className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Daily Scheduling
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Automatically generate daily tasks from your chosen templates.
                Keep yourself accountable with beautiful Gantt charts and
                progress tracking.
              </p>
            </div>

            <div className="flex flex-col p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:bg-neutral-900/60 hover:border-neutral-700 transition-all">
              <div className="h-12 w-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-6 shadow-inner">
                <Rocket className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Instant Workspaces
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Create dedicated learning spaces in one click. Organize your
                notes, references, and project ideas without ever leaving the
                platform.
              </p>
            </div>
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section className="w-full mb-32" id="pricing">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Start for free, upgrade when you need to unlock the full potential
              of your learning journey.
            </p>
          </div>

          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="w-full border-t border-neutral-900 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} MindHub. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
