"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const supportTopics = [
  { label: "Payment Issue", icon: "💳" },
  { label: "Order Problem", icon: "📦" },
  { label: "Product Report", icon: "🚨" },
  { label: "Account Issue", icon: "👤" },
  { label: "Technical Bug", icon: "🐞" },
  { label: "Other", icon: "💬" },
];

export default function SupportPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        setUser(data.user);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } catch {}
    }

    fetchUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject) {
      setMessage("Please select a support topic.");
      return;
    }

    if (!messageText.trim()) {
      setMessage("Please describe your issue.");
      return;
    }

    setLoading(true);
    setMessage("Submitting support ticket...");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message: messageText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to submit support ticket"
        );

        setLoading(false);
        return;
      }

      setMessage(
        "Support ticket submitted successfully!"
      );

      setSubject("");
      setMessageText("");
    } catch {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <Navbar />

      <section className="px-3 py-5 pb-20 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-700 via-green-600 to-emerald-400 p-6 text-white shadow-[0_20px_60px_rgba(22,163,74,0.16)] sm:rounded-[32px] sm:p-9 lg:p-11">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-950/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Axyon Help Center
              </span>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                How can we help?
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base sm:leading-7">
                Get help with orders, payments, verification,
                reports, listings, and technical issues.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <div className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold">
                  ⚡ Avg response: Under 24h
                </div>

                <div className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold">
                  🛡️ Student Safety Support
                </div>

                <div className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold">
                  📩 Ticket Tracking
                </div>
              </div>
            </div>
          </div>

          {/* TOPICS */}
          <div className="mt-6">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                Choose a topic
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                What do you need help with?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {supportTopics.map((topic) => {
                const selected = subject === topic.label;

                return (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => setSubject(topic.label)}
                    className={`rounded-[22px] border p-4 text-left transition-all duration-200 sm:p-5 ${
                      selected
                        ? "border-emerald-500 bg-emerald-50 shadow-[0_8px_25px_rgba(16,185,129,0.10)]"
                        : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${
                        selected
                          ? "bg-emerald-100"
                          : "bg-slate-50"
                      }`}
                    >
                      {topic.icon}
                    </div>

                    <p
                      className={`mt-3 text-xs font-black sm:text-sm ${
                        selected
                          ? "text-emerald-700"
                          : "text-slate-800"
                      }`}
                    >
                      {topic.label}
                    </p>

                    {selected && (
                      <p className="mt-1 text-[10px] font-bold text-emerald-600">
                        Selected
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* FORM */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_45px_rgba(15,23,42,0.05)] sm:p-7">
              <div className="mb-7">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                  Support request
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Submit a support ticket
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tell us what happened and our team will
                  review your issue.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* NAME */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Your Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className="
                      h-12 w-full rounded-2xl
                      border border-slate-200
                      bg-slate-50 px-4
                      text-sm text-slate-900
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    readOnly
                    disabled
                    className="
                      h-12 w-full rounded-2xl
                      border border-slate-200
                      bg-slate-100 px-4
                      text-sm text-slate-500
                      outline-none
                      cursor-not-allowed
                    "
                  />

                  <p className="mt-2 text-[10px] text-slate-400">
                    Your account email is used for this
                    support request.
                  </p>
                </div>

                {/* TOPIC */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Support Topic
                  </label>

                  <select
                    value={subject}
                    onChange={(e) =>
                      setSubject(e.target.value)
                    }
                    className="
                      h-12 w-full rounded-2xl
                      border border-slate-200
                      bg-slate-50 px-4
                      text-sm font-medium text-slate-900
                      outline-none transition
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  >
                    <option value="">
                      Select support topic
                    </option>

                    {supportTopics.map((topic) => (
                      <option
                        key={topic.label}
                        value={topic.label}
                      >
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Describe Your Issue
                  </label>

                  <textarea
                    rows={7}
                    placeholder="Describe your issue in detail..."
                    value={messageText}
                    onChange={(e) =>
                      setMessageText(e.target.value)
                    }
                    className="
                      min-h-[160px] w-full
                      resize-none rounded-2xl
                      border border-slate-200
                      bg-slate-50 px-4 py-3.5
                      text-sm leading-6 text-slate-900
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex w-full items-center
                    justify-center gap-2
                    rounded-2xl
                    bg-emerald-600
                    px-5 py-3.5
                    text-sm font-black text-white
                    shadow-[0_10px_30px_rgba(16,185,129,0.16)]
                    transition-all
                    hover:bg-emerald-700
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Ticket
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    message.includes("successfully")
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : message.includes("Submitting")
                        ? "border-slate-200 bg-slate-50 text-slate-600"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-5">
              {/* STATUS */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                  📋
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-900">
                  Ticket Status
                </h3>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />

                    <p className="text-xs font-bold text-slate-600">
                      Pending Review
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                    <p className="text-xs font-bold text-slate-600">
                      Under Investigation
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <p className="text-xs font-bold text-slate-600">
                      Resolved
                    </p>
                  </div>
                </div>
              </div>

              {/* SAFETY */}
              <div className="relative overflow-hidden rounded-[28px] bg-[#06100c] p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

                <div className="relative">
                  <span className="text-2xl">🛡️</span>

                  <h3 className="mt-4 text-xl font-black">
                    Campus Safety
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Report suspicious users, fake listings,
                    payment scams, or harassment.
                  </p>

                  <a
                    href="/marketplace"
                    className="
                      mt-5 inline-flex
                      items-center gap-2
                      rounded-xl
                      bg-emerald-600
                      px-4 py-3
                      text-xs font-black text-white
                      transition hover:bg-emerald-700
                    "
                  >
                    Explore Marketplace
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* QUICK NOTE */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Before submitting
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Include relevant order, listing or payment
                  details so the support team can understand
                  your issue faster.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}