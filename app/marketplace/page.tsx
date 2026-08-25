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
        setMessage(
          data.message || "Failed to load products"
        );
        return;
      }

      /*
       * The API already returns AVAILABLE products.
       *
       * We filter again on the client so stale/invalid
       * objects can never accidentally render.
       */
      const availableProducts = (
        data.products || []
      ).filter(
        (product: any) =>
          product.status === "AVAILABLE"
      );

      setProducts(availableProducts);
      setMessage("");
    } catch {
      setMessage(
        "Something went wrong while loading products"
      );
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userRes = await fetch(
        "/api/auth/me",
        {
          cache: "no-store",
        }
      );

      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData.user);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchProducts();
  }, [fetchCurrentUser, fetchProducts]);

  /*
   * Keep Marketplace synchronized with seller actions.
   *
   * Example:
   *
   * Seller deletes listing
   *        ↓
   * Product becomes REMOVED
   *        ↓
   * Marketplace refreshes
   *        ↓
   * Product is no longer returned
   *        ↓
   * Product disappears
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchProducts]);

  /*
   * When the user comes back to the Marketplace tab/page,
   * refresh immediately instead of showing an old list.
   */
  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible"
      ) {
        fetchProducts();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      fetchProducts
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        fetchProducts
      );
    };
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      /*
       * Final safety check.
       */
      if (product.status !== "AVAILABLE") {
        return false;
      }

      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        product.title
          ?.toLowerCase()
          .includes(searchText) ||
        product.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All"
          ? true
          : product.category === category;

      const matchesCondition =
        condition === "All"
          ? true
          : product.condition === condition;

      const matchesPrice = maxPrice
        ? Number(product.price) <=
          Number(maxPrice)
        : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCondition &&
        matchesPrice
      );
    });
  }, [
    products,
    search,
    category,
    condition,
    maxPrice,
  ]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setCondition("All");
    setMaxPrice("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#071019] text-white">
      <Navbar />

      <section className="px-4 py-8 pb-32 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* HERO */}

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-green-500/20 blur-3xl" />

            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-black text-green-400">
                  ✦ Verified Campus Marketplace
                </span>

                <h1 className="mt-6 text-4xl font-black leading-[0.95] sm:text-6xl">
                  Discover campus
                  <br />
                  deals around you.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                  Explore books, electronics, notes, furniture,
                  hostel essentials, and student deals inside
                  trusted college communities.
                </p>
              </div>

              {currentUser?.role !== "ADMIN" && (
                <a
                  href="/create-product"
                  className="
                    rounded-full
                    bg-gradient-to-r
                    from-green-500
                    to-emerald-600
                    px-7
                    py-4
                    text-center
                    font-black
                    text-black
                    shadow-[0_0_40px_rgba(34,197,94,0.35)]
                    transition
                    hover:scale-105
                  "
                >
                  + Post Listing
                </a>
              )}
            </div>
          </div>

          {/* FILTERS */}

          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl">
            <input
              type="text"
              placeholder="Search books, laptops, notes..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                px-5
                py-4
                text-white
                outline-none
                placeholder:text-slate-500
                focus:border-green-500
              "
            />

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setCategory(cat)
                  }
                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-5
                    py-3
                    text-sm
                    font-black
                    transition-all
                    ${
                      category === cat
                        ? "border-green-500 bg-green-500 text-black shadow-[0_0_25px_rgba(34,197,94,0.35)]"
                        : "border-white/10 bg-white/[0.04] text-slate-400"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value)
                }
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  py-4
                  text-white
                  outline-none
                "
              >
                {conditions.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-[#071019]"
                  >
                    {item === "All"
                      ? "All Conditions"
                      : item}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Max price ₹"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value)
                }
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  py-4
                  text-white
                  outline-none
                  placeholder:text-slate-500
                "
              />

              <button
                type="button"
                onClick={resetFilters}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  py-4
                  font-black
                  transition
                  hover:border-green-500
                "
              >
                Reset Filters
              </button>
            </div>
          </div>

          {!message && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-slate-400">
                Showing{" "}
                <span className="font-black text-green-400">
                  {filteredProducts.length}
                </span>{" "}
                listing(s)
              </p>
            </div>
          )}

          {message && (
            <div className="mt-10 text-center text-slate-400">
              {message}
            </div>
          )}

          {!message &&
            filteredProducts.length === 0 && (
              <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-12 text-center">
                <div className="text-6xl">
                  🛍️
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  No Listings Found
                </h2>

                <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-400">
                  Try changing your filters or search terms
                  to discover more campus products.
                </p>
              </div>
            )}

          {/* PRODUCTS */}

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const isSeller =
                currentUser?.id ===
                product.seller?.id;

              const image =
                product.imageUrls &&
                product.imageUrls.length > 0
                  ? product.imageUrls[0]
                  : null;

              return (
                <a
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-white/10
                    bg-white/[0.04]
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-green-500/40
                  "
                >
                  <div className="relative aspect-[1.1/1] overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-7xl">
                        🛍️
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-black backdrop-blur-xl">
                        {product.category}
                      </span>

                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-black text-black">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-2xl font-black">
                        {product.title}
                      </h2>

                      {product.seller
                        ?.studentVerified && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                          ✅
                        </div>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 leading-7 text-slate-400">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">
                          {product.seller?.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {product.seller?.college}
                        </p>
                      </div>

                      <div
                        className={`
                          rounded-full
                          px-4
                          py-2
                          text-xs
                          font-black
                          ${
                            isSeller
                              ? "bg-white/[0.06] text-white"
                              : "bg-green-500 text-black"
                          }
                        `}
                      >
                        {isSeller
                          ? "Your Listing"
                          : "View Deal"}
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}