export type PricingFeature = {
  text: string;
  included: boolean;
};

export type PricingTier = {
  id: string;
  name: string;
  description: string;
  price: string;
  buttonText: string;
  buttonAction: string;
  highlight?: string; // Teks "Everything in X and:"
  features: PricingFeature[];
};

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Intelligence for everyday tasks",
    price: "0",
    buttonText: "Get Free",
    buttonAction: "/signup",
    features: [
      { text: "Standard AI Model Access", included: true },
      { text: "Up to 3 Roadmaps & Dashboards", included: true },
      { text: "Standard generation speed", included: true },
      { text: "Basic export options", included: true },
      { text: "Community support", included: true },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    description: "Keep chatting with expanded access",
    price: "75,000",
    buttonText: "Get Go ↗",
    buttonAction: "/checkout/go",
    highlight: "Everything in Free and:",
    features: [
      { text: "Faster AI Model response time", included: true },
      { text: "Up to 10 Roadmaps & Dashboards", included: true },
      { text: "More daily AI messages", included: true },
      { text: "Priority queue during peak hours", included: true },
    ],
  },

  {
    id: "pro",
    name: "Pro",
    description: "Maximize your productivity",
    price: "200,000",
    buttonText: "Get Pro ↗",
    buttonAction: "/checkout/pro",
    highlight: "Everything in Plus and:",
    features: [
      { text: "Maximum AI Reasoning & Capabilities", included: true },
      { text: "Unlimited Roadmaps & Dashboards", included: true },
      { text: "Highest priority AI processing", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom API Access", included: true },
    ],
  },
];
