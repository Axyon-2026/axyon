"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  role?: string;
  studentVerified?: boolean;
  studentVerificationStatus?: string;
  isSuspended?: boolean;
  collegeIdImageUrl?: string;
  selfieImageUrl?: string;
  products?: unknown[];
};

type Viewer = {
  url: string;
  title: string;
};

const FILTERS = [
  "ALL",
  "VERIFIED",
  "PENDING",
  "ADMINS",
] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("Loading users...");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [actionUserId, setActionUserId] =
    useState<string | null>(null);

  async function fetchUsers() {
    try {
      setMessage("Loading users...");

      const res = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message || "Failed to load users."
        );
        return;
      }

      setUsers(data.users || []);
      setMessage("");
    } catch {
      setMessage(
        "Something went wrong while loading users."
      );
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!viewer) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setViewer(null);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [viewer]);

  async function updateVerification(
    userId: string,
    status: "APPROVED" | "REJECTED"
  ) {
    try {
      setActionUserId(userId);

      const action =
        status === "APPROVED"
          ? "APPROVE"
          : "REJECT";

      const res = await fetch(
        "/api/admin/users/verify-student",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            action,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to update verification."
        );
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                studentVerificationStatus:
                  status,
                studentVerified:
                  status === "APPROVED",
              }
            : user
        )
      );

      setViewer(null);

      alert(
        data.message ||
          `Verification ${status.toLowerCase()}.`
      );
    } catch {
      alert("Failed to update verification.");
    } finally {
      setActionUserId(null);
    }
  }

  async function updateSuspension(
    userId: string,
    suspended: boolean
  ) {
    const action = suspended
      ? "SUSPEND"
      : "UNSUSPEND";

    const confirmed = confirm(
      suspended
        ? "Suspend this user account?"
        : "Remove the suspension from this user?"
    );

    if (!confirmed) return;

    try {
      setActionUserId(userId);

      const res = await fetch(
        "/api/admin/users/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            action,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            `Failed to ${
              suspended ? "suspend" : "unsuspend"
            } user.`
        );
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                isSuspended: suspended,
              }
            : user
        )
      );

      alert(
        data.message ||
          `User ${
            suspended
              ? "suspended"
              : "unsuspended"
          } successfully.`
      );
    } catch {
      alert(
        `Failed to ${
          suspended ? "suspend" : "unsuspend"
        } user.`
      );
    } finally {
      setActionUserId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name
          ?.toLowerCase()
          .includes(query) ||
        user.email
          ?.toLowerCase()
          .includes(query) ||
        user.college
          ?.toLowerCase()
          .includes(query) ||
        user.phone
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "VERIFIED"
            ? !!user.studentVerified
            : filter === "PENDING"
              ? user.studentVerificationStatus ===
                "PENDING"
              : filter === "ADMINS"
                ? user.role === "ADMIN"
                : true;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    users,
    search,
    filter,
  ]);

  const totalUsers = users.length;

  const verifiedUsers = users.filter(
    (user) => user.studentVerified
  ).length;

  const pendingUsers = users.filter(
    (user) =>
      user.studentVerificationStatus ===
      "PENDING"
  ).length;

  const suspendedUsers = users.filter(
    (user) => user.isSuspended
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

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
                User Management
              </div>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Users
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Review student accounts, verify
                    identities, monitor suspicious
                    activity, and manage account
                    access.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchUsers}
                  className="w-full rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-emerald-500/50 hover:text-white sm:w-auto"
                >
                  ↻ Refresh Users
                </button>
              </div>

              {/* STATS */}
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {totalUsers}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Verified
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-300">
                    {verifiedUsers}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Pending
                  </p>
                  <p className="mt-1 text-2xl font-black text-amber-300">
                    {pendingUsers}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-400">
                    Suspended
                  </p>
                  <p className="mt-1 text-2xl font-black text-red-300">
                    {suspendedUsers}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-4 shadow-xl sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Search name, email, college or phone..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition ${
                      filter === item
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-700 bg-slate-950 text-slate-400 hover:border-emerald-500/50 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LOADING / ERROR */}
          {message && (
            <div className="mt-6 rounded-[1.75rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                {message === "Loading users..."
                  ? "⏳"
                  : "⚠️"}
              </div>

              <p className="mt-4 font-semibold text-slate-400">
                {message}
              </p>

              {message !== "Loading users..." && (
                <button
                  type="button"
                  onClick={fetchUsers}
                  className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          {/* EMPTY */}
          {!message &&
            filteredUsers.length === 0 && (
              <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center shadow-xl sm:p-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                  👥
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  No Users Found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No users match the current
                  search or filter.
                </p>
              </div>
            )}

          {/* USERS */}
          {!message &&
            filteredUsers.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredUsers.map((user) => {
                  const isActioning =
                    actionUserId === user.id;

                  const initials =
                    user.name
                      ?.trim()
                      .charAt(0)
                      .toUpperCase() || "U";

                  return (
                    <article
                      key={user.id}
                      className="rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-slate-700 sm:p-6"
                    >
                      {/* USER HEADER */}
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl font-black text-emerald-400">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                            {user.role === "ADMIN" && (
                              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-purple-400">
                                Admin
                              </span>
                            )}

                            {user.studentVerified && (
                              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                                Verified
                              </span>
                            )}

                            {user.studentVerificationStatus ===
                              "PENDING" && (
                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-400">
                                Pending
                              </span>
                            )}

                            {user.isSuspended && (
                              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-red-400">
                                Suspended
                              </span>
                            )}
                          </div>

                          <h2 className="mt-3 break-words text-xl font-black sm:text-2xl">
                            {user.name ||
                              "Unnamed User"}
                          </h2>

                          <p className="mt-1 break-all text-sm text-slate-500">
                            {user.email ||
                              "No email"}
                          </p>
                        </div>
                      </div>

                      {/* ACCOUNT DETAILS */}
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            College
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-slate-300">
                            {user.college ||
                              "Not added"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            Phone
                          </p>

                          <p className="mt-1 truncate text-sm font-bold text-slate-300">
                            {user.phone ||
                              "Not added"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            Listings
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-300">
                            {user.products?.length ||
                              0}
                          </p>
                        </div>
                      </div>

                      {/* VERIFICATION */}
                      {user.studentVerificationStatus ===
                        "PENDING" && (
                        <div className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                              Verification Review
                            </p>

                            <p className="text-xs leading-5 text-slate-500">
                              Review the submitted identity
                              documents before approving
                              this student.
                            </p>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* ID */}
                            {user.collegeIdImageUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewer({
                                    url: user.collegeIdImageUrl!,
                                    title: `${user.name || "User"} — College ID`,
                                  })
                                }
                                className="group relative h-48 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 transition hover:border-emerald-500"
                              >
                                <img
                                  src={
                                    user.collegeIdImageUrl
                                  }
                                  alt={`${user.name || "User"} College ID`}
                                  className="h-full w-full object-contain p-2"
                                />

                                <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2 text-center text-xs font-black text-white backdrop-blur-sm transition group-hover:bg-emerald-600/90">
                                  🔍 View College ID
                                </div>
                              </button>
                            ) : (
                              <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 px-4 text-center text-xs text-slate-600">
                                No college ID uploaded
                              </div>
                            )}

                            {/* SELFIE */}
                            {user.selfieImageUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewer({
                                    url: user.selfieImageUrl!,
                                    title: `${user.name || "User"} — Verification Selfie`,
                                  })
                                }
                                className="group relative h-48 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 transition hover:border-emerald-500"
                              >
                                <img
                                  src={
                                    user.selfieImageUrl
                                  }
                                  alt={`${user.name || "User"} verification selfie`}
                                  className="h-full w-full object-contain p-2"
                                />

                                <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2 text-center text-xs font-black text-white backdrop-blur-sm transition group-hover:bg-emerald-600/90">
                                  🔍 View Selfie
                                </div>
                              </button>
                            ) : (
                              <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 px-4 text-center text-xs text-slate-600">
                                No selfie uploaded
                              </div>
                            )}
                          </div>

                          {/* VERIFICATION ACTIONS */}
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() =>
                                updateVerification(
                                  user.id,
                                  "APPROVED"
                                )
                              }
                              className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isActioning
                                ? "Updating..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() =>
                                updateVerification(
                                  user.id,
                                  "REJECTED"
                                )
                              }
                              className="rounded-full border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-black text-red-400 transition hover:border-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACCOUNT ACTION */}
                      {user.role !== "ADMIN" && (
                        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                          <div>
                            <p className="text-sm font-black text-slate-300">
                              Account Access
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {user.isSuspended
                                ? "This account is currently suspended."
                                : "This account currently has access."}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() =>
                              updateSuspension(
                                user.id,
                                !user.isSuspended
                              )
                            }
                            className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.isSuspended
                                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500"
                                : "border-orange-500/30 bg-orange-500/5 text-orange-400 hover:border-orange-500"
                            }`}
                          >
                            {isActioning
                              ? "..."
                              : user.isSuspended
                                ? "Unsuspend"
                                : "Suspend"}
                          </button>
                        </div>
                      )}

                      {user.role === "ADMIN" && (
                        <div className="mt-5 rounded-2xl border border-purple-500/10 bg-purple-500/[0.03] p-4">
                          <p className="text-xs font-black uppercase tracking-wider text-purple-400">
                            Administrator Account
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-600">
                            Administrator accounts cannot be
                            suspended from this user moderation
                            panel.
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
        </div>
      </section>

      {/* DOCUMENT VIEWER */}
      {viewer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={viewer.title}
          onClick={() => setViewer(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6"
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="flex max-h-[95dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
          >
            <div className="flex shrink-0 items-center gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Verification Document
                </p>

                <h2 className="mt-1 truncate text-lg font-black text-white sm:text-xl">
                  {viewer.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewer(null)
                }
                aria-label="Close document"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl font-black text-white transition hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-black p-2 sm:p-4">
              <img
                src={viewer.url}
                alt={viewer.title}
                className="mx-auto block max-h-[calc(95dvh-100px)] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}