"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function AdminSupportPage() {
  const [tickets, setTickets] =
    useState<any[]>([]);

  const [message, setMessage] =
    useState(
      "Loading support tickets..."
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  async function fetchTickets() {
    try {
      const res =
        await fetch(
          "/api/admin/support"
        );

      const data =
        await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load support tickets"
        );

        return;
      }

      setTickets(
        data.tickets || []
      );

      setMessage("");

    } catch {

      setMessage(
        "Something went wrong"
      );

    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  async function resolveTicket(
    ticketId: string
  ) {
    try {

      const res =
        await fetch("/api/support", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    ticketId,
  }),
});

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.message ||
            "Failed to resolve ticket"
        );

        return;
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                resolved: true,
              }
            : ticket
        )
      );

      alert(
        "Ticket resolved"
      );

    } catch {

      alert(
        "Failed to resolve ticket"
      );

    }
  }

  const filteredTickets =
    useMemo(() => {

      return tickets.filter(
        (ticket) => {

          const matchesSearch =
            ticket.subject
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            ticket.email
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            ticket.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "ALL"
              ? true
              : filter ===
                "OPEN"
              ? !ticket.resolved
              : filter ===
                "RESOLVED"
              ? ticket.resolved
              : true;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [
      tickets,
      search,
      filter,
    ]);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-7xl mx-auto">
          {/* hero */}

          <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 sm:p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-4 py-2 text-xs font-black">
                Support Management
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl font-black">
                Admin Support
              </h1>

              <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                Review student support requests, track issues,
                and maintain healthy marketplace operations.
              </p>
            </div>
          </div>

          {/* filters */}

          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <input
                type="text"

                placeholder="Search tickets..."

                value={search}

                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }

                className="
                  px-5
                  py-4
                  rounded-2xl
                  bg-slate-800
                  border
                  border-slate-700
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

                    onClick={() =>
                      setFilter(item)
                    }

                    className={`
                      px-5
                      py-3
                      rounded-full
                      text-sm
                      font-black
                      border
                      transition

                      ${
                        filter === item
                          ? "bg-purple-600 border-purple-600"
                          : "bg-slate-800 border-slate-700 hover:border-purple-500"
                      }
                    `}
                  >
                    {item}
                  </button>
                ))}
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

          {!message &&
            filteredTickets.length ===
              0 && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-center">
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

          {/* tickets */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            {filteredTickets.map(
              (ticket) => (
                <div
                  key={ticket.id}

                  className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-[2rem]
                    p-6
                    shadow-2xl
                  "
                >
                  <div className="flex flex-wrap gap-2">
                    {!ticket.resolved && (
                      <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                        OPEN
                      </span>
                    )}

                    {ticket.resolved && (
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                        RESOLVED
                      </span>
                    )}
                  </div>

                  <h2 className="mt-5 text-2xl font-black">
                    {ticket.subject}
                  </h2>

                  <div className="mt-5 space-y-2 text-sm">
                    <p className="text-slate-400">
                      Name:{" "}
                      <span className="text-white font-semibold">
                        {ticket.name}
                      </span>
                    </p>

                    <p className="text-slate-400">
                      Email:{" "}
                      <span className="text-white font-semibold break-all">
                        {ticket.email}
                      </span>
                    </p>
                  </div>

                  <div className="mt-5 bg-slate-800 rounded-2xl p-4">
                    <p className="text-sm text-slate-300 leading-7 whitespace-pre-wrap">
                      {ticket.message}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {!ticket.resolved && (
                      <button
                        onClick={() =>
                          resolveTicket(
                            ticket.id
                          )
                        }

                        className="
                          bg-green-600
                          hover:bg-green-700
                          px-5
                          py-3
                          rounded-full
                          font-black
                          text-sm
                        "
                      >
                        Mark Resolved
                      </button>
                    )}

                    <a
                      href={`mailto:${ticket.email}`}

                      className="
                        border
                        border-purple-500/30
                        hover:border-purple-500
                        text-purple-400
                        px-5
                        py-3
                        rounded-full
                        font-black
                        text-sm
                      "
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}