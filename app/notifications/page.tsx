"use client";

import Navbar from "@/components/Navbar";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-12">
        <h1 className="text-4xl font-bold">Notifications</h1>

        <p className="mt-4 text-slate-400">
          No notifications yet.
        </p>
      </section>
    </main>
  );
}