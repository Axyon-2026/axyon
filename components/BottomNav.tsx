"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type MarketplaceType = "CAMPUS" | "SCHOOL" | "ADMIN" | null;

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [marketplaceType, setMarketplaceType] =
    useState<MarketplaceType>(null);

  async function checkAuthentication() {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        setAuthenticated(false);
        setMarketplaceType(null);
        setUnreadCount(0);
        return false;
      }

      const data = await res.json();

      setAuthenticated(true);
      setMarketplaceType(data.user?.marketplaceType || null);

      return true;
    } catch {
      setAuthenticated(false);
      setMarketplaceType(null);
      setUnreadCount(0);
      return false;
    }
  }

  async function fetchUnreadNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        setUnreadCount(0);
        return;
      }

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
    let interval: ReturnType<typeof setInterval> | null = null;

    async function initialize() {
      const isAuthenticated = await checkAuthentication();

      if (!isAuthenticated) return;

      await fetchUnreadNotifications();

      interval = setInterval(() => {
        fetchUnreadNotifications();
      }, 5000);
    }

    initialize();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isSchool = marketplaceType === "SCHOOL";

  const navItems = isSchool
    ? [
        {
          href: "/school-marketplace/home",
          icon: "🏠",
          label: "Home",
        },
        {
          href: "/school-marketplace/products",
          icon: "🛍️",
          label: "Market",
        },
        {
          href: "/school-marketplace/sell",
          icon: "➕",
          label: "Sell",
        },
        {
          href: "/notifications",
          icon: "🔔",
          label: "Alerts",
        },
        {
          href: "/school-marketplace/profile",
          icon: "👤",
          label: "Profile",
        },
      ]
    : [
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

  return (
    <div className="lg:hidden">
      <nav className="fixed bottom-4 left-1/2 z-50 w-[94%] max-w-md -translate-x-1/2">
        <div className="rounded-[2rem] border border-white/10 bg-[#071019]/90 px-2 py-2 shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="grid grid-cols-5 gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" &&
                  pathname.startsWith(`${item.href}/`));

              const isNotifications = item.href === "/notifications";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all duration-300"
                >
                  {active && (
                    <div className="absolute inset-0 rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-500/20 to-emerald-500/10" />
                  )}

                  <div
                    className={`relative transition-all duration-300 ${
                      active ? "scale-110" : "opacity-70"
                    }`}
                  >
                    <div
                      className={`relative flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all ${
                        active
                          ? "bg-green-500 text-black shadow-[0_0_25px_rgba(34,197,94,0.45)]"
                          : "bg-white/[0.04] text-white"
                      }`}
                    >
                      {item.icon}

                      {isNotifications &&
                        authenticated &&
                        unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-400 px-1 text-[10px] font-black text-black shadow-[0_0_12px_rgba(34,197,94,0.8)]">
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
                    <div className="absolute -top-1 h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
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