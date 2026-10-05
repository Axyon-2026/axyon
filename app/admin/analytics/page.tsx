"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

type AnalyticsData = {
  totalUsers?: number;
  totalProducts?: number;
  verifiedUsers?: number;
  totalSupportTickets?: number;
  totalReports?: number;
  openReports?: number;
  openSupportTickets?: number;
  totalAdmins?: number;
};

export default function AdminAnalyticsPage() {
  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [message, setMessage] =
    useState("Loading analytics...");

  const [refreshing, setRefreshing] =
    useState(false);

  async function fetchAnalytics() {
    try {
      setRefreshing(true);
      setMessage("Loading analytics...");

      const res = await fetch(
        "/api/admin/analytics",
        {
          cache: "no-store",
        }
      );

      const analyticsData =
        await res.json();

      if (!res.ok) {
        setMessage(
          analyticsData.message ||
            "Failed to load analytics."
        );
        return;
      }

      setData(analyticsData);
      setMessage("");
    } catch {
      setMessage(
        "Something went wrong while loading analytics."
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalUsers =
    data?.totalUsers ?? 0;

  const totalProducts =
    data?.totalProducts ?? 0;

  const verifiedUsers =
    data?.verifiedUsers ?? 0;

  const totalSupportTickets =
    data?.totalSupportTickets ?? 0;

  const totalReports =
    data?.totalReports ?? 0;

  const openReports =
    data?.openReports ?? 0;

  const openSupportTickets =
    data?.openSupportTickets ?? 0;

  const totalAdmins =
    data?.totalAdmins ?? 0;

  const verificationRate =
    totalUsers > 0
      ? Math.round(
          (verifiedUsers /
            totalUsers) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Marketplace Insights
              </div>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Admin Analytics
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Monitor users, listings,
                    verification, reports,
                    support activity, and
                    marketplace operations
                    from one place.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={fetchAnalytics}
                    disabled={refreshing}
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-emerald-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {refreshing
                      ? "Refreshing..."
                      : "↻ Refresh Data"}
                  </button>

                  <a
                    href="/admin"
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-center text-sm font-black text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
                  >
                    ← Admin Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* LOADING / ERROR */}
          {message && (
            <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                {message ===
                "Loading analytics..."
                  ? "⏳"
                  : "⚠️"}
              </div>

              <p className="mt-4 font-semibold text-slate-400">
                {message}
              </p>

              {message !==
                "Loading analytics..." && (
                <button
                  type="button"
                  onClick={fetchAnalytics}
                  className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {data && (
            <>
              {/* MAIN STATS */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {[
                  {
                    title: "Total Users",
                    value: totalUsers,
                    icon: "👥",
                    label: "Registered accounts",
                  },
                  {
                    title: "Products",
                    value: totalProducts,
                    icon: "📦",
                    label: "Marketplace listings",
                  },
                  {
                    title: "Verified Students",
                    value: verifiedUsers,
                    icon: "✓",
                    label: "Verified accounts",
                  },
                  {
                    title: "Support Tickets",
                    value:
                      totalSupportTickets,
                    icon: "💬",
                    label: "All support tickets",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4 shadow-xl transition hover:-translate-y-0.5 hover:border-slate-700 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-lg sm:h-11 sm:w-11 sm:text-xl">
                        {item.icon}
                      </div>

                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-400 sm:px-2.5 sm:py-1">
                        Live
                      </span>
                    </div>

                    <p className="mt-5 break-words text-2xl font-black tracking-tight sm:mt-6 sm:text-4xl">
                      {item.value}
                    </p>

                    <h2 className="mt-2 text-xs font-black text-slate-200 sm:text-sm">
                      {item.title}
                    </h2>

                    <p className="mt-1 hidden text-xs text-slate-600 sm:block">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* INSIGHTS */}
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* MARKETPLACE */}
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                          Marketplace
                        </p>

                        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                          Product Insights
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl">
                        📦
                      </div>
                    </div>

                    <div className="mt-7 space-y-3">
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-400">
                            Total Listings
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Products currently recorded
                          </p>
                        </div>

                        <p className="shrink-0 text-2xl font-black">
                          {totalProducts}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-400">
                            Total Reports
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Reports currently recorded
                          </p>
                        </div>

                        <p className="shrink-0 text-2xl font-black text-red-400">
                          {totalReports}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-400">
                              Verification Rate
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              Verified users / total users
                            </p>
                          </div>

                          <p className="shrink-0 text-2xl font-black text-emerald-400">
                            {verificationRate}%
                          </p>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${verificationRate}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-600">
                          <span>
                            {verifiedUsers} verified
                          </span>

                          <span>
                            {totalUsers} total
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TRUST & SAFETY */}
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-blue-400">
                          Platform
                        </p>

                        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                          Trust & Safety
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                        🛡️
                      </div>
                    </div>

                    <div className="mt-7 space-y-3">
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-400">
                            Open Reports
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Reports awaiting action
                          </p>
                        </div>

                        <p className="shrink-0 text-2xl font-black text-amber-400">
                          {openReports}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-purple-500/10 bg-purple-500/[0.03] p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-400">
                            Open Tickets
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Support issues awaiting action
                          </p>
                        </div>

                        <p className="shrink-0 text-2xl font-black text-purple-400">
                          {openSupportTickets}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-500/10 bg-blue-500/[0.03] p-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-400">
                            Admin Accounts
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Platform administrators
                          </p>
                        </div>

                        <p className="shrink-0 text-2xl font-black text-blue-400">
                          {totalAdmins}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OPERATIONAL STATUS */}
              <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Operations
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    Platform Status
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    A central operational view of the
                    systems represented by the current
                    admin analytics data.
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      title: "Verification",
                      description:
                        "Student verification",
                      status: "Running",
                    },
                    {
                      title: "Moderation",
                      description:
                        "Report monitoring",
                      status: "Active",
                    },
                    {
                      title: "Marketplace",
                      description:
                        "Listing operations",
                      status: "Online",
                    },
                    {
                      title: "Support",
                      description:
                        "Support operations",
                      status: "Active",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-200">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {item.description}
                          </p>
                        </div>

                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                      </div>

                      <p className="mt-4 text-sm font-black text-emerald-400">
                        {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK NAVIGATION */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <a
                  href="/admin/users"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center transition hover:border-emerald-500/40"
                >
                  <div className="text-xl">
                    👥
                  </div>
                  <p className="mt-2 text-xs font-black">
                    Users
                  </p>
                </a>

                <a
                  href="/admin/listings"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center transition hover:border-emerald-500/40"
                >
                  <div className="text-xl">
                    📦
                  </div>
                  <p className="mt-2 text-xs font-black">
                    Listings
                  </p>
                </a>

                <a
                  href="/admin/reports"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center transition hover:border-emerald-500/40"
                >
                  <div className="text-xl">
                    🚨
                  </div>
                  <p className="mt-2 text-xs font-black">
                    Reports
                  </p>
                </a>

                <a
                  href="/admin/support"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center transition hover:border-emerald-500/40"
                >
                  <div className="text-xl">
                    💬
                  </div>
                  <p className="mt-2 text-xs font-black">
                    Support
                  </p>
                </a>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}