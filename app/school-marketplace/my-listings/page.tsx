"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  condition: string;
  status?: string;
  imageUrls?: string[];
  sellerId?: string;
  seller?: {
    id?: string;
  };
};

export default function SchoolMyListingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");

        const meResponse = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!meResponse.ok) {
          window.location.replace("/school-marketplace/login");
          return;
        }

        const meData = await meResponse.json();
        const user = meData.user;

        if (user?.marketplaceType === "CAMPUS") {
          window.location.replace("/marketplace-home");
          return;
        }

        if (
          user?.marketplaceType !== "SCHOOL" ||
          user.schoolVerified !== true ||
          user.schoolVerificationStatus !== "APPROVED"
        ) {
          window.location.replace("/school-marketplace");
          return;
        }

        const response = await fetch("/api/school/products", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        const allProducts = Array.isArray(data.products)
          ? data.products
          : [];

        const mine = allProducts.filter(
          (product: Product) =>
            product.sellerId === user.id ||
            product.seller?.id === user.id
        );

        setProducts(mine);
      } catch {
        setError("Unable to load your listings.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#070b14] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1">
            <img
              src="/logo.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mx-auto mt-5 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

          <p className="mt-4 text-sm font-bold text-slate-500">
            Loading your listings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/school-marketplace/home"
            className="inline-flex min-h-10 w-fit items-center rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            ← School Home
          </a>

          <a
            href="/school-marketplace/sell"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black transition hover:bg-indigo-500 sm:w-auto"
          >
            + Sell Item
          </a>
        </div>

        {/* TITLE */}
        <div className="mt-8 sm:mt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 sm:text-xs sm:tracking-widest">
            Your Marketplace
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            My Listings
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Manage the items you have listed on School Marketplace.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {products.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-7 text-center sm:rounded-[2rem] sm:p-10">
            <div className="text-4xl">📦</div>

            <h2 className="mt-5 text-xl font-black">
              You have no listings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              List something useful for students across schools.
            </p>

            <a
              href="/school-marketplace/sell"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-black transition hover:bg-indigo-500"
            >
              Create Your First Listing
            </a>
          </div>
        ) : (
          /* LISTINGS */
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] transition duration-300 hover:border-indigo-400/30 hover:bg-white/[0.055]"
              >
                {/* IMAGE / VIEW */}
                <a
                  href={`/school-marketplace/products/${product.id}`}
                  className="block"
                >
                  <div className="h-48 bg-black/20 sm:h-52">
                    {product.imageUrls?.[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        📦
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 line-clamp-2 text-sm font-black leading-5 sm:text-base">
                        {product.title}
                      </h2>

                      <span className="shrink-0 text-sm font-black text-indigo-300 sm:text-base">
                        ₹
                        {product.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="max-w-full truncate rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-bold text-slate-400">
                        {product.category}
                      </span>

                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-bold text-slate-400">
                        {product.condition}
                      </span>

                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-300">
                        {product.status || "AVAILABLE"}
                      </span>
                    </div>
                  </div>
                </a>

                {/* ACTIONS */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-4">
                  <a
                    href={`/school-marketplace/products/${product.id}`}
                    className="flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-black text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    View Listing
                  </a>

                  <a
                    href={`/school-marketplace/edit-listing/${product.id}`}
                    className="flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-3 py-3 text-xs font-black text-white transition hover:bg-indigo-500"
                  >
                    Edit Listing
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-8 border-t border-white/10 px-4 py-7 text-center text-[11px] leading-5 text-slate-700 sm:mt-12 sm:px-5 sm:py-8 sm:text-xs">
        Axyon School Marketplace · Manage your listings
      </footer>
    </main>
  );
}