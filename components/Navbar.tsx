"use client";

import { useEffect, useState } from "react";

type MarketplaceType = "CAMPUS" | "SCHOOL";

type User = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  marketplaceType?: MarketplaceType;
  schoolName?: string | null;
  schoolCity?: string | null;
  classLevel?: string | null;
  schoolVerified?: boolean;
  schoolStudentPhotoUrl?: string | null;
  profileImageUrl?: string | null;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMoreOpen, setAdminMoreOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  async function fetchUnreadNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      const unread = (
        data.notifications || []
      ).filter(
        (item: any) => !item.isRead
      ).length;

      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
    }
  }

  useEffect(() => {
    if (!user) return;

    fetchUnreadNotifications();

    const interval = setInterval(
      fetchUnreadNotifications,
      5000
    );

    return () => clearInterval(interval);
  }, [user]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  }

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";
  const isSchool =
    user?.marketplaceType === "SCHOOL";
  const isCampus =
    user?.marketplaceType === "CAMPUS";

  const profileHref = isSchool
    ? "/school-marketplace/profile"
    : "/profile";

  const profileImage =
    user?.profileImageUrl ||
    user?.schoolStudentPhotoUrl ||
    "";

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">

        <div className="flex min-h-[76px] items-center gap-4">

          {/* BRAND */}
          <a
            href={
              isAdmin
                ? "/admin"
                : isSchool
                ? "/school-marketplace/home"
                : isCampus
                ? "/marketplace-home"
                : "/"
            }
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-[0_6px_20px_rgba(79,70,229,0.16)] ring-1 ring-slate-200">
              <img
                src="/logo.png"
                alt="Axyon Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-slate-950">
                Axyon
              </h1>

              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                {isAdmin
                  ? "Admin Control Center"
                  : isSchool
                  ? "School Marketplace"
                  : isCampus
                  ? "Campus Marketplace"
                  : "Smart Student Ecosystem"}
              </p>
            </div>
          </a>

          {/* DESKTOP NAVIGATION */}
          <div className="ml-auto hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 lg:flex">

            {!isLoggedIn && (
              <>
                <NavLink
                  href="/"
                  label="Home"
                />

                <NavLink
                  href="/marketplace-home"
                  label="Campus"
                />

                <NavLink
                  href="/school-marketplace"
                  label="School"
                  accent="indigo"
                />
              </>
            )}

            {/* CAMPUS */}
            {isCampus && !isAdmin && (
              <>
                <NavLink
                  href="/marketplace-home"
                  label="Campus Home"
                />

                <NavLink
                  href="/marketplace"
                  label="Marketplace"
                />

                <NavLink
                  href="/rooms"
                  label="Accommodation"
                />

                <NavLink
                  href="/chat"
                  label="Chat"
                />

                <NavLink
                  href="/support"
                  label="Support"
                />
              </>
            )}

            {/* SCHOOL */}
            {isSchool && !isAdmin && (
              <>
                <NavLink
                  href="/school-marketplace/home"
                  label="School Home"
                  accent="indigo"
                />

                <NavLink
                  href="/school-marketplace/products"
                  label="Marketplace"
                  accent="indigo"
                />

                <NavLink
                  href="/school-marketplace/chat"
                  label="Chat"
                  accent="indigo"
                />

                <NavLink
                  href="/support"
                  label="Support"
                  accent="indigo"
                />
              </>
            )}

            {/* ADMIN */}
            {isAdmin && (
              <>
                <NavLink
                  href="/admin"
                  label="Dashboard"
                  accent="indigo"
                />

                <NavLink
                  href="/admin/users"
                  label="Users"
                  accent="indigo"
                />

                <NavLink
                  href="/admin/listings"
                  label="Listings"
                  accent="indigo"
                />

                <NavLink
                  href="/admin/rooms"
                  label="Accommodation"
                  accent="indigo"
                />

                <NavLink
                  href="/admin/reports"
                  label="Reports"
                  accent="indigo"
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setAdminMoreOpen(
                        (value) => !value
                      )
                    }
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    More ▾
                  </button>

                  {adminMoreOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                      <AdminMoreLink
                        href="/admin/school-verification"
                        label="School Verification"
                      />

                      <AdminMoreLink
                        href="/admin/ads"
                        label="Ad Banners"
                      />

                      <AdminMoreLink
                        href="/admin/support"
                        label="Support"
                      />

                      <AdminMoreLink
                        href="/admin/analytics"
                        label="Analytics"
                      />

                      <AdminMoreLink
                        href="/admin/logs"
                        label="Admin Logs"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-2 lg:flex">

            {!loading && !isLoggedIn && (
              <>
                <a
                  href="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Campus Login
                </a>

                <a
                  href="/school-marketplace/login"
                  className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-600 ring-1 ring-indigo-100 transition hover:bg-indigo-100"
                >
                  School Login
                </a>
              </>
            )}

            {!loading && isLoggedIn && (
              <>
                {/* NOTIFICATIONS */}
                <a
                  href="/notifications"
                  aria-label="Notifications"
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  🔔

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-black text-white">
                      {unreadCount > 9
                        ? "9+"
                        : unreadCount}
                    </span>
                  )}
                </a>

                {/* CAMPUS SELL */}
                {isCampus && !isAdmin && (
                  <a
                    href="/create-product"
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-black text-white shadow-[0_8px_25px_rgba(16,185,129,0.22)] transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Sell Product
                  </a>
                )}

                {/* SCHOOL SELL */}
                {isSchool && !isAdmin && (
                  <a
                    href="/school-marketplace/sell"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_8px_25px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Sell Item
                  </a>
                )}

                {/* PROFILE ICON ONLY */}
                {!isAdmin && (
                  <a
                    href={profileHref}
                    aria-label="Open profile"
                    title="Profile"
                    className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`${user.name}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">
                        👤
                      </span>
                    )}
                  </a>
                )}

                {/* ADMIN */}
                {isAdmin && (
                  <span className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                    Admin
                  </span>
                )}

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen((value) => !value)
            }
            aria-label="Open menu"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm lg:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="pb-5 lg:hidden">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">

              {!isLoggedIn && (
                <>
                  <MobileLink
                    href="/"
                    label="Axyon Home"
                  />

                  <MobileLink
                    href="/marketplace-home"
                    label="Campus Marketplace"
                  />

                  <MobileLink
                    href="/school-marketplace"
                    label="School Marketplace"
                  />

                  <MobileLink
                    href="/login"
                    label="Campus Login"
                  />

                  <MobileLink
                    href="/school-marketplace/login"
                    label="School Login"
                  />
                </>
              )}

              {/* CAMPUS MOBILE */}
              {isCampus && !isAdmin && (
                <>
                  <MobileLink
                    href="/marketplace-home"
                    label="Campus Home"
                  />

                  <MobileLink
                    href="/marketplace"
                    label="Marketplace"
                  />

                  <MobileLink
                    href="/rooms"
                    label="Accommodation"
                  />

                  <MobileLink
                    href="/chat"
                    label="Chat"
                  />

                  <MobileLink
                    href="/support"
                    label="Support"
                  />

                  <MobileLink
                    href="/profile"
                    label="Profile"
                  />

                  <MobileLink
                    href="/create-product"
                    label="Sell Product"
                  />

                  <MobileLink
                    href="/create-room"
                    label="List Room"
                  />
                </>
              )}

              {/* SCHOOL MOBILE */}
              {isSchool && !isAdmin && (
                <>
                  <MobileLink
                    href="/school-marketplace/home"
                    label="School Home"
                  />

                  <MobileLink
                    href="/school-marketplace/products"
                    label="Marketplace"
                  />

                  <MobileLink
                    href="/school-marketplace/sell"
                    label="Sell Item"
                  />

                  <MobileLink
                    href="/school-marketplace/chat"
                    label="Chat"
                  />

                  <MobileLink
                    href="/support"
                    label="Support"
                  />

                  <MobileLink
                    href="/school-marketplace/profile"
                    label="Profile"
                  />
                </>
              )}

              {/* ADMIN MOBILE */}
              {isAdmin && (
                <>
                  <MobileSection title="Admin Control Center" />

                  <MobileLink
                    href="/admin"
                    label="Dashboard"
                  />

                  <MobileLink
                    href="/admin/users"
                    label="Users"
                  />

                  <MobileLink
                    href="/admin/listings"
                    label="Listings"
                  />

                  <MobileLink
                    href="/admin/rooms"
                    label="Accommodation"
                  />

                  <MobileLink
                    href="/admin/reports"
                    label="Reports"
                  />

                  <MobileSection title="Management" />

                  <MobileLink
                    href="/admin/school-verification"
                    label="School Verification"
                  />

                  <MobileLink
                    href="/admin/ads"
                    label="Ad Banners"
                  />

                  <MobileLink
                    href="/admin/support"
                    label="Support"
                  />

                  <MobileLink
                    href="/admin/analytics"
                    label="Analytics"
                  />

                  <MobileLink
                    href="/admin/logs"
                    label="Admin Logs"
                  />
                </>
              )}

              {isLoggedIn && (
                <>
                  <MobileLink
                    href="/notifications"
                    label={
                      unreadCount > 0
                        ? `Notifications (${
                            unreadCount > 9
                              ? "9+"
                              : unreadCount
                          })`
                        : "Notifications"
                    }
                  />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 w-full rounded-xl border border-red-100 bg-red-50 py-3.5 font-black text-red-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  accent = "green",
}: {
  href: string;
  label: string;
  accent?: "green" | "indigo";
}) {
  const hoverClasses =
    accent === "indigo"
      ? "hover:bg-indigo-50 hover:text-indigo-700"
      : "hover:bg-emerald-50 hover:text-emerald-700";

  return (
    <a
      href={href}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition ${hoverClasses}`}
    >
      {label}
    </a>
  );
}

function AdminMoreLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
    >
      {label}
    </a>
  );
}

function MobileLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700"
    >
      {label}
    </a>
  );
}

function MobileSection({
  title,
}: {
  title: string;
}) {
  return (
    <div className="px-2 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
      {title}
    </div>
  );
}