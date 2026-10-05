"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Tutor = {
  id: string;
  displayName: string;
  photoUrl?: string | null;
  institution?: string | null;
  college?: string | null;
  bio: string;
  subjects: string[];
  classes: string[];
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  location?: string | null;
  maxTravelDistance?: number | null;
  availability: string;
  languages: string[];
  hourlyFee: number;
  demoAvailable: boolean;
  demoDetails?: string | null;
  rating: number;
  reviewCount: number;
  contactAvailable: boolean;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer?: {
    name?: string | null;
  } | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Stars({
  value,
  large = false,
}: {
  value: number;
  large?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-0.5 ${
        large ? "text-lg" : "text-sm"
      }`}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(value)
              ? "text-amber-400"
              : "text-slate-200"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function TutorDetailPage() {
  const params = useParams();
  const tutorId = String(params.id);

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState<
    "CALL" | "WHATSAPP" | null
  >(null);
  const [error, setError] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");

  async function loadTutor() {
    try {
      const response = await fetch(
        `/api/home-tuition/tutors/${tutorId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Tutor not found.");
      }

      setTutor(data.tutor);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Tutor not found."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews() {
    setReviewLoading(true);

    try {
      const response = await fetch(
        `/api/home-tuition/reviews?tutorProfileId=${encodeURIComponent(
          tutorId
        )}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } finally {
      setReviewLoading(false);
    }
  }

  useEffect(() => {
    loadTutor();
    loadReviews();
  }, [tutorId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return tutor?.rating || 0;

    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) /
      reviews.length
    );
  }, [reviews, tutor]);

  async function contactTutor(method: "CALL" | "WHATSAPP") {
    setContactLoading(method);

    try {
      const response = await fetch(
        `/api/home-tuition/tutors/${tutorId}/contact?method=${method}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Contact is currently unavailable."
        );
      }

      window.location.href = data.url;
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Contact is currently unavailable."
      );
    } finally {
      setContactLoading(null);
    }
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();

    setReviewSubmitting(true);
    setReviewError("");
    setReviewMessage("");

    try {
      const response = await fetch("/api/home-tuition/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tutorProfileId: tutorId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(
          `/home-tuition/tutors/${tutorId}`
        )}`;
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to submit your review."
        );
      }

      setReviewComment("");
      setReviewRating(5);
      setReviewMessage(
        "Your review has been submitted successfully."
      );

      await loadReviews();
      await loadTutor();
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Unable to submit your review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function submitReport(event: React.FormEvent) {
    event.preventDefault();

    if (!reportReason.trim()) {
      setReportError("Please describe the issue.");
      return;
    }

    setReportSubmitting(true);
    setReportError("");
    setReportMessage("");

    try {
      const response = await fetch("/api/home-tuition/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tutorProfileId: tutorId,
          reason: reportReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(
          `/home-tuition/tutors/${tutorId}`
        )}`;
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to submit report."
        );
      }

      setReportReason("");
      setReportOpen(false);
      setReportMessage(
        "Thanks. Your report has been submitted for review."
      );
    } catch (err) {
      setReportError(
        err instanceof Error
          ? err.message
          : "Unable to submit report."
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-4 py-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-10 w-40 rounded-xl bg-white" />
          <div className="mt-6 h-72 rounded-3xl bg-white" />
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="h-72 rounded-3xl bg-white lg:col-span-2" />
            <div className="h-72 rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !tutor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
            !
          </div>
          <h1 className="mt-5 text-xl font-black">
            Tutor unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "This tutor profile could not be loaded."}
          </p>
          <Link
            href="/home-tuition"
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
          >
            Back to tutors
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/home-tuition"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
              A
            </div>

            <div>
              <div className="text-sm font-black tracking-tight">
                Axyon
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Home Tuition
              </div>
            </div>
          </Link>

          <Link
            href="/home-tuition"
            className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            ← All tutors
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-xl">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 text-3xl font-black text-white shadow-2xl">
                  {tutor.photoUrl ? (
                    <img
                      src={tutor.photoUrl}
                      alt={tutor.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    tutor.displayName.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">
                    Verified tutor profile
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {tutor.displayName}
                  </h1>

                  {(tutor.institution || tutor.college) && (
                    <p className="mt-2 text-sm font-medium text-slate-300">
                      {tutor.institution || tutor.college}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Stars value={averageRating} />
                      <span className="text-sm font-black text-white">
                        {averageRating
                          ? averageRating.toFixed(1)
                          : "New"}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      {tutor.reviewCount} review
                      {tutor.reviewCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Hourly fee
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  ₹{tutor.hourlyFee.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-400">per hour</p>
              </div>
            </div>
          </div>
        </div>

        {reviewMessage && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {reviewMessage}
          </div>
        )}

        {reportMessage && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {reportMessage}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-black">About the tutor</h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {tutor.bio}
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Teaching mode
                  </p>
                  <p className="mt-2 text-sm font-black">
                    {tutor.teachingMode === "BOTH"
                      ? "Online + Offline"
                      : tutor.teachingMode}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Availability
                  </p>
                  <p className="mt-2 text-sm font-black">
                    {tutor.availability}
                  </p>
                </div>

                {tutor.location && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Location
                    </p>
                    <p className="mt-2 text-sm font-black">
                      {tutor.location}
                    </p>
                  </div>
                )}

                {tutor.maxTravelDistance && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Travel distance
                    </p>
                    <p className="mt-2 text-sm font-black">
                      Up to {tutor.maxTravelDistance} km
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-black">Subjects & classes</h2>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subjects
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Classes
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tutor.classes.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {tutor.languages.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Languages
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {tutor.languages.join(" · ")}
                  </p>
                </div>
              )}
            </section>

            {tutor.demoAvailable && (
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-7">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
                    ✓
                  </div>

                  <div>
                    <h2 className="font-black text-emerald-950">
                      Demo class available
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                      {tutor.demoDetails ||
                        "Contact the tutor to discuss demo class availability."}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Student feedback
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    Reviews
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Stars value={averageRating} large />
                  <span className="text-sm font-black">
                    {averageRating
                      ? averageRating.toFixed(1)
                      : "No rating"}
                  </span>
                </div>
              </div>

              {reviewLoading ? (
                <div className="mt-6 space-y-3">
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-50" />
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-50" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-7 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    No reviews yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Be the first verified student to share feedback.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black">
                            {review.reviewer?.name || "Axyon student"}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <Stars value={review.rating} />
                            <span className="text-[11px] text-slate-400">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-7 border-t border-slate-100 pt-7">
                <h3 className="font-black">Share your experience</h3>

                <form
                  onSubmit={submitReview}
                  className="mt-4 space-y-4"
                >
                  {reviewError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                      {reviewError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      Rating
                    </label>

                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className={`text-2xl transition ${
                            rating <= reviewRating
                              ? "text-amber-400"
                              : "text-slate-200"
                          }`}
                          aria-label={`${rating} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(event) =>
                      setReviewComment(event.target.value)
                    }
                    required
                    minLength={3}
                    maxLength={2000}
                    rows={4}
                    placeholder="Share useful, factual feedback about your tutoring experience..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  />

                  <button
                    type="submit"
                    disabled={
                      reviewSubmitting ||
                      reviewComment.trim().length < 3
                    }
                    className="rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reviewSubmitting
                      ? "Submitting..."
                      : "Submit review"}
                  </button>
                </form>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Contact tutor
              </p>

              <h2 className="mt-2 text-xl font-black">
                Start a conversation
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Contact details remain private. Use the available
                contact actions to reach the tutor directly.
              </p>

              {tutor.contactAvailable ? (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={contactLoading !== null}
                    onClick={() => contactTutor("CALL")}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span className="text-lg">☎</span>
                    {contactLoading === "CALL"
                      ? "Opening..."
                      : "Call"}
                  </button>

                  <button
                    type="button"
                    disabled={contactLoading !== null}
                    onClick={() => contactTutor("WHATSAPP")}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <span className="text-lg">◉</span>
                    {contactLoading === "WHATSAPP"
                      ? "Opening..."
                      : "WhatsApp"}
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-500">
                  Contact is currently unavailable for this tutor.
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Hourly fee
                  </span>
                  <span className="font-black">
                    ₹{tutor.hourlyFee.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Teaching mode
                  </span>
                  <span className="font-bold">
                    {tutor.teachingMode === "BOTH"
                      ? "Online + Offline"
                      : tutor.teachingMode}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black text-slate-700">
                  Safety reminder
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Keep payments and communication transparent. Never
                  share passwords, verification codes or sensitive
                  account information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReportError("");
                  setReportOpen(true);
                }}
                className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                Report this tutor
              </button>
            </div>
          </aside>
        </div>
      </section>

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Safety report
                </p>
                <h2 className="mt-1 text-xl font-black">
                  Report this tutor
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={submitReport}
              className="mt-6 space-y-4"
            >
              {reportError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {reportError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500">
                  What is the issue?
                </label>

                <textarea
                  value={reportReason}
                  onChange={(event) =>
                    setReportReason(event.target.value)
                  }
                  rows={5}
                  maxLength={2000}
                  required
                  placeholder="Describe the specific issue..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="rounded-xl bg-rose-600 px-5 py-3 text-xs font-black text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {reportSubmitting
                    ? "Submitting..."
                    : "Submit report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}