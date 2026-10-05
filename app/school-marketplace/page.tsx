"use client";

import { useEffect, useState } from "react";

type User = {
  marketplaceType?: "CAMPUS" | "SCHOOL";
  schoolVerified?: boolean;
  schoolVerificationStatus?: string;
};

export default function SchoolMarketplacePage() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          setChecking(false);
          return;
        }

        const data = await response.json();
        const currentUser = data.user;

        if (!currentUser) {
          setChecking(false);
          return;
        }

        if (currentUser.marketplaceType === "CAMPUS") {
          window.location.replace("/marketplace-home");
          return;
        }

        if (currentUser.marketplaceType === "SCHOOL") {
          setUser(currentUser);

          if (
            currentUser.schoolVerified === true &&
            currentUser.schoolVerificationStatus === "APPROVED"
          ) {
            window.location.replace(
              "/school-marketplace/home"
            );
            return;
          }
        }

        setChecking(false);
      } catch {
        setChecking(false);
      }
    }

    checkSession();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1">
            <img
              src="/logo.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="mt-5 text-sm font-bold text-slate-500">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  const pending =
    user?.marketplaceType === "SCHOOL" &&
    user.schoolVerificationStatus === "PENDING";

  const rejected =
    user?.marketplaceType === "SCHOOL" &&
    user.schoolVerificationStatus === "REJECTED";

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative w-full max-w-xl">
          <a
            href="/"
            className="mx-auto flex w-fit items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1">
              <img
                src="/logo.png"
                alt="Axyon"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-xl font-black">
                Axyon
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                School Marketplace
              </p>
            </div>
          </a>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl sm:p-10">
            {pending ? (
              <>
                <div className="text-4xl">⏳</div>

                <h1 className="mt-5 text-3xl font-black">
                  Verification in progress
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Your School account has been created and
                  is waiting for Axyon verification.
                </p>

                <a
                  href="/school-marketplace/login"
                  className="mt-7 block rounded-2xl bg-indigo-600 px-6 py-4 text-center text-sm font-black"
                >
                  School Login
                </a>
              </>
            ) : rejected ? (
              <>
                <div className="text-4xl">⚠️</div>

                <h1 className="mt-5 text-3xl font-black">
                  Verification needs attention
                </h1>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Your School account needs correction or
                  resubmission.
                </p>

                <a
                  href="/school-marketplace/create-account"
                  className="mt-7 block rounded-2xl bg-indigo-600 px-6 py-4 text-center text-sm font-black"
                >
                  Correct & Resubmit
                </a>
              </>
            ) : (
              <>
                <div className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-black text-indigo-300">
                  School Marketplace
                </div>

                <h1 className="mt-6 text-4xl font-black leading-tight">
                  Your school community.
                  <br />
                  <span className="text-indigo-400">
                    Your marketplace.
                  </span>
                </h1>

                <p className="mt-5 text-sm leading-7 text-slate-400">
                  A verified marketplace for Classes 9–12
                  students to buy, sell and connect
                  across schools.
                </p>

                <div className="mt-8 space-y-3">
                  <a
                    href="/school-marketplace/create-account"
                    className="block rounded-2xl bg-indigo-600 px-6 py-4 text-center text-sm font-black transition hover:bg-indigo-500"
                  >
                    Create School Account
                  </a>

                  <a
                    href="/school-marketplace/login"
                    className="block rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm font-black transition hover:bg-white/[0.08]"
                  >
                    School Login
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}