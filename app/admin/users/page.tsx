"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading users...");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [viewer, setViewer] = useState<{
    url: string;
    title: string;
  } | null>(null);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load users");
        return;
      }

      setUsers(data.users || []);
      setMessage("");
    } catch {
      setMessage("Something went wrong");
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

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [viewer]);

  async function updateVerification(
    userId: string,
    status: string
  ) {
    try {
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
            "Failed to update verification"
        );
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                studentVerificationStatus: status,
                studentVerified:
                  status === "APPROVED",
              }
            : user
        )
      );

      setViewer(null);

      alert(
        data.message ||
          `Verification ${status.toLowerCase()}`
      );
    } catch {
      alert("Failed to update verification");
    }
  }

  async function suspendUser(userId: string) {
    try {
      const res = await fetch(
        "/api/admin/users/action",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId,
            action: "SUSPEND",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to suspend user"
        );
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                isSuspended: true,
              }
            : user
        )
      );

      alert(
        data.message ||
          "User suspended successfully"
      );
    } catch {
      alert("Failed to suspend user");
    }
  }

  async function unsuspendUser(userId: string) {
    try {
      const res = await fetch(
        "/api/admin/users/action",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId,
            action: "UNSUSPEND",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to unsuspend user"
        );
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                isSuspended: false,
              }
            : user
        )
      );

      alert(
        data.message ||
          "User unsuspended successfully"
      );
    } catch {
      alert("Failed to unsuspend user");
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name
          ?.toLowerCase()
          .includes(query) ||
        user.email
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "VERIFIED"
            ? user.studentVerified
            : filter === "PENDING"
              ? user.studentVerificationStatus ===
                "PENDING"
              : filter === "ADMINS"
                ? user.role === "ADMIN"
                : true;

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <section className="px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* HERO */}

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-black text-green-400">
                User Management
              </span>

              <h1 className="mt-6 text-4xl font-black sm:text-5xl">
                Admin Users
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                Manage student verification, review accounts,
                monitor admins, and moderate suspicious users.
              </p>
            </div>
          </div>

          {/* FILTERS */}

          <div className="mt-8 rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-800
                  px-5
                  py-4
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  focus:border-green-500
                "
              />

              <div className="flex flex-wrap gap-3">
                {[
                  "ALL",
                  "VERIFIED",
                  "PENDING",
                  "ADMINS",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`
                      rounded-full
                      border
                      px-5
                      py-3
                      text-sm
                      font-black
                      transition
                      ${
                        filter === item
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-slate-700 bg-slate-800 text-white hover:border-green-500"
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
            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="font-semibold text-slate-400">
                {message}
              </p>
            </div>
          )}

          {!message &&
            filteredUsers.length === 0 && (
              <div className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center">
                <div className="text-6xl">
                  👥
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  No Users Found
                </h2>

                <p className="mt-3 text-slate-400">
                  No users match the selected filters.
                </p>
              </div>
            )}

          {/* USERS */}

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="
                  rounded-[2rem]
                  border
                  border-slate-800
                  bg-slate-900
                  p-6
                  shadow-2xl
                "
              >
                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-green-100
                      text-2xl
                      font-black
                      text-green-700
                    "
                  >
                    {user.name?.charAt(0) || "U"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      {user.role === "ADMIN" && (
                        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black text-purple-400">
                          ADMIN
                        </span>
                      )}

                      {user.studentVerified && (
                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-black text-green-400">
                          VERIFIED
                        </span>
                      )}

                      {user.studentVerificationStatus ===
                        "PENDING" && (
                        <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-black text-yellow-400">
                          PENDING
                        </span>
                      )}

                      {user.isSuspended && (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black text-red-400">
                          SUSPENDED
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 break-words text-2xl font-black">
                      {user.name}
                    </h2>

                    <p className="mt-2 break-all text-slate-400">
                      {user.email}
                    </p>

                    <div className="mt-5 space-y-2 text-sm">
                      <p className="text-slate-400">
                        College:{" "}
                        <span className="font-semibold text-white">
                          {user.college || "Not added"}
                        </span>
                      </p>

                      <p className="text-slate-400">
                        Phone:{" "}
                        <span className="font-semibold text-white">
                          {user.phone || "Not added"}
                        </span>
                      </p>

                      <p className="text-slate-400">
                        Listings:{" "}
                        <span className="font-semibold text-white">
                          {user.products?.length || 0}
                        </span>
                      </p>
                    </div>

                    {/* VERIFICATION IMAGES */}

                    {user.studentVerificationStatus ===
                      "PENDING" && (
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* ID */}

                        <div>
                          <p className="mb-3 text-sm font-black text-slate-300">
                            College ID
                          </p>

                          {user.collegeIdImageUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setViewer({
                                  url: user.collegeIdImageUrl,
                                  title: `${user.name} — College ID`,
                                })
                              }
                              className="
                                group
                                relative
                                block
                                h-56
                                w-full
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-700
                                bg-slate-950
                                transition
                                hover:border-green-500
                              "
                            >
                              <img
                                src={user.collegeIdImageUrl}
                                alt={`${user.name} College ID`}
                                className="
                                  h-full
                                  w-full
                                  object-contain
                                  p-2
                                "
                              />

                              <div
                                className="
                                  absolute
                                  inset-x-0
                                  bottom-0
                                  bg-black/70
                                  px-3
                                  py-2
                                  text-center
                                  text-xs
                                  font-black
                                  text-white
                                  backdrop-blur-sm
                                  transition
                                  group-hover:bg-green-600/90
                                "
                              >
                                🔍 View Full ID
                              </div>
                            </button>
                          ) : (
                            <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 text-center text-slate-500">
                              No ID uploaded
                            </div>
                          )}
                        </div>

                        {/* SELFIE */}

                        <div>
                          <p className="mb-3 text-sm font-black text-slate-300">
                            Selfie Verification
                          </p>

                          {user.selfieImageUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setViewer({
                                  url: user.selfieImageUrl,
                                  title: `${user.name} — Verification Selfie`,
                                })
                              }
                              className="
                                group
                                relative
                                block
                                h-56
                                w-full
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-700
                                bg-slate-950
                                transition
                                hover:border-green-500
                              "
                            >
                              <img
                                src={user.selfieImageUrl}
                                alt={`${user.name} verification selfie`}
                                className="
                                  h-full
                                  w-full
                                  object-contain
                                  p-2
                                "
                              />

                              <div
                                className="
                                  absolute
                                  inset-x-0
                                  bottom-0
                                  bg-black/70
                                  px-3
                                  py-2
                                  text-center
                                  text-xs
                                  font-black
                                  text-white
                                  backdrop-blur-sm
                                  transition
                                  group-hover:bg-green-600/90
                                "
                              >
                                🔍 View Full Selfie
                              </div>
                            </button>
                          ) : (
                            <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 text-center text-slate-500">
                              No selfie uploaded
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* VERIFICATION ACTIONS */}

                    {user.studentVerificationStatus ===
                      "PENDING" && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateVerification(
                              user.id,
                              "APPROVED"
                            )
                          }
                          className="
                            rounded-full
                            bg-green-600
                            px-5
                            py-3
                            text-sm
                            font-black
                            text-white
                            transition
                            hover:bg-green-700
                          "
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateVerification(
                              user.id,
                              "REJECTED"
                            )
                          }
                          className="
                            rounded-full
                            border
                            border-red-500/30
                            px-5
                            py-3
                            text-sm
                            font-black
                            text-red-400
                            transition
                            hover:border-red-500
                            hover:bg-red-500/10
                          "
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* SUSPEND */}

                    {user.role !== "ADMIN" && (
                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() =>
                            user.isSuspended
                              ? unsuspendUser(user.id)
                              : suspendUser(user.id)
                          }
                          className={`
                            rounded-full
                            border
                            px-5
                            py-3
                            text-sm
                            font-black
                            transition-all
                            ${
                              user.isSuspended
                                ? "border-green-500/30 text-green-400 hover:border-green-500 hover:bg-green-500/10"
                                : "border-orange-500/30 text-orange-400 hover:border-orange-500 hover:bg-orange-500/10"
                            }
                          `}
                        >
                          {user.isSuspended
                            ? "Unsuspend User"
                            : "Suspend User"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL SCREEN IMAGE VIEWER */}

      {viewer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={viewer.title}
          onClick={() => setViewer(null)}
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/90
            p-3
            backdrop-blur-md
            sm:p-6
          "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              flex
              max-h-[95dvh]
              w-full
              max-w-6xl
              flex-col
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-slate-950
              shadow-2xl
            "
          >
            <div className="flex shrink-0 items-center gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wider text-green-400">
                  Verification Document
                </p>

                <h2 className="mt-1 truncate text-lg font-black text-white sm:text-xl">
                  {viewer.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewer(null)}
                aria-label="Close image"
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-xl
                  font-black
                  text-white
                  transition
                  hover:bg-white/20
                "
              >
                ✕
              </button>
            </div>

            <div
              className="
                min-h-0
                flex-1
                overflow-auto
                bg-black
                p-2
                sm:p-4
              "
            >
              <img
                src={viewer.url}
                alt={viewer.title}
                className="
                  mx-auto
                  block
                  max-h-[calc(95dvh-100px)]
                  max-w-full
                  object-contain
                "
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}