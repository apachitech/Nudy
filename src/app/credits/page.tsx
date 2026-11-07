"use client";

import { useEffect, useState } from "react";
import {
  Coins,
  Check,
  Zap,
  ShieldCheck,
  History,
  CreditCard,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface LedgerEntry {
  id: string;
  amount: number;
  balanceAfter: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export default function CreditsPage() {
  const [user, setUser] = useState<any>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        setUser(data.user);
        if (data.user) {
          // Fetch user data export / ledger
          fetch("/api/user/export")
            .then((r) => r.json())
            .then((exportData) => {
              setLedger(exportData.creditsLedger || []);
            });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (packId: string, credits: number, type: "CREDIT_PACK" | "SUBSCRIPTION", tier?: string) => {
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierOrPackId: packId,
          amountCredits: credits,
          type,
          tier,
        }),
      });

      const data = await res.json();
      if (res.ok && data.session?.checkoutUrl) {
        window.location.href = data.session.checkoutUrl;
      }
    } catch {
      alert("Failed to initiate checkout");
    }
  };

  const tiers = [
    {
      id: "tier_creator",
      name: "Creator",
      price: "$19",
      credits: 300,
      features: [
        "300 Generation Credits / month",
        "High-priority queue dispatch",
        "Up to 10 persistent character profiles",
        "Standard HD video synthesis",
        "100% private private cloud storage",
      ],
      popular: true,
      tierEnum: "CREATOR" as const,
    },
    {
      id: "tier_pro",
      name: "Pro Studio",
      price: "$49",
      credits: 1000,
      features: [
        "1,000 Generation Credits / month",
        "Fastest dedicated GPU queue",
        "Unlimited fictional characters",
        "Extended 1080p video motion",
        "ComfyUI / Custom workflow priority",
        "Full API key generation access",
      ],
      popular: false,
      tierEnum: "PRO" as const,
    },
    {
      id: "tier_unlimited",
      name: "Studio Agency",
      price: "$99",
      credits: 2500,
      features: [
        "2,500 Generation Credits / month",
        "Instant zero-wait generation",
        "Bulk rendering & batch downloads",
        "Custom LoRA model fine-tuning (soon)",
        "Dedicated compliance agent support",
      ],
      popular: false,
      tierEnum: "STUDIO" as const,
    },
  ];

  const creditPacks = [
    { id: "pack_100", credits: 100, price: "$9.99" },
    { id: "pack_350", credits: 350, price: "$24.99", bonus: "+50 Bonus" },
    { id: "pack_800", credits: 800, price: "$49.99", bonus: "+150 Bonus" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Coins className="w-7 h-7 text-pink-500" /> Credits & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pay-as-you-go credit packages or recurring subscription plans with rollover perks.
          </p>
        </div>

        {user && (
          <div className="bg-[#121215] border border-pink-500/30 rounded-2xl p-4 flex items-center gap-4 shrink-0 glow-pink">
            <div>
              <span className="text-[11px] text-zinc-400 block font-medium">Current Balance</span>
              <span className="text-2xl font-black text-white flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-pink-500" />
                {user.creditBalance} <span className="text-xs text-pink-400 font-semibold">Credits</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Tiers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <h2 className="text-lg font-bold text-white">Monthly Subscription Tiers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition duration-300 relative ${
                t.popular
                  ? "bg-gradient-to-b from-[#181820] to-[#121215] border-2 border-pink-500 shadow-xl shadow-pink-600/20"
                  : "bg-[#121215] border border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-pink-600 text-white text-[11px] font-bold tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{t.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-white">{t.price}</span>
                    <span className="text-xs text-zinc-400">/ month</span>
                  </div>
                  <span className="inline-block mt-2 text-xs font-semibold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                    {t.credits} Credits Refreshed Monthly
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-300 pt-3 border-t border-zinc-800">
                  {t.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleCheckout(t.id, t.credits, "SUBSCRIPTION", t.tierEnum)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    t.popular
                      ? "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
                >
                  <Zap className="w-4 h-4" /> Subscribe to {t.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* One-Time Credit Topups */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-pink-500" />
          <h2 className="text-lg font-bold text-white">One-Time Instant Credit Packs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-pink-500/40 transition"
            >
              <div>
                <span className="text-base font-bold text-white block">{pack.credits} Credits</span>
                <span className="text-xs text-pink-400 font-semibold">{pack.price}</span>
                {pack.bonus && (
                  <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {pack.bonus}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleCheckout(pack.id, pack.credits, "CREDIT_PACK")}
                className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-pink-600 hover:text-white text-zinc-200 text-xs font-semibold transition"
              >
                Buy Pack
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Ledger / Usage History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-pink-500" />
          <h2 className="text-lg font-bold text-white">Credits Ledger & Transaction History</h2>
        </div>

        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl overflow-hidden">
          {ledger.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              No transactions recorded on this account yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/60 text-zinc-400 uppercase font-semibold text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {ledger.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/30">
                      <td className="p-3.5 text-zinc-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-medium text-white">{item.transactionType}</td>
                      <td className="p-3.5 text-zinc-300">{item.description}</td>
                      <td
                        className={`p-3.5 font-bold ${
                          item.amount > 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {item.amount > 0 ? `+${item.amount}` : item.amount}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-400">{item.balanceAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
