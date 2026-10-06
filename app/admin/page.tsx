"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DashboardData = {
  users?: {
    total?: number;
    active?: number;
    suspended?: number;
    verified?: number;
    pendingVerification?: number;
    campus?: number;
    school?: number;
  };

  listings?: {
    total?: number;
    active?: number;
    removed?: number;
    sold?: number;
    campus?: number;
    school?: number;
  };

  rooms?: {
    total?: number;
    active?: number;
    occupied?: number;
    removed?: number;
  };

  reports?: {
    total?: number;
    pending?: number;
    reviewing?: number;
    resolved?: number;
    dismissed?: number;
  };

  support?: {
    total?: number;
    open?: number;
    resolved?: number;
  };

  schoolVerification?: {
    pending?: number;
    approved?: number;
    rejected?: number;
  };

  recentUsers?: any[];
  recentListings?: any[];
  recentRooms?: any[];
  recentReports?: any[];
};

type StatCardProps = {
  label: string;
  value: number | string;
  description: string;
  href: string;
  icon: string;
};

function StatCard({ label, value, description, href, icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl transition group-hover:bg-green-50">
          {icon}
        </div>

        <span className="text-slate-300 transition group-hover:text-green-600">
          →
        </span>
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </Link>
  );
}

function SectionCard({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>

          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        {href && (
          <Link
            href={href}
            className="shrink-0 text-sm font-black text-green-600 hover:text-green-700"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const res = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load dashboard");
      }

      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totals = useMemo(() => {
    return {
      users: data?.users?.total ?? 0,

      listings: data?.listings?.total ?? 0,

      rooms: data?.rooms?.total ?? 0,

      reports: data?.reports?.pending ?? 0,

      support: data?.support?.open ?? 0,

      verification: data?.schoolVerification?.pending ?? 0,
    };
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />

          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full min-w-0 bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {/* HEADER */}

        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-300">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Axyon Control Center
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Monitor the Campus and School marketplaces, verification,
                reports, users, accommodation and platform activity from one
                place.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 sm:w-auto"
            >
              ↻ Refresh
            </button>
          </div>

          {/* ADMIN PERMISSIONS */}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Monitor", "Users, listings, accommodation & reports"],
              ["Moderate", "Remove inappropriate content"],
              ["No marketplace activity", "No buying, selling or editing"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-black">{title}</p>

                <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {/* OVERVIEW */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Users"
            value={totals.users}
            description="Registered platform users"
            href="/admin/users"
            icon="👥"
          />

          <StatCard
            label="Listings"
            value={totals.listings}
            description="Campus + School marketplace items"
            href="/admin/listings"
            icon="📦"
          />

          <StatCard
            label="Accommodation"
            value={totals.rooms}
            description="Campus accommodation listings"
            href="/admin/rooms"
            icon="🏠"
          />

          <StatCard
            label="Pending reports"
            value={totals.reports}
            description="Reports requiring moderation"
            href="/admin/reports"
            icon="🚩"
          />

          <StatCard
            label="Open support"
            value={totals.support}
            description="Support requests awaiting action"
            href="/admin/support"
            icon="💬"
          />

          <StatCard
            label="School verification"
            value={totals.verification}
            description="Students awaiting approval"
            href="/admin/school-verification"
            icon="🎓"
          />
        </div>

        {/* MARKETPLACE OVERVIEW */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* CAMPUS */}

          <SectionCard
            title="Campus Marketplace"
            description="Overview of the existing college marketplace."
            href="/admin/listings"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">Items</p>

                <p className="mt-1 text-2xl font-black">
                  {data?.listings?.campus ?? 0}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">
                  Accommodation
                </p>

                <p className="mt-1 text-2xl font-black">
                  {data?.rooms?.total ?? 0}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* SCHOOL */}

          <SectionCard
            title="School Marketplace"
            description="Overview of the verified school marketplace."
            href="/admin/listings"
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">Items</p>

                <p className="mt-1 text-2xl font-black">
                  {data?.listings?.school ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm font-black text-green-800">
                School marketplace is product-only
              </p>

              <p className="mt-1 text-xs leading-5 text-green-700">
                School accommodation is not part of the School Marketplace.
              </p>
            </div>
          </SectionCard>
        </div>

        {/* QUICK ACTIONS */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-black">Admin controls</h2>

            <p className="mt-1 text-sm text-slate-500">
              Administrative tools only. Marketplace creation and editing are
              intentionally unavailable to admins.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["👥", "Manage Users", "/admin/users"],
              ["📦", "Review Listings", "/admin/listings"],
              ["🏠", "Review Accommodation", "/admin/rooms"],
              ["🚩", "Handle Reports", "/admin/reports"],
              ["🎓", "School Verification", "/admin/school-verification"],
              ["📚", "Home Tuition", "/admin/home-tuition"],
              ["📣", "Announcements", "/admin/announcements"],
              ["💬", "Support", "/admin/support"],
              ["📊", "Analytics", "/admin/analytics"],
              ["📋", "Audit Logs", "/admin/logs"],
            ].map(([icon, label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-green-200 hover:bg-green-50"
              >
                <span className="text-xl">{icon}</span>

                <span className="text-sm font-black">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* RECENT ACTIVITY */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* USERS */}

          <SectionCard
            title="Recent users"
            description="Latest account activity."
            href="/admin/users"
          >
            <div className="space-y-3">
              {(data?.recentUsers || []).slice(0, 5).map((user, index) => (
                <div
                  key={user.id || index}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {user.name || user.email || "User"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.email || "No email"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">
                    {user.marketplaceType || "CAMPUS"}
                  </span>
                </div>
              ))}

              {!data?.recentUsers?.length && (
                <p className="py-6 text-center text-sm text-slate-400">
                  No recent users.
                </p>
              )}
            </div>
          </SectionCard>

          {/* LISTINGS */}

          <SectionCard
            title="Recent listings"
            description="Latest marketplace activity."
            href="/admin/listings"
          >
            <div className="space-y-3">
              {(data?.recentListings || [])
                .slice(0, 5)
                .map((listing, index) => (
                  <div
                    key={listing.id || index}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {listing.title || "Untitled listing"}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {listing.seller?.name ||
                          listing.seller?.email ||
                          "Unknown seller"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">
                      {listing.marketplaceType || "CAMPUS"}
                    </span>
                  </div>
                ))}

              {!data?.recentListings?.length && (
                <p className="py-6 text-center text-sm text-slate-400">
                  No recent listings.
                </p>
              )}
            </div>
          </SectionCard>

          {/* REPORTS */}

          <SectionCard
            title="Recent reports"
            description="Moderation activity requiring attention."
            href="/admin/reports"
          >
            <div className="space-y-3">
              {(data?.recentReports || []).slice(0, 5).map((report, index) => (
                <div
                  key={report.id || index}
                  className="rounded-2xl bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-black">
                      {report.reason || "Reported content"}
                    </p>

                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-700">
                      {report.status || "PENDING"}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {report.product?.title ||
                      report.room?.title ||
                      "Content under review"}
                  </p>
                </div>
              ))}

              {!data?.recentReports?.length && (
                <p className="py-6 text-center text-sm text-slate-400">
                  No recent reports.
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* FOOTER NOTE */}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-black text-slate-700">
            Axyon Administration
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Admin accounts are for platform oversight and moderation only.
            Marketplace buying, selling, creation and listing editing remain
            unavailable.
          </p>
        </div>
      </div>
    </main>
  );
}
