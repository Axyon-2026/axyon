"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Sending reset link...");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message || "Something went wrong");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>

          <p className="text-slate-400 mb-6">
            Enter your email and we’ll send you a password reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium">
              Send Reset Link
            </button>
          </form>

          {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}
        </div>
      </section>
    </main>
  );
}