"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function AdminListingsPage() {
  const [products, setProducts] =
    useState<any[]>([]);

  const [message, setMessage] =
    useState(
      "Loading listings..."
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  async function fetchProducts() {
    try {
      const res =
        await fetch(
          "/api/admin/listings"
        );

      const data =
        await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load listings"
        );

        return;
      }

      setProducts(
        data.products || []
      );

      setMessage("");

    } catch {

      setMessage(
        "Something went wrong"
      );

    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function deleteProduct(
    productId: string
  ) {
    const confirmed =
      confirm(
        "Remove this listing?"
      );

    if (!confirmed) return;

    try {

      const res =
        await fetch(
          `/api/admin/listings/${productId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.message ||
            "Failed to remove listing"
        );

        return;
      }

      setProducts((prev) =>
        prev.filter(
          (p) =>
            p.id !== productId
        )
      );

      alert(
        "Listing removed successfully"
      );

    } catch {

      alert(
        "Failed to remove listing"
      );

    }
  }

  const filteredProducts =
    useMemo(() => {

      return products.filter(
        (product) => {

          const matchesSearch =
            product.title
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            product.seller?.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "ALL"
              ? true
              : filter ===
                "REPORTED"
              ? product.reports
                  ?.length > 0
              : filter ===
                "VERIFIED"
              ? product.seller
                  ?.studentVerified
              : true;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [
      products,
      search,
      filter,
    ]);

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-7xl mx-auto">
          {/* hero */}

          <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-8 sm:p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.25),_transparent_35%)]" />

            <div className="relative">
              <span className="inline-flex bg-green-500/10 border border-green-500/20 text-green-400 rounded-full px-4 py-2 text-xs font-black">
                Marketplace Moderation
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl font-black">
                Admin Listings
              </h1>

              <p className="mt-4 text-slate-400 max-w-2xl leading-7">
                Review marketplace products, moderate suspicious listings,
                and monitor seller activity across Axyon.
              </p>
            </div>
          </div>

          {/* filters */}

          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <input
                type="text"

                placeholder="Search by product or seller..."

                value={search}

                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }

                className="
                  px-5
                  py-4
                  rounded-2xl
                  bg-slate-800
                  border
                  border-slate-700
                  outline-none
                  focus:border-green-500
                "
              />

              <div className="flex flex-wrap gap-3">
                {[
                  "ALL",
                  "REPORTED",
                  "VERIFIED",
                ].map((item) => (
                  <button
                    key={item}

                    onClick={() =>
                      setFilter(item)
                    }

                    className={`
                      px-5
                      py-3
                      rounded-full
                      text-sm
                      font-black
                      border
                      transition

                      ${
                        filter === item
                          ? "bg-green-600 border-green-600"
                          : "bg-slate-800 border-slate-700 hover:border-green-500"
                      }
                    `}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <p className="text-slate-400 font-semibold">
                {message}
              </p>
            </div>
          )}

          {!message &&
            filteredProducts.length ===
              0 && (
              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-[2rem] p-10 text-center">
                <div className="text-6xl">
                  🛍️
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  No Listings Found
                </h2>

                <p className="mt-3 text-slate-400">
                  No products match the selected filters.
                </p>
              </div>
            )}

          {!message && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-400 font-semibold">
                Showing{" "}
                {
                  filteredProducts.length
                }{" "}
                listing(s)
              </p>
            </div>
          )}

          {/* products */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            {filteredProducts.map(
              (product) => {

                const image =
                  product.imageUrls &&
                  product.imageUrls
                    .length > 0
                    ? product
                        .imageUrls[0]
                    : "";

                return (
                  <div
                    key={product.id}

                    className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-[2rem]
                    overflow-hidden
                    shadow-2xl
                  "
                  >
                    <div className="grid grid-cols-[140px_1fr]">
                      <div className="bg-slate-800 aspect-square">
                        {image ? (
                          <img
                            src={image}
                            alt={
                              product.title
                            }

                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🛍️
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                            {
                              product.category
                            }
                          </span>

                          <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-black">
                            {
                              product.condition
                            }
                          </span>

                          {product.reports
                            ?.length >
                            0 && (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black">
                              🚨 Reported
                            </span>
                          )}
                        </div>

                        <h2 className="mt-4 text-2xl font-black line-clamp-2">
                          {product.title}
                        </h2>

                        <p className="mt-2 text-green-400 text-3xl font-black">
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-slate-400">
                            Seller:{" "}
                            <span className="text-white font-semibold">
                              {
                                product
                                  .seller
                                  ?.name
                              }
                            </span>
                          </p>

                          <p className="text-sm text-slate-400">
                            College:{" "}
                            <span className="text-white font-semibold">
                              {
                                product
                                  .seller
                                  ?.college
                              }
                            </span>
                          </p>

                          <p className="text-sm text-slate-400">
                            Reports:{" "}
                            <span className="text-white font-semibold">
                              {
                                product
                                  .reports
                                  ?.length ||
                                  0
                              }
                            </span>
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href={`/product/${product.id}`}

                            className="
                              bg-green-600
                              hover:bg-green-700
                              px-5
                              py-3
                              rounded-full
                              font-black
                              text-sm
                            "
                          >
                            View Product
                          </a>

                          <button
                            onClick={() =>
                              deleteProduct(
                                product.id
                              )
                            }

                            className="
                              border
                              border-red-500/30
                              hover:border-red-500
                              text-red-400
                              px-5
                              py-3
                              rounded-full
                              font-black
                              text-sm
                            "
                          >
                            Remove Listing
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>
    </main>
  );
}