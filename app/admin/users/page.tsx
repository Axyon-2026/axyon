"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading users...");
  const [accessDenied, setAccessDenied] = useState(false);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
        return;
      }

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

  async function handleUserAction(userId: string, action: string) {
    if (action === "SUSPEND") {
      const confirmed = confirm("Suspend this user?");
      if (!confirmed) return;
    }

    const res = await fetch("/api/admin/users/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, action }),
    });

    const data = await res.json();

    alert(data.message || "Action completed");
    fetchUsers();
  }

  async function handleStudentVerification(userId: string, action: string) {
    const confirmed = confirm(
      action === "APPROVE"
        ? "Approve this student's college ID?"
        : "Reject this student's college ID?"
    );

    if (!confirmed) return;

    const res = await fetch("/api/admin/users/verify-student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, action }),
    });

    const data = await res.json();

    alert(data.message || "Verification updated");
    fetchUsers();
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <section className="flex items-center justify-center py-24 px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-lg">
            <h1 className="text-4xl font-bold text-red-500">
              Access Denied
            </h1>

            <p className="mt-5 text-slate-400">
              You do not have permission to access admin users.
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
            <h1 className="text-4xl font-bold">User Management</h1>

            <p className="mt-3 text-slate-400">
              View, verify, warn, suspend, and monitor platform users.
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

        {!message && users.length === 0 && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold">No Users Found</h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
          {users.map((user) => (
            <div
              key={user.id}
              className={`bg-slate-900 border rounded-2xl p-6 ${
                user.isSuspended ? "border-red-600" : "border-slate-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <p>
                  Role: <span className="font-medium">{user.role}</span>
                </p>

                <p>College: {user.college || "Not added"}</p>

                <p>Phone: {user.phone || "Not added"}</p>

                <p>Email Verified: {user.emailVerified ? "Yes" : "No"}</p>

                <p>
                  Student Verification:{" "}
                  <span
                    className={
                      user.studentVerificationStatus === "APPROVED"
                        ? "text-green-400"
                        : user.studentVerificationStatus === "REJECTED"
                        ? "text-red-400"
                        : user.studentVerificationStatus === "PENDING"
                        ? "text-yellow-400"
                        : "text-slate-400"
                    }
                  >
                    {user.studentVerificationStatus || "NOT_SUBMITTED"}
                  </span>
                </p>

                <p>
                  College ID Number:{" "}
                  {user.collegeIdNumber || "Not submitted"}
                </p>

                <p>
                  Strikes:{" "}
                  <span className="font-medium">{user.strikeCount}</span>
                </p>

                <p>
                  Status:{" "}
                  <span
                    className={
                      user.isSuspended ? "text-red-400" : "text-green-400"
                    }
                  >
                    {user.isSuspended ? "Suspended" : "Active"}
                  </span>
                </p>

                <p>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {user.collegeIdImageUrl && (
                <div className="mt-5">
                  <p className="text-sm text-slate-400 mb-2">
                    College ID Image
                  </p>

                  <img
                    src={user.collegeIdImageUrl}
                    alt="College ID"
                    className="w-full max-h-72 object-cover rounded-xl border border-slate-700"
                  />
                </div>
              )}

              {user.role === "ADMIN" ? (
                <p className="mt-6 text-sm text-purple-400">
                  Admin accounts cannot be modified here.
                </p>
              ) : (
                <>
                  {user.studentVerificationStatus === "PENDING" && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() =>
                          handleStudentVerification(user.id, "APPROVE")
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-xl text-sm font-medium"
                      >
                        Approve ID
                      </button>

                      <button
                        onClick={() =>
                          handleStudentVerification(user.id, "REJECT")
                        }
                        className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-xl text-sm font-medium"
                      >
                        Reject ID
                      </button>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleUserAction(user.id, "WARN")}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded-xl text-sm font-medium"
                    >
                      Warn
                    </button>

                    {user.isSuspended ? (
                      <button
                        onClick={() => handleUserAction(user.id, "UNSUSPEND")}
                        className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-xl text-sm font-medium"
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(user.id, "SUSPEND")}
                        className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-xl text-sm font-medium"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}