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
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black">
            A
          </div>

          <div>
            <p className="text-2xl font-bold leading-none">Axyon</p>
            <p className="text-xs text-slate-500 hidden sm:block">
              Campus Marketplace
            </p>
          </div>
        </a>

        <div className="hidden lg:flex gap-6 text-sm text-slate-300 items-center">
          <a href="/" className="hover:text-white">
            Home
          </a>

          {!isAdmin && (
            <a href="/marketplace" className="hover:text-white">
              Marketplace
            </a>
          )}

          {!isLoggedIn && (
            <a href="/support" className="hover:text-white">
              Support
            </a>
          )}

          {isLoggedIn && !isAdmin && (
            <>
              <a href="/marketplace" className="hover:text-white">
                Marketplace
              </a>

              <a href="/create-product" className="hover:text-white">
                Sell
              </a>

              <a href="/chat" className="hover:text-white">
                Chat
              </a>

              <a href="/support" className="hover:text-white">
                Support
              </a>

              <a href="/dashboard" className="hover:text-white">
                Dashboard
              </a>

              <a href="/my-orders" className="hover:text-white">
                Orders
              </a>

              <a href="/student-verification" className="hover:text-white">
                Verify
              </a>
            </>
          )}

          {isAdmin && (
            <>
              <a href="/admin" className="text-purple-400 font-semibold">
                Admin
              </a>

              <a href="/admin/users" className="text-purple-400">
                Users
              </a>

              <a href="/admin/listings" className="text-purple-400">
                Listings
              </a>

              <a href="/admin/support" className="text-purple-400">
                Tickets
              </a>

              <a href="/admin/reports" className="text-purple-400">
                Reports
              </a>

              <a href="/admin/logs" className="text-purple-400">
                Logs
              </a>

              <a href="/admin/analytics" className="text-purple-400">
                Analytics
              </a>
            </>
          )}
        </div>

        <div className="hidden lg:flex gap-3 items-center">
          {!loading && !isLoggedIn && (
            <>
              <a
                href="/login"
                className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-sm"
              >
                Login
              </a>

              <a
                href="/register"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium"
              >
                Get Started
              </a>
            </>
          )}

          {!loading && isLoggedIn && (
            <>
              <a
                href="/profile"
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  isAdmin
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isAdmin ? "Admin Profile" : "My Account"}
              </a>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden w-11 h-11 rounded-xl border border-slate-700 flex items-center justify-center text-xl"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-5 py-5">
          <div className="space-y-3">
            <a
              href="/"
              className="block bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
            >
              Home
            </a>

            {!isAdmin && (
              <a
                href="/marketplace"
                className="block bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
              >
                Marketplace
              </a>
            )}

            {!loading && !isLoggedIn && (
              <>
                <a
                  href="/support"
                  className="block bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
                >
                  Support
                </a>

                <a
                  href="/login"
                  className="block border border-slate-700 rounded-xl px-4 py-3 text-center"
                >
                  Login
                </a>

                <a
                  href="/register"
                  className="block bg-blue-600 rounded-xl px-4 py-3 text-center font-medium"
                >
                  Get Started
                </a>
              </>
            )}

            {!loading && isLoggedIn && !isAdmin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/create-product"
                    className="bg-blue-600 rounded-xl px-4 py-3 text-center font-medium"
                  >
                    Sell
                  </a>

                  <a
                    href="/chat"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center"
                  >
                    Chat
                  </a>

                  <a
                    href="/dashboard"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center"
                  >
                    Dashboard
                  </a>

                  <a
                    href="/my-orders"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center"
                  >
                    Orders
                  </a>

                  <a
                    href="/student-verification"
                    className="bg-yellow-600 rounded-xl px-4 py-3 text-center font-medium"
                  >
                    Verify ID
                  </a>

                  <a
                    href="/support"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center"
                  >
                    Support
                  </a>
                </div>

                <a
                  href="/profile"
                  className="block bg-blue-600 rounded-xl px-4 py-3 text-center font-medium"
                >
                  My Account
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full border border-red-500 text-red-400 rounded-xl px-4 py-3"
                >
                  Logout
                </button>
              </>
            )}

            {!loading && isAdmin && (
              <>
                <div className="bg-purple-900/30 border border-purple-700 rounded-2xl p-4">
                  <p className="text-purple-300 text-sm font-medium">
                    Admin Control Panel
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/admin"
                    className="bg-purple-600 rounded-xl px-4 py-3 text-center font-medium"
                  >
                    Admin
                  </a>

                  <a
                    href="/admin/users"
                    className="bg-slate-900 border border-purple-800 rounded-xl px-4 py-3 text-center"
                  >
                    Users
                  </a>

                  <a
                    href="/admin/listings"
                    className="bg-slate-900 border border-purple-800 rounded-xl px-4 py-3 text-center"
                  >
                    Listings
                  </a>

                  <a
                    href="/admin/support"
                    className="bg-slate-900 border border-purple-800 rounded-xl px-4 py-3 text-center"
                  >
                    Tickets
                  </a>

                  <a
                    href="/admin/reports"
                    className="bg-slate-900 border border-purple-800 rounded-xl px-4 py-3 text-center"
                  >
                    Reports
                  </a>

                  <a
                    href="/admin/logs"
                    className="bg-slate-900 border border-purple-800 rounded-xl px-4 py-3 text-center"
                  >
                    Logs
                  </a>

                  <a
                    href="/admin/analytics"
                    className="bg-slate-900 border border-purple-800 rounded-xl px-4 py-3 text-center col-span-2"
                  >
                    Analytics
                  </a>
                </div>

                <a
                  href="/profile"
                  className="block bg-purple-600 rounded-xl px-4 py-3 text-center font-medium"
                >
                  Admin Profile
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full border border-red-500 text-red-400 rounded-xl px-4 py-3"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}