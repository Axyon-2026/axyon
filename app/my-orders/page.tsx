"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function MyOrdersPage() {
  const [orders, setOrders] =
    useState<any[]>([]);

  const [message, setMessage] =
    useState("Loading orders...");

  const [cancelReason, setCancelReason] =
    useState("");

  async function fetchOrders() {

    try {

      const res =
        await fetch("/api/my-orders");

      const data =
        await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load orders"
        );

        return;
      }

      setOrders(data.orders || []);
      setMessage("");

    } catch {

      setMessage(
        "Something went wrong"
      );

    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleCancel(
    orderId: string
  ) {

    if (
      !cancelReason ||
      cancelReason.length < 5
    ) {
      alert(
        "Please provide cancellation reason"
      );

      return;
    }

    const confirmCancel =
      confirm(
        "Are you sure you want to cancel this order?"
      );

    if (!confirmCancel) return;

    const res =
      await fetch(
        "/api/orders/cancel",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            orderId,
            reason:
              cancelReason,
          }),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data.message ||
          "Failed to cancel order"
      );

      return;
    }

    alert(
      "Order cancelled successfully"
    );

    fetchOrders();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              My Orders
            </h1>

            <p className="mt-3 text-slate-400">
              Manage your purchases and cancellations.
            </p>
          </div>
        </div>

        {message && (
          <p className="mt-8 text-slate-400">
            {message}
          </p>
        )}

        <div className="space-y-6 mt-10">
          {orders.length === 0 &&
            !message && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-semibold">
                  No Orders Yet
                </h2>

                <p className="mt-3 text-slate-400">
                  Your purchases will appear here.
                </p>
              </div>
            )}

          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-bold">
                    ₹{order.amount}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Order ID:
                    {" "}
                    {order.id}
                  </p>

                  <p className="mt-2 text-slate-400">
                    Status:
                    {" "}

                    <span
                      className={`font-medium ${
                        order.paymentStatus ===
                        "SUCCESS"
                          ? "text-green-400"
                          : order.paymentStatus ===
                            "CANCELLED"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {
                        order.paymentStatus
                      }
                    </span>
                  </p>

                  <p className="mt-2 text-slate-500 text-sm">
                    Ordered on:
                    {" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>

                  {order.cancelReason && (
                    <p className="mt-2 text-sm text-red-400">
                      Cancellation Reason:
                      {" "}
                      {
                        order.cancelReason
                      }
                    </p>
                  )}
                </div>

                {order.paymentStatus ===
                  "PENDING" && (
                  <div className="w-full md:w-[320px]">
                    <select
                      value={
                        cancelReason
                      }

                      onChange={(e) =>
                        setCancelReason(
                          e.target.value
                        )
                      }

                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
                    >
                      <option value="">
                        Select cancellation reason
                      </option>

                      <option value="Changed my mind">
                        Changed my mind
                      </option>

                      <option value="Ordered by mistake">
                        Ordered by mistake
                      </option>

                      <option value="Found cheaper elsewhere">
                        Found cheaper elsewhere
                      </option>

                      <option value="Need cancelled">
                        No longer needed
                      </option>
                    </select>

                    <button
                      onClick={() =>
                        handleCancel(
                          order.id
                        )
                      }
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-medium"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}