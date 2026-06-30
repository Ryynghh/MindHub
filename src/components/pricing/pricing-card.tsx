"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PricingTier } from "@/config/pricing-data";

interface PricingCardProps {
  tier: PricingTier;
}

export function PricingCard({ tier }: PricingCardProps) {
  return (
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
        className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-neutral-950 font-medium rounded-full text-center transition-colors mb-8"
      >
        {tier.buttonText}
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
  );
}
