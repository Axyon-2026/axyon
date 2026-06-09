import BottomNav from "@/components/BottomNav";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axyon | Campus Marketplace",
  description: "Buy, sell and connect within your campus using Axyon. The student network built for real campus life",
  icons: {
    icon: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-black text-white">
        <main className="pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}