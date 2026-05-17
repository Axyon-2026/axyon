"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

const categories = [
  "All",
  "Books",
  "Notes",
  "Electronics",
  "Furniture",
  "Hostel Items",
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
        category === "All" ? true : product.category === category;

      const matchesCondition =
        condition === "All" ? true : product.condition === condition;

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
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2rem] bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 text-white p-6 sm:p-10 shadow-xl shadow-green-200">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-xs font-bold">
                  Verified Campus Marketplace
                </span>

                <h1 className="mt-5 text-4xl sm:text-5xl font-black leading-tight">
                  Find what students are selling near you
                </h1>

                <p className="mt-4 text-green-50 max-w-2xl text-base sm:text-lg">
                  Browse books, electronics, notes, hostel essentials and more
                  from verified students.
                </p>
              </div>

              {currentUser?.role !== "ADMIN" && (
                <a
                  href="/create-product"
                  className="bg-white text-green-700 hover:bg-green-50 px-6 py-4 rounded-full font-black text-center shadow-lg"
                >
                  + Post Listing
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
            <input
              type="text"
              placeholder="Search books, laptops, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-green-500 focus:bg-white"
            />

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition ${
                    category === cat
                      ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-100"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none"
              >
                {conditions.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Conditions" : item}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Max price ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none"
              />

              <button
                onClick={resetFilters}
                className="col-span-2 md:col-span-1 border border-slate-300 hover:border-green-500 py-3 rounded-2xl font-bold text-slate-700"
              >
                Reset
              </button>
            </div>
          </div>

          {message && <p className="mt-8 text-slate-500">{message}</p>}

          {!message && (
            <div className="mt-7 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Showing {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            </div>
          )}

          {!message && filteredProducts.length === 0 && (
            <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
              <h2 className="text-2xl font-black">No products found</h2>

              <p className="mt-3 text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mt-5">
            {filteredProducts.map((product) => {
              const isSeller = currentUser?.id === product.seller?.id;
              const image =
                product.imageUrls && product.imageUrls.length > 0
                  ? product.imageUrls[0]
                  : "";

              return (
                <a
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  <div className="aspect-square bg-slate-100 relative overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-green-50 to-slate-100">
                        🛍️
                      </div>
                    )}

                    <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded-full">
                      {product.condition}
                    </span>

                    {isSeller && (
                      <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        Your Listing
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold">
                        {product.category}
                      </span>
                    </div>

                    <h2 className="font-black text-slate-900 text-sm sm:text-base leading-tight line-clamp-2">
                      {product.title}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 hidden sm:block">
                      {product.description}
                    </p>

                    <p className="mt-2 text-lg font-black text-green-600">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 truncate">
                          {product.seller?.name || "Unknown"}
                        </p>

                        <p className="text-[10px] text-slate-400 truncate">
                          {product.seller?.college || "Campus"}
                        </p>
                      </div>

                      <span className="text-[10px] text-green-600 font-black shrink-0">
                        View
                      </span>
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