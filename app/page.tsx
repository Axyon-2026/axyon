"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-24 text-center">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block bg-blue-600/20 text-blue-400 px-5 py-2 rounded-full text-sm font-medium">
            India’s Student Marketplace
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mt-8 leading-tight">
            Buy, Sell & Connect
            <br />
            within your campus
          </h1>

          <p className="mt-8 text-xl text-slate-400 max-w-3xl mx-auto leading-8">
            Axyon helps students securely buy and sell products,
            chat with buyers and sellers, manage orders, and
            build a trusted college marketplace ecosystem.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            {!loading && !isLoggedIn && (
              <>
                <a
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-medium text-lg"
                >
                  Get Started
                </a>

                <a
                  href="/marketplace"
                  className="border border-slate-700 hover:border-slate-500 px-8 py-4 rounded-2xl font-medium text-lg"
                >
                  Explore Marketplace
                </a>
              </>
            )}

            {!loading && isLoggedIn && (
              <>
                <a
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className={`px-8 py-4 rounded-2xl font-medium text-lg ${
                    isAdmin
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isAdmin
                    ? "Go to Admin"
                    : "Go to Dashboard"}
                </a>

                {!isAdmin && (
                  <a
                    href="/marketplace"
                    className="border border-slate-700 hover:border-slate-500 px-8 py-4 rounded-2xl font-medium text-lg"
                  >
                    Explore Marketplace
                  </a>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold">
                Secure Marketplace
              </h2>

              <p className="mt-4 text-slate-400 leading-7">
                Buy and sell products safely within verified
                student communities.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold">
                Real-Time Chat
              </h2>

              <p className="mt-4 text-slate-400 leading-7">
                Connect instantly with buyers and sellers
                using built-in messaging.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold">
                Trusted Campus Network
              </h2>

              <p className="mt-4 text-slate-400 leading-7">
                Built for students with moderation, reporting,
                and admin-controlled trust systems.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}