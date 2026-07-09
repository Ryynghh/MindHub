// src/app/admin/payments/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import {
  CreditCard,
  Receipt,
  TrendingUp,
  DollarSign,
  Calendar,
  UserCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== "admin@gmail.com") {
    redirect("/dashboard");
  }

  // Use admin client (bypasses RLS) to fetch all data
  const adminDb = createAdminClient();

  const { data: allUsers } = await adminDb
    .from("user")
    .select("*")
    .order("created_at", { ascending: false });

  const users = allUsers || [];

  // Simulate payment/subscription data from user table
  const premiumUsers = users.filter(
    (u) => u.subscription_tier === "plus" || u.subscription_tier === "pro"
  );

  const plusUsers = users.filter((u) => u.subscription_tier === "plus");
  const proUsers = users.filter((u) => u.subscription_tier === "pro");

  // Calculate revenue estimates based on pricing
  const plusPrice = 29000; // IDR
  const proPrice = 79000; // IDR
  const estimatedRevenue = plusUsers.length * plusPrice + proUsers.length * proPrice;

  return (
    <main className="w-full px-8 py-10 pb-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-8 border-b border-neutral-900 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Payments & Subscriptions
                </h1>
              </div>
              <p className="text-neutral-400 mt-2 ml-14">
                Track subscription revenue and payment activity.
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Estimated Revenue */}
          <Card className="bg-gradient-to-br from-emerald-950/60 via-neutral-950 to-neutral-950 border-emerald-900/40 shadow-xl overflow-hidden relative">
            <div className="absolute -right-4 -top-4 text-emerald-500/10">
              <DollarSign className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-emerald-300/80">
                Estimated MRR
              </CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-emerald-400">
                Rp {estimatedRevenue.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-emerald-500/60 mt-2">Monthly recurring revenue</p>
            </CardContent>
          </Card>

          {/* Total Premium */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Premium Subscribers
              </CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{premiumUsers.length}</div>
              <p className="text-xs text-neutral-500 mt-2">
                {users.length > 0 ? Math.round((premiumUsers.length / users.length) * 100) : 0}% conversion rate
              </p>
            </CardContent>
          </Card>

          {/* Plus Revenue */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Plus Tier
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Receipt className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{plusUsers.length}</div>
              <p className="text-xs text-neutral-500 mt-2">
                Rp {(plusUsers.length * plusPrice).toLocaleString("id-ID")}/mo
              </p>
            </CardContent>
          </Card>

          {/* Pro Revenue */}
          <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Pro Tier
              </CardTitle>
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Receipt className="w-4 h-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{proUsers.length}</div>
              <p className="text-xs text-neutral-500 mt-2">
                Rp {(proUsers.length * proPrice).toLocaleString("id-ID")}/mo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Breakdown */}
        <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-lg mb-10">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-neutral-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Plus Tier Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Plus Tier
                  </span>
                  <span className="text-neutral-300 font-medium">
                    Rp {(plusUsers.length * plusPrice).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="h-3 bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                    style={{
                      width: estimatedRevenue > 0
                        ? `${((plusUsers.length * plusPrice) / estimatedRevenue) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Pro Tier Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Pro Tier
                  </span>
                  <span className="text-neutral-300 font-medium">
                    Rp {(proUsers.length * proPrice).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="h-3 bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                    style={{
                      width: estimatedRevenue > 0
                        ? `${((proUsers.length * proPrice) / estimatedRevenue) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Users Table */}
        <Card className="bg-neutral-950/60 border-neutral-800/80 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-neutral-900/50 pb-4">
            <CardTitle className="text-base text-neutral-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Premium Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-900/40 text-[11px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-900/50">
              <div className="col-span-4">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-center">Plan</div>
              <div className="col-span-3 text-right">Since</div>
            </div>

            {premiumUsers.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="mb-1">No premium subscribers yet.</p>
                <p className="text-xs text-neutral-600">Revenue data will appear here when users subscribe.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-900/40">
                {premiumUsers.map((u: any) => (
                  <div
                    key={u.user_id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-900/40 transition-colors items-center group"
                  >
                    {/* User */}
                    <div className="col-span-4 flex items-center gap-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border-2 border-neutral-800"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white border-2 border-neutral-800">
                          {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="text-sm font-medium text-neutral-200 truncate max-w-[200px]">
                        {u.full_name || "Unnamed User"}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="col-span-3 text-sm text-neutral-400 truncate">
                      {u.email}
                    </div>

                    {/* Plan */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border flex items-center gap-1 ${
                        u.subscription_tier === "pro"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        {u.subscription_tier}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-3 flex items-center justify-end gap-1.5 text-sm text-neutral-500">
                      <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
  );
}
