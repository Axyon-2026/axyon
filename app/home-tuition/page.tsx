"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Tutor = {
  id: string;
  displayName: string;
  photoUrl: string | null;
  institution: string | null;
  college: string | null;
  bio: string;
  subjects: string[];
  classes: string[];
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  location: string | null;
  availability: string;
  hourlyFee: number;
  demoAvailable: boolean;
  rating: number;
  reviewCount: number;
  contactAvailable: boolean;
};

type Plan = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  durationDays: number;
  isActive?: boolean;
  offerEnabled?: boolean;
  offerActive?: boolean;
  discountPercent?: number;
  offerMessage?: string | null;
  offerEndsAt?: string | null;
};

type ApiResponse = {
  tutors?: Tutor[];
  error?: string;
};

type PlansResponse = {
  plans?: Plan[];
  error?: string;
};

const subjectOptions = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
];

const classOptions = ["9", "10", "11", "12"];

function formatDate(date: string | null | undefined) {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HomeTuitionPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [teachingMode, setTeachingMode] = useState("");
  const [maxFee, setMaxFee] = useState("");

  async function loadTutors() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (subject) params.set("subject", subject);
      if (classLevel) params.set("class", classLevel);
      if (teachingMode) params.set("teachingMode", teachingMode);
      if (maxFee) params.set("maxFee", maxFee);

      const response = await fetch(
        `/api/home-tuition/tutors?${params.toString()}`,
        { cache: "no-store" }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load tutors");
      }

      setTutors(data.tutors || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tutors right now."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPlans() {
    try {
      setPlansLoading(true);

      const response = await fetch("/api/home-tuition/plans", {
        cache: "no-store",
      });

      const data: PlansResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load subscription plans"
        );
      }

      setPlans(
        (data.plans || []).filter(
          (plan) => plan.isActive !== false
        )
      );
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }

  useEffect(() => {
    loadTutors();
    loadPlans();
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    loadTutors();
  }

  function clearFilters() {
    setSearch("");
    setSubject("");
    setClassLevel("");
    setTeachingMode("");
    setMaxFee("");

    setTimeout(() => {
      loadTutors();
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-black tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">
              A
            </span>
            <span>Axyon</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/home-tuition/tutor"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Become a Tutor
            </Link>

            <Link
              href="/marketplace"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.32),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.2),transparent_32%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Verified Campus tutors
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the right tutor for your next academic goal.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Discover verified student tutors for Classes 9–12. Compare
              subjects, teaching modes, fees, availability and reviews in one
              place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#subscription-plans"
                className="rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
              >
                View Subscription Plans
              </a>

              <Link
                href="/home-tuition/tutor"
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Become a Tutor
              </Link>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-9 rounded-2xl border border-white/10 bg-white p-3 shadow-2xl sm:p-4"
          >
            <div className="grid gap-3 lg:grid-cols-[1.7fr_1fr_1fr_1fr_auto]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tutor, subject or institution..."
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">All subjects</option>
                {subjectOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">All classes</option>
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    Class {item}
                  </option>
                ))}
              </select>

              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">Any mode</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="BOTH">Online + Offline</option>
              </select>

              <button
                type="submit"
                className="h-12 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white transition hover:bg-indigo-500 active:scale-[0.98]"
              >
                Search
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">
                Maximum hourly fee
              </span>

              <input
                value={maxFee}
                onChange={(e) =>
                  setMaxFee(e.target.value.replace(/\D/g, ""))
                }
                inputMode="numeric"
                placeholder="e.g. 500"
                className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-indigo-400"
              />

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Clear filters
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-indigo-600">How it works</p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            A clear tutoring service for students and tutors
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Axyon Home Tuition connects students with verified Campus tutors.
            Tutors purchase a subscription when they want their tutoring
            profile published and available through the Axyon service.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            [
              "01",
              "Create your profile",
              "Set your subjects, classes and teaching preferences.",
            ],
            [
              "02",
              "Choose a plan",
              "Review the available Home Tuition subscription plans and pricing.",
            ],
            [
              "03",
              "Get listed",
              "After successful payment and activation, your eligible tutor profile can be published.",
            ],
            [
              "04",
              "Connect",
              "Students can review your profile and use the available contact options.",
            ],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-xs font-black text-indigo-600">
                {number}
              </span>

              <h3 className="mt-3 font-black">{title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-indigo-100 bg-indigo-50 p-6 sm:p-7">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                What is paid for?
              </p>
              <p className="mt-2 text-sm leading-6 text-indigo-950">
                Home Tuition subscription plans cover tutor profile publication
                and access to the Axyon tutoring marketplace during the
                applicable subscription period.
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Before payment
              </p>
              <p className="mt-2 text-sm leading-6 text-indigo-950">
                The applicable plan price, duration and any active promotional
                pricing are displayed before checkout.
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Payment provider
              </p>
              <p className="mt-2 text-sm leading-6 text-indigo-950">
                Payments are processed through the configured payment provider.
                Axyon records the applicable subscription and payment status.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="subscription-plans"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-indigo-600">
              Home Tuition subscriptions
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Choose your tutor subscription plan
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Current pricing and promotional offers are shown here before
              proceeding to the subscription flow.
            </p>
          </div>

          {plansLoading && (
            <div className="mx-auto mt-9 grid max-w-4xl gap-5 sm:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          )}

          {!plansLoading && plans.length > 0 && (
            <div className="mx-auto mt-9 grid max-w-4xl gap-5 sm:grid-cols-2">
              {plans.map((plan) => {
                const offerActive =
                  plan.offerActive === true &&
                  plan.originalPrice !== undefined &&
                  plan.originalPrice > plan.price;

                const originalPrice =
                  plan.originalPrice ?? plan.price;

                const expiry = offerActive
                  ? formatDate(plan.offerEndsAt)
                  : null;

                return (
                  <div
                    key={plan.id}
                    className={`relative overflow-hidden rounded-3xl border p-7 shadow-sm ${
                      offerActive
                        ? "border-indigo-200 bg-gradient-to-br from-white via-white to-indigo-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {offerActive && (
                      <div className="absolute left-0 right-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-white">
                        <span className="text-xs font-black uppercase tracking-wider">
                          Limited-time offer
                        </span>

                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black">
                          {plan.discountPercent ?? 0}% OFF
                        </span>
                      </div>
                    )}

                    <div className={offerActive ? "mt-9" : ""}>
                      <p className="text-sm font-bold text-indigo-600">
                        {plan.name}
                      </p>

                      <div className="mt-3 flex flex-wrap items-end gap-3">
                        <span className="text-4xl font-black">
                          ₹{plan.price.toLocaleString("en-IN")}
                        </span>

                        {offerActive && (
                          <>
                            <span className="pb-1 text-lg font-bold text-slate-400 line-through">
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>

                            <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                              Save {plan.discountPercent ?? 0}%
                            </span>
                          </>
                        )}

                        <span className="w-full text-sm text-slate-500">
                          for {plan.durationDays} days
                        </span>
                      </div>

                      {offerActive && plan.offerMessage && (
                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                          <p className="text-sm font-bold text-indigo-900">
                            {plan.offerMessage}
                          </p>

                          {expiry && (
                            <p className="mt-1 text-xs font-semibold text-indigo-600">
                              Offer ends {expiry}
                            </p>
                          )}
                        </div>
                      )}

                      {plan.description && (
                        <p className="mt-4 text-sm leading-6 text-slate-500">
                          {plan.description}
                        </p>
                      )}

                      <div className="mt-6 space-y-2 text-sm text-slate-600">
                        <p>✓ Tutor profile publication</p>
                        <p>✓ Visibility to students</p>
                        <p>✓ Active tutor listing</p>
                        <p>✓ Student contact access</p>
                      </div>

                      <Link
                        href="/home-tuition/subscribe"
                        className="mt-7 flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white transition hover:bg-indigo-600"
                      >
                        {offerActive
                          ? `Get offer · ₹${plan.price.toLocaleString(
                              "en-IN"
                            )}`
                          : "Choose this plan"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!plansLoading && plans.length === 0 && (
            <div className="mx-auto mt-9 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">
              <p className="font-bold text-slate-800">
                Subscription plans are being updated.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You can still explore available tutors and create your tutor
                profile.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Home Tuition
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Tutors available now
            </h2>
          </div>

          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {tutors.length} tutor{tutors.length === 1 ? "" : "s"} found
            </p>
          )}
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[330px] animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-800">{error}</p>

            <button
              onClick={loadTutors}
              className="mt-4 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && tutors.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🔎
            </div>

            <h3 className="mt-5 text-xl font-black">
              No tutors match these filters
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another subject, class, teaching mode or fee range.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white"
            >
              Reset search
            </button>
          </div>
        )}

        {!loading && !error && tutors.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => (
              <article
                key={tutor.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {tutor.photoUrl ? (
                      <img
                        src={tutor.photoUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-500">
                        {tutor.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black">
                        {tutor.displayName}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {tutor.institution ||
                          tutor.college ||
                          "Verified Campus Tutor"}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <span className="font-bold text-amber-500">★</span>

                        <span className="font-bold">
                          {tutor.rating > 0
                            ? tutor.rating.toFixed(1)
                            : "New"}
                        </span>

                        {tutor.reviewCount > 0 && (
                          <span className="text-slate-400">
                            ({tutor.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-600">
                    {tutor.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tutor.subjects.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Classes
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {tutor.classes.length
                          ? tutor.classes.join(", ")
                          : "9–12"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Starting
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        ₹{tutor.hourlyFee}/hr
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                      {tutor.teachingMode === "BOTH"
                        ? "Online + Offline"
                        : tutor.teachingMode === "ONLINE"
                        ? "Online"
                        : "Offline"}
                    </span>

                    {tutor.demoAvailable && (
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                        Demo available
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/home-tuition/tutors/${tutor.id}`}
                    className="mt-5 flex h-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white transition hover:bg-indigo-600"
                  >
                    View tutor
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-indigo-600 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold text-indigo-200">
                For Campus students
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Teach what you know. Build your tutoring profile.
              </h2>

              <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                Create a verified tutor profile, choose your subjects and
                teaching preferences, and reach students looking for help.
              </p>
            </div>

            <Link
              href="/home-tuition/tutor"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-black text-indigo-700 transition hover:bg-indigo-50"
            >
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-black text-slate-900">
                Axyon Home Tuition
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Axyon provides a tutoring marketplace where eligible Campus
                tutors can publish profiles and students can discover tutoring
                options.
              </p>
            </div>

            <div>
              <p className="text-sm font-black text-slate-900">
                Payment & subscription
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Subscription pricing and any applicable promotional offer are
                shown before payment. Cancellation and refund terms are
                available in the published policy.
              </p>
            </div>

            <div>
              <p className="text-sm font-black text-slate-900">
                Need assistance?
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                <Link className="hover:text-indigo-600" href="/contact">
                  Contact
                </Link>
                <Link className="hover:text-indigo-600" href="/help">
                  Help & Support
                </Link>
                <Link className="hover:text-indigo-600" href="/terms">
                  Terms
                </Link>
                <Link
                  className="hover:text-indigo-600"
                  href="/privacy"
                >
                  Privacy
                </Link>
                <Link
                  className="hover:text-indigo-600"
                  href="/refund-policy"
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-400">
            Axyon Home Tuition subscription payments are for the applicable
            Axyon platform service described in the selected plan. Tutor-student
            tuition arrangements are separate from the Axyon platform
            subscription.
          </p>
        </div>
      </section>
    </main>
  );
}