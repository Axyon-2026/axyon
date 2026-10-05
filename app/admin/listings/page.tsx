"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  finalPrice?: number | null;
  status?: string;
  marketplaceType?: "CAMPUS" | "SCHOOL" | string;
  schoolName?: string | null;
  schoolId?: string | null;
  schoolCity?: string | null;
  college?: string | null;
  city?: string | null;
  createdAt?: string;
  imageUrls?: string[];
  seller?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [marketplace, setMarketplace] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadListings() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/listings", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load listings"
        );
      }

      setListings(
        Array.isArray(data.listings)
          ? data.listings
          : Array.isArray(data)
            ? data
            : []
      );
    } catch (err: any) {
      setError(
        err?.message || "Failed to load listings"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesMarketplace =
        marketplace === "ALL" ||
        String(
          listing.marketplaceType || ""
        ).toUpperCase() === marketplace;

      const normalizedStatus = String(
        listing.status || ""
      ).toUpperCase();

      const matchesStatus =
        status === "ALL" ||
        normalizedStatus === status ||
        (status === "AVAILABLE" &&
          normalizedStatus === "ACTIVE");

      if (!query) {
        return (
          matchesMarketplace &&
          matchesStatus
        );
      }

      const searchable = [
        listing.title,
        listing.description,
        listing.seller?.name,
        listing.seller?.email,
        listing.schoolName,
        listing.schoolCity,
        listing.college,
        listing.city,
        listing.marketplaceType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesMarketplace &&
        matchesStatus &&
        searchable.includes(query)
      );
    });
  }, [
    listings,
    marketplace,
    search,
    status,
  ]);

  const campusCount = listings.filter(
    (listing) =>
      String(
        listing.marketplaceType || ""
      ).toUpperCase() === "CAMPUS"
  ).length;

  const schoolCount = listings.filter(
    (listing) =>
      String(
        listing.marketplaceType || ""
      ).toUpperCase() === "SCHOOL"
  ).length;

  const activeCount = listings.filter(
    (listing) =>
      ["AVAILABLE", "ACTIVE", "PUBLISHED"].includes(
        String(
          listing.status || ""
        ).toUpperCase()
      )
  ).length;

  async function removeListing(
    listing: Listing
  ) {
    const normalizedStatus = String(
      listing.status || ""
    ).toUpperCase();

    /*
     * Sold listings should remain visible for
     * administrative history but must not be
     * removable through moderation.
     */

    if (normalizedStatus === "SOLD") {
      return;
    }

    if (normalizedStatus === "REMOVED") {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${
        listing.title || "this listing"
      }" from the marketplace?\n\nUse this only when the content violates Axyon's marketplace rules.`
    );

    if (!confirmed) return;

    try {
      setRemovingId(listing.id);
      setError("");

      const res = await fetch(
        "/api/admin/listings",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId: listing.id,
            action: "REMOVE",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to remove listing"
        );
      }

      setListings((current) =>
        current.map((item) =>
          item.id === listing.id
            ? {
                ...item,
                status: "REMOVED",
              }
            : item
        )
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to remove listing"
      );
    } finally {
      setRemovingId(null);
    }
  }

  function formatPrice(
    price?: number,
    finalPrice?: number | null
  ) {
    const value =
      typeof finalPrice === "number"
        ? finalPrice
        : price;

    if (typeof value !== "number") {
      return "—";
    }

    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  }

  function formatDate(date?: string) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "—";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function marketplaceLabel(
    type?: string
  ) {
    return String(
      type || ""
    ).toUpperCase() === "SCHOOL"
      ? "School"
      : "Campus";
  }

  function getListingHref(
    listing: Listing
  ) {
    const isSchool =
      String(
        listing.marketplaceType || ""
      ).toUpperCase() === "SCHOOL";

    if (isSchool) {
      return `/school-marketplace/product/${listing.id}`;
    }

    return `/product/${listing.id}`;
  }

  function statusClasses(
    value?: string
  ) {
    const normalized = String(
      value || ""
    ).toUpperCase();

    if (
      normalized === "REMOVED"
    ) {
      return "border-red-100 bg-red-50 text-red-700";
    }

    if (
      normalized === "SOLD"
    ) {
      return "border-slate-200 bg-slate-100 text-slate-600";
    }

    return "border-green-100 bg-green-50 text-green-700";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        {/* HEADER */}

        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-300">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Marketplace moderation
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Listings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Review Campus and School Marketplace
                listings before taking moderation action.
                Admins can inspect listings and remove
                inappropriate content only.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">

              <Link
                href="/admin"
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center text-sm font-black transition hover:bg-white/15"
              >
                ← Dashboard
              </Link>

              <button
                type="button"
                onClick={loadListings}
                disabled={loading}
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↻ Refresh
              </button>

            </div>
          </div>

          {/* PERMISSION NOTICE */}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                🛡
              </div>

              <div>
                <p className="text-sm font-black">
                  Moderation-only access
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Open the listing first to review its
                  content. Only inappropriate listings
                  may be removed. Sold listings remain
                  available for administrative history.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Total
            </p>

            <p className="mt-2 text-3xl font-black">
              {listings.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              All marketplace listings
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Campus
            </p>

            <p className="mt-2 text-3xl font-black">
              {campusCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Campus Marketplace
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              School
            </p>

            <p className="mt-2 text-3xl font-black">
              {schoolCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              School Marketplace
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Active
            </p>

            <p className="mt-2 text-3xl font-black">
              {activeCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Currently visible
            </p>
          </div>

        </div>

        {/* FILTERS */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search title, seller, school, college or city..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3.5 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
              />

            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-[360px]">

              <select
                value={marketplace}
                onChange={(e) =>
                  setMarketplace(
                    e.target.value
                  )
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black outline-none focus:border-green-500"
              >
                <option value="ALL">
                  All marketplaces
                </option>

                <option value="CAMPUS">
                  Campus
                </option>

                <option value="SCHOOL">
                  School
                </option>
              </select>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-black outline-none focus:border-green-500"
              >
                <option value="ALL">
                  All statuses
                </option>

                <option value="AVAILABLE">
                  Available
                </option>

                <option value="SOLD">
                  Sold
                </option>

                <option value="REMOVED">
                  Removed
                </option>
              </select>

            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">

            <span>
              Showing{" "}
              <strong className="text-slate-700">
                {filteredListings.length}
              </strong>{" "}
              listings
            </span>

            {(search ||
              marketplace !== "ALL" ||
              status !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setMarketplace("ALL");
                  setStatus("ALL");
                }}
                className="font-black text-green-600 hover:text-green-700"
              >
                Clear filters
              </button>
            )}

          </div>
        </section>

        {/* LISTINGS */}

        <section className="mt-6">

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-3xl bg-white shadow-sm"
                />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📦
              </div>

              <h2 className="mt-4 text-lg font-black">
                No listings found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                There are no listings matching the
                current search and filters.
              </p>

            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">

              {filteredListings.map(
                (listing) => {
                  const normalizedStatus =
                    String(
                      listing.status || ""
                    ).toUpperCase();

                  const isSold =
                    normalizedStatus ===
                    "SOLD";

                  const isRemoved =
                    normalizedStatus ===
                    "REMOVED";

                  return (
                    <article
                      key={listing.id}
                      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
                        isRemoved
                          ? "border-red-100 opacity-75"
                          : "border-slate-200 hover:shadow-md"
                      }`}
                    >

                      <div className="p-5 sm:p-6">

                        {/* TOP */}

                        <div className="flex gap-4">

                          {/* REAL LISTING IMAGE */}

                          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-32 sm:w-32">

                            {listing.imageUrls &&
                            listing.imageUrls.length > 0 ? (
                              <img
                                src={
                                  listing.imageUrls[0]
                                }
                                alt={
                                  listing.title ||
                                  "Listing"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-3xl">
                                📦
                              </div>
                            )}

                          </div>

                          {/* BASIC INFO */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${
                                  String(
                                    listing.marketplaceType ||
                                      ""
                                  ).toUpperCase() ===
                                  "SCHOOL"
                                    ? "border-blue-100 bg-blue-50 text-blue-700"
                                    : "border-green-100 bg-green-50 text-green-700"
                                }`}
                              >
                                {marketplaceLabel(
                                  listing.marketplaceType
                                )}
                              </span>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClasses(
                                  listing.status
                                )}`}
                              >
                                {listing.status ||
                                  "AVAILABLE"}
                              </span>

                            </div>

                            <h2 className="mt-3 line-clamp-2 text-base font-black text-slate-950 sm:text-lg">
                              {listing.title ||
                                "Untitled listing"}
                            </h2>

                            <p className="mt-1 text-lg font-black text-green-600">
                              {formatPrice(
                                listing.price,
                                listing.finalPrice
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Listed{" "}
                              {formatDate(
                                listing.createdAt
                              )}
                            </p>

                          </div>
                        </div>

                        {/* DETAILS */}

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Seller
                            </p>

                            <p className="mt-1 truncate text-sm font-bold text-slate-700">
                              {listing.seller?.name ||
                                listing.seller?.email ||
                                "Unknown"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Marketplace
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              {marketplaceLabel(
                                listing.marketplaceType
                              )}
                            </p>
                          </div>

                          {(listing.schoolName ||
                            listing.schoolCity ||
                            listing.college ||
                            listing.city) && (
                            <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Marketplace location
                              </p>

                              <p className="mt-1 truncate text-sm font-bold text-slate-700">
                                {listing.schoolName ||
                                  listing.college ||
                                  listing.schoolCity ||
                                  listing.city}
                              </p>
                            </div>
                          )}

                        </div>

                        {/* MODERATION ACTIONS */}

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5">

                          <div className="flex flex-col gap-3 sm:flex-row">

                            {/* VIEW LISTING */}

                            <Link
                              href={getListingHref(
                                listing
                              )}
                              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-black text-slate-800 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                            >
                              View Listing →
                            </Link>

                            {/* REMOVE */}

                            {!isSold &&
                            !isRemoved ? (
                              <button
                                type="button"
                                onClick={() =>
                                  removeListing(
                                    listing
                                  )
                                }
                                disabled={
                                  removingId ===
                                  listing.id
                                }
                                className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {removingId ===
                                listing.id
                                  ? "Removing..."
                                  : "Remove Listing"}
                              </button>
                            ) : isSold ? (
                              <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-xs font-bold text-slate-500">
                                Sold listing — no moderation removal
                              </div>
                            ) : (
                              <div className="flex flex-1 items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-center text-xs font-black text-red-700">
                                Listing removed
                              </div>
                            )}

                          </div>

                          <p className="text-center text-xs leading-5 text-slate-400">
                            {isSold
                              ? "Sold listings remain in the admin record for history and are not removed through moderation."
                              : isRemoved
                                ? "This listing has already been removed from the marketplace."
                                : "Review the full listing before deciding whether moderation removal is necessary."}
                          </p>

                        </div>

                      </div>
                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>
      </div>
    </main>
  );
}