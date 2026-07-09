"use server";

import { createClient } from "@/lib/supabase/server";
// @ts-ignore - midtrans-client does not have type definitions
import Midtrans from "midtrans-client";

// Inisialisasi Midtrans Snap Client
const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

export async function createSnapToken(tierId: string, priceStr: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Silakan login terlebih dahulu untuk melanjutkan pembayaran." };
  }

  // Konversi format harga string ("75,000") menjadi angka (75000)
  const amount = parseInt(priceStr.replace(/[^0-9]/g, ""));
  if (isNaN(amount) || amount <= 0) {
    return { error: "Format harga tidak valid." };
  }

  // Buat Order ID yang unik untuk transaksi ini
  const orderId = `MINDHUB-${tierId.toUpperCase()}-${Date.now()}`;

  const parameters = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      email: user.email,
    },
    item_details: [
      {
        id: tierId,
        price: amount,
        quantity: 1,
        name: `MindHub ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} Plan`,
      },
    ],
    // Menyimpan user.id agar webhook nanti tahu akun mana yang harus di-upgrade
    custom_field1: user.id,
    custom_field2: tierId,
  };

  try {
    const transaction = await snap.createTransaction(parameters);
    
    // Disini kamu bisa menambahkan kode untuk menyimpan orderId ke tabel "transactions" di Supabase
    // dengan status "pending", agar nanti bisa di-update oleh Webhook Midtrans.
    
    return { token: transaction.token, orderId };
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return { error: error.message || "Gagal membuat token pembayaran dari Midtrans." };
  }
}
