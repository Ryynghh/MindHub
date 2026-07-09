import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validasi Keamanan (Signature Key)
    // Supaya hacker tidak bisa menembak API ini secara palsu
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureKey = body.signature_key;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(body.order_id + body.status_code + body.gross_amount + serverKey)
      .digest("hex");

    if (signatureKey !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Ambil data penting dari payload Midtrans
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    const userId = body.custom_field1; // Tadi kita simpan user.id disini
    const tierId = body.custom_field2; // Tadi kita simpan nama paket disini (plus / pro)

    if (!userId || !tierId) {
      return NextResponse.json({ message: "No custom field found. Ignoring." }, { status: 200 });
    }

    // 3. Logika Perubahan Status
    // Transaksi Midtrans dianggap sukses jika statusnya capture (Kartu Kredit) atau settlement (Transfer Bank/GoPay dll)
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "challenge") {
        // Pembayaran butuh verifikasi manual di dashboard Midtrans (jarang terjadi)
        console.log("Pembayaran di-challenge oleh fraud detection.");
      } else {
        // PEMBAYARAN SUKSES!
        
        // Kita menggunakan Supabase Admin Client karena API Route ini tidak dipanggil oleh user (tidak punya session login)
        // melainkan dipanggil oleh server Midtrans.
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Update database user menjadi paket yang dibeli
        // CATATAN: Pastikan di tabel public."user" milikmu sudah ada kolom bernama "plan"
        const { error } = await supabaseAdmin
          .from("user")
          .update({ subscription_tier: tierId }) // Ubah paket jadi "pro" atau "plus"
          .eq("user_id", userId);

        if (error) {
          console.error("Gagal mengupdate database user:", error);
          return NextResponse.json({ error: "Gagal update database" }, { status: 500 });
        }

        console.log(`Berhasil! User ${userId} telah di-upgrade ke paket ${tierId}.`);
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      // Pembayaran gagal atau kadaluarsa
      console.log(`Pembayaran order ${body.order_id} gagal/kadaluarsa.`);
    }

    // Harus selalu me-return HTTP 200 OK ke Midtrans
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
