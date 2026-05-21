"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function NotificationsPage() {

  const [
    notifications,
    setNotifications,
  ] = useState<any[]>([]);

  const [
    message,
    setMessage,
  ] = useState(
    "Loading notifications..."
  );

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(
          "/api/notifications"
        );

        const data =
          await res.json();

        if (!res.ok) {
          setMessage(
            data.message ||
              "Failed to load notifications"
          );

          return;
        }

        setNotifications(
          data.notifications || []
        );

        setMessage("");
      } catch {
        setMessage(
          "Something went wrong"
        );
      }
    }

    fetchNotifications();
  }, []);

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-10 pb-32">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-green-400 text-sm font-black">
                Updates & Activity
              </p>

              <h1 className="mt-2 text-5xl font-black">
                Notifications
              </h1>
            </div>

            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl">
              🔔
            </div>
          </div>

          {message && (
            <p className="mt-10 text-slate-400">
              {message}
            </p>
          )}

          {!message &&
            notifications.length === 0 && (
              <div className="mt-10 bg-white/[0.04] border border-white/10 rounded-[2rem] p-12 text-center">
                <div className="text-6xl">
                  🔔
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  No Notifications Yet
                </h2>

                <p className="mt-4 text-slate-400">
                  Your activity updates will appear here.
                </p>
              </div>
            )}

          <div className="mt-10 space-y-5">
            {notifications.map(
              (item) => (
                <a
                  key={item.id}
                  href={
                    item.link || "#"
                  }
                  className="
                    block
                    bg-white/[0.04]
                    border
                    border-white/10
                    rounded-[2rem]
                    p-6
                    backdrop-blur-xl
                    hover:border-green-500/30
                    transition
                  "
                >
                  <div className="flex items-start justify-between gap-5">

                    <div>
                      <h2 className="text-xl font-black">
                        {item.title}
                      </h2>

                      <p className="mt-3 text-slate-400 leading-7">
                        {item.message}
                      </p>
                    </div>

                    {!item.isRead && (
                      <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.8)] mt-2" />
                    )}
                  </div>

                  <p className="mt-5 text-xs text-slate-500">
                    {new Date(
                      item.createdAt
                    ).toLocaleString()}
                  </p>
                </a>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}