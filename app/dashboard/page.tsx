"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("Loading dashboard...");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const dashboardData = await res.json();

        if (!res.ok) {
          setMessage(dashboardData.message || "Failed to load dashboard");
          return;
        }

        if (dashboardData.user?.role === "ADMIN") {
          window.location.href = "/admin";
          return;
        }

        setData(dashboardData);
        setMessage("");
      } catch {
        setMessage("Something went wrong");
      }
    }

    fetchDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="mt-2 text-slate-400">
              Manage your Axyon account and activity.
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href="/create-product"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
            >
              Sell Product
            </a>

            <a
              href="/marketplace"
              className="border border-slate-700 hover:border-slate-500 px-6 py-3 rounded-xl font-medium"
            >
              Marketplace
            </a>
          </div>
        </div>

        {message && <p className="mt-10 text-slate-400">{message}</p>}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">Listed Products</p>
                <h2 className="text-4xl font-bold mt-3">
                  {data.listedProducts?.length}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">Purchases</p>
                <h2 className="text-4xl font-bold mt-3">
                  {data.purchasedOrders?.length}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">Sold Items</p>
                <h2 className="text-4xl font-bold mt-3">
                  {data.soldOrders?.length}
                </h2>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm">Conversations</p>
                <h2 className="text-4xl font-bold mt-3">
                  {data.conversations?.length}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold">Profile</h2>

                <div className="mt-6 space-y-4 text-slate-300">
                  <p>Name: {data.user?.name}</p>
                  <p>Email: {data.user?.email}</p>
                  <p>College: {data.user?.college}</p>
                  <p>
                    Joined:{" "}
                    {new Date(data.user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Listed Products</h2>

                  <a
                    href="/create-product"
                    className="text-blue-400 hover:underline"
                  >
                    Add More
                  </a>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {data.listedProducts?.length === 0 && (
                    <p className="text-slate-400">No products listed yet.</p>
                  )}

                  {data.listedProducts?.map((product: any) => (
                    <div
                      key={product.id}
                      className="bg-slate-800 rounded-2xl overflow-hidden"
                    >
                      <div className="h-48 bg-slate-700">
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-lg">
                            {product.title}
                          </h3>

                          <span className="text-blue-400 font-bold">
                            ₹{product.price}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <span className="bg-slate-700 px-3 py-1 rounded-full text-xs">
                            {product.category}
                          </span>

                          <span className="bg-slate-700 px-3 py-1 rounded-full text-xs">
                            {product.condition}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold">Recent Purchases</h2>

                <div className="mt-5 space-y-4">
                  {data.purchasedOrders?.length === 0 && (
                    <p className="text-slate-400">No purchases yet.</p>
                  )}

                  {data.purchasedOrders?.map((order: any) => (
                    <div key={order.id} className="bg-slate-800 rounded-xl p-4">
                      <p>Order Amount: ₹{order.amount}</p>

                      <p className="text-sm text-green-400 mt-2">
                        {order.paymentStatus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold">Recent Chats</h2>

                <div className="mt-5 space-y-4">
                  {data.conversations?.length === 0 && (
                    <p className="text-slate-400">No conversations yet.</p>
                  )}

                  {data.conversations?.map((conversation: any) => (
                    <a
                      key={conversation.id}
                      href="/chat"
                      className="block bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition"
                    >
                      <p className="font-medium">Product Chat</p>

                      <p className="text-sm text-slate-400 mt-2 line-clamp-1">
                        {
                          conversation.messages?.[
                            conversation.messages.length - 1
                          ]?.text
                        }
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}