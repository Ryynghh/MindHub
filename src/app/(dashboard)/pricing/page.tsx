import React from "react";
import { pricingTiers } from "@/config/pricing-data";
import { PricingCard } from "@/components/pricing/pricing-card";
// 👇 1. Import FloatingHeader
import { FloatingHeader } from "@/components/layouts/floating-header";

export const metadata = {
  title: "Pricing | MindHub",
  description: "Choose the perfect plan for your productivity needs.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-neutral-200 selection:bg-neutral-800">
      {/* 👇 2. Pasang FloatingHeader di paling atas */}
      <FloatingHeader />

      {/* 👇 3. Ubah div menjadi <main> dengan pt-32 (jarak untuk header) dan flex-1 agar tetap di tengah */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col items-center w-full">
          {/* Header Text */}
          <div className="text-center max-w-2xl mb-16 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-1000 fill-mode-both">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Upgrade your intelligence
            </h1>
            <p className="text-lg text-neutral-400">
              Get lightning-fast AI models and unlock more roadmap & dashboard
              templates to supercharge your workflow.
            </p>
          </div>

          {/* Pricing Grid (Untuk 2 Kartu) */}
          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>

          {/* FAQ or Footer Notice */}
          <p className="mt-16 text-sm text-neutral-500 text-center">
            Need a custom enterprise plan?{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-white transition-colors"
            >
              Contact sales
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
