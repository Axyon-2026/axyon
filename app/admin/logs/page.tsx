"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading admin logs...");
  const [accessDenied, setAccessDenied] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
        return;
      }

      if (!res.ok) {
        setMessage(data.message || "Failed to load logs");
        return;
      }

      setLogs(data.logs || []);
      setMessage("");
    } catch {
      setMessage("Something went wrong");
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const value = search.toLowerCase();

      return (
        log.action?.toLowerCase().includes(value) ||
        log.adminEmail?.toLowerCase().includes(value) ||
        log.targetType?.toLowerCase().includes(value) ||
        log.targetId?.toLowerCase().includes(value) ||
        log.details?.toLowerCase().includes(value)
      );
    });
  }, [logs, search]);

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-[#0f172a] text-white">
        <Navbar />

        <section className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 max-w-lg text-center shadow-2xl">
            <div className="text-7xl">🔒</div>

            <h1 className="mt-6 text-4xl font-black text-red-500">
              Access Denied
            </h1>

            <p className="mt-4 text-slate-400 leading-7">
              You do not have permission to view admin activity logs.
            </p>

            <a
              href="/"
              className="inline-block mt-8 bg-green-600 hover:bg-green-700 px-7 py-4 rounded-full font-black"
            >
              Go Home
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 sm:p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-4 py-2 text-xs font-black">
                Admin Audit Trail
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl font-black">
                Activity Logs
              </h1>

              <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                Review sensitive admin actions, target records, timestamps,
                and moderation history across Axyon.
              </p>

              <a
                href="/admin"
                className="inline-block mt-7 border border-slate-600 hover:border-green-500 px-6 py-3 rounded-full font-black"
              >
                Back to Admin
              </a>
            </div>
          </div>

          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-xl">
            <input
              type="text"
              placeholder="Search logs by action, admin, target, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 outline-none focus:border-green-500"
            />
          </div>

          {message && (
            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <p className="text-slate-400 font-semibold">{message}</p>
            </div>
          )}

          {!message && filteredLogs.length === 0 && (
            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-center">
              <div className="text-6xl">📁</div>

              <h2 className="mt-5 text-3xl font-black">No Logs Found</h2>

              <p className="mt-3 text-slate-400">
                Admin actions will appear here.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                        {log.action || "ACTION"}
                      </span>

                      {log.targetType && (
                        <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black">
                          {log.targetType}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-black break-words">
                      {log.action}
                    </h2>

                    <p className="mt-3 text-sm text-slate-400 break-all">
                      Admin:{" "}
                      <span className="text-white font-semibold">
                        {log.adminEmail}
                      </span>
                    </p>

                    {log.targetId && (
                      <p className="mt-2 text-sm text-slate-400 break-all">
                        Target ID:{" "}
                        <span className="text-white font-semibold">
                          {log.targetId}
                        </span>
                      </p>
                    )}

                    {log.details && (
                      <div className="mt-5 bg-slate-800 rounded-2xl p-4">
                        <p className="text-sm text-slate-300 leading-7 whitespace-pre-wrap">
                          {log.details}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-xs text-slate-500 font-semibold">
                      Timestamp
                    </p>

                    <p className="mt-2 text-sm text-slate-300 font-bold">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}