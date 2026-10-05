"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type Report = {
  id: string;
  reason?: string;
  description?: string;
  status?: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  product?: {
    id: string;
    title?: string;
    imageUrls?: string[];
    seller?: {
      name?: string;
      email?: string;
    };
  };
  reportedBy?: {
    name?: string;
    email?: string;
  };
};

const STATUS_FILTERS = [
  "ALL",
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
] as const;

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("Loading reports...");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function fetchReports() {
    try {
      setMessage("Loading reports...");

      const res = await fetch("/api/admin/reports", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load reports.");
        return;
      }

      setReports(data.reports || []);
      setMessage("");
    } catch {
      setMessage("Something went wrong while loading reports.");
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function updateReportStatus(
    reportId: string,
    status: "REVIEWING" | "RESOLVED" | "DISMISSED"
  ) {
    try {
      setResolvingId(reportId);

      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update report.");
        return;
      }

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status,
              }
            : report
        )
      );
    } catch {
      alert("Failed to update report.");
    } finally {
      setResolvingId(null);
    }
  }

  async function removeProduct(productId?: string) {
    if (!productId) return;

    const confirmed = confirm(
      "Remove this reported product?\n\nThis will mark the listing as removed from the marketplace."
    );

    if (!confirmed) return;

    try {
      setRemovingId(productId);

      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          action: "REMOVE",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to remove product.");
        return;
      }

      alert("Product removed successfully.");

      await fetchReports();
    } catch {
      alert("Failed to remove product.");
    } finally {
      setRemovingId(null);
    }
  }

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.reason?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query) ||
        report.product?.title?.toLowerCase().includes(query) ||
        report.reportedBy?.name?.toLowerCase().includes(query) ||
        report.reportedBy?.email?.toLowerCase().includes(query) ||
        report.product?.seller?.name?.toLowerCase().includes(query) ||
        report.product?.seller?.email?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "ALL"
          ? true
          : report.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [reports, search, filter]);

  const totalCount = reports.length;

  const openCount = reports.filter(
    (report) =>
      report.status === "OPEN" ||
      report.status === "REVIEWING"
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "RESOLVED"
  ).length;

  const dismissedCount = reports.filter(
    (report) => report.status === "DISMISSED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/30 p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Trust & Safety
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Reports Center
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Review reported marketplace activity, investigate
                suspicious listings, manage report status, and remove
                inappropriate products when necessary.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-black/20 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {totalCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-400">
                    Open
                  </p>
                  <p className="mt-1 text-2xl font-black text-red-300">
                    {openCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Resolved
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-300">
                    {resolvedCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-800/40 px-4 py-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Dismissed
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-300">
                    {dismissedCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-4 shadow-xl sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Search reports, products, sellers, users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition ${
                      filter === item
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-slate-700 bg-slate-950 text-slate-400 hover:border-red-500/50 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading / error */}
          {message && (
            <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                {message === "Loading reports..." ? "⏳" : "⚠️"}
              </div>

              <p className="mt-4 font-semibold text-slate-400">
                {message}
              </p>
            </div>
          )}

          {/* Empty */}
          {!message && filteredReports.length === 0 && (
            <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center shadow-xl sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                🛡️
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No Reports Found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No reports match the current search or status filter.
              </p>
            </div>
          )}

          {/* Reports */}
          {!message && filteredReports.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredReports.map((report) => {
                const image =
                  report.product?.imageUrls?.[0] || "";

                const isRemoving =
                  removingId === report.product?.id;

                const isUpdating =
                  resolvingId === report.id;

                const status = report.status || "OPEN";

                return (
                  <article
                    key={report.id}
                    className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-xl transition hover:border-slate-700"
                  >
                    {/* Product preview */}
                    <div className="relative aspect-[16/7] bg-slate-950 sm:aspect-[16/6]">
                      {image ? (
                        <img
                          src={image}
                          alt={
                            report.product?.title ||
                            "Reported product"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">
                          🚨
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                      <div className="absolute left-4 top-4">
                        <span
                          className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                            status === "RESOLVED"
                              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                              : status === "DISMISSED"
                                ? "border-slate-500/30 bg-slate-500/15 text-slate-300"
                                : status === "REVIEWING"
                                  ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                                  : "border-red-500/30 bg-red-500/15 text-red-300"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-5 right-5">
                        <h2 className="line-clamp-2 text-xl font-black sm:text-2xl">
                          {report.product?.title ||
                            "Unknown Product"}
                        </h2>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      {/* People */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                            Reported By
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-slate-200">
                            {report.reportedBy?.name ||
                              "Unknown user"}
                          </p>

                          {report.reportedBy?.email && (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {report.reportedBy.email}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                            Seller
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-slate-200">
                            {report.product?.seller?.name ||
                              "Unknown seller"}
                          </p>

                          {report.product?.seller?.email && (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {report.product.seller.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mt-4 rounded-2xl border border-red-500/10 bg-red-500/[0.04] p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-red-400">
                          Report Reason
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-200">
                          {report.reason ||
                            "No reason provided"}
                        </p>
                      </div>

                      {report.description && (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                            Description
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {report.description}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {report.product?.id && (
                          <a
                            href={`/product/${report.product.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                          >
                            View Product
                          </a>
                        )}

                        {status !== "RESOLVED" &&
                          status !== "DISMISSED" && (
                            <>
                              {status !== "REVIEWING" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateReportStatus(
                                      report.id,
                                      "REVIEWING"
                                    )
                                  }
                                  disabled={isUpdating}
                                  className="inline-flex items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/5 px-5 py-3 text-sm font-black text-amber-400 transition hover:border-amber-400 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "Review"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  updateReportStatus(
                                    report.id,
                                    "RESOLVED"
                                  )
                                }
                                disabled={isUpdating}
                                className="inline-flex items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/5 px-5 py-3 text-sm font-black text-emerald-400 transition hover:border-emerald-400 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Resolve"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateReportStatus(
                                    report.id,
                                    "DISMISSED"
                                  )
                                }
                                disabled={isUpdating}
                                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-800/40 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Dismiss
                              </button>
                            </>
                          )}

                        {report.product?.id && (
                          <button
                            type="button"
                            onClick={() =>
                              removeProduct(
                                report.product?.id
                              )
                            }
                            disabled={isRemoving}
                            className="inline-flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/5 px-5 py-3 text-sm font-black text-red-400 transition hover:border-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isRemoving
                              ? "Removing..."
                              : "Remove Product"}
                          </button>
                        )}
                      </div>

                      <p className="mt-4 text-[11px] leading-5 text-slate-600">
                        Admins can review and moderate reports and
                        remove inappropriate listings. Listing editing
                        and selling remain unavailable to admins.
                      </p>
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