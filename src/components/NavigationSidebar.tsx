"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Wand2,
  Users2,
  Image as ImageIcon,
  Coins,
  Settings,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Flame,
  Shield,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  isAgeVerified: boolean;
  creditBalance: number;
}

export function NavigationSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  const navItems = [
    { label: "Create Studio", href: "/create", icon: Wand2 },
    { label: "Characters", href: "/characters", icon: Users2 },
    { label: "Gallery", href: "/gallery", icon: ImageIcon },
    { label: "Credits & Tiers", href: "/credits", icon: Coins },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (user?.role === "ADMIN" || user?.role === "MODERATOR") {
    navItems.push({ label: "Moderation Queue", href: "/admin", icon: Shield });
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <aside className="w-64 border-r border-zinc-800 bg-[#0d0d10] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="p-5">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 mb-6 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-pink-600/30 group-hover:scale-105 transition">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">Nudy</span>
              <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[10px] font-semibold border border-pink-500/20">
                18+
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 block -mt-0.5">AI Character Studio</span>
          </div>
        </Link>

        {/* User Status / Age Verification Badge */}
        {user ? (
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-300 truncate max-w-[120px]">
                {user.name || user.email}
              </span>
              {user.isAgeVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> 18+ Verified
                </span>
              ) : (
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition"
                >
                  <ShieldAlert className="w-3 h-3" /> Verify KYC
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Credits Available:</span>
              <span className="font-semibold text-pink-400">{user.creditBalance}</span>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3 mb-6 text-center">
            <p className="text-xs text-zinc-400 mb-2">Sign in to start creating</p>
            <Link
              href="/settings"
              className="block w-full py-1.5 text-xs font-medium rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition"
            >
              Sign In / Register
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-pink-600/15 text-pink-400 border border-pink-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-pink-400" : "text-zinc-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Legal & Logout */}
      <div className="p-4 border-t border-zinc-900 space-y-3">
        <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-400">
          <Link href="/legal/terms" className="hover:text-zinc-300 transition">
            Terms of Service
          </Link>
          <Link href="/legal/privacy" className="hover:text-zinc-300 transition">
            Privacy Policy
          </Link>
          <Link href="/legal/content-policy" className="hover:text-zinc-300 transition">
            Content Policy
          </Link>
          <Link href="/legal/2257" className="hover:text-zinc-300 transition">
            18 U.S.C. 2257
          </Link>
          <Link href="/legal/dmca" className="col-span-2 hover:text-zinc-300 transition pt-0.5">
            DMCA & Takedown Notices
          </Link>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}

