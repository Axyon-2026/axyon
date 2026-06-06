"use client";
import Navbar from "@/components/Navbar";
import HomeAdBanner from "@/components/HomeAdBanner";
import { useEffect, useState } from "react";

const categories = [
  {
    title: "Marketplace",
    desc: "Buy and sell campus essentials",
    icon: "🛍️",
    href: "/marketplace",
  },
  {
    title: "Rentals",
    desc: "Rent items instead of buying",
    icon: "🔁",
    href: "/rentals",
  },
  {
    title: "Barter",
    desc: "Exchange items with students",
    icon: "🤝",
    href: "/barter",
  },
  {
    title: "Campus Chat",
    desc: "Talk safely before deals",
    icon: "💬",
    href: "/chat",
  },
  {
    title: "Verification",
    desc: "Trusted student identities",
    icon: "✅",
    href: "/student-verification",
  },
  {
    title: "Support",
    desc: "Help when something goes wrong",
    icon: "🛡️",
    href: "/support",
  },
];
const steps = [
  {
    number: "01",
    title: "Join your campus",
    description: "Create your account and verify your student identity.",
  },
  {
    number: "02",
    title: "Discover campus deals",
    description: "Browse listings, rentals, exchanges, and student services.",
  },
  {
    number: "03",
    title: "Connect with trust",
    description: "Chat, meet safely, and transact inside your college network.",
  },
];

const highlights = [
  "Verified student community",
  "Marketplace + chat in one place",
  "Rentals and barter coming soon",
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

      <section className="px-4 sm:px-6 lg:px-10 pt-14 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-black">
                ✦ India’s Smart Student Ecosystem
              </span>

              <h1 className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-slate-950">
                The student network built for{" "}
                <span className="text-green-600">real campus life...</span>
              </h1>

              <p className="mt-7 text-lg sm:text-xl text-slate-600 max-w-2xl leading-8">
                Axyon helps students buy, sell, rent, exchange, and connect
                safely within verified college communities — powered by trusted
                identities, campus chat, and student-first experiences.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {!loading && !isLoggedIn && (
                  <>
                    <a
                      href="/register"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-black text-center shadow-xl shadow-green-200"
                    >
                      Join Campus
                    </a>

                    <a
                      href="/marketplace"
                      className="bg-white border-2 border-slate-200 hover:border-green-400 text-slate-800 px-8 py-4 rounded-full font-black text-center"
                    >
                      Explore Axyon
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
                      {isAdmin ? "Open Admin Panel" : "Enter Marketplace"}
                    </a>

                    {!isAdmin && (
                      <a
                        href="/create-product"
                        className="bg-white border-2 border-slate-200 hover:border-green-400 text-slate-800 px-8 py-4 rounded-full font-black text-center"
                      >
                        Post Listing
                      </a>
                    )}
                  </>
                )}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-bold text-slate-600 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-green-300 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-60" />

              <div className="relative grid gap-5">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 font-bold">
                        Axyon Core
                      </p>

                      <h2 className="mt-2 text-3xl font-black">
                        One campus. One trusted network.
                      </h2>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl">
                      🎓
                    </div>
                  </div>

                  <p className="mt-5 text-slate-600 leading-7">
                    Axyon is not just a marketplace. It is a student ecosystem
                    for deals, trust, communication, and campus convenience.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                      🛍️
                    </div>

                    <h3 className="mt-4 font-black text-lg">
                      Buy & Sell
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 leading-6">
                      Turn unused items into value inside your college.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                      💬
                    </div>

                    <h3 className="mt-4 font-black text-lg">
                      Campus Chat
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 leading-6">
                      Message students before buying, selling, or exchanging.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 text-white rounded-[2rem] p-6 shadow-2xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_40%)]" />

                  <div className="relative">
                    <p className="text-green-400 text-sm font-black">
                      NEXT ON AXYON
                    </p>

                    <h3 className="mt-2 text-3xl font-black">
                      Rentals & Barter
                    </h3>

                    <p className="mt-3 text-slate-300 leading-7">
                      Rent essentials, exchange items, and reduce student
                      expenses with smarter campus sharing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <HomeAdBanner />
      <section className="px-4 sm:px-6 lg:px-10 py-14 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-green-600 font-black text-sm">
                Axyon Ecosystem
              </p>
              
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                More than buying and selling.
              </h2>
            </div>
            
            <a
              href="/marketplace"
              className="hidden sm:block text-green-600 font-black"
            >
              Open marketplace →
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-5 hover:border-green-400 hover:-translate-y-1 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>

                <p className="mt-4 font-black text-slate-900">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-slate-500 leading-5">
                  {item.desc}
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
              How Axyon Works
            </p>

            <h2 className="text-3xl sm:text-5xl font-black mt-2">
              Built around student trust.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white border border-slate-200 rounded-[2rem] p-7 shadow-sm hover:-translate-y-1 hover:shadow-xl transition"
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
              Your campus has people. Axyon connects everything else.
            </h2>

            <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
              Join the student ecosystem built for safer deals, smarter sharing,
              and stronger campus communities.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/marketplace"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-black"
              >
                Explore Axyon
              </a>

              {!isAdmin && (
                <a
                  href={isLoggedIn ? "/create-product" : "/register"}
                  className="bg-white text-slate-950 px-8 py-4 rounded-full font-black"
                >
                  {isLoggedIn ? "Post Listing" : "Join Campus"}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}