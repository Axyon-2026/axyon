"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type Ticket = {
  id: string;
  subject?: string;
  email?: string;
  name?: string;
  message?: string;
  status?: string;
  createdAt?: string;
};

const FILTERS = ["ALL", "OPEN", "RESOLVED"] as const;

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [message, setMessage] = useState(
    "Loading support tickets..."
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [updatingTicket, setUpdatingTicket] =
    useState<string | null>(null);

  async function fetchTickets() {
    try {
      setMessage("Loading support tickets...");

      const res = await fetch("/api/admin/support", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load support tickets."
        );
        return;
      }

      setTickets(data.tickets || []);
      setMessage("");
    } catch {
      setMessage(
        "Something went wrong while loading support tickets."
      );
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  async function resolveTicket(ticketId: string) {
    if (updatingTicket) return;

    try {
      setUpdatingTicket(ticketId);

      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          status: "RESOLVED",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to resolve ticket."
        );
        return;
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: "RESOLVED",
              }
            : ticket
        )
      );
    } catch {
      alert("Failed to resolve ticket.");
    } finally {
      setUpdatingTicket(null);
    }
  }

  const filteredTickets = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.subject
          ?.toLowerCase()
          .includes(query) ||
        ticket.email
          ?.toLowerCase()
          .includes(query) ||
        ticket.name
          ?.toLowerCase()
          .includes(query) ||
        ticket.message
          ?.toLowerCase()
          .includes(query);

      const isResolved =
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED";

      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "OPEN"
            ? !isResolved
            : filter === "RESOLVED"
              ? isResolved
              : true;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    tickets,
    search,
    filter,
  ]);

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status !== "RESOLVED" &&
      ticket.status !== "CLOSED"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-purple-400">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                Support Management
              </div>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Support Center
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Review student support requests, track
                    unresolved issues, and keep marketplace
                    operations running smoothly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchTickets}
                  className="w-full rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-purple-500/50 hover:text-white sm:w-auto"
                >
                  ↻ Refresh Tickets
                </button>
              </div>

              {/* STATS */}
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {totalTickets}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Open
                  </p>

                  <p className="mt-1 text-2xl font-black text-amber-300">
                    {openTickets}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Resolved
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-300">
                    {resolvedTickets}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-4 shadow-xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Search tickets, names, emails..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition ${
                      filter === item
                        ? "border-purple-500 bg-purple-500 text-white"
                        : "border-slate-700 bg-slate-950 text-slate-400 hover:border-purple-500/50 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LOADING / ERROR */}
          {message && (
            <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                {message ===
                "Loading support tickets..."
                  ? "⏳"
                  : "⚠️"}
              </div>

              <p className="mt-4 font-semibold text-slate-400">
                {message}
              </p>

              {message !==
                "Loading support tickets..." && (
                <button
                  type="button"
                  onClick={fetchTickets}
                  className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* EMPTY */}
          {!message &&
            filteredTickets.length === 0 && (
              <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center shadow-xl sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                  💬
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  No Tickets Found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No support tickets match the current
                  search or status filter.
                </p>
              </div>
            )}

          {/* TICKETS */}
          {!message &&
            filteredTickets.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredTickets.map((ticket) => {
                  const isResolved =
                    ticket.status ===
                      "RESOLVED" ||
                    ticket.status ===
                      "CLOSED";

                  const isUpdating =
                    updatingTicket ===
                    ticket.id;

                  const status =
                    ticket.status ||
                    "OPEN";

                  return (
                    <article
                      key={ticket.id}
                      className="rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-slate-700 sm:p-6"
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-xl">
                            💬
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                                  isResolved
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : status ===
                                        "IN_PROGRESS"
                                      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                }`}
                              >
                                {status.replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </div>

                            <h2 className="mt-3 break-words text-xl font-black sm:text-2xl">
                              {ticket.subject ||
                                "Support Request"}
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/* USER */}
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            Name
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-slate-300">
                            {ticket.name ||
                              "Unknown user"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm font-bold text-slate-300">
                            {ticket.email ||
                              "No email"}
                          </p>
                        </div>
                      </div>

                      {/* MESSAGE */}
                      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-600">
                          Message
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                          {ticket.message ||
                            "No message provided."}
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {!isResolved && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              resolveTicket(
                                ticket.id
                              )
                            }
                            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Resolving..."
                              : "✓ Mark Resolved"}
                          </button>
                        )}

                        {ticket.email && (
                          <a
                            href={`mailto:${ticket.email}`}
                            className="inline-flex items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/5 px-5 py-3 text-sm font-black text-purple-400 transition hover:border-purple-500 hover:bg-purple-500/10"
                          >
                            ✉ Reply via Email
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}