"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const supportTopics = [
  {
    label: "Payment Issue",
    icon: "💳",
  },

  {
    label: "Order Problem",
    icon: "📦",
  },

  {
    label: "Product Report",
    icon: "🚨",
  },

  {
    label: "Account Issue",
    icon: "👤",
  },

  {
    label: "Technical Bug",
    icon: "🐞",
  },

  {
    label: "Other",
    icon: "💬",
  },
];

export default function SupportPage() {
  const [user, setUser] =
    useState<any>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [
    messageText,
    setMessageText,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res =
          await fetch(
            "/api/auth/me"
          );

        if (!res.ok) return;

        const data =
          await res.json();

        setUser(data.user);

        setName(
          data.user.name || ""
        );

        setEmail(
          data.user.email || ""
        );

      } catch {}
    }

    fetchUser();
  }, []);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    setMessage(
      "Submitting support ticket..."
    );

    try {
      const res =
        await fetch(
          "/api/support",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
  subject,
  message: messageText,
}),
          }
        );

      const data =
        await res.json();

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

      setMessage(
        "Something went wrong"
      );

    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-400 text-white p-8 sm:p-10 shadow-xl shadow-green-200">
            <span className="inline-flex bg-white/20 border border-white/30 rounded-full px-4 py-2 text-xs font-black">
              Axyon Help Center
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl font-black">
              Support Center
            </h1>

            <p className="mt-4 text-green-50 max-w-2xl leading-7">
              Get help with orders, payments, verification,
              reports, listings, and technical issues.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm font-bold">
                ⚡ Avg response: Under 24h
              </div>

              <div className="bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm font-bold">
                🛡️ Student Safety Support
              </div>

              <div className="bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm font-bold">
                📩 Ticket Tracking
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {supportTopics.map(
              (topic) => (
                <button
                  key={topic.label}

                  onClick={() =>
                    setSubject(
                      topic.label
                    )
                  }

                  className={`
                    bg-white
                    border
                    rounded-3xl
                    p-5
                    text-left
                    shadow-sm
                    transition
                    hover:-translate-y-1

                    ${
                      subject ===
                      topic.label
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200"
                    }
                  `}
                >
                  <div className="text-3xl">
                    {topic.icon}
                  </div>

                  <p className="mt-4 text-sm font-black">
                    {topic.label}
                  </p>
                </button>
              )
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-black">
                  Submit Support Ticket
                </h2>

                <p className="mt-2 text-slate-500">
                  Our team will review your issue and respond as quickly as possible.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }

                  className="
                    w-full
                    px-5
                    py-4
                    rounded-2xl
                    bg-slate-100
                    border
                    border-slate-200
                    outline-none
                    focus:bg-white
                    focus:border-green-500
                  "
                />

                <input
  type="email"
  value={email}
  readOnly
  disabled
  className="
    w-full
    px-5
    py-4
    rounded-2xl
    bg-slate-200
    border
    border-slate-300
    outline-none
    text-slate-500
    cursor-not-allowed
  "
/>

                <select
                  value={subject}
                  onChange={(e) =>
                    setSubject(
                      e.target.value
                    )
                  }

                  className="
                    w-full
                    px-5
                    py-4
                    rounded-2xl
                    bg-slate-100
                    border
                    border-slate-200
                    outline-none
                    focus:bg-white
                    focus:border-green-500
                  "
                >
                  <option value="">
                    Select support topic
                  </option>

                  {supportTopics.map(
                    (topic) => (
                      <option
                        key={
                          topic.label
                        }

                        value={
                          topic.label
                        }
                      >
                        {topic.label}
                      </option>
                    )
                  )}
                </select>

                <textarea
                  rows={7}

                  placeholder="Describe your issue in detail..."

                  value={messageText}

                  onChange={(e) =>
                    setMessageText(
                      e.target.value
                    )
                  }

                  className="
                    w-full
                    px-5
                    py-4
                    rounded-2xl
                    bg-slate-100
                    border
                    border-slate-200
                    outline-none
                    resize-none
                    focus:bg-white
                    focus:border-green-500
                  "
                />

                <button
                  disabled={loading}

                  className="
                    w-full
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    py-4
                    rounded-full
                    font-black
                    shadow-lg
                    shadow-green-100
                    disabled:opacity-60
                  "
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Ticket"}
                </button>
              </form>

              {message && (
                <p className="mt-5 text-sm font-semibold text-slate-600">
                  {message}
                </p>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-xl font-black">
                  Ticket Status
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />

                    <p className="text-sm font-semibold text-slate-600">
                      Pending Review
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />

                    <p className="text-sm font-semibold text-slate-600">
                      Under Investigation
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />

                    <p className="text-sm font-semibold text-slate-600">
                      Resolved
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 text-white rounded-[2rem] p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_40%)]" />

                <div className="relative">
                  <h3 className="text-2xl font-black">
                    Campus Safety
                  </h3>

                  <p className="mt-3 text-slate-300 leading-7">
                    Report suspicious users, fake listings, payment scams, or harassment.
                  </p>

                  <a
                    href="/marketplace"

                    className="
                      inline-block
                      mt-5
                      bg-green-600
                      hover:bg-green-700
                      px-5
                      py-3
                      rounded-full
                      font-black
                    "
                  >
                    Explore Marketplace
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}