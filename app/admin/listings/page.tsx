"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading listings...");
  const [accessDenied, setAccessDenied] = useState(false);

  async function fetchListings() {
    try {
      const res = await fetch("/api/admin/listings");
      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setMessage("Access denied");
        return;
      }

      if (!res.ok) {
        setMessage(data.message || "Failed to load listings");
        return;
      }

      setListings(data.listings || []);
      setMessage("");
    } catch {
      setMessage("Something went wrong");
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function handleListingAction(
    productId: string,
    action: string
  ) {
    const confirmed = confirm(
      action === "REMOVE"
        ? "Remove this listing?"
        : "Restore this listing?"
    );

    if (!confirmed) return;

    const res = await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        action,
      }),
    });

    const data = await res.json();

    alert(data.message || "Action completed");

    fetchListings();
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <section className="flex items-center justify-center py-24 px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-lg">
            <h1 className="text-4xl font-bold text-red-500">
              Access Denied
            </h1>

            <p className="mt-5 text-slate-400">
              You do not have permission to view listings.
            </p>

            <a
              href="/"
              className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
            >
              Go Home
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold">
              Marketplace Listings
            </h1>

            <p className="mt-3 text-slate-400">
              Review and moderate marketplace products.
            </p>
          </div>

          <a
            href="/admin"
            className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl font-medium"
          >
            Back to Admin
          </a>
        </div>

        {message && (
          <p className="mt-8 text-slate-400">
            {message}
          </p>
        )}

        {!message && listings.length === 0 && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold">
              No Listings
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden ${
                listing.status === "REMOVED"
                  ? "border-red-700"
                  : "border-slate-800"
              }`}
            >
              <div className="h-72 bg-slate-800">
                {listing.imageUrls &&
                listing.imageUrls.length > 0 ? (
                  <img
                    src={listing.imageUrls[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    No Image
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {listing.title}
                    </h2>

                    <p className="mt-2 text-slate-400 line-clamp-2">
                      {listing.description}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      listing.status === "REMOVED"
                        ? "bg-red-900/40 text-red-300"
                        : "bg-green-900/40 text-green-300"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-slate-300">
                  <p>Price: ₹{listing.price}</p>

                  <p>Category: {listing.category}</p>

                  <p>Condition: {listing.condition}</p>

                  <p>
                    Seller: {listing.seller?.name}
                  </p>

                  <p className="col-span-2">
                    Seller Email:{" "}
                    {listing.seller?.email}
                  </p>

                  <p className="col-span-2">
                    College:{" "}
                    {listing.seller?.college ||
                      "Not added"}
                  </p>

                  <p>
                    Seller Strikes:{" "}
                    {listing.seller?.strikeCount}
                  </p>

                  <p>
                    Seller Status:{" "}
                    <span
                      className={
                        listing.seller
                          ?.isSuspended
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {listing.seller
                        ?.isSuspended
                        ? "Suspended"
                        : "Active"}
                    </span>
                  </p>
                </div>

                <div className="mt-6 flex gap-4">
                  <a
                    href={`/product/${listing.id}`}
                    className="flex-1 border border-slate-700 hover:border-slate-500 py-3 rounded-xl text-center font-medium"
                  >
                    View
                  </a>

                  {listing.status === "REMOVED" ? (
                    <button
                      onClick={() =>
                        handleListingAction(
                          listing.id,
                          "RESTORE"
                        )
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-medium"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleListingAction(
                          listing.id,
                          "REMOVE"
                        )
                      }
                      className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}