"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  marketplaceType: string;
  schoolName?: string | null;
  schoolCity?: string | null;
  classLevel?: string | null;
  schoolVerified?: boolean;
  schoolVerificationStatus?: string;
  schoolStudentPhotoUrl?: string | null;
  createdAt?: string;
};

export default function SchoolProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          window.location.href = "/school-marketplace/login";
          return;
        }

        const data = await response.json();

        if (data.user?.marketplaceType !== "SCHOOL") {
          window.location.href = "/";
          return;
        }

        setUser(data.user);
      } catch {
        window.location.href = "/school-marketplace/login";
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* TOP NAV */}
        <div className="flex items-center justify-between gap-4">
          <a
            href="/school-marketplace/home"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            ← School Home
          </a>

          <span className="hidden rounded-full border border-indigo-400/10 bg-indigo-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300 sm:inline-flex">
            School Account
          </span>
        </div>

        {/* PROFILE */}
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur">
          {/* Cover */}
          <div className="relative h-36 overflow-hidden bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-slate-900 sm:h-44">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.25),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(139,92,246,0.18),transparent_35%)]" />

            <div className="absolute bottom-5 left-5 sm:left-8">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200/70">
                Axyon School
              </p>
            </div>
          </div>

          <div className="-mt-12 px-5 pb-7 sm:-mt-16 sm:px-8">
            {/* Avatar + identity */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-[#070b14] bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-3xl shadow-2xl sm:h-32 sm:w-32">
                {user.schoolStudentPhotoUrl ? (
                  <img
                    src={user.schoolStudentPhotoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "👤"
                )}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="max-w-full break-words text-2xl font-black tracking-tight sm:text-3xl">
                    {user.name}
                  </h1>

                  {user.schoolVerified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-400/15 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  School Marketplace Student
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <InfoCard
                label="School"
                value={user.schoolName || "Not available"}
                icon="🏫"
              />

              <InfoCard
                label="City"
                value={user.schoolCity || "Not available"}
                icon="📍"
              />

              <InfoCard
                label="Class"
                value={
                  user.classLevel
                    ? `Class ${user.classLevel}`
                    : "Not available"
                }
                icon="🎓"
              />

              <InfoCard
                label="Email"
                value={user.email}
                icon="✉️"
              />
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-6">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">
              Account
            </p>

            <h2 className="mt-1 text-xl font-black">
              Quick actions
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ActionCard
              href="/school-marketplace/products"
              icon="🛍️"
              title="Browse Marketplace"
              description="Discover listings from verified students across schools."
            />

            <ActionCard
              href="/school-marketplace/my-listings"
              icon="📦"
              title="My Listings"
              description="View and manage the things you're selling."
            />

            <ActionCard
              href="/school-marketplace/chat"
              icon="💬"
              title="My Chats"
              description="Continue conversations with other students."
            />

            <div className="rounded-[1.5rem] border border-indigo-400/10 bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.03] p-5 shadow-lg shadow-black/10 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-xl">
                  🛡️
                </span>

                <span className="rounded-full border border-white/5 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Status
                </span>
              </div>

              <h2 className="mt-5 font-black">
                Verification
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Your School Marketplace verification status.
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    user.schoolVerified
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />

                <p
                  className={`text-sm font-black ${
                    user.schoolVerified
                      ? "text-emerald-400"
                      : "text-amber-300"
                  }`}
                >
                  {user.schoolVerificationStatus || "UNKNOWN"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST NOTE */}
        <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-center">
          <p className="text-xs leading-5 text-slate-600">
            Your verified school information is connected to your
            Axyon School account.
          </p>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-white/15 hover:bg-white/[0.025] sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-lg">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-200">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-400/25 hover:bg-white/[0.06] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-xl transition group-hover:bg-indigo-500/10">
          {icon}
        </span>

        <span className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-indigo-400">
          →
        </span>
      </div>

      <h2 className="mt-5 font-black text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </a>
  );
}