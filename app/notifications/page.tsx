"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading notifications...");

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load notifications");
        return;
      }

      setNotifications(data.notifications || []);
      setMessage("");
    } catch {
      setMessage("Failed to load notifications");
    }
  }

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-400 text-white p-7 sm:p-10 shadow-xl shadow-green-200">
            <span className="inline-flex bg-white/20 border border-white/30 rounded-full px-4 py-2 text-xs font-black">
              Activity Center
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl font-black">
              Notifications
            </h1>

            <p className="mt-3 text-green-50 max-w-2xl">
              Track verification updates, orders, messages, reports, and
              marketplace activity in one place.
            </p>
          </div>

          {message && (
            <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <p className="text-slate-500 font-semibold">{message}</p>
            </div>
          )}

          {!message && notifications.length === 0 && (
            <div className="mt-6 bg-white border border-slate-200 rounded-[2rem] p-10 text-center shadow-sm">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center text-4xl">
                🔔
              </div>

              <h2 className="mt-6 text-2xl font-black">
                No notifications yet
              </h2>

              <p className="mt-3 text-slate-500 max-w-md mx-auto">
                When something important happens on Axyon, it will appear here.
              </p>

              <a
                href="/marketplace"
                className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-7 py-3 rounded-full font-black"
              >
                Explore Marketplace
              </a>
            </div>
          )}

          {!message && notifications.length > 0 && (
            <div className="mt-6 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl shrink-0">
                    🔔
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-black text-slate-900">
                      {notification.title || "Axyon Update"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 leading-6">
                      {notification.message || notification.text}
                    </p>

                    {notification.createdAt && (
                      <p className="mt-2 text-xs text-slate-400 font-semibold">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}