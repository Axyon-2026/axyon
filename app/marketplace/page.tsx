"use client";

import Navbar from "@/components/Navbar";
import { useCallback, useEffect, useMemo, useState } from "react";

const categories = [
  "All",
  "Books",
  "Notes",
  "Medical Equipment",
  "Electronics",
  "Furniture",
  "Stationary",
  "Vehicles",
  "Others",
];

const conditions = ["All", "New", "Like New", "Good", "Used"];

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("Loading products...");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load products");
        return;
      }

      const availableProducts = (data.products || []).filter(
        (product: any) => product.status === "AVAILABLE",
      );

      setProducts(availableProducts);
      setMessage("");
    } catch {
      setMessage("Something went wrong while loading products");
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userRes = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        const user = userData.user;

        if (user?.marketplaceType === "SCHOOL") {
          window.location.replace("/school-marketplace/home");
          return;
        }

        setCurrentUser(user);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchProducts();
  }, [fetchCurrentUser, fetchProducts]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchProducts]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchProducts();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("focus", fetchProducts);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("focus", fetchProducts);
    };
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status !== "AVAILABLE") {
        return false;
      }

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        product.title?.toLowerCase().includes(searchText) ||
        product.description?.toLowerCase().includes(searchText) ||
        product.seller?.college?.toLowerCase().includes(searchText);
      const matchesCategory =
        category === "All" ? true : product.category === category;

      const matchesCondition =
        condition === "All" ? true : product.condition === condition;

      const matchesPrice = maxPrice
        ? Number(product.price) <= Number(maxPrice)
        : true;

      return (
        matchesSearch && matchesCategory && matchesCondition && matchesPrice
      );
    });
  }, [products, search, category, condition, maxPrice]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setCondition("All");
    setMaxPrice("");
  }

  const hasActiveFilters =
    search.trim() || category !== "All" || condition !== "All" || maxPrice;

  return (
    <main className="min-h-screen overflow-hidden bg-[#071019] text-white">
      <Navbar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <section className="relative z-10 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-black text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Verified Campus Marketplace
                </span>

                <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Discover campus
                  <br />
                  deals around you.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                  Explore books, electronics, notes, furniture, hostel
                  essentials, and student deals inside trusted college
                  communities.
                </p>
              </div>

              {currentUser?.role !== "ADMIN" && (
                <a
                  href="/create-product"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-7 py-4 text-sm font-black text-black shadow-[0_0_40px_rgba(34,197,94,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(34,197,94,0.35)] sm:w-auto sm:rounded-full sm:text-base"
                >
                  + Post Listing
                </a>
              )}
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 backdrop-blur-2xl sm:mt-6 sm:p-6">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                Marketplace
              </p>

              <h2 className="mt-1 text-lg font-black sm:text-xl">
                Find what you need
              </h2>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search products, college or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-13 w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-green-500/50 focus:bg-black/30"
              />
            </div>

            {/* Category chips */}
            <div className="mt-5 -mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-max gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition-all sm:px-5 sm:py-3 sm:text-sm ${
                      category === cat
                        ? "border-green-500 bg-green-500 text-black shadow-[0_0_25px_rgba(34,197,94,0.25)]"
                        : "border-white/10 bg-white/[0.035] text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary filters */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1520] px-4 text-sm text-white outline-none transition focus:border-green-500/50"
              >
                {conditions.map((item) => (
                  <option key={item} value={item} className="bg-[#071019]">
                    {item === "All" ? "All Conditions" : item}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                placeholder="Max price ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-green-500/50"
              />

              <button
                type="button"
                onClick={resetFilters}
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.025] px-4 text-sm font-black text-slate-300 transition hover:border-green-500/40 hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* RESULTS HEADER */}
          {!message && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Campus listings
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Showing{" "}
                  <span className="font-black text-green-400">
                    {filteredProducts.length}
                  </span>{" "}
                  {filteredProducts.length === 1 ? "listing" : "listings"}
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="self-start text-xs font-black text-green-400 transition hover:text-green-300 sm:self-auto"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* MESSAGE */}
          {message && (
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl">
                ⏳
              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">{message}</p>
            </div>
          )}

          {/* EMPTY */}
          {!message && filteredProducts.length === 0 && (
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-16 text-center sm:px-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.04] text-3xl">
                🛍️
              </div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                No Listings Found
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Try changing your filters or search terms to discover more
                campus products.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}

          {/* PRODUCTS */}
          {!message && filteredProducts.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const isSeller = currentUser?.id === product.seller?.id;

                const image =
                  product.imageUrls && product.imageUrls.length > 0
                    ? product.imageUrls[0]
                    : null;

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-green-500/30 hover:bg-white/[0.06]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[1.1/1] overflow-hidden bg-black/20">
                      {image ? (
                        <img
                          src={image}
                          alt={product.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-[#071019] text-6xl">
                          🛍️
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
                        <span className="max-w-[65%] truncate rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-black backdrop-blur-xl">
                          {product.category}
                        </span>

                        <span className="shrink-0 rounded-full bg-green-500 px-3 py-1.5 text-xs font-black text-black shadow-lg">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 text-xl font-black leading-6 sm:text-2xl">
                          {product.title}
                        </h2>

                        {product.seller?.studentVerified && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-sm">
                            ✅
                          </div>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                        {product.description}
                      </p>

                      <div className="mt-4">
                        <span className="inline-flex rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400">
                          {product.condition}
                        </span>
                      </div>

                      <div className="mt-auto border-t border-white/10 pt-4 sm:mt-6">
                        <div className="flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">
                              {product.seller?.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {product.seller?.college}
                            </p>
                          </div>

                          <div
                            className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-black ${
                              isSeller
                                ? "bg-white/[0.06] text-white"
                                : "bg-green-500 text-black"
                            }`}
                          >
                            {isSeller ? "Your Listing" : "View Deal →"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
