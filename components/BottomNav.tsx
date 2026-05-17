"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    icon: "🏠",
    label: "Home",
  },

  {
    href: "/marketplace",
    icon: "🛒",
    label: "Browse",
  },

  {
    href: "/create-product",
    icon: "➕",
    label: "Sell",
  },

  {
    href: "/chat",
    icon: "💬",
    label: "Chat",
  },

  {
    href: "/profile",
    icon: "👤",
    label: "Profile",
  },
];

export default function BottomNav() {

  const pathname =
    usePathname();

  // hide on admin pages
  if (
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <nav
      className="
      fixed
      bottom-0
      left-0
      right-0
      z-50
      bg-[#0f172a]
      border-t
      border-white/10
      backdrop-blur-xl
    "
    >
      <div
        className="
        grid
        grid-cols-5
        py-2
      "
      >
        {navItems.map((item) => {

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-1
                py-2
                transition-all
              "
            >
              <span
                className={`
                  text-xl
                  transition-all
                  ${
                    active
                      ? "scale-110"
                      : "opacity-70"
                  }
                `}
              >
                {item.icon}
              </span>

              <span
                className={`
                  text-[11px]
                  font-medium
                  ${
                    active
                      ? "text-green-400"
                      : "text-slate-400"
                  }
                `}
              >
                {item.label}
              </span>

              {active && (
                <div
                  className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-green-400
                "
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}