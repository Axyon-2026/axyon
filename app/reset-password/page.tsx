"use client";

import Navbar from "@/components/Navbar";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setMessage("Reset token is missing.");
      return;
    }

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setMessage("Resetting password...");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Failed to reset password");
      return;
    }

    setMessage("Password reset successful. You can now login.");
  }

  return (
    <section className="flex items-center justify-center py-24 px-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold">Reset Password</h1>

        <p className="mt-3 text-slate-400">
          Enter your new password below.
        </p>

        <form onSubmit={handleReset} className="mt-8 space-y-5">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
          />

          <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium">
            Reset Password
          </button>
        </form>

        {message && (
          <p className="mt-5 text-sm text-slate-300">{message}</p>
        )}

        {message.includes("successful") && (
          <a
            href="/login"
            className="inline-block mt-5 text-blue-400 hover:underline"
          >
            Go to Login
          </a>
        )}
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Suspense
        fallback={
          <section className="px-8 py-24 text-center text-slate-400">
            Loading reset form...
          </section>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}