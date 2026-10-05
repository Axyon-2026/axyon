"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-12 w-12 rounded-2xl object-contain shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight">Axyon</h1>
              <p className="text-xs font-semibold text-slate-500">
                India&apos;s Smart Student Ecosystem
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm">
              ✦ Welcome to Axyon
            </span>

            <h2 className="mt-7 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              One platform.
              <br />
              <span className="text-green-600">
                Connected student experiences.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Axyon is a student-focused digital ecosystem with separate
              experiences for school students, college students and education
              services such as Home Tuition.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            <a
              href="/school-marketplace"
              className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 text-white shadow-2xl shadow-indigo-200 transition duration-300 hover:-translate-y-2 hover:shadow-indigo-300 sm:p-9"
            >
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                    🏫
                  </div>

                  <span className="rounded-full bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-wider">
                    Classes 9–12
                  </span>
                </div>

                <h3 className="mt-8 text-3xl font-black sm:text-4xl">
                  School Marketplace
                </h3>

                <p className="mt-4 max-w-md text-sm leading-7 text-indigo-100 sm:text-base">
                  A dedicated student marketplace for Classes 9–12. Buy, sell,
                  discover and connect with verified school students across
                  Axyon.
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="font-black">Enter School Marketplace</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-indigo-600 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </a>

            <a
              href="/marketplace"
              className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-7 text-white shadow-2xl shadow-green-200 transition duration-300 hover:-translate-y-2 hover:shadow-green-300 sm:p-9"
            >
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                    🎓
                  </div>

                  <span className="rounded-full bg-white/15 px-4 py-2 text-[11px] font-black uppercase tracking-wider">
                    College
                  </span>
                </div>

                <h3 className="mt-8 text-3xl font-black sm:text-4xl">
                  Campus Marketplace
                </h3>

                <p className="mt-4 max-w-md text-sm leading-7 text-green-100 sm:text-base">
                  The Axyon college marketplace for buying, selling,
                  accommodation, barter, chat and student connections.
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="font-black">Enter Campus Marketplace</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-green-600 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </a>
          </div>

          <div className="mx-auto mt-6 max-w-5xl">
            <Link
              href="/home-tuition"
              className="group relative block overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-7 text-white shadow-2xl transition duration-300 hover:-translate-y-1 sm:p-9"
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-200">
                    Axyon Home Tuition
                  </div>

                  <h3 className="mt-5 text-3xl font-black sm:text-4xl">
                    Discover tutors. Build a verified tutoring profile.
                  </h3>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    Home Tuition connects students with verified Campus tutors.
                    Tutors can create a profile, choose their subjects and
                    teaching preferences, and purchase a subscription for
                    profile publication and access to the Axyon tutoring
                    marketplace.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-slate-300">
                    <span className="rounded-full bg-white/10 px-3 py-2">
                      Verified tutors
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-2">
                      Online & offline options
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-2">
                      Transparent subscription pricing
                    </span>
                  </div>
                </div>

                <span className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-black text-slate-950 transition group-hover:bg-indigo-50">
                  Explore Home Tuition →
                </span>
              </div>
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              [
                "🔐",
                "Verified Communities",
                "Student identity verification helps keep relevant communities trusted.",
              ],
              [
                "🤝",
                "Student First",
                "Axyon brings practical student-focused experiences together.",
              ],
              [
                "💳",
                "Secure Payments",
                "Paid Axyon services clearly display applicable plans and pricing before payment.",
              ],
            ].map(([icon, title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
              >
                <div className="text-2xl">{icon}</div>
                <p className="mt-2 text-sm font-black">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-black text-green-600">ABOUT AXYON</p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                A student-focused digital ecosystem.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-slate-600">
              <p>
                Axyon is designed to make everyday student interactions more
                organized, accessible and community-driven.
              </p>

              <p>
                The platform maintains separate experiences for school and
                college students while also providing services such as Home
                Tuition for students and verified Campus tutors.
              </p>

              <p>
                Axyon uses verification, community separation and platform
                controls to provide a more relevant and trusted experience for
                its users.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-black text-green-600">HOW AXYON WORKS</p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Different services. One ecosystem.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
              Each Axyon experience has a clear purpose and access flow.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "🏫",
                "School Marketplace",
                "A dedicated marketplace for verified Classes 9–12 students.",
              ],
              [
                "🎓",
                "Campus Marketplace",
                "A college-focused marketplace for student buying, selling and connections.",
              ],
              [
                "📚",
                "Home Tuition",
                "A tutoring marketplace connecting students with verified Campus tutors.",
              ],
              [
                "🔐",
                "Verification",
                "Relevant student and tutor verification supports safer community participation.",
              ],
            ].map(([icon, title, description]) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-black text-green-400">AXYON SUPPORT</p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Need help with Axyon?
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-slate-300">
                For account, platform, Home Tuition or payment-related
                questions, contact Axyon using the support details provided
                below.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <p className="text-sm font-black text-slate-400">
                CONTACT & SUPPORT
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"
              >
                Contact Axyon
              </Link>

              <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm text-slate-300">
                <Link href="/about" className="hover:text-white">
                  About Axyon →
                </Link>
                <Link href="/terms" className="hover:text-white">
                  Terms & Conditions →
                </Link>
                <Link href="/refund-policy" className="hover:text-white">
                  Refund & Cancellation Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
