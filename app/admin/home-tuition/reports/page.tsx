"use client";

import { useEffect, useMemo, useState } from "react";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    marketplaceType: string;
    isSuspended: boolean;
  } | null;
  tutor: {
    id: string;
    displayName: string;
    photoUrl: string | null;
    institution: string | null;
    college: string | null;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      isSuspended: boolean;
    };
  } | null;
  review: {
    id: string;
    rating: number;
    comment: string;
    isPublished: boolean;
    isRemoved: boolean;
    createdAt: string;
    tutorProfile: {
      id: string;
      displayName: string;
    };
    reviewer: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
};

type Counts = Record<string, number>;

const STATUS_OPTIONS = [
  "ALL",
  "OPEN",
  "RESOLVED",
  "DISMISSED",
  "WITHDRAWN",
];

export default function HomeTuitionReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [status, setStatus] = useState("ALL");
  const [targetType, setTargetType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Report | null>(null);
  const [error, setError] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (targetType !== "ALL") {
        params.set("targetType", targetType);
      }

      const response = await fetch(
        `/api/home-tuition/admin/reports?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load reports");
      }

      setReports(data.reports || []);
      setCounts(data.counts || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [status, targetType]);

  async function updateStatus(id: string, nextStatus: string) {
    try {
      setActionId(id);
      setError("");

      const response = await fetch(`/api/home-tuition/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update report");
      }

      setSelected((current) =>
        current?.id === id
          ? {
              ...current,
              ...data.report,
            }
          : current
      );

      await loadReports();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update report"
      );
    } finally {
      setActionId(null);
    }
  }

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return reports;

    return reports.filter((report) => {
      const haystack = [
        report.id,
        report.reason,
        report.details || "",
        report.targetType,
        report.tutor?.displayName || "",
        report.tutor?.user.name || "",
        report.tutor?.user.email || "",
        report.review?.comment || "",
        report.review?.tutorProfile.displayName || "",
        report.review?.reviewer.name || "",
        report.review?.reviewer.email || "",
        report.reporter?.name || "",
        report.reporter?.email || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [reports, search]);

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Axyon Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Home Tuition Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review tutor and review reports and manage their resolution.
            </p>
          </div>

          <a
            href="/admin/home-tuition"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Home Tuition
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Open" value={counts.OPEN || 0} active={status === "OPEN"} />
          <StatCard
            label="Resolved"
            value={counts.RESOLVED || 0}
            active={status === "RESOLVED"}
          />
          <StatCard
            label="Dismissed"
            value={counts.DISMISSED || 0}
            active={status === "DISMISSED"}
          />
          <StatCard
            label="Withdrawn"
            value={counts.WITHDRAWN || 0}
            active={status === "WITHDRAWN"}
          />
          <StatCard label="Loaded" value={reports.length} />
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports, tutors, reviewers, reasons..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    Status: {item}
                  </option>
                ))}
              </select>

              <select
                value={targetType}
                onChange={(event) => setTargetType(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400"
              >
                <option value="ALL">All targets</option>
                <option value="TUTOR">Tutor</option>
                <option value="TUTOR_REVIEW">Tutor review</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="text-4xl">✓</div>
              <h2 className="mt-4 text-lg font-bold">No reports found</h2>
              <p className="mt-1 text-sm text-slate-500">
                No reports match the current filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  actionId={actionId}
                  onOpen={() => setSelected(report)}
                  onUpdate={updateStatus}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <ReportModal
          report={selected}
          actionId={actionId}
          onClose={() => setSelected(null)}
          onUpdate={updateStatus}
        />
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  active = false,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border bg-white p-5 shadow-sm ${
        active ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"
      }`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function ReportCard({
  report,
  actionId,
  onOpen,
  onUpdate,
}: {
  report: Report;
  actionId: string | null;
  onOpen: () => void;
  onUpdate: (id: string, status: string) => void;
}) {
  const subject =
    report.targetType === "TUTOR"
      ? report.tutor?.displayName || "Tutor profile unavailable"
      : report.review?.tutorProfile.displayName || "Tutor review";

  const reporter = report.reporter?.name || "Unknown reporter";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {report.targetType === "TUTOR" ? "Tutor" : "Tutor Review"}
            </span>
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">{subject}</h2>

          <p className="mt-2 text-sm font-semibold text-red-600">
            {report.reason}
          </p>

          {report.details && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {report.details}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>Reporter: {reporter}</span>
            <span>
              {new Date(report.createdAt).toLocaleString("en-IN")}
            </span>
            <span className="font-mono">#{report.id.slice(-8)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">
          <button
            onClick={onOpen}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Inspect
          </button>

          {report.status === "OPEN" && (
            <>
              <button
                disabled={actionId === report.id}
                onClick={() => onUpdate(report.id, "RESOLVED")}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                Resolve
              </button>

              <button
                disabled={actionId === report.id}
                onClick={() => onUpdate(report.id, "DISMISSED")}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "OPEN"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "RESOLVED"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status === "DISMISSED"
          ? "bg-slate-100 text-slate-700 border-slate-200"
          : "bg-violet-50 text-violet-700 border-violet-200";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${classes}`}
    >
      {status}
    </span>
  );
}

