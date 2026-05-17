"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function StudentVerificationPage() {
  const [user, setUser] =
    useState<any>(null);

  const [collegeId, setCollegeId] =
    useState<File | null>(null);

  const [selfie, setSelfie] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

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

    } catch {}
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !collegeId ||
      !selfie
    ) {
      setMessage(
        "Please upload required documents"
      );

      return;
    }

    setLoading(true);

    setMessage(
      "Submitting verification..."
    );

    try {

      const formData =
        new FormData();

      formData.append(
        "collegeId",
        collegeId
      );

      formData.append(
        "selfie",
        selfie
      );

      const res =
        await fetch(
          "/api/student-verification",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        setMessage(
          data.message ||
            "Verification failed"
        );

        setLoading(false);

        return;
      }

      setMessage(
        "Verification submitted successfully!"
      );

      fetchUser();

    } catch {

      setMessage(
        "Something went wrong"
      );

    }

    setLoading(false);
  }

  const status =
    user?.studentVerificationStatus;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-400 text-white p-8 sm:p-10 shadow-xl shadow-green-200">
            <span className="inline-flex bg-white/20 border border-white/30 rounded-full px-4 py-2 text-xs font-black">
              Campus Trust System
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl font-black">
              Student Verification
            </h1>

            <p className="mt-4 text-green-50 max-w-2xl leading-7">
              Verify your student identity to unlock listings,
              safer transactions, and trusted marketplace access.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap gap-3 mb-8">
                <div
                  className={`
                    px-5
                    py-3
                    rounded-full
                    text-sm
                    font-black

                    ${
                      status ===
                      "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : status ===
                          "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : status ===
                          "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }
                  `}
                >
                  {status ===
                  "APPROVED"
                    ? "✅ Verified"
                    : status ===
                      "PENDING"
                    ? "⏳ Pending Review"
                    : status ===
                      "REJECTED"
                    ? "❌ Rejected"
                    : "⚡ Not Verified"}
                </div>

                {user?.college && (
                  <div className="px-5 py-3 rounded-full text-sm font-black bg-blue-100 text-blue-700">
                    🎓 {user.college}
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black">
                Verify Your Identity
              </h2>

              <p className="mt-3 text-slate-500 leading-7">
                Upload your college ID and a selfie for secure student verification.
              </p>

              {status !==
                "APPROVED" && (
                <form
                  onSubmit={
                    handleSubmit
                  }

                  className="mt-8 space-y-6"
                >
                  <div>
                    <label className="block mb-3 text-sm font-black text-slate-700">
                      College ID Card
                    </label>

                    <div
                      className="
                      border-2
                      border-dashed
                      border-slate-300
                      hover:border-green-400
                      bg-slate-50
                      rounded-[2rem]
                      p-8
                      text-center
                    "
                    >
                      <div className="text-5xl">
                        🎓
                      </div>

                      <p className="mt-4 font-black text-slate-800">
                        Upload College ID
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        JPG, PNG or WEBP
                      </p>

                      <input
                        type="file"

                        accept="image/*"

                        onChange={(e) =>
                          setCollegeId(
                            e.target
                              .files?.[0] ||
                              null
                          )
                        }

                        className="mt-5 block w-full text-sm text-slate-500"
                      />

                      {collegeId && (
                        <p className="mt-4 text-sm font-semibold text-green-700">
                          {collegeId.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-3 text-sm font-black text-slate-700">
                      Selfie Verification
                    </label>

                    <div
                      className="
                      border-2
                      border-dashed
                      border-slate-300
                      hover:border-green-400
                      bg-slate-50
                      rounded-[2rem]
                      p-8
                      text-center
                    "
                    >
                      <div className="text-5xl">
                        📸
                      </div>

                      <p className="mt-4 font-black text-slate-800">
                        Upload Clear Selfie
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Match your college ID photo
                      </p>

                      <input
                        type="file"

                        accept="image/*"

                        capture="user"

                        onChange={(e) =>
                          setSelfie(
                            e.target
                              .files?.[0] ||
                              null
                          )
                        }

                        className="mt-5 block w-full text-sm text-slate-500"
                      />

                      {selfie && (
                        <p className="mt-4 text-sm font-semibold text-green-700">
                          {selfie.name}
                        </p>
                      )}
                    </div>
                  </div>

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
                      : "Submit Verification"}
                  </button>

                  {message && (
                    <p className="text-sm font-semibold text-slate-600">
                      {message}
                    </p>
                  )}
                </form>
              )}

              {status ===
                "APPROVED" && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-[2rem] p-6">
                  <h3 className="text-2xl font-black text-green-700">
                    Verification Complete
                  </h3>

                  <p className="mt-3 text-green-700 leading-7">
                    Your account is verified. You can now create listings,
                    chat with students, and access all marketplace features.
                  </p>

                  <a
                    href="/create-product"

                    className="
                      inline-block
                      mt-5
                      bg-green-600
                      hover:bg-green-700
                      text-white
                      px-6
                      py-3
                      rounded-full
                      font-black
                    "
                  >
                    Create Listing
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-2xl font-black">
                  Why Verify?
                </h3>

                <ul className="mt-5 space-y-4 text-slate-600">
                  <li>
                    • Unlock product listings
                  </li>

                  <li>
                    • Build buyer trust
                  </li>

                  <li>
                    • Reduce fake accounts
                  </li>

                  <li>
                    • Safer campus transactions
                  </li>

                  <li>
                    • Access verified badge
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 text-white rounded-[2rem] p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_40%)]" />

                <div className="relative">
                  <h3 className="text-2xl font-black">
                    Trusted Campus Marketplace
                  </h3>

                  <p className="mt-4 text-slate-300 leading-7">
                    Axyon focuses on verified student-to-student trust to make campus transactions safer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}