"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading support tickets...");
  const [accessDenied, setAccessDenied] = useState(false);

  async function fetchTickets() {
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
        return;
      }

      if (!res.ok) {
        setMessage(data.message || "Failed to load tickets");
        return;
      }

      setTickets(data.tickets || []);
      setMessage("");
    } catch {
      setMessage("Something went wrong");
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  async function updateStatus(ticketId: string, status: string) {
    const res = await fetch("/api/admin/support", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketId,
        status,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update ticket");
      return;
    }

    fetchTickets();
  }

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
              You do not have permission to view support tickets.
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold">
              Support Tickets
            </h1>

            <p className="mt-3 text-slate-400">
              Manage user complaints, bugs, payments, and order issues.
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
          <p className="mt-8 text-slate-400">
            {message}
          </p>
        )}

        {!message && tickets.length === 0 && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold">
              No Tickets
            </h2>

            <p className="mt-3 text-slate-400">
              New support requests will appear here.
            </p>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      {ticket.subject}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === "OPEN"
                          ? "bg-red-900/40 text-red-300"
                          : ticket.status === "IN_PROGRESS"
                          ? "bg-yellow-900/40 text-yellow-300"
                          : ticket.status === "RESOLVED"
                          ? "bg-green-900/40 text-green-300"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="mt-4 text-slate-300 leading-7">
                    {ticket.message}
                  </p>

                  <div className="mt-5 text-sm text-slate-400 space-y-2">
                    <p>Name: {ticket.name}</p>

                    <p>Email: {ticket.email}</p>

                    <p>
                      Created:{" "}
                      {new Date(
                        ticket.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-64">
                  <label className="block text-sm text-slate-400 mb-2">
                    Update Status
                  </label>

                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      updateStatus(
                        ticket.id,
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
                  >
                    <option value="OPEN">
                      OPEN
                    </option>

                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>

                    <option value="RESOLVED">
                      RESOLVED
                    </option>

                    <option value="CLOSED">
                      CLOSED
                    </option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}