function ReportModal({
  report,
  actionId,
  onClose,
  onUpdate,
}: {
  report: Report;
  actionId: string | null;
  onClose: () => void;
  onUpdate: (id: string, status: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Report inspection
            </p>
            <h2 className="mt-1 text-xl font-bold">Report details</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-xl text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {report.targetType}
            </span>
          </div>

          <InfoBlock title="Report">
            <p className="font-semibold text-red-600">{report.reason}</p>
            {report.details && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {report.details}
              </p>
            )}
          </InfoBlock>

          <InfoBlock title="Reporter">
            {report.reporter ? (
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <Detail label="Name" value={report.reporter.name} />
                <Detail label="Email" value={report.reporter.email} />
                <Detail
                  label="Marketplace"
                  value={report.reporter.marketplaceType}
                />
                <Detail
                  label="Account status"
                  value={report.reporter.isSuspended ? "Suspended" : "Active"}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Reporter unavailable.</p>
            )}
          </InfoBlock>

          {report.tutor && (
            <InfoBlock title="Reported tutor">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <Detail label="Display name" value={report.tutor.displayName} />
                <Detail label="Account name" value={report.tutor.user.name} />
                <Detail label="Email" value={report.tutor.user.email} />
                <Detail label="Profile status" value={report.tutor.status} />
                <Detail
                  label="Account status"
                  value={
                    report.tutor.user.isSuspended ? "Suspended" : "Active"
                  }
                />
                <Detail
                  label="Institution"
                  value={
                    report.tutor.institution ||
                    report.tutor.college ||
                    "Not provided"
                  }
                />
              </div>
            </InfoBlock>
          )}

          {report.review && (
            <InfoBlock title="Reported review">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {report.review.tutorProfile.displayName}
                  </p>
                  <span className="font-bold">
                    {"★".repeat(Math.max(0, Math.min(5, report.review.rating)))}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {report.review.comment}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span>Reviewer: {report.review.reviewer.name}</span>
                  <span>{report.review.reviewer.email}</span>
                  <span>
                    {report.review.isRemoved ? "Removed" : "Not removed"}
                  </span>
                  <span>
                    {report.review.isPublished ? "Published" : "Unpublished"}
                  </span>
                </div>
              </div>
            </InfoBlock>
          )}

          <div className="border-t border-slate-200 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {report.status === "OPEN" && (
                <>
                  <button
                    disabled={actionId === report.id}
                    onClick={() => onUpdate(report.id, "RESOLVED")}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>

                  <button
                    disabled={actionId === report.id}
                    onClick={() => onUpdate(report.id, "DISMISSED")}
                    className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-50"
                  >
                    Dismiss Report
                  </button>
                </>
              )}

              {report.status !== "OPEN" && (
                <button
                  disabled={actionId === report.id}
                  onClick={() => onUpdate(report.id, "OPEN")}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                >
                  Reopen Report
                </button>
              )}

              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      <div className="rounded-2xl border border-slate-200 p-4">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}