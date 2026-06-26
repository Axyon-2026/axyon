"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
        }

        const res = await fetch("/api/products");
        const data = await res.json();

        if (!res.ok) {
          setMessage("Failed to load products");
          return;
        }

        setProducts(data.products || []);
        setMessage("");
      } catch {
        setMessage("Something went wrong while loading products");
      }
    }

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.title?.toLowerCase().includes(searchText) ||
        product.description?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All"
          ? true
          : product.category === category;

      const matchesCondition =
        condition === "All"
          ? true
          : product.condition === condition;

      const matchesPrice = maxPrice
        ? Number(product.price) <= Number(maxPrice)
        : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCondition &&
        matchesPrice
      );
    });
  }, [products, search, category, condition, maxPrice]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setCondition("All");
    setMaxPrice("");
  }

  return (
    <main className="min-h-screen bg-[#071019] text-white overflow-hidden">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
            <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/20 rounded-full blur-3xl" />

            <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <span className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-xs font-black text-green-400">
                  ✦ Verified Campus Marketplace
                </span>

                <h1 className="mt-6 text-4xl sm:text-6xl font-black leading-[0.95]">
                  Discover campus
                  <br />
                  deals around you.
                </h1>

                <p className="mt-6 text-slate-400 max-w-2xl text-lg leading-8">
                  Explore books, electronics, notes, furniture,
                  hostel essentials, and student deals inside
                  trusted college communities.
                </p>
              </div>

              {currentUser?.role !== "ADMIN" && (
                <a
                  href="/create-product"
                  className="
                    bg-gradient-to-r
                    from-green-500
                    to-emerald-600
                    hover:scale-105
                    transition
                    text-black
                    px-7
                    py-4
                    rounded-full
                    font-black
                    shadow-[0_0_40px_rgba(34,197,94,0.35)]
                    text-center
                  "
                >
                  + Post Listing
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-[2rem] p-5">
            <input
              type="text"
              placeholder="Search books, laptops, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                px-5
                py-4
                rounded-2xl
                bg-white/[0.04]
                border
                border-white/10
                outline-none
                focus:border-green-500
                text-white
                placeholder:text-slate-500
              "
            />

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`
                    shrink-0
                    px-5
                    py-3
                    rounded-full
                    text-sm
                    font-black
                    border
                    transition-all
                    ${
                      category === cat
                        ? "bg-green-500 text-black border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.35)]"
                        : "bg-white/[0.04] text-slate-400 border-white/10"
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="
                  px-4
                  py-4
                  rounded-2xl
                  bg-white/[0.04]
                  border
                  border-white/10
                  outline-none
                  text-white
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
                  px-4
                  py-4
                  rounded-2xl
                  bg-white/[0.04]
                  border
                  border-white/10
                  outline-none
                  text-white
                  placeholder:text-slate-500
                "
              />

              <button
                onClick={resetFilters}
                className="
                  border
                  border-white/10
                  hover:border-green-500
                  py-4
                  rounded-2xl
                  font-black
                  transition
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
                <span className="text-green-400 font-black">
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
              <div className="mt-10 bg-white/[0.04] border border-white/10 rounded-[2rem] p-12 text-center">
                <div className="text-6xl">🛍️</div>

                <h2 className="mt-5 text-3xl font-black">
                  No Listings Found
                </h2>

                <p className="mt-4 text-slate-400 max-w-lg mx-auto leading-7">
                  Try changing your filters or search terms
                  to discover more campus products.
                </p>
              </div>
            )}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    bg-white/[0.04]
                    border
                    border-white/10
                    hover:border-green-500/40
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    backdrop-blur-xl
                  "
                >
                  <div className="relative aspect-[1.1/1] overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        className="
                          w-full
                          h-full
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-7xl">
                        🛍️
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      <span className="bg-black/50 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-full text-xs font-black">
                        {product.category}
                      </span>

                      <span className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-black">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-2xl font-black line-clamp-2">
                        {product.title}
                      </h2>

                      {product.seller
                        ?.studentVerified && (
                        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                          ✅
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-slate-400 line-clamp-2 leading-7">
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
                          px-4
                          py-2
                          rounded-full
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