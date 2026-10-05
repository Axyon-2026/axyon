"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  imageUrls: string[];
  schoolName: string | null;
  schoolCity: string | null;
  seller: {
    id: string;
    name: string;
    schoolName: string | null;
    schoolCity: string | null;
    classLevel: string | null;
    schoolVerified: boolean;
  };
};

const REPORT_REASONS = [
  "Inappropriate content",
  "Wrong or misleading information",
  "Prohibited item",
  "Spam or duplicate listing",
  "Suspicious or fraudulent listing",
  "Other",
];

export default function SchoolProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const { id } = await params;

        const response = await fetch(
          `/api/school/products/${id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            window.location.replace(
              "/school-marketplace/login"
            );
            return;
          }

          setError(
            data.message ||
              "Unable to load this product."
          );

          return;
        }

        setProduct(data.product);
        setCurrentUserId(
          data.currentUserId || ""
        );
      } catch {
        setError(
          "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params]);

  async function openChat() {
    if (!product) return;

    setChatLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/school/chat/open",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to open chat."
        );
        return;
      }

      window.location.href =
        `/school-marketplace/chat/${data.conversationId}`;
    } catch {
      setError(
        "Unable to open School Chat."
      );
    } finally {
      setChatLoading(false);
    }
  }

  async function submitReport() {
    if (!product) return;

    if (!reportReason) {
      setError("Please select a reason for the report.");
      return;
    }

    setReporting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetType: "PRODUCT",
            targetId: product.id,
            reason: reportReason,
            details: reportDetails.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to submit report."
        );
        return;
      }

      setShowReport(false);
      setReportReason("");
      setReportDetails("");

      setSuccess(
        "Report submitted successfully. Our admin team will review this listing."
      );
    } catch {
      setError(
        "Unable to submit report. Please try again."
      );
    } finally {
      setReporting(false);
    }
  }

  async function removeListing() {
    if (!product) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    setRemoving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/school/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to remove listing."
        );
        return;
      }

      setSuccess(
        "Your listing has been removed."
      );

      setTimeout(() => {
        window.location.replace(
          "/school-marketplace/my-listings"
        );
      }, 800);
    } catch {
      setError(
        "Something went wrong while removing the listing."
      );
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#070b14] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mx-auto mt-5 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

          <p className="mt-4 text-sm font-bold text-slate-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <a
            href="/school-marketplace/products"
            className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            ← Marketplace
          </a>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-8 text-center sm:rounded-[2rem] sm:p-12">
            <div className="text-5xl">🔎</div>

            <h1 className="mt-5 text-2xl font-black">
              Product not found
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error ||
                "This listing may have been removed."}
            </p>

            <a
              href="/school-marketplace/products"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black transition hover:bg-indigo-500"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </main>
    );
  }

  const isOwner =
    currentUserId === product.seller.id;

  const isAvailable =
    product.status === "AVAILABLE";

  const images =
    product.imageUrls?.length > 0
      ? product.imageUrls
      : [];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        <a
          href="/school-marketplace/products"
          className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
        >
          ← Back to Marketplace
        </a>

        <div className="mt-7 grid gap-7 lg:mt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">

          {/* IMAGES */}
          <section className="min-w-0">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 sm:rounded-[2rem]">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-5xl sm:text-6xl">
                  🛍️
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2 sm:mt-4 sm:gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={`overflow-hidden rounded-xl border transition sm:rounded-2xl ${
                      selectedImage === index
                        ? "border-indigo-400 ring-1 ring-indigo-400/30"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* DETAILS */}
          <section className="min-w-0">

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black text-indigo-300 sm:text-xs">
                {product.category}
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-black text-slate-400 sm:text-xs">
                {product.condition}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-black sm:text-xs ${
                  product.status === "AVAILABLE"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                {product.status}
              </span>
            </div>

            <h1 className="mt-4 break-words text-3xl font-black leading-tight tracking-[-0.03em] sm:mt-5 sm:text-4xl">
              {product.title}
            </h1>

            <p className="mt-4 text-2xl font-black text-indigo-400 sm:text-3xl">
              ₹
              {product.price.toLocaleString(
                "en-IN"
              )}
            </p>

            {/* DESCRIPTION */}
            <div className="mt-6 border-t border-white/10 pt-6 sm:mt-7 sm:pt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                Description
              </p>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                {product.description}
              </p>
            </div>

            {/* SELLER */}
            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 sm:mt-7 sm:rounded-3xl sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                Seller
              </p>

              <div className="mt-4 flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-lg sm:h-12 sm:w-12 sm:text-xl">
                  👤
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black sm:text-base">
                    {product.seller.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
                    {product.seller.schoolName ||
                      product.schoolName ||
                      "School"}
                  </p>

                  <p className="truncate text-[11px] text-slate-600 sm:text-xs">
                    {product.seller.schoolCity ||
                      product.schoolCity ||
                      "City"}

                    {product.seller.classLevel
                      ? ` · Class ${product.seller.classLevel}`
                      : ""}
                  </p>
                </div>
              </div>

              {product.seller.schoolVerified && (
                <div className="mt-4 rounded-xl bg-emerald-500/[0.05] px-3 py-2.5 text-[11px] font-black text-emerald-400 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-xs">
                  ✓ Verified School Student
                </div>
              )}
            </div>

            {/* ACTIONS */}
            {isOwner ? (
              <div className="mt-5 space-y-2.5 sm:mt-6">
                {isAvailable && (
                  <a
                    href={`/school-marketplace/edit-listing/${product.id}`}
                    className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white transition hover:bg-indigo-500"
                  >
                    ✏️ Edit Listing
                  </a>
                )}

                {isAvailable && (
                  <button
                    type="button"
                    onClick={removeListing}
                    disabled={removing}
                    className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-5 py-4 text-sm font-black text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removing
                      ? "Removing Listing..."
                      : "Remove My Listing"}
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-3 sm:mt-6">

                <button
                  type="button"
                  onClick={openChat}
                  disabled={
                    chatLoading ||
                    !isAvailable
                  }
                  className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {chatLoading
                    ? "Opening Chat..."
                    : isAvailable
                    ? "💬 Chat with Seller"
                    : "Listing Unavailable"}
                </button>

                {/* REPORT BUTTON */}
                {isAvailable && (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setShowReport(
                        (value) => !value
                      );
                    }}
                    className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-5 py-4 text-sm font-black text-red-300 transition hover:bg-red-500/[0.1]"
                  >
                    🚨 Report Listing
                  </button>
                )}

                {/* REPORT PANEL */}
                {showReport && (
                  <div className="rounded-[1.5rem] border border-red-400/20 bg-red-500/[0.04] p-4 sm:p-5">

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-white">
                          Report this listing
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Tell the Axyon admin team why
                          this listing needs attention.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowReport(false)
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        aria-label="Close report form"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                        Reason
                      </label>

                      <select
                        value={reportReason}
                        onChange={(event) =>
                          setReportReason(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d1320] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-red-400/40"
                      >
                        <option value="">
                          Select a reason
                        </option>

                        {REPORT_REASONS.map(
                          (reason) => (
                            <option
                              key={reason}
                              value={reason}
                            >
                              {reason}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                        Additional details
                      </label>

                      <textarea
                        value={reportDetails}
                        onChange={(event) =>
                          setReportDetails(
                            event.target.value
                          )
                        }
                        maxLength={2000}
                        rows={4}
                        placeholder="Optional details..."
                        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#0d1320] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-700 focus:border-red-400/40"
                      />

                      <p className="mt-1 text-right text-[10px] text-slate-600">
                        {reportDetails.length}/2000
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={submitReport}
                      disabled={
                        reporting ||
                        !reportReason
                      }
                      className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reporting
                        ? "Submitting Report..."
                        : "Submit Report"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3">
                <p className="text-xs font-bold leading-5 text-red-200">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3">
                <p className="text-xs font-bold leading-5 text-emerald-300">
                  {success}
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="h-8 sm:h-12" />
      </div>
    </main>
  );
}