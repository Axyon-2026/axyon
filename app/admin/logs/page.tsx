"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading admin logs...");
  const [accessDenied, setAccessDenied] = useState(false);

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

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <section className="flex items-center justify-center py-24 px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-lg">
            <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
            <p className="mt-5 text-slate-400">
              You do not have permission to view admin logs.
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
            <h1 className="text-4xl font-bold">Admin Activity Logs</h1>
            <p className="mt-3 text-slate-400">
              Review every sensitive admin action with timestamp.
            </p>
          </div>

          <a
            href="/admin"
            className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl font-medium"
          >
            Back to Admin
          </a>
        </div>

        {message && <p className="mt-8 text-slate-400">{message}</p>}

        {!message && logs.length === 0 && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold">No Logs Yet</h2>
            <p className="mt-3 text-slate-400">
              Admin actions will appear here.
            </p>
          </div>
        )}

        <div className="mt-10 space-y-5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-purple-300">
                    {log.action}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Admin: {log.adminEmail}
                  </p>

                  {log.targetType && (
                    <p className="mt-2 text-slate-400">
                      Target: {log.targetType} — {log.targetId}
                    </p>
                  )}

                  {log.details && (
                    <p className="mt-3 text-slate-300">{log.details}</p>
                  )}
                </div>

                <p className="text-sm text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}