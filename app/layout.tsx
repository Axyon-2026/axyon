import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import SiteAnnouncement from "@/components/SiteAnnouncement";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axyon | Student Ecosystem",
  description:
    "Axyon is a student-focused digital ecosystem with dedicated school and college marketplace experiences.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-black text-white">
        <main className="pb-24">
          <SiteAnnouncement />
          {children}
          <Footer />
        </main>

        <BottomNav />
      </body>
    </html>
  );
}