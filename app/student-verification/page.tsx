"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";

export default function StudentVerificationPage() {
  const [user, setUser] = useState<any>(null);

  const [collegeId, setCollegeId] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const [collegeIdPreview, setCollegeIdPreview] = useState("");
  const [selfiePreview, setSelfiePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const collegeIdInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("FETCH USER ERROR:", error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  /*
   * Create preview URLs only when files change.
   * Revoke them afterwards so repeated image selections
   * do not leak object URLs.
   */
  useEffect(() => {
    if (!collegeId) {
      setCollegeIdPreview("");
      return;
    }

    const url = URL.createObjectURL(collegeId);
    setCollegeIdPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [collegeId]);

  useEffect(() => {
    if (!selfie) {
      setSelfiePreview("");
      return;
    }

    const url = URL.createObjectURL(selfie);
    setSelfiePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selfie]);

  function handleCollegeIdChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] || null;

    setMessage("");

    if (!file) {
      setCollegeId(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("College ID must be an image.");
      e.target.value = "";
      setCollegeId(null);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setMessage(
        "College ID image must be smaller than 15MB."
      );
      e.target.value = "";
      setCollegeId(null);
      return;
    }

    setCollegeId(file);
  }

  function handleSelfieChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] || null;

    setMessage("");

    if (!file) {
      setSelfie(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Selfie must be an image.");
      e.target.value = "";
      setSelfie(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage(
        "Selfie image must be smaller than 10MB."
      );
      e.target.value = "";
      setSelfie(null);
      return;
    }

    setSelfie(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!collegeId || !selfie) {
      setMessage(
        "Please upload both your College ID and selfie."
      );
      return;
    }

    if (collegeId.size > 15 * 1024 * 1024) {
      setMessage(
        "College ID image must be smaller than 15MB."
      );
      return;
    }

    if (selfie.size > 10 * 1024 * 1024) {
      setMessage(
        "Selfie image must be smaller than 10MB."
      );
      return;
    }

    setLoading(true);
    setMessage("📸 Preparing your images...");

    try {
      const compressedCollegeId =
        await imageCompression(collegeId, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1800,
          useWebWorker: true,
        });

      const compressedSelfie =
        await imageCompression(selfie, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });

      const formData = new FormData();

      formData.append(
        "collegeId",
        compressedCollegeId
      );

      formData.append(
        "selfie",
        compressedSelfie
      );

      setMessage("☁️ Uploading documents...");

      const res = await fetch(
        "/api/student-verification",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message || "Verification failed."
        );
        return;
      }

      setMessage(
        "✅ Verification submitted successfully!"
      );

      setCollegeId(null);
      setSelfie(null);

      if (collegeIdInputRef.current) {
        collegeIdInputRef.current.value = "";
      }

      if (selfieInputRef.current) {
        selfieInputRef.current.value = "";
      }

      await fetchUser();
    } catch (error: any) {
      console.error(
        "STUDENT VERIFICATION ERROR:",
        error
      );

      setMessage(
        error?.message || "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const status =
    user?.studentVerificationStatus;

  const canSubmit =
    Boolean(collegeId && selfie) && !loading;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">

          {/* HERO */}

          <div className="rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-400 p-8 text-white shadow-xl shadow-green-200 sm:p-10">
            <span className="inline-flex rounded-full border border-white/30 bg-white/20 px-4 py-2 text-xs font-black">
              Campus Trust System
            </span>

            <h1 className="mt-5 text-4xl font-black sm:text-5xl">
              Student Verification
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-green-50">
              Verify your student identity to unlock listings,
              safer transactions, and trusted marketplace access.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

            {/* VERIFICATION FORM */}

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              {/* STATUS */}

              <div className="mb-8 flex flex-wrap gap-3">
                <div
                  className={`
                    rounded-full
                    px-5
                    py-3
                    text-sm
                    font-black
                    ${
                      status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                    }
                  `}
                >
                  {status === "APPROVED"
                    ? "✅ Verified"
                    : status === "PENDING"
                      ? "⏳ Pending Review"
                      : status === "REJECTED"
                        ? "❌ Rejected"
                        : "⚡ Not Verified"}
                </div>

                {user?.college && (
                  <div className="rounded-full bg-blue-100 px-5 py-3 text-sm font-black text-blue-700">
                    🎓 {user.college}
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black">
                Verify Your Identity
              </h2>

              <p className="mt-3 leading-7 text-slate-500">
                Upload a clear image of your college ID and a
                recent selfie so the Axyon team can verify your
                student identity.
              </p>

              {status !== "APPROVED" && (
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-7"
                >

                  {/* COLLEGE ID */}

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="text-sm font-black text-slate-800">
                        College ID Card
                      </label>

                      <span className="text-xs font-bold text-slate-400">
                        Required
                      </span>
                    </div>

                    <div
                      className={`
                        overflow-hidden
                        rounded-[2rem]
                        border-2
                        border-dashed
                        transition
                        ${
                          collegeId
                            ? "border-green-500 bg-green-50"
                            : "border-slate-300 bg-slate-50 hover:border-green-400"
                        }
                      `}
                    >
                      {collegeIdPreview ? (
                        <div className="p-4">
                          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-green-200 bg-white">
                            <img
                              src={collegeIdPreview}
                              alt="College ID preview"
                              className="max-h-80 w-full object-contain p-2"
                            />
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-green-700">
                                ✓ College ID selected
                              </p>

                              <p className="mt-1 truncate text-sm text-slate-600">
                                {collegeId?.name}
                              </p>

                              {collegeId && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {(
                                    collegeId.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                collegeIdInputRef.current?.click()
                              }
                              className="
                                shrink-0
                                rounded-full
                                border
                                border-green-600
                                bg-white
                                px-5
                                py-3
                                text-sm
                                font-black
                                text-green-700
                                transition
                                hover:bg-green-50
                                disabled:opacity-50
                              "
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center sm:p-10">
                          <div className="text-5xl">
                            🎓
                          </div>

                          <h3 className="mt-4 text-xl font-black text-slate-900">
                            Upload College ID
                          </h3>

                          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Upload a clear image showing your
                            student details and college identity.
                          </p>

                          <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                              collegeIdInputRef.current?.click()
                            }
                            className="
                              mt-6
                              rounded-full
                              bg-green-600
                              px-7
                              py-3.5
                              font-black
                              text-white
                              shadow-md
                              transition
                              hover:bg-green-700
                              active:scale-[0.98]
                              disabled:opacity-50
                            "
                          >
                            📁 Choose College ID
                          </button>

                          <p className="mt-4 text-xs font-semibold text-slate-400">
                            JPG, PNG, WEBP or supported image •
                            Maximum 15MB
                          </p>
                        </div>
                      )}

                      <input
                        ref={collegeIdInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCollegeIdChange}
                        disabled={loading}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* SELFIE */}

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="text-sm font-black text-slate-800">
                        Selfie Verification
                      </label>

                      <span className="text-xs font-bold text-slate-400">
                        Required
                      </span>
                    </div>

                    <div
                      className={`
                        overflow-hidden
                        rounded-[2rem]
                        border-2
                        border-dashed
                        transition
                        ${
                          selfie
                            ? "border-green-500 bg-green-50"
                            : "border-slate-300 bg-slate-50 hover:border-green-400"
                        }
                      `}
                    >
                      {selfiePreview ? (
                        <div className="p-4">
                          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-green-200 bg-white">
                            <img
                              src={selfiePreview}
                              alt="Selfie preview"
                              className="max-h-80 w-full object-contain p-2"
                            />
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-green-700">
                                ✓ Selfie selected
                              </p>

                              <p className="mt-1 truncate text-sm text-slate-600">
                                {selfie?.name}
                              </p>

                              {selfie && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {(
                                    selfie.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                selfieInputRef.current?.click()
                              }
                              className="
                                shrink-0
                                rounded-full
                                border
                                border-green-600
                                bg-white
                                px-5
                                py-3
                                text-sm
                                font-black
                                text-green-700
                                transition
                                hover:bg-green-50
                                disabled:opacity-50
                              "
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center sm:p-10">
                          <div className="text-5xl">
                            📸
                          </div>

                          <h3 className="mt-4 text-xl font-black text-slate-900">
                            Upload Clear Selfie
                          </h3>

                          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Use a clear, recent photo of yourself
                            so it can be compared with your
                            college ID.
                          </p>

                          <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                              selfieInputRef.current?.click()
                            }
                            className="
                              mt-6
                              rounded-full
                              bg-slate-950
                              px-7
                              py-3.5
                              font-black
                              text-white
                              shadow-md
                              transition
                              hover:bg-slate-800
                              active:scale-[0.98]
                              disabled:opacity-50
                            "
                          >
                            📷 Choose Selfie
                          </button>

                          <p className="mt-4 text-xs font-semibold text-slate-400">
                            Clear face photo • Maximum 10MB
                          </p>
                        </div>
                      )}

                      <input
                        ref={selfieInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleSelfieChange}
                        disabled={loading}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="
                      w-full
                      rounded-full
                      bg-green-600
                      py-4
                      font-black
                      text-white
                      shadow-lg
                      shadow-green-100
                      transition
                      hover:bg-green-700
                      active:scale-[0.99]
                      disabled:cursor-not-allowed
                      disabled:bg-slate-300
                      disabled:text-slate-500
                      disabled:shadow-none
                    "
                  >
                    {loading
                      ? "Submitting Verification..."
                      : !collegeId || !selfie
                        ? "Upload Both Images to Continue"
                        : "Submit Verification"}
                  </button>

                  {message && (
                    <div
                      className={`
                        rounded-2xl
                        border
                        px-5
                        py-4
                        text-sm
                        font-bold
                        ${
                          message.includes("✅")
                            ? "border-green-200 bg-green-50 text-green-700"
                            : message.includes("failed") ||
                                message.includes("must") ||
                                message.includes("Please")
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                        }
                      `}
                    >
                      {message}
                    </div>
                  )}
                </form>
              )}

              {/* APPROVED */}

              {status === "APPROVED" && (
                <div className="mt-8 rounded-[2rem] border border-green-200 bg-green-50 p-6">
                  <h3 className="text-2xl font-black text-green-700">
                    Verification Complete
                  </h3>

                  <p className="mt-3 leading-7 text-green-700">
                    Your account is verified. You can now create
                    listings, chat with students, and access all
                    marketplace features.
                  </p>

                  <a
                    href="/create-product"
                    className="
                      mt-5
                      inline-block
                      rounded-full
                      bg-green-600
                      px-6
                      py-3
                      font-black
                      text-white
                      transition
                      hover:bg-green-700
                    "
                  >
                    Create Listing
                  </a>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}

            <div className="space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-black">
                  Why Verify?
                </h3>

                <ul className="mt-5 space-y-4 text-slate-600">
                  <li>• Unlock product listings</li>
                  <li>• Build buyer trust</li>
                  <li>• Reduce fake accounts</li>
                  <li>• Safer campus transactions</li>
                  <li>• Access verified badge</li>
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_40%)]" />

                <div className="relative">
                  <h3 className="text-2xl font-black">
                    Trusted Campus Marketplace
                  </h3>

                  <p className="mt-4 leading-7 text-slate-300">
                    Axyon focuses on verified
                    student-to-student trust to make campus
                    transactions safer.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-blue-200 bg-blue-50 p-6">
                <h3 className="text-xl font-black text-blue-900">
                  Photo Tips
                </h3>

                <div className="mt-4 space-y-3 text-sm leading-6 text-blue-800">
                  <p>
                    ✓ Make sure the entire College ID is visible.
                  </p>

                  <p>
                    ✓ Avoid blur, glare, shadows, and dark photos.
                  </p>

                  <p>
                    ✓ Your selfie should clearly show your face.
                  </p>

                  <p>
                    ✓ Review both previews before submitting.
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