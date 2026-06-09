"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminAnalyticsPage() {
  const [data, setData] =
    useState<any>(null);

  const [message, setMessage] =
    useState(
      "Loading analytics..."
    );

  async function fetchAnalytics() {
    try {
      const res =
        await fetch(
          "/api/admin/analytics"
        );

      const analyticsData =
        await res.json();

      if (!res.ok) {

  setTimeout(() => {
    window.location.reload();
  }, 800);

  return;
}

      setData(analyticsData);

      setMessage("");

    } catch {

      setMessage(
        "Something went wrong"
      );

    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
                Marketplace Insights
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl font-black">
                Admin Analytics
              </h1>

              <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                Monitor marketplace growth, user activity,
                listings, trust metrics, and platform health.
              </p>
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

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                {[
                  {
                    title:
                      "Total Users",

                    value:
                      data.totalUsers ||
                      0,

                    icon: "👥",
                  },

                  {
                    title:
                      "Products",

                    value:
                      data.totalProducts ||
                      0,

                    icon: "🛍️",
                  },

                  {
                    title:
                      "Verified Students",

                    value:
                      data.verifiedUsers ||
                      0,

                    icon: "✅",
                  },

                  {
                    title:
                      "Support Tickets",

                    value:
                      data.totalSupportTickets ||
                      0,

                    icon: "💬",
                  },
                ].map((item) => (
                  <div
                    key={item.title}

                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-[2rem]
                      p-6
                      shadow-2xl
                    "
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">
                        {item.icon}
                      </span>

                      <span className="text-[10px] font-black text-green-400">
                        LIVE
                      </span>
                    </div>

                    <h2 className="mt-6 text-4xl font-black">
                      {item.value}
                    </h2>

                    <p className="mt-3 text-sm text-slate-400 font-semibold">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>

              {/* charts/cards */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-7 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-black">
                        Marketplace
                      </p>

                      <h2 className="mt-2 text-3xl font-black">
                        Product Insights
                      </h2>
                    </div>

                    <div className="text-5xl">
                      📦
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">
                    <div className="bg-slate-800 rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-400 font-semibold">
                          Active Listings
                        </p>

                        <p className="text-2xl font-black">
                          {
                            data.totalProducts
                          }
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-400 font-semibold">
                          Reported Products
                        </p>

                        <p className="text-2xl font-black text-red-400">
                          {
                            data.totalReports
                          }
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-400 font-semibold">
                          Verification Rate
                        </p>

                        <p className="text-2xl font-black text-green-400">
                          {data.totalUsers
                            ? Math.round(
                                (data.verifiedUsers /
                                  data.totalUsers) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-7 shadow-2xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),_transparent_35%)]" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-400 text-sm font-black">
                          Platform
                        </p>

                        <h2 className="mt-2 text-3xl font-black">
                          Trust & Safety
                        </h2>
                      </div>

                      <div className="text-5xl">
                        🛡️
                      </div>
                    </div>

                    <div className="mt-8 space-y-5">
                      <div className="bg-slate-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 font-semibold">
                            Open Reports
                          </p>

                          <p className="text-2xl font-black text-yellow-400">
                            {
                              data.openReports
                            }
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 font-semibold">
                            Open Tickets
                          </p>

                          <p className="text-2xl font-black text-purple-400">
                            {
                              data.openSupportTickets
                            }
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <p className="text-slate-400 font-semibold">
                            Admin Accounts
                          </p>

                          <p className="text-2xl font-black text-blue-400">
                            {
                              data.totalAdmins
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* health */}

              <div className="mt-10 bg-slate-900 border border-slate-800 rounded-[2rem] p-7 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div>
                    <p className="text-green-400 text-sm font-black">
                      System Health
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      Marketplace Status
                    </h2>

                    <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                      Axyon systems are actively monitoring
                      student verification, reports, listings,
                      moderation, and support activity.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 rounded-2xl p-5 min-w-[150px]">
                      <p className="text-sm text-slate-400 font-semibold">
                        Verification
                      </p>

                      <p className="mt-2 text-green-400 font-black">
                        Running
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-5 min-w-[150px]">
                      <p className="text-sm text-slate-400 font-semibold">
                        Moderation
                      </p>

                      <p className="mt-2 text-green-400 font-black">
                        Active
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-5 min-w-[150px]">
                      <p className="text-sm text-slate-400 font-semibold">
                        Marketplace
                      </p>

                      <p className="mt-2 text-green-400 font-black">
                        Online
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-5 min-w-[150px]">
                      <p className="text-sm text-slate-400 font-semibold">
                        Support
                      </p>

                      <p className="mt-2 text-green-400 font-black">
                        Stable
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