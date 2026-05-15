"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("Loading analytics...");
  const [accessDenied, setAccessDenied] = useState(false);

  async function fetchAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics");
      const analyticsData = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
        return;
      }

      if (!res.ok) {
        setMessage(
          analyticsData.message || "Failed to load analytics"
        );
        return;
      }

      setData(analyticsData);
      setMessage("");
    } catch {
      setMessage("Something went wrong");
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <section className="flex items-center justify-center py-24 px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-lg">
            <h1 className="text-4xl font-bold text-red-500">
              Access Denied
            </h1>

            <p className="mt-5 text-slate-400">
              You do not have permission to view analytics.
            </p>

            <a
              href="/"
              className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
            >
              Go Home
            </a>
          </div>
        </section>
      </main>
    );
  }

  const stats = data?.stats || {};

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold">Analytics</h1>

            <p className="mt-3 text-slate-400">
              Platform insights and operational metrics.
            </p>
          </div>

          <a
            href="/admin"
            className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl font-medium"
          >
            Back to Admin
          </a>
        </div>

        {message && (
          <p className="mt-8 text-slate-400">{message}</p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">Total Users</p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.totalUsers}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Verified Students
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.verifiedStudents}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Pending Verifications
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.pendingStudentVerifications}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Suspended Users
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.suspendedUsers}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Total Listings
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.totalListings}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Active Listings
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.activeListings}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Removed Listings
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.removedListings}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Total Orders
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.totalOrders}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Pending Orders
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.pendingOrders}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Successful Orders
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.successfulOrders}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Cancelled Orders
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.cancelledOrders}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Open Reports
                </p>
                <h2 className="text-4xl font-bold mt-3">
                  {stats.openReports}
                </h2>
              </div>
            </div>

            <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold">
                Product Categories
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
                {Object.entries(data.categoryStats || {}).map(
                  ([category, count]: any) => (
                    <div
                      key={category}
                      className="bg-slate-800 rounded-2xl p-5"
                    >
                      <p className="text-slate-400 text-sm">
                        Category
                      </p>

                      <h3 className="text-2xl font-bold mt-2">
                        {category}
                      </h3>

                      <p className="mt-3 text-blue-400 font-medium">
                        {count} listings
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}