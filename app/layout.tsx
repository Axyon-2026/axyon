import BottomNav from "@/components/BottomNav";
import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable:
    "--font-geist-sans",

  subsets: ["latin"],
});

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: ["latin"],
  });

export const metadata: Metadata = {
  title:
    "Axyon | Campus Marketplace",

  description:
    "Buy, sell and connect within your campus using Axyon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >
      <body
        className="
          min-h-full
          bg-black
          text-white
        "
      >
        <main className="pb-24">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}