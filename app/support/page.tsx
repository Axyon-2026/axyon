"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

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
        const res = await fetch("/api/auth/me");

        if (!res.ok) return;

        const data = await res.json();

        setUser(data.user);

        setName(data.user.name || "");
        setEmail(data.user.email || "");
      } catch {}
    }

    fetchUser();
  }, []);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("Submitting support request...");

    try {
      const res = await fetch(
        "/api/support",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
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
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Support Center
            </h1>

            <p className="mt-3 text-slate-400">
              Need help with orders,
              payments, products, or
              account issues? Contact
              Axyon support.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <select
              value={subject}
              onChange={(e) =>
                setSubject(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            >
              <option value="">
                Select Support Topic
              </option>

              <option value="Payment Issue">
                Payment Issue
              </option>

              <option value="Order Problem">
                Order Problem
              </option>

              <option value="Product Report">
                Product Report
              </option>

              <option value="Account Issue">
                Account Issue
              </option>

              <option value="Seller Complaint">
                Seller Complaint
              </option>

              <option value="Buyer Complaint">
                Buyer Complaint
              </option>

              <option value="Technical Bug">
                Technical Bug
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            <textarea
              placeholder="Describe your issue in detail..."
              rows={6}
              value={messageText}
              onChange={(e) =>
                setMessageText(
                  e.target.value
                )
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none resize-none"
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {loading
                ? "Submitting..."
                : "Submit Support Ticket"}
            </button>
          </form>

          {message && (
            <p className="mt-5 text-sm text-slate-300">
              {message}
            </p>
          )}

          <div className="mt-10 border-t border-slate-800 pt-6">
            <h2 className="text-xl font-semibold">
              Contact Information
            </h2>

            <div className="mt-4 space-y-3 text-slate-400">
              <p>
                Email:
                {" "}
                support@axyon.in
              </p>

              <p>
                Response Time:
                {" "}
                Usually within 24 hours
              </p>

              <p>
                Platform:
                {" "}
                Axyon Campus Marketplace
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}