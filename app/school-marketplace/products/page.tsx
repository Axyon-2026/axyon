"use client";

import { FormEvent, useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
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

type Filters = {
  schools: string[];
  cities: string[];
  categories: string[];
};

const emptyFilters: Filters = {
  schools: [],
  cities: [],
  categories: [],
};

export default function SchoolProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const [search, setSearch] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (school) {
        params.set("school", school);
      }

      if (city) {
        params.set("city", city);
      }

      if (category) {
        params.set("category", category);
      }

      const query = params.toString();

      const response = await fetch(
        `/api/school/products${query ? `?${query}` : ""}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/school-marketplace/login";
          return;
        }

        setError(
          data.message || "Failed to load School Marketplace."
        );

        return;
      }

      setProducts(data.products || []);
      setFilters(data.filters || emptyFilters);
    } catch {
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [school, city, category]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadProducts();
  }

  function clearFilters() {
    setSearch("");
    setSchool("");
    setCity("");
    setCategory("");
  }

  const hasFilters = Boolean(
    search || school || city || category
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HEADER */}
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/10 backdrop-blur sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <a
                href="/school-marketplace/home"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-black text-slate-400 transition hover:border-white/20 hover:text-white"
              >
                ← School Home
              </a>

              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-xl">
                  🛍️
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
                    School Marketplace
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                    Browse Marketplace
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Discover items listed by verified students across
                schools and cities.
              </p>
            </div>

            <a
              href="/school-marketplace/sell"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-black shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-500 hover:shadow-indigo-500/10 sm:w-auto"
            >
              + Sell Something
            </a>
          </div>
        </header>

        {/* SEARCH + FILTERS */}
        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-xl shadow-black/10 backdrop-blur sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Find something
            </p>

            <h2 className="mt-1 text-lg font-black">
              Search & filter listings
            </h2>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(150px,0.55fr))]">
              <label className="relative block">
                <span className="sr-only">Search products</span>

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search products, descriptions or schools..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-black/30"
                />
              </label>

              <select
                value={school}
                onChange={(event) =>
                  setSchool(event.target.value)
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition focus:border-indigo-400/50"
              >
                <option value="">All schools</option>

                {filters.schools.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition focus:border-indigo-400/50"
              >
                <option value="">All cities</option>

                {filters.cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition focus:border-indigo-400/50"
              >
                <option value="">All categories</option>

                {filters.categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-bold text-indigo-400 transition hover:text-indigo-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-2xl bg-white px-6 text-sm font-black text-slate-950 transition hover:bg-slate-200 sm:w-auto"
              >
                Search Marketplace
              </button>
            </div>
          </form>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 sm:flex-row sm:items-center">
            <span className="text-lg">!</span>

            <p className="text-sm text-red-200">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProducts}
              className="text-left text-sm font-black text-red-300 hover:text-white sm:ml-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* PRODUCTS */}
        <section className="mt-8">
          {loading ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                ⏳
              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">
                Loading marketplace...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-16 text-center sm:px-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.05] text-3xl">
                🔎
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another search or remove one of your filters
                to see more listings.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                    Available listings
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-400">
                    {products.length}{" "}
                    {products.length === 1
                      ? "product"
                      : "products"}{" "}
                    found
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <a
                    key={product.id}
                    href={`/school-marketplace/products/${product.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/20 hover:bg-white/[0.06]"
                  >
                    {/* IMAGE */}
                    <div className="relative aspect-square overflow-hidden bg-black/25">
                      {product.imageUrls?.[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-4xl">
                          🛍️
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                      <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {/* TITLE + PRICE */}
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="min-w-0 line-clamp-2 font-black leading-5 text-white">
                          {product.title}
                        </h2>

                        <p className="shrink-0 text-base font-black text-indigo-400">
                          ₹
                          {product.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* DESCRIPTION */}
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                        {product.description}
                      </p>

                      {/* TAGS */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/5 bg-white/[0.05] px-3 py-1 text-[11px] font-bold text-slate-400">
                          {product.condition}
                        </span>
                      </div>

                      {/* SCHOOL */}
                      <div className="mt-auto border-t border-white/10 pt-4">
                        <p className="truncate font-black text-white">
                          {product.schoolName ||
                            "School not available"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {product.schoolCity ||
                            "City not available"}

                          {product.seller.classLevel
                            ? ` · Class ${product.seller.classLevel}`
                            : ""}
                        </p>

                        {product.seller.schoolVerified ? (
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-emerald-400">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/10 text-[10px]">
                              ✓
                            </span>
                            Verified Student
                          </p>
                        ) : (
                          <p className="mt-3 text-xs font-bold text-slate-600">
                            Student seller
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}