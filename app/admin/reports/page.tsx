"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] =
    useState<any[]>([]);

  const [message, setMessage] =
    useState(
      "Loading reports..."
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  async function fetchReports() {
    try {
      const res =
        await fetch(
          "/api/admin/reports"
        );

      const data =
        await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load reports"
        );

        return;
      }

      setReports(
        data.reports || []
      );

      setMessage("");

    } catch {

      setMessage(
        "Something went wrong"
      );

    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function resolveReport(
    reportId: string
  ) {
    try {

      const res =
        await fetch(
          `/api/admin/reports/${reportId}/resolve`,
          {
            method: "PATCH",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.message ||
            "Failed to resolve report"
        );

        return;
      }

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                resolved: true,
              }
            : report
        )
      );

      alert(
        "Report resolved"
      );

    } catch {

      alert(
        "Failed to resolve report"
      );

    }
  }

  async function deleteProduct(
    productId: string
  ) {
    const confirmed =
      confirm(
        "Remove this reported product?"
      );

    if (!confirmed) return;

    try {

      const res =
        await fetch(
          `/api/admin/listings/${productId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.message ||
            "Failed to remove product"
        );

        return;
      }

      alert(
        "Product removed successfully"
      );

      fetchReports();

    } catch {

      alert(
        "Failed to remove product"
      );

    }
  }

  const filteredReports =
    useMemo(() => {

      return reports.filter(
        (report) => {

          const matchesSearch =
            report.reason
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            report.product?.title
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            report.reportedBy
              ?.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "ALL"
              ? true
              : filter ===
                "OPEN"
              ? !report.resolved
              : filter ===
                "RESOLVED"
              ? report.resolved
              : true;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [
      reports,
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex bg-red-500/10 border border-red-500/20 text-red-400 rounded-full px-4 py-2 text-xs font-black">
                Trust & Safety
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl font-black">
                Admin Reports
              </h1>

              <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                Review suspicious listings, investigate abuse,
                and maintain a safe student marketplace.
              </p>
            </div>
          </div>

          {/* filters */}

          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <input
                type="text"

                placeholder="Search reports..."

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
                  focus:border-red-500
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
                          ? "bg-red-600 border-red-600"
                          : "bg-slate-800 border-slate-700 hover:border-red-500"
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
            filteredReports.length ===
              0 && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-center">
                <div className="text-6xl">
                  🚨
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  No Reports Found
                </h2>

                <p className="mt-3 text-slate-400">
                  No reports match the selected filters.
                </p>
              </div>
            )}

          {/* reports */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            {filteredReports.map(
              (report) => {

                const image =
                  report.product
                    ?.imageUrls &&
                  report.product
                    .imageUrls
                    .length > 0
                    ? report.product
                        .imageUrls[0]
                    : "";

                return (
                  <div
                    key={report.id}

                    className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-[2rem]
                    overflow-hidden
                    shadow-2xl
                  "
                  >
                    <div className="grid grid-cols-[140px_1fr]">
                      <div className="bg-slate-800 aspect-square">
                        {image ? (
                          <img
                            src={image}
                            alt={
                              report
                                .product
                                ?.title
                            }

                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🚨
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex flex-wrap gap-2">
                          {!report.resolved && (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                              OPEN
                            </span>
                          )}

                          {report.resolved && (
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                              RESOLVED
                            </span>
                          )}
                        </div>

                        <h2 className="mt-4 text-2xl font-black line-clamp-2">
                          {
                            report.product
                              ?.title
                          }
                        </h2>

                        <div className="mt-4 space-y-2 text-sm">
                          <p className="text-slate-400">
                            Reported By:{" "}
                            <span className="text-white font-semibold">
                              {
                                report
                                  .reportedBy
                                  ?.name
                              }
                            </span>
                          </p>

                          <p className="text-slate-400">
                            Seller:{" "}
                            <span className="text-white font-semibold">
                              {
                                report
                                  .product
                                  ?.seller
                                  ?.name
                              }
                            </span>
                          </p>

                          <p className="text-slate-400">
                            Reason:{" "}
                            <span className="text-white font-semibold">
                              {
                                report.reason
                              }
                            </span>
                          </p>
                        </div>

                        {report.description && (
                          <div className="mt-5 bg-slate-800 rounded-2xl p-4">
                            <p className="text-sm text-slate-300 leading-6">
                              {
                                report.description
                              }
                            </p>
                          </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href={`/product/${report.product?.id}`}

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
                            View Product
                          </a>

                          {!report.resolved && (
                            <button
                              onClick={() =>
                                resolveReport(
                                  report.id
                                )
                              }

                              className="
                                border
                                border-blue-500/30
                                hover:border-blue-500
                                text-blue-400
                                px-5
                                py-3
                                rounded-full
                                font-black
                                text-sm
                              "
                            >
                              Resolve
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteProduct(
                                report
                                  .product
                                  ?.id
                              )
                            }

                            className="
                              border
                              border-red-500/30
                              hover:border-red-500
                              text-red-400
                              px-5
                              py-3
                              rounded-full
                              font-black
                              text-sm
                            "
                          >
                            Remove Product
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>
    </main>
  );
}