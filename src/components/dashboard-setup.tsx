"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function DashboardSetup() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Cek apakah ada parameter verified=true di URL
    if (searchParams.get("verified") === "true") {
      // Munculkan toast sukses
      toast.success("Email verified successfully!", {
        description: "Selamat datang di MindHub.",
      });

      // Bersihkan URL dari parameter agar toast tidak muncul lagi saat di-refresh
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return null; // Komponen ini tidak me-render UI apa pun
}
