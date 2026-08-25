"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [message, setMessage] = useState(
    "Loading support tickets..."
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(
    null
  );

  async function fetchTickets() {
    try {
      const res = await fetch("/api/admin/support", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message || "Failed to load support tickets"
        );
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
          data.message || "Failed to resolve ticket"
        );
        return;
      }

      /*
       * Update local state using the actual database
       * status field.
       */
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

      alert("Ticket resolved successfully.");
    } catch {
      alert("Failed to resolve ticket.");
    } finally {
      setUpdatingTicket(null);
    }
  }

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase().trim();

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

      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "OPEN"
          ? ticket.status !== "RESOLVED" &&
            ticket.status !== "CLOSED"
          : filter === "RESOLVED"
          ? ticket.status === "RESOLVED" ||
            ticket.status === "CLOSED"
          : true;

      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <section className="px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* HERO */}

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-black text-purple-400">
                Support Management
              </span>

              <h1 className="mt-6 text-4xl font-black sm:text-5xl">
                Admin Support
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                Review student support requests, track issues,
                and maintain healthy marketplace operations.
              </p>
            </div>
          </div>

          {/* FILTERS */}

          <div className="mt-8 rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-800
                  px-5
                  py-4
                  outline-none
                  focus:border-purple-500
                "
              />

              <div className="flex flex-wrap gap-3">
                {[
                  "ALL",
                  "OPEN",
                  "RESOLVED",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`
                      rounded-full
                      border
                      px-5
                      py-3
                      text-sm
                      font-black
                      transition
                      ${
                        filter === item
                          ? "border-purple-600 bg-purple-600"
                          : "border-slate-700 bg-slate-800 hover:border-purple-500"
                      }
                    `}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STATUS MESSAGE */}

          {message && (
            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="font-semibold text-slate-400">
                {message}
              </p>
            </div>
          )}

          {/* EMPTY */}

          {!message &&
            filteredTickets.length === 0 && (
              <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center">
                <div className="text-6xl">
                  💬
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  No Tickets Found
                </h2>

                <p className="mt-3 text-slate-400">
                  No support tickets match the selected filters.
                </p>
              </div>
            )}

          {/* TICKETS */}

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredTickets.map((ticket) => {
              const isResolved =
                ticket.status === "RESOLVED" ||
                ticket.status === "CLOSED";

              const isUpdating =
                updatingTicket === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="
                    rounded-[2rem]
                    border
                    border-slate-800
                    bg-slate-900
                    p-6
                    shadow-2xl
                  "
                >
                  {/* STATUS */}

                  <div className="flex flex-wrap gap-2">
                    {ticket.status === "OPEN" && (
                      <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-black text-yellow-400">
                        OPEN
                      </span>
                    )}

                    {ticket.status === "IN_PROGRESS" && (
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black text-blue-400">
                        IN PROGRESS
                      </span>
                    )}

                    {ticket.status === "RESOLVED" && (
                      <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-black text-green-400">
                        RESOLVED
                      </span>
                    )}

                    {ticket.status === "CLOSED" && (
                      <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-[10px] font-black text-slate-400">
                        CLOSED
                      </span>
                    )}
                  </div>

                  {/* SUBJECT */}

                  <h2 className="mt-5 text-2xl font-black">
                    {ticket.subject}
                  </h2>

                  {/* USER */}

                  <div className="mt-5 space-y-2 text-sm">
                    <p className="text-slate-400">
                      Name:{" "}
                      <span className="font-semibold text-white">
                        {ticket.name}
                      </span>
                    </p>

                    <p className="text-slate-400">
                      Email:{" "}
                      <span className="break-all font-semibold text-white">
                        {ticket.email}
                      </span>
                    </p>
                  </div>

                  {/* MESSAGE */}

                  <div className="mt-5 rounded-2xl bg-slate-800 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {ticket.message}
                    </p>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-6 flex flex-wrap gap-3">

                    {!isResolved && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          resolveTicket(ticket.id)
                        }
                        className="
                          rounded-full
                          bg-green-600
                          px-5
                          py-3
                          text-sm
                          font-black
                          transition
                          hover:bg-green-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {isUpdating
                          ? "Resolving..."
                          : "✓ Mark Resolved"}
                      </button>
                    )}

                    <a
                      href={`mailto:${ticket.email}`}
                      className="
                        rounded-full
                        border
                        border-purple-500/30
                        px-5
                        py-3
                        text-sm
                        font-black
                        text-purple-400
                        transition
                        hover:border-purple-500
                      "
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}