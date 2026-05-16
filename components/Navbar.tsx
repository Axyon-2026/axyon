"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-950 text-white">
      <a href="/" className="text-2xl font-bold text-blue-500">
        Axyon
      </a>

      <div className="hidden md:flex gap-6 text-sm text-slate-300 items-center">
        <a href="/">Home</a>

        {!isAdmin && <a href="/marketplace">Marketplace</a>}

        {!isLoggedIn && (
          <>
            <a href="/support">Support</a>
          </>
        )}

        {isLoggedIn && !isAdmin && (
          <>
            <a href="/create-product">Sell Product</a>
            <a href="/chat">Chat</a>
            <a href="/support">Support</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/my-orders">My Orders</a>
            <a href="/profile">Profile</a>
            <a href="/student-verification">
            Verify Student</a>
            <a href="/notifications">Notifications</a>
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
            <a
  href="/admin/analytics"
  className="text-purple-400"
>
  Analytics
</a>
            <a href="/notifications">Notifications</a>
          </>
        )}
      </div>

      <div className="flex gap-3 items-center">
        {!loading && !isLoggedIn && (
          <>
            <a
              href="/login"
              className="px-4 py-2 rounded-lg border border-slate-700 text-sm"
            >
              Login
            </a>

            <a
              href="/register"
              className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium"
            >
              Get Started
            </a>
          </>
        )}

        {!loading && isLoggedIn && (
          <>
            <a
              href="/profile"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isAdmin ? "bg-purple-600" : "bg-blue-600"
              }`}
            >
              {isAdmin ? "Admin Profile" : "My Account"}
            </a>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-red-500 text-red-400 text-sm"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}