"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const categories = [
  "Books",
  "Notes",
  "Electronics",
  "Medical Equipment",
  "Furniture",
  "Stationary",
  "Vehicles",
  "Others",
];

const conditions = [
  "New",
  "Like New",
  "Good",
  "Used",
];

export default function CreateProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("Good");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        setUser(data.user);

        if (
          data.user?.studentVerificationStatus !==
          "APPROVED"
        ) {
          window.location.href = "/student-verification";
        }
      } catch {}
    }

    fetchUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price) {
      setMessage("Please fill all fields.");
      return;
    }

    if (Number(price) <= 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    setLoading(true);
    setMessage("Creating listing...");

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("category", category);
      formData.append("condition", condition);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message || "Failed to create listing"
        );
        setLoading(false);
        return;
      }

      setMessage("Product listed successfully!");

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("Books");
      setCondition("Good");
      setImages([]);

      setTimeout(() => {
        window.location.href = "/marketplace";
      }, 1500);
    } catch {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isUnderLimit =
        file.size <= 5 * 1024 * 1024;

      return isImage && isUnderLimit;
    });

    if (validFiles.length !== selectedFiles.length) {
      setMessage(
        "Some images were too large or invalid. Please upload images under 5MB."
      );
    } else {
      setMessage("");
    }

    setImages(validFiles);
  }

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <Navbar />

      <section className="px-3 py-5 pb-20 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-700 via-green-600 to-emerald-400 p-6 text-white shadow-[0_20px_60px_rgba(22,163,74,0.16)] sm:rounded-[32px] sm:p-9 lg:p-11">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-950/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Sell on Axyon
              </span>

              <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Create a new listing.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base sm:leading-7">
                Sell books, gadgets, hostel items, notes,
                furniture and more to verified students on
                campus.
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* FORM */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_45px_rgba(15,23,42,0.05)] sm:p-7">
              <div className="mb-7">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                  Listing details
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  Tell students what you’re selling
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* TITLE */}
                <div>
                  <label
                    htmlFor="product-title"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600"
                  >
                    Product Title
                  </label>

                  <input
                    id="product-title"
                    type="text"
                    placeholder="e.g. Data Structures Book"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    className="
                      h-12 w-full rounded-2xl
                      border border-slate-200
                      bg-slate-50 px-4
                      text-sm text-slate-900
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label
                    htmlFor="product-description"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600"
                  >
                    Description
                  </label>

                  <textarea
                    id="product-description"
                    rows={7}
                    placeholder="Describe your product, condition, pickup location, etc."
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    className="
                      min-h-[150px] w-full
                      resize-none rounded-2xl
                      border border-slate-200
                      bg-slate-50 px-4 py-3.5
                      text-sm leading-6 text-slate-900
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-emerald-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />

                  <p className="mt-2 text-[10px] text-slate-400">
                    Include useful details that help a
                    buyer understand the listing.
                  </p>
                </div>

                {/* CATEGORY + CONDITION */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="product-category"
                      className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600"
                    >
                      Category
                    </label>

                    <select
                      id="product-category"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      className="
                        h-12 w-full rounded-2xl
                        border border-slate-200
                        bg-slate-50 px-4
                        text-sm font-medium text-slate-900
                        outline-none transition
                        focus:border-emerald-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-emerald-500/10
                      "
                    >
                      {categories.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="product-condition"
                      className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600"
                    >
                      Condition
                    </label>

                    <select
                      id="product-condition"
                      value={condition}
                      onChange={(e) =>
                        setCondition(e.target.value)
                      }
                      className="
                        h-12 w-full rounded-2xl
                        border border-slate-200
                        bg-slate-50 px-4
                        text-sm font-medium text-slate-900
                        outline-none transition
                        focus:border-emerald-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-emerald-500/10
                      "
                    >
                      {conditions.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PRICE */}
                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600"
                  >
                    Price
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-600">
                      ₹
                    </span>

                    <input
                      id="product-price"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter product price"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      className="
                        h-12 w-full rounded-2xl
                        border border-slate-200
                        bg-slate-50
                        pl-9 pr-4
                        text-sm font-semibold
                        text-slate-900
                        outline-none transition
                        placeholder:text-slate-400
                        focus:border-emerald-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-emerald-500/10
                      "
                    />
                  </div>
                </div>

                {/* IMAGES */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Product Images
                  </label>

                  <label
                    htmlFor="product-images"
                    className="
                      block cursor-pointer
                      rounded-[24px]
                      border-2 border-dashed
                      border-slate-200
                      bg-slate-50
                      p-6 text-center
                      transition
                      hover:border-emerald-400
                      hover:bg-emerald-50/40
                      sm:p-8
                    "
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl">
                      📸
                    </div>

                    <p className="mt-4 text-sm font-black text-slate-800">
                      Upload product images
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      PNG, JPG or WEBP • Maximum 5MB per
                      image
                    </p>

                    <span className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white">
                      Choose Images
                    </span>

                    <input
                      id="product-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />

                    {images.length > 0 && (
                      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-xs font-black text-emerald-700">
                          {images.length} image
                          {images.length === 1
                            ? ""
                            : "s"}{" "}
                          selected
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex h-13 w-full items-center
                    justify-center gap-2 rounded-2xl
                    bg-emerald-600 px-5 py-3.5
                    text-sm font-black text-white
                    shadow-[0_10px_30px_rgba(16,185,129,0.18)]
                    transition-all duration-200
                    hover:bg-emerald-700
                    hover:shadow-[0_12px_35px_rgba(16,185,129,0.22)]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Listing
                      <span>→</span>
                    </>
                  )}
                </button>

                {message && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      message.includes("successfully")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : message.includes("Creating")
                          ? "border-slate-200 bg-slate-50 text-slate-600"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
                  💡
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-900">
                  Listing Tips
                </h3>

                <ul className="mt-5 space-y-3">
                  {[
                    "Add clear product photos",
                    "Mention the exact condition",
                    "Keep pricing realistic",
                    "Respond quickly to buyers",
                    "Avoid misleading descriptions",
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex gap-2.5 text-sm leading-5 text-slate-600"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-[28px] bg-[#06100c] p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

                <div className="relative">
                  <span className="text-2xl">🛡️</span>

                  <h3 className="mt-4 text-xl font-black">
                    Verified Campus Marketplace
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Axyon is designed for safer
                    student-to-student transactions inside
                    your campus ecosystem.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}