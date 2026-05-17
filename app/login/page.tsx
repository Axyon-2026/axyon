"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setMessage("Logging in...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      setMessage("Login successful!");

      if (data.user?.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/marketplace";
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="min-h-[calc(100vh-90px)] px-4 sm:px-6 lg:px-10 py-10 flex items-center">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-black">
              Verified Campus Access
            </span>

            <h1 className="mt-6 text-6xl font-black leading-[0.95] tracking-tight">
              Welcome back to{" "}
              <span className="text-green-600">Axyon</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 max-w-lg leading-8">
              Continue buying, selling, chatting, and managing your trusted
              campus marketplace account.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <p className="text-3xl font-black text-green-600">✓</p>
                <h3 className="mt-3 font-black">Verified students</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Safer campus transactions.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <p className="text-3xl font-black text-green-600">₹</p>
                <h3 className="mt-3 font-black">Smart deals</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Buy and sell essentials.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.7)]" />
                <span className="font-black text-3xl tracking-tight">
                  AXYON
                </span>
              </div>

              <h1 className="text-3xl font-black">Login to your account</h1>

              <p className="mt-2 text-sm text-slate-500">
                Access your marketplace, chats, orders, and profile.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-bold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-20 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-4 text-sm font-bold text-slate-500 hover:text-green-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="mt-3 text-right">
                  <a
                    href="/forgot-password"
                    className="text-sm font-bold text-green-600 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-black shadow-lg shadow-green-100">
                Login
              </button>
            </form>

            {message && (
              <p className="mt-5 text-sm font-semibold text-slate-600 text-center">
                {message}
              </p>
            )}

            <p className="mt-8 text-center text-sm text-slate-500">
              New to Axyon?{" "}
              <a href="/register" className="text-green-600 font-black">
                Create account
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}