"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    icon: "🏠",
    label: "Home",
  },
  {
    href: "/marketplace",
    icon: "🛍️",
    label: "Market",
  },
  {
    href: "/create-product",
    icon: "➕",
    label: "Sell",
  },
  {
    href: "/notifications",
    icon: "🔔",
    label: "Alerts",
  },
  {
    href: "/profile",
    icon: "👤",
    label: "Profile",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnreadNotifications() {
    try {
      const res = await fetch("/api/notifications");

      if (!res.ok) return;

      const data = await res.json();

      const unread = (data.notifications || []).filter(
        (item: any) => !item.isRead
      ).length;

      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
    }
  }

  useEffect(() => {
    fetchUnreadNotifications();

    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="lg:hidden">
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md">
        <div className="bg-[#071019]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.45)] rounded-[2rem] px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const isNotifications = item.href === "/notifications";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all duration-300"
                >
                  {active && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-500/20 to-emerald-500/10 border border-green-500/20" />
                  )}

                  <div
                    className={`relative transition-all duration-300 ${
                      active ? "scale-110" : "opacity-70"
                    }`}
                  >
                    <div
                      className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${
                        active
                          ? "bg-green-500 text-black shadow-[0_0_25px_rgba(34,197,94,0.45)]"
                          : "bg-white/[0.04] text-white"
                      }`}
                    >
                      {item.icon}

                      {isNotifications && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-green-400 text-black text-[10px] font-black flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.8)]">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`relative text-[11px] font-black transition-all ${
                      active ? "text-green-400" : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>

                  {active && (
                    <div className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}