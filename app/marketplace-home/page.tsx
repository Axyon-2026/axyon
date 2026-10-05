"use client";

import { useEffect, useState } from "react";
import HomeAdBanner from "@/components/HomeAdBanner";

type User = {
  name?: string;
  marketplaceType?: string;
  studentVerified?: boolean;
};

export default function CampusMarketplaceHome() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();

          if (data.user?.marketplaceType === "SCHOOL") {
            window.location.replace("/school-marketplace/home");
            return;
          }

          if (data.user?.marketplaceType === "CAMPUS") {
            setUser(data.user);
          }
        }
      } catch {
        // Campus Home remains publicly accessible.
      } finally {
        setChecking(false);
      }
    }

    loadUser();
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
              <img
                src="/icon.png"
                alt="Axyon"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mx-auto mt-5 h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-green-500" />
            </div>

            <p className="mt-4 text-sm font-bold text-slate-500">
              Opening Campus Marketplace...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8f7] text-slate-950">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-green-200/40 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-[1500px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-24">
          <div className="max-w-5xl">
            {/* BADGE */}
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Axyon Campus Marketplace
            </div>

            {/* HEADING */}
            <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
              Campus life,
              <br />
              <span className="text-green-600">made easier.</span>
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-500 sm:text-lg">
              Buy and sell useful student essentials, discover accommodation,
              connect with other students, and find better campus deals in one
              place.
            </p>

            {/* WELCOME */}
            {user?.name && (
              <p className="mt-5 text-sm font-black text-slate-400">
                Welcome back <span className="text-slate-700">{user.name}</span>
                .
              </p>
            )}

            {/* ACTIONS */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="/marketplace"
                className="rounded-2xl bg-slate-950 px-8 py-4 text-center text-sm font-black text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Browse Marketplace
              </a>

              <a
                href="/rooms"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"
              >
                Find Accommodation
              </a>

              <a
                href="/home-tuition"
                className="rounded-2xl border border-indigo-200 bg-indigo-50 px-8 py-4 text-center text-sm font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-100"
              >
                Home Tuition
              </a>

              {user ? (
                <a
                  href="/dashboard"
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100"
                >
                  Dashboard
                </a>
              ) : (
                <a
                  href="/register"
                  className="rounded-2xl border border-green-200 bg-green-50 px-8 py-4 text-center text-sm font-black text-green-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-100"
                >
                  Join Campus
                </a>
              )}
            </div>

            {/* TRUST STRIP */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-400">
              <span>✓ Student-focused</span>
              <span>✓ Campus listings</span>
              <span>✓ Direct chat</span>
              <span>✓ Verified student community</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ADS
      ========================================================= */}
      <HomeAdBanner />

      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600">
              Explore Axyon
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Your campus, connected.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-400">
            Everything students use most, organised into simple experiences.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon="🛍️"
            title="Buy & Sell"
            text="Books, electronics, furniture, notes and everyday student essentials."
            href="/marketplace"
            action="Browse listings"
            featured
          />

          <FeatureCard
            icon="🏠"
            title="Accommodation"
            text="Explore rooms, PGs, hostels and shared student accommodation."
            href="/rooms"
            action="Find a place"
          />

          <FeatureCard
            icon="🤝"
            title="Barter"
            text="Exchange useful items directly with other students."
            href="/barter"
            action="Coming soon"
            comingSoon
          />

          <FeatureCard
            icon="🔁"
            title="Rentals"
            text="Rent books, gadgets and student essentials inside Axyon."
            href="/rentals"
            action="Coming soon"
            comingSoon
          />
        </div>
      </section>

      {/* =========================================================
          ACCOMMODATION
      ========================================================= */}
      <section className="mx-auto max-w-[1500px] px-5 pb-16 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-100 blur-3xl" />

          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-green-700">
                <span>🏠</span>
                Campus Accommodation
              </div>

              <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Find a place that works for you.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Explore student rooms, PGs, hostels and shared accommodation
                around your campus.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/rooms"
                  className="rounded-2xl bg-slate-950 px-7 py-4 text-center text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Explore Accommodation →
                </a>

                {!user && (
                  <a
                    href="/register"
                    className="rounded-2xl border border-green-200 bg-green-50 px-7 py-4 text-center text-sm font-black text-green-700 transition hover:border-green-300 hover:bg-green-100"
                  >
                    Join Campus
                  </a>
                )}

                {user && (
                  <a
                    href="/create-room"
                    className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center text-sm font-black text-slate-700 transition hover:border-green-200 hover:bg-green-50"
                  >
                    List a Room
                  </a>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[430px] lg:grid-cols-1">
              <AccommodationPoint
                icon="📍"
                title="Nearby"
                text="Explore places around your campus."
              />

              <AccommodationPoint
                icon="🛏️"
                title="Student-focused"
                text="Built around student accommodation."
              />

              <AccommodationPoint
                icon="💬"
                title="Direct contact"
                text="Connect directly with the owner."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUE STRIP
      ========================================================= */}
      <section className="mx-auto max-w-[1500px] px-5 pb-16 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,0.12)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400">
                Why students use Axyon
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Less searching.
                <br />
                More student life.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Axyon brings campus buying, selling, accommodation and student
                connections together without making the experience complicated.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[560px]">
              <ValueCard
                icon="🛡️"
                title="Trust"
                text="Built around student communities."
              />

              <ValueCard
                icon="⚡"
                title="Simple"
                text="Find what you need quickly."
              />

              <ValueCard
                icon="💬"
                title="Connect"
                text="Chat directly with students."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section className="mx-auto max-w-[1500px] px-5 pb-16 sm:px-8 lg:px-10">
        <div className="rounded-[2.5rem] border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-7 sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-700">
            How Axyon works
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              icon="🔎"
              title="Discover"
              text="Browse products, accommodation and student opportunities."
            />

            <Step
              number="02"
              icon="💬"
              title="Connect"
              text="Chat with students and ask questions before making a deal."
            />

            <Step
              number="03"
              icon="🤝"
              title="Exchange"
              text="Meet, exchange or complete your transaction responsibly."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-green-500 p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-green-950">
                Start exploring
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Find something useful today.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-green-950/70">
                Explore listings from the Axyon campus community and discover
                what students around you are offering.
              </p>
            </div>

            <a
              href="/marketplace"
              className="shrink-0 rounded-2xl bg-slate-950 px-7 py-4 text-center text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Explore Marketplace →
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-xs font-medium text-slate-400">
        Axyon Campus Marketplace · Built for student life
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  href,
  action,
  featured = false,
  comingSoon = false,
}: {
  icon: string;
  title: string;
  text: string;
  href: string;
  action: string;
  featured?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <a
      href={href}
      className={`group relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 ${
        featured
          ? "border-green-200 hover:border-green-400"
          : "border-slate-200 hover:border-green-200"
      }`}
    >
      {featured && (
        <div className="absolute right-4 top-4 rounded-full bg-green-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-green-700">
          Popular
        </div>
      )}

      {comingSoon && (
        <div className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
          Soon
        </div>
      )}

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl ring-1 ring-slate-100 transition group-hover:scale-105">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>

      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
        {text}
      </p>

      <p
        className={`mt-6 text-xs font-black ${
          comingSoon ? "text-slate-400" : "text-green-600"
        }`}
      >
        {action} →
      </p>
    </a>
  );
}

function AccommodationPoint({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-black text-slate-950">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <div className="text-xl">{icon}</div>

      <p className="mt-3 text-sm font-black text-white">{title}</p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-green-100">
        {icon}
      </div>

      <div>
        <span className="text-[10px] font-black tracking-widest text-green-600">
          {number}
        </span>

        <h3 className="mt-1 text-lg font-black text-slate-950">{title}</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
