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

export default function SchoolVerificationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
            "Unable to load verification requests."
        );
        return;
      }

      setStudents(data.students || []);
    } catch {
      setError(
        "Unable to load verification requests."
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
    action: "APPROVE" | "REJECT"
  ) {
    const confirmation =
      action === "APPROVE"
        ? "Approve this student's School Marketplace verification?"
        : "Reject this student's School Marketplace verification?";

    if (!window.confirm(confirmation)) {
      return;
    }

    setActionLoading(
      `${userId}-${action}`
    );
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

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to update verification."
        );
        return;
      }

      setStudents((current) =>
        current.filter(
          (student) =>
            student.id !== userId
        )
      );
    } catch {
      setError(
        "Unable to update verification."
      );
    } finally {
      setActionLoading("");
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) return students;

    return students.filter(
      (student) =>
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
          .includes(query)
    );
  }, [students, search]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Axyon Admin
              </div>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    School Verification
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Review School Marketplace accounts
                    and verify student identity before
                    granting marketplace access.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={loadStudents}
                    disabled={loading}
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-indigo-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Refreshing..."
                      : "↻ Refresh"}
                  </button>

                  <a
                    href="/admin"
                    className="rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-center text-sm font-black text-slate-300 transition hover:border-indigo-500/50 hover:text-white"
                  >
                    ← Admin Dashboard
                  </a>
                </div>
              </div>

              {/* STATS */}
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                    Pending
                  </p>

                  <p className="mt-1 text-2xl font-black text-amber-300">
                    {students.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400">
                    Visible
                  </p>

                  <p className="mt-1 text-2xl font-black text-indigo-300">
                    {filteredStudents.length}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-slate-800 bg-black/20 p-4 sm:col-span-1">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Review Queue
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-300">
                    Identity + School ID
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className="mt-6 rounded-[1.75rem] border border-indigo-500/20 bg-indigo-500/5 p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-xl">
                🔐
              </div>

              <div>
                <h2 className="font-black">
                  School verification review
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Review the submitted student photo,
                  school ID, school information, and
                  class before approving access.
                </p>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search student, email, school, city, or class..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {search && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="text-xs font-bold text-indigo-400 transition hover:text-indigo-300"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-200">
                {error}
              </p>

              <button
                type="button"
                onClick={loadStudents}
                className="w-fit rounded-full border border-red-400/20 px-4 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/10"
              >
                Try Again
              </button>
            </div>
          )}

          {/* CONTENT */}
          <section className="mt-6">
            {loading ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center shadow-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                  ⏳
                </div>

                <p className="mt-4 font-bold text-slate-400">
                  Loading verification requests...
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center shadow-xl sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl">
                  ✓
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  {search
                    ? "No Matching Requests"
                    : "No Pending Requests"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "No verification requests match your current search."
                    : "All School Marketplace verification requests have been reviewed."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredStudents.map(
                  (student) => {
                    const approveKey = `${student.id}-APPROVE`;
                    const rejectKey = `${student.id}-REJECT`;

                    return (
                      <article
                        key={student.id}
                        className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl"
                      >
                        {/* STUDENT HEADER */}
                        <div className="border-b border-slate-800 bg-slate-950/40 p-5 sm:p-7">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                                🎓
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h2 className="break-words text-xl font-black sm:text-2xl">
                                    {student.name}
                                  </h2>

                                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-amber-400">
                                    Pending
                                  </span>
                                </div>

                                <p className="mt-1 break-all text-sm text-slate-500">
                                  {student.email}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:flex">
                              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                  Class
                                </p>

                                <p className="mt-1 text-lg font-black text-slate-200">
                                  {student.classLevel
                                    ? `Class ${student.classLevel}`
                                    : "N/A"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                  Status
                                </p>

                                <p className="mt-1 text-lg font-black text-amber-400">
                                  PENDING
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DETAILS */}
                        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr]">
                          {/* SCHOOL */}
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-indigo-400">
                              School Information
                            </p>

                            <div className="mt-4 space-y-3">
                              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                  School Name
                                </p>

                                <p className="mt-1 break-words text-sm font-bold text-slate-300">
                                  {student.schoolName ||
                                    "Not provided"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                  City
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-300">
                                  {student.schoolCity ||
                                    "Not provided"}
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

                              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                                <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                  Verification Status
                                </p>

                                <p className="mt-1 text-sm font-bold text-amber-400">
                                  {student.schoolVerificationStatus ||
                                    "PENDING"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* DOCUMENTS */}
                          <div>
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-black uppercase tracking-wider text-indigo-400">
                                Verification Documents
                              </p>

                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Click image to inspect
                              </span>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              {/* PHOTO */}
                              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                                  <p className="text-sm font-black">
                                    Student Photo
                                  </p>

                                  {student.schoolStudentPhotoUrl && (
                                    <span className="text-xs text-emerald-400">
                                      ✓
                                    </span>
                                  )}
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
                                      className="h-64 w-full object-cover transition duration-300 hover:scale-[1.02]"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                                    No photo submitted
                                  </div>
                                )}
                              </div>

                              {/* SCHOOL ID */}
                              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                                  <p className="text-sm font-black">
                                    School ID
                                  </p>

                                  {student.schoolIdImageUrl && (
                                    <span className="text-xs text-emerald-400">
                                      ✓
                                    </span>
                                  )}
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
                                      className="h-64 w-full object-cover transition duration-300 hover:scale-[1.02]"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex h-64 items-center justify-center text-sm text-slate-600">
                                    No school ID submitted
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950/40 p-5 sm:flex-row sm:justify-end sm:p-6">
                          <button
                            type="button"
                            disabled={
                              !!actionLoading
                            }
                            onClick={() =>
                              handleAction(
                                student.id,
                                "REJECT"
                              )
                            }
                            className="rounded-2xl border border-red-500/20 bg-red-500/5 px-7 py-3.5 text-sm font-black text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading ===
                            rejectKey
                              ? "Rejecting..."
                              : "Reject Request"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              !!actionLoading
                            }
                            onClick={() =>
                              handleAction(
                                student.id,
                                "APPROVE"
                              )
                            }
                            className="rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading ===
                            approveKey
                              ? "Approving..."
                              : "✓ Approve Student"}
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}