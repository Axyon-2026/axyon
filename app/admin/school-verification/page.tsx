"use client";

import { useEffect, useMemo, useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
  schoolName: string | null;
  schoolCity: string | null;
  classLevel: string | null;
  schoolStudentPhotoUrl: string | null;
  schoolIdImageUrl: string | null;
  schoolVerificationStatus: string;
  schoolVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
};

const EMPTY_STATS: Stats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  suspended: 0,
};

export default function SchoolVerificationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/school-verification",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to load School Marketplace users."
        );
        return;
      }

      setStudents(data.students || []);
      setStats(data.stats || EMPTY_STATS);
    } catch {
      setError(
        "Unable to load School Marketplace users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleAction(
    userId: string,
    action:
      | "APPROVE"
      | "REJECT"
      | "SUSPEND"
      | "UNSUSPEND"
  ) {
    const messages = {
      APPROVE:
        "Approve this student's School Marketplace verification?",
      REJECT:
        "Reject this student's School Marketplace verification?",
      SUSPEND:
        "Suspend this School Marketplace account?",
      UNSUSPEND:
        "Unsuspend this School Marketplace account?",
    };

    if (!window.confirm(messages[action])) {
      return;
    }

    const key = `${userId}-${action}`;

    setActionLoading(key);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/school-verification",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userId,
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update School Marketplace user."
        );
        return;
      }

      await loadStudents();
    } catch {
      setError(
        "Unable to update School Marketplace user."
      );
    } finally {
      setActionLoading("");
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name
          ?.toLowerCase()
          .includes(query) ||
        student.email
          ?.toLowerCase()
          .includes(query) ||
        student.schoolName
          ?.toLowerCase()
          .includes(query) ||
        student.schoolCity
          ?.toLowerCase()
          .includes(query) ||
        student.classLevel
          ?.toLowerCase()
          .includes(query);

      const status =
        student.isSuspended
          ? "SUSPENDED"
          : student.schoolVerificationStatus;

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      <section className="w-full px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-indigo-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  Axyon Admin
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  School Marketplace
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Manage School Marketplace students,
                  verification status and account access.
                </p>
              </div>

              <button
                type="button"
                onClick={loadStudents}
                disabled={loading}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-indigo-500/50 hover:text-white disabled:opacity-50 sm:w-auto"
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["Total", stats.total, "text-white"],
              ["Pending", stats.pending, "text-amber-400"],
              ["Verified", stats.approved, "text-emerald-400"],
              ["Rejected", stats.rejected, "text-red-400"],
              ["Suspended", stats.suspended, "text-orange-400"],
            ].map(([label, value, textColor]) => (
              <div
                key={String(label)}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {label}
                </p>

                <p
                  className={`mt-2 text-3xl font-black ${textColor}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search student, email, school, city or class..."
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/60"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-sm font-bold text-white outline-none focus:border-indigo-500/60"
              >
                <option value="ALL">
                  All Students
                </option>
                <option value="PENDING">
                  Pending
                </option>
                <option value="APPROVED">
                  Verified
                </option>
                <option value="REJECTED">
                  Rejected
                </option>
                <option value="SUSPENDED">
                  Suspended
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
                <p className="font-bold text-slate-400">
                  Loading School Marketplace users...
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center sm:p-14">
                <h2 className="text-2xl font-black">
                  No students found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search or status filter.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredStudents.map((student) => {
                  const status = student.isSuspended
                    ? "SUSPENDED"
                    : student.schoolVerificationStatus;

                  return (
                    <article
                      key={student.id}
                      className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl"
                    >
                      <div className="border-b border-slate-800 bg-slate-950/40 p-5 sm:p-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="break-words text-xl font-black sm:text-2xl">
                                {student.name}
                              </h2>

                              <span
                                className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                                  status === "APPROVED"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : status === "REJECTED"
                                      ? "bg-red-500/10 text-red-400"
                                      : status === "SUSPENDED"
                                        ? "bg-orange-500/10 text-orange-400"
                                        : "bg-amber-500/10 text-amber-400"
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            <p className="mt-1 break-all text-sm text-slate-500">
                              {student.email}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Class
                              </p>

                              <p className="mt-1 text-lg font-black text-slate-200">
                                {student.classLevel
                                  ? `Class ${student.classLevel}`
                                  : "N/A"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                School
                              </p>

                              <p className="mt-1 max-w-40 truncate text-sm font-black text-slate-200">
                                {student.schoolName ||
                                  "N/A"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                City
                              </p>

                              <p className="mt-1 text-sm font-black text-slate-200">
                                {student.schoolCity ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-indigo-400">
                            Account Information
                          </p>

                          <div className="mt-4 space-y-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Verification
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-300">
                                {student.schoolVerificationStatus}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Verified
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-300">
                                {student.schoolVerified
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Submitted
                              </p>

                              <p className="mt-1 text-sm font-bold leading-6 text-slate-300">
                                {new Date(
                                  student.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-indigo-400">
                            Verification Documents
                          </p>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                              <div className="border-b border-slate-800 px-4 py-3">
                                <p className="text-sm font-black">
                                  Student Photo
                                </p>
                              </div>

                              {student.schoolStudentPhotoUrl ? (
                                <a
                                  href={
                                    student.schoolStudentPhotoUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block bg-black"
                                >
                                  <img
                                    src={
                                      student.schoolStudentPhotoUrl
                                    }
                                    alt="Student verification"
                                    className="h-64 w-full object-cover"
                                  />
                                </a>
                              ) : (
                                <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                                  No photo
                                </div>
                              )}
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                              <div className="border-b border-slate-800 px-4 py-3">
                                <p className="text-sm font-black">
                                  School ID
                                </p>
                              </div>

                              {student.schoolIdImageUrl ? (
                                <a
                                  href={
                                    student.schoolIdImageUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block bg-black"
                                >
                                  <img
                                    src={
                                      student.schoolIdImageUrl
                                    }
                                    alt="School ID verification"
                                    className="h-64 w-full object-cover"
                                  />
                                </a>
                              ) : (
                                <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                                  No school ID
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950/40 p-5 sm:flex-row sm:justify-end sm:p-6">
                        {status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={!!actionLoading}
                              onClick={() =>
                                handleAction(
                                  student.id,
                                  "REJECT"
                                )
                              }
                              className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-3.5 text-sm font-black text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {actionLoading ===
                              `${student.id}-REJECT`
                                ? "Rejecting..."
                                : "Reject"}
                            </button>

                            <button
                              type="button"
                              disabled={!!actionLoading}
                              onClick={() =>
                                handleAction(
                                  student.id,
                                  "APPROVE"
                                )
                              }
                              className="rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                            >
                              {actionLoading ===
                              `${student.id}-APPROVE`
                                ? "Approving..."
                                : "Approve"}
                            </button>
                          </>
                        )}

                        {status !== "SUSPENDED" ? (
                          <button
                            type="button"
                            disabled={!!actionLoading}
                            onClick={() =>
                              handleAction(
                                student.id,
                                "SUSPEND"
                              )
                            }
                            className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-6 py-3.5 text-sm font-black text-orange-400 hover:bg-orange-500/10 disabled:opacity-50"
                          >
                            {actionLoading ===
                            `${student.id}-SUSPEND`
                              ? "Suspending..."
                              : "Suspend"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!!actionLoading}
                            onClick={() =>
                              handleAction(
                                student.id,
                                "UNSUSPEND"
                              )
                            }
                            className="rounded-2xl bg-blue-500 px-6 py-3.5 text-sm font-black text-white hover:bg-blue-400 disabled:opacity-50"
                          >
                            {actionLoading ===
                            `${student.id}-UNSUSPEND`
                              ? "Unsuspending..."
                              : "Unsuspend"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}