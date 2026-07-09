"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, Loader2 } from "lucide-react";
import Script from "next/script";
import { PricingTier } from "@/config/pricing-data";
import { createSnapToken } from "@/app/(dashboard)/actions/checkout";

// Supaya Typescript mengenali objek window.snap dari Midtrans
declare global {
  interface Window {
    snap: any;
  }
}

interface PricingCardProps {
  tier: PricingTier;
}

export function PricingCard({ tier }: PricingCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCheckout = async (e: React.MouseEvent) => {
    // Jika paket gratis, biarkan link berjalan normal (navigasi ke buttonAction)
    if (tier.id === "free") return;
    
    e.preventDefault(); // Cegah pindah halaman
    setIsLoading(true);

    // Panggil backend untuk dapat token pembayaran
    const result = await createSnapToken(tier.id, tier.price);
    setIsLoading(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    // Panggil pop-up Snap Midtrans
    if (result.token && window.snap) {
      window.snap.pay(result.token, {
        onSuccess: function () {
          alert("Payment successful!");
          window.location.reload();
        },
        onPending: function () {
          alert("Waiting for your payment to be completed.");
        },
        onError: function () {
          alert("Payment failed!");
        },
        onClose: function () {
          console.log("Customer closed the popup without finishing the payment");
        },
      });
    } else {
      alert("Payment script failed to load. Please refresh the page.");
    }
  };

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="flex flex-col p-6 sm:p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 transition-all hover:border-neutral-700">
      {/* Header Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-2">{tier.name}</h3>
        <p className="text-neutral-400 text-sm h-10">{tier.description}</p>
      </div>

      {/* Price Section */}
      <div className="mb-6 flex items-baseline gap-1.5">
        <span className="text-xl font-medium text-white">IDR</span>
        <span className="text-4xl font-bold text-white tracking-tight">
          {tier.price}
        </span>
        <span className="text-neutral-500 text-sm">/ month</span>
      </div>

      {/* CTA Button */}
      <Link
        href={tier.buttonAction}
        onClick={handleCheckout}
        className={`w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-neutral-950 font-medium rounded-full flex items-center justify-center transition-colors mb-8 ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : tier.buttonText}
      </Link>

      {/* Features List */}
      <div className="flex-1">
        {tier.highlight && (
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-semibold text-white">
              {tier.highlight}
            </span>
          </div>
        )}
        <ul className="flex flex-col gap-4">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-300 leading-tight">
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}
