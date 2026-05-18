"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
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

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    window.location.href = "/login";
  }

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#071019]/80 backdrop-blur-2xl text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-4 shrink-0">
           <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-[0_0_20px_rgba(139,92,246,0.35)] flex items-center justify-center p-1">
              <img
                src="/logo.png"
                alt="Axyon Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">Axyon</h1>

              <p className="text-xs text-slate-400 hidden sm:block">
                India’s Smart Student Ecosystem
              </p>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-3 py-2">
            <NavLink href="/" label="Home" />

            {!isAdmin && (
              <>
                <NavLink href="/marketplace" label="Marketplace" />

                {isLoggedIn && (
                  <>
                    <NavLink href="/chat" label="Chat" />
                    <NavLink href="/support" label="Support" />
                  </>
                )}
              </>
            )}

            {isAdmin && (
              <>
                <NavLink href="/admin" label="Dashboard" />
                <NavLink href="/admin/users" label="Users" />
                <NavLink href="/admin/listings" label="Listings" />
                <NavLink href="/admin/reports" label="Reports" />
                <NavLink href="/admin/analytics" label="Analytics" />
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {!loading && !isLoggedIn && (
              <>
                <a
                  href="/login"
                  className="px-5 py-2.5 rounded-full border border-white/10 hover:border-green-500 transition text-sm font-semibold"
                >
                  Login
                </a>

                <a
                  href="/register"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition shadow-[0_0_30px_rgba(34,197,94,0.35)] text-sm font-black text-black"
                >
                  Join Campus
                </a>
              </>
            )}

            {!loading && isLoggedIn && !isAdmin && (
              <>
                <a
                  href="/create-product"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition shadow-[0_0_30px_rgba(34,197,94,0.35)] text-sm font-black text-black"
                >
                  Sell Now
                </a>

                <a
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-full border border-white/10 hover:border-green-500 transition text-sm font-semibold"
                >
                  Profile
                </a>
              </>
            )}

            {!loading && isLoggedIn && isAdmin && (
              <a
                href="/admin"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_30px_rgba(34,197,94,0.35)] text-sm font-black text-black"
              >
                Admin Panel
              </a>
            )}

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full border border-red-500/20 text-red-400 hover:border-red-500 transition text-sm font-semibold"
              >
                Logout
              </button>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-2xl"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-6">
            <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] p-5 space-y-3 shadow-2xl">
              <MobileLink href="/" label="Home" />

              {!isAdmin && <MobileLink href="/marketplace" label="Marketplace" />}

              {isLoggedIn && !isAdmin && (
                <>
                  <MobileLink href="/chat" label="Chat" />
                  <MobileLink href="/support" label="Support" />
                  <MobileLink href="/dashboard" label="Dashboard" />
                  <MobileLink href="/create-product" label="Sell Product" />
                </>
              )}

              {isAdmin && (
                <>
                  <MobileLink href="/admin" label="Admin Dashboard" />
                  <MobileLink href="/admin/users" label="Users" />
                  <MobileLink href="/admin/listings" label="Listings" />
                  <MobileLink href="/admin/reports" label="Reports" />
                  <MobileLink href="/admin/support" label="Support" />
                  <MobileLink href="/admin/logs" label="Logs" />
                  <MobileLink href="/admin/analytics" label="Analytics" />
                </>
              )}

              {!loading && !isLoggedIn && (
                <>
                  <MobileLink href="/login" label="Login" />

                  <a
                    href="/register"
                    className="block text-center mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-black py-4 rounded-2xl"
                  >
                    Join Campus
                  </a>
                </>
              )}

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 border border-red-500/20 text-red-400 py-4 rounded-2xl font-black"
                >
                  Logout
                </button>
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
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
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
      className="block px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-green-500/40 transition font-semibold"
    >
      {label}
    </a>
  );
}