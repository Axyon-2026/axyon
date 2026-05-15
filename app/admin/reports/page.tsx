"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading reports...");
  const [accessDenied, setAccessDenied] = useState(false);

  async function fetchReports() {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
        return;
      }

      if (!res.ok) {
        setMessage(data.message || "Failed to load reports");
        return;
      }

      setReports(data.reports || []);
      setMessage("");
    } catch {
      setMessage("Something went wrong");
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function updateStatus(reportId: string, status: string) {
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reportId, status }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update report");
      return;
    }

    fetchReports();
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <section className="flex items-center justify-center py-24 px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-lg">
            <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
            <p className="mt-5 text-slate-400">
              You do not have permission to view reports.
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
            <h1 className="text-4xl font-bold">Reports & Flags</h1>
            <p className="mt-3 text-slate-400">
              Review reported users, products, orders, and chats.
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

        {!message && reports.length === 0 && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold">No Reports</h2>
            <p className="mt-3 text-slate-400">
              Reported content will appear here.
            </p>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      {report.targetType} Report
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === "OPEN"
                          ? "bg-red-900/40 text-red-300"
                          : report.status === "REVIEWING"
                          ? "bg-yellow-900/40 text-yellow-300"
                          : report.status === "RESOLVED"
                          ? "bg-green-900/40 text-green-300"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-slate-300">
                    <p>
                      <span className="text-slate-500">Target ID:</span>{" "}
                      {report.targetId}
                    </p>

                    <p>
                      <span className="text-slate-500">Reason:</span>{" "}
                      {report.reason}
                    </p>

                    {report.details && (
                      <p>
                        <span className="text-slate-500">Details:</span>{" "}
                        {report.details}
                      </p>
                    )}

                    <p className="text-sm text-slate-500">
                      Reported on:{" "}
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-64">
                  <label className="block text-sm text-slate-400 mb-2">
                    Update Status
                  </label>

                  <select
                    value={report.status}
                    onChange={(e) => updateStatus(report.id, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="REVIEWING">REVIEWING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="DISMISSED">DISMISSED</option>
                  </select>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="bg-yellow-600 hover:bg-yellow-700 py-2 rounded-xl text-sm font-medium">
                      Warn
                    </button>

                    <button className="bg-red-600 hover:bg-red-700 py-2 rounded-xl text-sm font-medium">
                      Flag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}