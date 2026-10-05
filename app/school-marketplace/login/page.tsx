"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

export default function SchoolLoginPage() {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;

          if (user?.marketplaceType === "CAMPUS") {
            window.location.replace(
              "/marketplace-home"
            );
            return;
          }

          if (user?.marketplaceType === "SCHOOL") {
            if (
              user.schoolVerified === true &&
              user.schoolVerificationStatus ===
                "APPROVED"
            ) {
              window.location.replace(
                "/school-marketplace/home"
              );
              return;
            }

            if (
              user.schoolVerificationStatus ===
                "PENDING" ||
              user.schoolVerificationStatus ===
                "REJECTED"
            ) {
              window.location.replace(
                "/school-marketplace"
              );
              return;
            }
          }
        }
      } catch {
        // Treat as logged out.
      }

      setChecking(false);
    }

    checkExistingSession();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/school/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to sign in."
        );
        return;
      }

      window.location.replace(
        "/school-marketplace/home"
      );
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <p className="text-sm font-bold text-slate-500">
          Checking account...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <a
          href="/school-marketplace"
          className="text-sm font-bold text-slate-500"
        >
          ← School Marketplace
        </a>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 sm:p-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1">
            <img
              src="/logo.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="mt-7 text-3xl font-black">
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in to your verified School Marketplace
            account.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4"
          >
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm outline-none placeholder:text-slate-700 focus:border-indigo-400/50"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm outline-none placeholder:text-slate-700 focus:border-indigo-400/50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-slate-600">
            Don't have a School account?
          </p>

          <a
            href="/school-marketplace/create-account"
            className="mt-3 block text-center text-sm font-black text-indigo-400"
          >
            Create School Account →
          </a>
        </div>
      </div>
    </main>
  );
}