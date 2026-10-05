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

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setMessage("Logging in...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
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
      } else if (
        data.user?.marketplaceType === "SCHOOL"
      ) {
        window.location.href =
          "/school-marketplace/home";
      } else {
        window.location.href = "/marketplace-home";
      }
    } catch {
      setMessage(
        "Something went wrong. Please try again."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <Navbar />

      <section className="min-h-[calc(100vh-80px)] px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
          {/* LEFT */}
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified Campus Access
            </span>

            <h1 className="mt-6 max-w-2xl text-6xl font-black leading-[0.92] tracking-tight">
              Welcome back to{" "}
              <span className="text-emerald-600">
                Axyon.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Continue buying, selling, chatting, and
              managing your trusted campus marketplace
              account.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-black text-emerald-600">
                  ✓
                </div>

                <h3 className="mt-4 font-black">
                  Verified students
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Safer campus transactions.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-black text-emerald-600">
                  ₹
                </div>

                <h3 className="mt-4 font-black">
                  Smart deals
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Buy and sell essentials.
                </p>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[32px] sm:p-8">
            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.55)]" />

                <span className="text-3xl font-black tracking-tight">
                  AXYON
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Login to your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Access your marketplace, chats, orders,
                and profile.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                  Email
                </label>

                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="
                    h-12 w-full rounded-2xl
                    border border-slate-200
                    bg-slate-50 px-4
                    text-sm text-slate-900
                    outline-none transition
                    placeholder:text-slate-400
                    focus:border-emerald-500
                    focus:bg-white
                    focus:ring-4
                    focus:ring-emerald-500/10
                  "
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="
                      h-12 w-full rounded-2xl
                      border border-slate-200
                      bg-slate-50
                      px-4 pr-20
                      text-sm text-slate-900
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 hover:text-emerald-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="mt-3 text-right">
                  <a
                    href="/forgot-password"
                    className="text-xs font-black text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="
                  flex w-full items-center
                  justify-center rounded-2xl
                  bg-emerald-600
                  py-3.5
                  text-sm font-black text-white
                  shadow-[0_10px_30px_rgba(16,185,129,0.18)]
                  transition
                  hover:bg-emerald-700
                  active:scale-[0.99]
                "
              >
                Login
                <span className="ml-2">→</span>
              </button>
            </form>

            {message && (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${
                  message === "Login successful!"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : message === "Logging in..."
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {message}
              </div>
            )}

            <p className="mt-8 text-center text-sm text-slate-500">
              New to Axyon?{" "}
              <a
                href="/register"
                className="font-black text-emerald-600 hover:text-emerald-700"
              >
                Create account
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}