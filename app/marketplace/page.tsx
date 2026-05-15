"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("Loading products...");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (userRes.ok) {
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
      const matchesSearch =
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category ? product.category === category : true;

      const matchesCondition = condition
        ? product.condition === condition
        : true;

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
    setCategory("");
    setCondition("");
    setMaxPrice("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-bold">Marketplace</h1>
            <p className="mt-3 text-slate-400">
              Buy and sell trusted campus products.
            </p>
          </div>

          {currentUser?.role !== "ADMIN" && (
  <a
          href="/create-product"
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium text-center"
  >
        Sell Product
  </a>
)}
        </div>

        <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:col-span-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
          >
            <option value="">All Categories</option>
            <option value="Books">Books</option>
            <option value="Notes">Notes</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Hostel Items">Hostel Items</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Others">Others</option>
          </select>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Used">Used</option>
          </select>

          <input
            type="number"
            placeholder="Max price ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
          />

          <button
            onClick={resetFilters}
            className="md:col-span-5 border border-slate-700 hover:border-slate-500 py-3 rounded-xl font-medium"
          >
            Reset Filters
          </button>
        </div>

        {message && <p className="mt-8 text-slate-400">{message}</p>}

        {!message && filteredProducts.length === 0 && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold">No products found</h2>
            <p className="mt-3 text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}

        <p className="mt-8 text-sm text-slate-400">
          Showing {filteredProducts.length} product(s)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredProducts.map((product) => {
            const isSeller = currentUser?.id === product.seller?.id;

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 transition"
              >
                <div className="h-56 bg-slate-800 overflow-hidden">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold line-clamp-2">
                      {product.title}
                    </h2>

                    <span className="text-blue-400 font-bold whitespace-nowrap">
                      ₹{product.price}
                    </span>
                  </div>

                  <p className="mt-3 text-slate-400 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-800 px-3 py-1 rounded-full">
                      {product.category}
                    </span>

                    <span className="bg-slate-800 px-3 py-1 rounded-full">
                      {product.condition}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    Seller: {product.seller?.name || "Unknown"}
                  </p>

                  <p className="text-sm text-slate-500">
                    College: {product.seller?.college || "Not added"}
                  </p>

                  <a
                    href={`/product/${product.id}`}
                    className={`block mt-5 text-center py-3 rounded-xl font-medium ${
                      isSeller
                        ? "bg-slate-700 hover:bg-slate-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSeller ? "Manage Listing" : "View & Buy"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}