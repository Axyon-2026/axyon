"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Email verification failed.");
          return;
        }

        setMessage("Email verified successfully. You can now login to your account.");
      } catch {
        setMessage("Something went wrong during email verification.");
      }
    }

    verifyEmail();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center py-24 px-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-3xl font-bold">Email Verification</h1>

          <p className="mt-4 text-slate-300">{message}</p>

          {message.includes("successfully") && (
            <a
              href="/login"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
            >
              Go to Login
            </a>
          )}
        </div>
      </section>
    </main>
  );
}