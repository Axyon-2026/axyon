"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const categories = [
  "Books",
  "Notes",
  "Electronics",
  "Hostel Items",
  "Furniture",
  "Cycles",
];

const steps = [
  {
    number: "01",
    title: "Verify Student ID",
    description: "Join with your campus profile and verification.",
  },
  {
    number: "02",
    title: "Browse or List",
    description: "Find deals or post items you no longer need.",
  },
  {
    number: "03",
    title: "Chat & Transact",
    description: "Connect safely with verified students.",
  },
];

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
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-black">
                ★ India’s Student Marketplace
              </span>

              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-slate-950">
                Everything a{" "}
                <span className="text-green-600">student needs</span>
                <br />
                in one campus app.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-8">
                Buy books, sell electronics, exchange essentials, chat with
                students, and build a safer marketplace inside your college.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {!loading && !isLoggedIn && (
                  <>
                    <a
                      href="/register"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-black text-center shadow-xl shadow-green-200"
                    >
                      Get Started Free
                    </a>

                    <a
                      href="/marketplace"
                      className="bg-white border-2 border-slate-200 hover:border-green-400 text-slate-800 px-8 py-4 rounded-full font-black text-center"
                    >
                      Explore Marketplace
                    </a>
                  </>
                )}

                {!loading && isLoggedIn && (
                  <>
                    <a
                      href={isAdmin ? "/admin" : "/marketplace"}
                      className={`px-8 py-4 rounded-full font-black text-center shadow-xl ${
                        isAdmin
                          ? "bg-slate-950 hover:bg-slate-800 text-white shadow-slate-200"
                          : "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                      }`}
                    >
                      {isAdmin ? "Open Admin Panel" : "Browse Marketplace"}
                    </a>

                    {!isAdmin && (
                      <a
                        href="/create-product"
                        className="bg-white border-2 border-slate-200 hover:border-green-400 text-slate-800 px-8 py-4 rounded-full font-black text-center"
                      >
                        Sell Something
                      </a>
                    )}
                  </>
                )}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-5 max-w-xl">
                <div>
                  <p className="text-3xl font-black text-slate-950">1K+</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Students Goal
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-slate-950">24/7</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Campus Access
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-black text-slate-950">100%</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Verified Focus
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -right-4 w-32 h-32 bg-green-300 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-6 -left-4 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-60" />

              <div className="relative bg-white border border-slate-200 rounded-[2rem] p-5 shadow-2xl">
                <div className="bg-slate-50 rounded-[1.5rem] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-bold">
                        Featured Campus Deal
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        Data Structures Book
                      </h2>
                    </div>

                    <span className="bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full">
                      LIVE
                    </span>
                  </div>

                  <div className="mt-5 aspect-[4/3] rounded-3xl bg-gradient-to-br from-green-100 to-slate-200 flex items-center justify-center text-7xl">
                    📚
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black text-green-600">
                        ₹500
                      </p>

                      <p className="text-sm text-slate-500 font-medium">
                        Verified student seller
                      </p>
                    </div>

                    <a
                      href="/marketplace"
                      className="bg-slate-950 text-white px-5 py-3 rounded-full font-black text-sm"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block absolute -left-6 top-10 bg-white border border-slate-200 shadow-xl rounded-2xl p-4">
                <p className="text-sm font-black text-slate-900">
                  Secure Chat
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Buyer ↔ Seller
                </p>
              </div>

              <div className="hidden sm:block absolute -right-5 bottom-12 bg-green-600 text-white shadow-xl rounded-2xl p-4">
                <p className="text-sm font-black">Student Verified</p>
                <p className="text-xs text-green-100 mt-1">
                  Safer campus deals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-green-600 font-black text-sm">
                Categories
              </p>

              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Find anything for campus life
              </h2>
            </div>

            <a
              href="/marketplace"
              className="hidden sm:block text-green-600 font-black"
            >
              View all →
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((item) => (
              <a
                key={item}
                href="/marketplace"
                className="bg-slate-50 border border-slate-200 rounded-3xl p-5 hover:border-green-400 hover:-translate-y-1 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                  🛍️
                </div>

                <p className="mt-4 font-black text-slate-900">{item}</p>

                <p className="mt-1 text-xs text-slate-500">
                  Browse listings
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <p className="text-green-600 font-black text-sm">
              How It Works
            </p>

            <h2 className="text-3xl sm:text-5xl font-black mt-2">
              Simple, safe, student-first.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm"
              >
                <p className="text-5xl font-black text-green-600">
                  {step.number}
                </p>

                <h3 className="mt-5 text-xl font-black">{step.title}</h3>

                <p className="mt-3 text-slate-500 leading-7">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 pb-28">
        <div className="max-w-6xl mx-auto rounded-[2rem] bg-slate-950 text-white p-8 sm:p-12 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_35%)]" />

          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-black">
              Ready to make campus buying smarter?
            </h2>

            <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
              Join Axyon and help build a trusted marketplace for your college.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/marketplace"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-black"
              >
                Explore Now
              </a>

              {!isAdmin && (
                <a
                  href={isLoggedIn ? "/create-product" : "/register"}
                  className="bg-white text-slate-950 px-8 py-4 rounded-full font-black"
                >
                  {isLoggedIn ? "Post Listing" : "Create Account"}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}