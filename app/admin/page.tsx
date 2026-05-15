"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("Loading admin dashboard...");
  const [accessDenied, setAccessDenied] = useState(false);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/admin/dashboard");
      const dashboardData = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
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
      setMessage("Something went wrong");
    }
  }

  useEffect(() => {
    fetchDashboard();
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
              You do not have permission to access admin dashboard.
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-slate-400">
              Manage users, products, support tickets,
              reports, and marketplace activity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/admin/users"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium text-center"
            >
              Manage Users
            </a>

            <a
              href="/admin/listings"
              className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-medium text-center"
            >
              Manage Listings
            </a>

            <a
              href="/admin/support"
              className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl font-medium text-center"
            >
              Support Tickets
            </a>

            <a
              href="/admin/reports"
              className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-medium text-center"
            >
              Reports
            </a>

            <a
              href="/admin/logs"
              className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl font-medium text-center"
            >
              Logs
            </a>
            <a
  href="/admin/analytics"
  className="bg-cyan-600 hover:bg-cyan-700 px-5 py-3 rounded-xl font-medium text-center"
>
  Analytics
</a>

            <a
              href="/marketplace"
              className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl font-medium text-center"
            >
              Marketplace
            </a>
          </div>
        </div>

        {message && (
          <p className="mt-10 text-slate-400">
            {message}
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mt-10">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Total Users
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {data.stats?.totalUsers}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Verified Users
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {data.stats?.verifiedUsers}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Total Products
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {data.stats?.totalProducts}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Total Orders
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {data.stats?.totalOrders}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Open Tickets
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {data.stats?.openTickets}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">
                  Open Reports
                </p>

                <h2 className="text-4xl font-bold mt-3">
                  {data.stats?.openReports}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800">
                  <h2 className="text-2xl font-bold">
                    Users
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="text-left px-5 py-4">
                          Name
                        </th>

                        <th className="text-left px-5 py-4">
                          Email
                        </th>

                        <th className="text-left px-5 py-4">
                          Role
                        </th>

                        <th className="text-left px-5 py-4">
                          Verified
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.users?.slice(0, 5).map((user: any) => (
                        <tr
                          key={user.id}
                          className="border-t border-slate-800"
                        >
                          <td className="px-5 py-4">
                            {user.name}
                          </td>

                          <td className="px-5 py-4 text-slate-400">
                            {user.email}
                          </td>

                          <td className="px-5 py-4">
                            {user.role}
                          </td>

                          <td className="px-5 py-4">
                            {user.emailVerified
                              ? "Yes"
                              : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800">
                  <h2 className="text-2xl font-bold">
                    Products
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="text-left px-5 py-4">
                          Title
                        </th>

                        <th className="text-left px-5 py-4">
                          Price
                        </th>

                        <th className="text-left px-5 py-4">
                          Seller
                        </th>

                        <th className="text-left px-5 py-4">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.products?.slice(0, 5).map((product: any) => (
                        <tr
                          key={product.id}
                          className="border-t border-slate-800"
                        >
                          <td className="px-5 py-4">
                            {product.title}
                          </td>

                          <td className="px-5 py-4">
                            ₹{product.price}
                          </td>

                          <td className="px-5 py-4">
                            {product.seller?.name}
                          </td>

                          <td className="px-5 py-4">
                            {product.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}