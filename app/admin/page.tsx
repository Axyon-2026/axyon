"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const adminLinks = [
  {
    title: "Users",
    href: "/admin/users",
    icon: "👥",
    color: "from-green-500 to-emerald-500",
  },

  {
    title: "Listings",
    href: "/admin/listings",
    icon: "🛍️",
    color: "from-blue-500 to-cyan-500",
  },

  {
    title: "Reports",
    href: "/admin/reports",
    icon: "🚨",
    color: "from-red-500 to-orange-500",
  },

  {
    title: "Support",
    href: "/admin/support",
    icon: "💬",
    color: "from-purple-500 to-pink-500",
  },

  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: "📊",
    color: "from-yellow-500 to-amber-500",
  },

  {
    title: "Logs",
    href: "/admin/logs",
    icon: "📁",
    color: "from-slate-600 to-slate-700",
  },
];

export default function AdminDashboardPage() {
  const [data, setData] =
    useState<any>(null);

  const [message, setMessage] =
    useState(
      "Loading admin dashboard..."
    );

  const [accessDenied, setAccessDenied] =
    useState(false);

  async function fetchDashboard() {
    try {
      const res =
        await fetch(
          "/api/admin/dashboard"
        );

      const dashboardData =
        await res.json();

      if (res.status === 403) {
        setAccessDenied(true);

        setMessage(
          "Access denied"
        );

        return;
      }

      if (!res.ok) {
        setMessage(
          dashboardData.message ||
            "Failed to load dashboard"
        );

        return;
      }

      setData(dashboardData);

      setMessage("");

    } catch {

      setMessage(
        "Something went wrong"
      );

    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white">
        <Navbar />

        <section className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 max-w-lg text-center shadow-2xl">
            <div className="text-7xl">
              🔒
            </div>

            <h1 className="mt-6 text-4xl font-black text-red-500">
              Access Denied
            </h1>

            <p className="mt-4 text-slate-400 leading-7">
              You do not have permission to access the admin dashboard.
            </p>

            <a
              href="/"

              className="
                inline-block
                mt-8
                bg-green-600
                hover:bg-green-700
                px-7
                py-4
                rounded-full
                font-black
              "
            >
              Go Home
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-7xl mx-auto">
          {/* hero */}

          <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 sm:p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-4 py-2 text-xs font-black">
                Axyon Admin Control Center
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl font-black">
                Admin Dashboard
              </h1>

              <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                Manage users, student verification, listings, reports,
                support tickets, and overall marketplace activity.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/marketplace"

                  className="
                    bg-green-600
                    hover:bg-green-700
                    px-6
                    py-3
                    rounded-full
                    font-black
                  "
                >
                  Open Marketplace
                </a>

                <a
                  href="/admin/listings"

                  className="
                    border
                    border-slate-600
                    hover:border-green-500
                    px-6
                    py-3
                    rounded-full
                    font-black
                  "
                >
                  Moderate Listings
                </a>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <p className="text-slate-400 font-semibold">
                {message}
              </p>
            </div>
          )}

          {data && (
            <>
              {/* stats */}

              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-8">
                {[
                  {
                    label:
                      "Total Users",

                    value:
                      data.stats
                        ?.totalUsers,

                    icon: "👥",
                  },

                  {
                    label:
                      "Verified",

                    value:
                      data.stats
                        ?.verifiedUsers,

                    icon: "✅",
                  },

                  {
                    label:
                      "Products",

                    value:
                      data.stats
                        ?.totalProducts,

                    icon: "🛍️",
                  },

                  {
                    label:
                      "Reports",

                    value:
                      data.stats
                        ?.totalReports,

                    icon: "🚨",
                  },

                  {
                    label:
                      "Support",

                    value:
                      data.stats
                        ?.totalSupportTickets,

                    icon: "💬",
                  },

                  {
                    label:
                      "Admins",

                    value:
                      data.stats
                        ?.totalAdmins,

                    icon: "🛡️",
                  },
                ].map((item) => (
                  <div
                    key={item.label}

                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-[2rem]
                      p-5
                      shadow-xl
                    "
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">
                        {item.icon}
                      </span>

                      <span className="text-[10px] text-green-400 font-black">
                        LIVE
                      </span>
                    </div>

                    <h2 className="mt-5 text-3xl font-black">
                      {item.value || 0}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400 font-semibold">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* admin modules */}

              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-black">
                      Management
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                      Admin Modules
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                  {adminLinks.map(
                    (item) => (
                      <a
                        key={item.title}

                        href={item.href}

                        className="
                          group
                          bg-slate-900
                          border
                          border-slate-800
                          hover:border-green-500
                          rounded-[2rem]
                          p-6
                          transition
                          hover:-translate-y-1
                          shadow-xl
                        "
                      >
                        <div
                          className={`
                            w-14
                            h-14
                            rounded-2xl
                            bg-gradient-to-br
                            ${item.color}
                            flex
                            items-center
                            justify-center
                            text-2xl
                          `}
                        >
                          {item.icon}
                        </div>

                        <h3 className="mt-5 text-2xl font-black">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-slate-400 text-sm leading-6">
                          Manage and monitor {item.title.toLowerCase()}.
                        </p>

                        <div className="mt-5 text-green-400 font-black text-sm">
                          Open →
                        </div>
                      </a>
                    )
                  )}
                </div>
              </div>

              {/* system */}

              <div className="mt-10 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <p className="text-green-400 text-sm font-black">
                      System Status
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      Marketplace Health
                    </h2>

                    <p className="mt-3 text-slate-400 max-w-2xl leading-7">
                      Monitor trust, reports, support activity,
                      and campus marketplace operations.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-2xl p-5">
                      <p className="text-sm text-slate-400 font-semibold">
                        Verification
                      </p>

                      <p className="mt-2 text-green-400 font-black">
                        Active
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-5">
                      <p className="text-sm text-slate-400 font-semibold">
                        Moderation
                      </p>

                      <p className="mt-2 text-green-400 font-black">
                        Running
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}