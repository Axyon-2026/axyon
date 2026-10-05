"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading notifications...");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const authResponse = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (authResponse.status === 401) {
          window.location.href = "/login?next=/notifications";
          return;
        }

        if (!authResponse.ok) {
          setMessage("Unable to verify your account.");
          return;
        }

        const res = await fetch("/api/notifications", {
          cache: "no-store",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to load notifications");
          return;
        }

        setNotifications(data.notifications || []);
        setMessage("");

        await fetch("/api/notifications", {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
        });
      } catch {
        setMessage("Something went wrong");
      }
    }

    fetchNotifications();
  }, []);

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="px-4 py-10 pb-32 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-green-400">
                Updates & Activity
              </p>

              <h1 className="mt-2 text-4xl font-black sm:text-5xl">
                Notifications
              </h1>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-3xl">
              🔔
            </div>
          </div>

          {message && (
            <p className="mt-10 text-slate-400">
              {message}
            </p>
          )}

          {!message && notifications.length === 0 && (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center sm:p-12">
              <div className="text-6xl">🔔</div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                No Notifications Yet
              </h2>

              <p className="mt-4 text-slate-400">
                Your activity updates will appear here.
              </p>
            </div>
          )}

          <div className="mt-10 space-y-5">
            {notifications.map((item) => {
              const content = (
                <>
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <h2 className="text-xl font-black">
                        {item.title}
                      </h2>

                      <p className="mt-3 leading-7 text-slate-400">
                        {item.message}
                      </p>
                    </div>

                    {!item.isRead && (
                      <div className="mt-2 h-3 w-3 shrink-0 rounded-full bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                    )}
                  </div>

                  <p className="mt-5 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </>
              );

              if (item.link?.startsWith("/")) {
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="block rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-green-500/30"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={item.id}
                  href={item.link || "#"}
                  className="block rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-green-500/30"
                >
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}