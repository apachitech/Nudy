import type { Metadata } from "next";
import "./globals.css";
import { AgeGateModal } from "@/components/AgeGateModal";
import { CookieBanner } from "@/components/CookieBanner";
import { NavigationSidebar } from "@/components/NavigationSidebar";

export const metadata: Metadata = {
  title: "Nudy | 18+ Fictional AI Character Studio",
  description: "Next-generation generative AI image and video studio for fictional adult characters. 18+ only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen flex antialiased">
        <AgeGateModal />
        <CookieBanner />
        <NavigationSidebar />
        <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
