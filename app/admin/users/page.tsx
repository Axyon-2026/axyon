"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] =
    useState<any[]>([]);

  const [message, setMessage] =
    useState(
      "Loading users..."
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  async function fetchUsers() {
    try {
      const res =
        await fetch(
          "/api/admin/users"
        );

      const data =
        await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load users"
        );

        return;
      }

      setUsers(data.users || []);

      setMessage("");

    } catch {

      setMessage(
        "Something went wrong"
      );

    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

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
          "Content-Type":
            "application/json",
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

              studentVerificationStatus:
                status,

              studentVerified:
                status === "APPROVED",
            }
          : user
      )
    );

    alert(
      data.message ||
        `Verification ${status.toLowerCase()}`
    );

  } catch {

    alert(
      "Failed to update verification"
    );
  }
}

 async function suspendUser(userId: string) {
  try {

    const res = await fetch(
      "/api/admin/users/action",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
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

    alert(
      "Failed to suspend user"
    );
  }
}
async function unsuspendUser(userId: string) {
  try {
    const res = await fetch(
      "/api/admin/users/action",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
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
    alert(
      "Failed to unsuspend user"
    );
  }
}

  const filteredUsers =
    useMemo(() => {

      return users.filter(
        (user) => {

          const matchesSearch =
            user.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            user.email
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "ALL"
              ? true
              : filter ===
                "VERIFIED"
              ? user.studentVerified
              : filter ===
                "PENDING"
              ? user.studentVerificationStatus ===
                "PENDING"
              : filter ===
                "ADMINS"
              ? user.role ===
                "ADMIN"
              : true;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [
      users,
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-4 py-2 text-xs font-black">
                User Management
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl font-black">
                Admin Users
              </h1>

              <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                Manage student verification, review accounts,
                monitor admins, and moderate suspicious users.
              </p>
            </div>
          </div>

          {/* filters */}

          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <input
                type="text"

                placeholder="Search users..."

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
                          ? "bg-green-600 border-green-600"
                          : "bg-slate-800 border-slate-700 hover:border-green-500"
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
            filteredUsers.length ===
              0 && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-center">
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

          {/* users */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            {filteredUsers.map(
              (user) => (
                <div
                  key={user.id}

                  className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-[2rem]
                    p-6
                    shadow-2xl
                  "
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="
                      w-16
                      h-16
                      rounded-full
                      bg-green-100
                      text-green-700
                      flex
                      items-center
                      justify-center
                      text-2xl
                      font-black
                      shrink-0
                    "
                    >
                      {user.name?.charAt(
                        0
                      ) || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {user.role ===
                          "ADMIN" && (
                          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                            ADMIN
                          </span>
                        )}

                        {user.studentVerified && (
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                            VERIFIED
                          </span>
                        )}

                        {user.studentVerificationStatus ===
                          "PENDING" && (
                          <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                            PENDING
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-2xl font-black break-words">
                        {user.name}
                      </h2>

                      <p className="mt-2 text-slate-400 break-all">
                        {user.email}
                      </p>

                      <div className="mt-5 space-y-2 text-sm">
                        <p className="text-slate-400">
                          College:{" "}
                          <span className="text-white font-semibold">
                            {user.college ||
                              "Not added"}
                          </span>
                        </p>

                        <p className="text-slate-400">
                          Phone:{" "}
                          <span className="text-white font-semibold">
                            {user.phone ||
                              "Not added"}
                          </span>
                        </p>

                        <p className="text-slate-400">
                          Listings:{" "}
                          <span className="text-white font-semibold">
                            {
                              user
                                .products
                                ?.length ||
                                0
                            }
                          </span>
                        </p>
                      </div>
                      {user.studentVerificationStatus === "PENDING" && (
  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

    <div>
      <p className="text-sm font-black text-slate-400 mb-3">
        College ID
      </p>

      {user.collegeIdImageUrl ? (
        <img
          src={user.collegeIdImageUrl}
          alt="College ID"
          className="w-full h-52 object-cover rounded-2xl border border-slate-700"
        />
      ) : (
        <div className="h-52 rounded-2xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-500">
          No ID uploaded
        </div>
      )}
    </div>

    <div>
      <p className="text-sm font-black text-slate-400 mb-3">
        Selfie Verification
      </p>

      {user.selfieImageUrl ? (
        <img
          src={user.selfieImageUrl}
          alt="Selfie"
          className="w-full h-52 object-cover rounded-2xl border border-slate-700"
        />
      ) : (
        <div className="h-52 rounded-2xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-500">
          No selfie uploaded
        </div>
      )}
    </div>

  </div>
)}
                      {user.studentVerificationStatus ===
                        "PENDING" && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              updateVerification(
                                user.id,
                                "APPROVED"
                              )
                            }

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
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              updateVerification(
                                user.id,
                                "REJECTED"
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
                            Reject
                          </button>
                        </div>
                      )}

                     {user.role !== "ADMIN" && (
  <div className="mt-5">
    <button
      onClick={() =>
        user.isSuspended
          ? unsuspendUser(user.id)
          : suspendUser(user.id)
      }
      className={`
        border
        px-5
        py-3
        rounded-full
        font-black
        text-sm
        transition-all

        ${
          user.isSuspended
            ? "border-green-500/30 hover:border-green-500 text-green-400"
            : "border-orange-500/30 hover:border-orange-500 text-orange-400"
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
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}