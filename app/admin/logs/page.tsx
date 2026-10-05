"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type AdminLog = {
  id: string;
  action?: string;
  adminEmail?: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  createdAt?: string;
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [message, setMessage] =
    useState("Loading admin logs...");
  const [accessDenied, setAccessDenied] =
    useState(false);
  const [search, setSearch] = useState("");

  async function fetchLogs() {
    try {
      setMessage("Loading admin logs...");
      setAccessDenied(false);

      const res = await fetch(
        "/api/admin/logs",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
        return;
      }

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load logs."
        );
        return;
      }

      setLogs(data.logs || []);
      setMessage("");
    } catch {
      setMessage(
        "Something went wrong while loading logs."
      );
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) return logs;

    return logs.filter((log) =>
      [
        log.action,
        log.adminEmail,
        log.targetType,
        log.targetId,
        log.details,
      ].some((field) =>
        field
          ?.toLowerCase()
          .includes(value)
      )
    );
  }, [logs, search]);

  const actionCount = logs.length;

  const uniqueAdmins = new Set(
    logs
      .map((log) => log.adminEmail)
      .filter(Boolean)
  ).size;

  const moderationActions = logs.filter(
    (log) =>
      log.action
        ?.toLowerCase()
        .includes("remove") ||
      log.action
        ?.toLowerCase()
        .includes("suspend") ||
      log.action
        ?.toLowerCase()
        .includes("verify")
  ).length;

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <section className="flex min-h-[80vh] items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg rounded-[2rem] border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-4xl">
              🔒
            </div>

            <h1 className="mt-6 text-3xl font-black text-red-400 sm:text-4xl">
              Access Denied
            </h1>

            <p className="mt-4 leading-7 text-slate-400">
              You do not have permission to view
              admin activity logs.
            </p>

            <a
              href="/"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-200"
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

      <section className="px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Admin Audit Trail
              </div>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Activity Logs
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Review sensitive admin actions,
                    target records, timestamps, and
                    moderation history across Axyon.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={fetchLogs}
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
                  >
                    ↻ Refresh Logs
                  </button>

                  <a
                    href="/admin"
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-center text-sm font-black text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
                  >
                    ← Admin Dashboard
                  </a>
                </div>
              </div>

              {/* STATS */}
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Actions
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {actionCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Admins
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {uniqueAdmins}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    Moderation
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-300">
                    {moderationActions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-4 shadow-xl sm:p-5">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search by action, admin, target, ID, or details..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-300">
                  {filteredLogs.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-300">
                  {logs.length}
                </span>{" "}
                logs
              </span>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* STATUS */}
          {message && (
            <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                ⏳
              </div>

              <p className="mt-4 font-semibold text-slate-400">
                {message}
              </p>

              {message !==
                "Loading admin logs..." && (
                <button
                  type="button"
                  onClick={fetchLogs}
                  className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* EMPTY */}
          {!message &&
            filteredLogs.length === 0 && (
              <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center shadow-xl sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                  📁
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  No Logs Found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "No activity matches your current search."
                    : "Admin actions will appear here."}
                </p>
              </div>
            )}

          {/* LOGS */}
          {!message &&
            filteredLogs.length > 0 && (
              <div className="mt-6 space-y-4">
                {filteredLogs.map((log) => {
                  const action =
                    log.action ||
                    "ACTION";

                  return (
                    <article
                      key={log.id}
                      className="rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-slate-700 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        {/* MAIN */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
                              🛡️
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap gap-2">
                                <span className="max-w-full break-all rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                                  {action}
                                </span>

                                {log.targetType && (
                                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                    {log.targetType}
                                  </span>
                                )}
                              </div>

                              <h2 className="mt-3 break-words text-lg font-black sm:text-xl">
                                {action}
                              </h2>
                            </div>
                          </div>

                          {/* METADATA */}
                          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Admin
                              </p>

                              <p className="mt-1 break-all text-sm font-bold text-slate-300">
                                {log.adminEmail ||
                                  "Unknown admin"}
                              </p>
                            </div>

                            {log.targetId && (
                              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                  Target ID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs font-bold text-slate-300">
                                  {log.targetId}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* DETAILS */}
                          {log.details && (
                            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                              <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Details
                              </p>

                              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-400">
                                {log.details}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* TIMESTAMP */}
                        <div className="shrink-0 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 lg:min-w-[190px]">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            Timestamp
                          </p>

                          <p className="mt-2 text-sm font-bold leading-6 text-slate-300">
                            {log.createdAt
                              ? new Date(
                                  log.createdAt
                                ).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>
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