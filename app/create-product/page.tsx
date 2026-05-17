"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const categories = [
  "Books",
  "Notes",
  "Electronics",
  "Furniture",
  "Hostel Items",
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
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [category, setCategory] =
    useState("Books");

  const [condition, setCondition] =
    useState("Good");

  const [images, setImages] =
    useState<File[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [user, setUser] =
    useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res =
          await fetch(
            "/api/auth/me"
          );

        if (!res.ok) return;

        const data =
          await res.json();

        setUser(data.user);

        if (
          data.user
            ?.studentVerificationStatus !==
          "APPROVED"
        ) {
          window.location.href =
            "/student-verification";
        }

      } catch {}
    }

    fetchUser();
  }, []);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !title ||
      !description ||
      !price
    ) {
      setMessage(
        "Please fill all fields"
      );

      return;
    }

    setLoading(true);

    setMessage(
      "Creating listing..."
    );

    try {

      const formData =
        new FormData();

      formData.append(
        "title",
        title
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "price",
        price
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "condition",
        condition
      );

      images.forEach(
        (image) => {
          formData.append(
            "images",
            image
          );
        }
      );

      const res =
        await fetch(
          "/api/products",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await res.json();

      if (!res.ok) {

        setMessage(
          data.message ||
            "Failed to create listing"
        );

        setLoading(false);

        return;
      }

      setMessage(
        "Product listed successfully!"
      );

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("Books");
      setCondition("Good");
      setImages([]);

      setTimeout(() => {
        window.location.href =
          "/marketplace";
      }, 1500);

    } catch {

      setMessage(
        "Something went wrong"
      );

    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-400 text-white p-8 sm:p-10 shadow-xl shadow-green-200">
            <span className="inline-flex bg-white/20 border border-white/30 rounded-full px-4 py-2 text-xs font-black">
              Sell on Axyon
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl font-black">
              Create New Listing
            </h1>

            <p className="mt-4 text-green-50 max-w-2xl leading-7">
              Sell books, gadgets, hostel items, notes, furniture, and more to verified students on campus.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block mb-2 text-sm font-black text-slate-700">
                    Product Title
                  </label>

                  <input
                    type="text"

                    placeholder="e.g. Data Structures Book"

                    value={title}

                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }

                    className="
                      w-full
                      px-5
                      py-4
                      rounded-2xl
                      bg-slate-100
                      border
                      border-slate-200
                      outline-none
                      focus:bg-white
                      focus:border-green-500
                    "
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-black text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={7}

                    placeholder="Describe your product, condition, pickup location, etc."

                    value={description}

                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }

                    className="
                      w-full
                      px-5
                      py-4
                      rounded-2xl
                      bg-slate-100
                      border
                      border-slate-200
                      outline-none
                      resize-none
                      focus:bg-white
                      focus:border-green-500
                    "
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-black text-slate-700">
                      Category
                    </label>

                    <select
                      value={category}

                      onChange={(e) =>
                        setCategory(
                          e.target.value
                        )
                      }

                      className="
                        w-full
                        px-5
                        py-4
                        rounded-2xl
                        bg-slate-100
                        border
                        border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-green-500
                      "
                    >
                      {categories.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-black text-slate-700">
                      Condition
                    </label>

                    <select
                      value={condition}

                      onChange={(e) =>
                        setCondition(
                          e.target.value
                        )
                      }

                      className="
                        w-full
                        px-5
                        py-4
                        rounded-2xl
                        bg-slate-100
                        border
                        border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-green-500
                      "
                    >
                      {conditions.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-black text-slate-700">
                    Price (₹)
                  </label>

                  <input
                    type="number"

                    placeholder="Enter product price"

                    value={price}

                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }

                    className="
                      w-full
                      px-5
                      py-4
                      rounded-2xl
                      bg-slate-100
                      border
                      border-slate-200
                      outline-none
                      focus:bg-white
                      focus:border-green-500
                    "
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-black text-slate-700">
                    Product Images
                  </label>

                  <div
                    className="
                    border-2
                    border-dashed
                    border-slate-300
                    hover:border-green-400
                    bg-slate-50
                    rounded-[2rem]
                    p-8
                    text-center
                  "
                  >
                    <div className="text-5xl">
                      📸
                    </div>

                    <p className="mt-4 font-black text-slate-800">
                      Upload Product Images
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      PNG, JPG, WEBP supported
                    </p>

                    <input
                      type="file"

                      multiple

                      accept="image/*"

                      onChange={(e) =>
                        setImages(
                          Array.from(
                            e.target
                              .files || []
                          )
                        )
                      }

                      className="
                        mt-5
                        block
                        w-full
                        text-sm
                        text-slate-500
                      "
                    />

                    {images.length >
                      0 && (
                      <div className="mt-5 text-sm font-semibold text-green-700">
                        {images.length} image(s) selected
                      </div>
                    )}
                  </div>
                </div>

                <button
                  disabled={loading}

                  className="
                    w-full
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    py-4
                    rounded-full
                    font-black
                    shadow-lg
                    shadow-green-100
                    disabled:opacity-60
                  "
                >
                  {loading
                    ? "Creating..."
                    : "Create Listing"}
                </button>

                {message && (
                  <p className="text-sm font-semibold text-slate-600">
                    {message}
                  </p>
                )}
              </form>
            </div>

            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <h3 className="text-2xl font-black">
                  Listing Tips
                </h3>

                <ul className="mt-5 space-y-4 text-slate-600">
                  <li>
                    • Add clear product photos
                  </li>

                  <li>
                    • Mention exact condition
                  </li>

                  <li>
                    • Keep pricing realistic
                  </li>

                  <li>
                    • Respond quickly to buyers
                  </li>

                  <li>
                    • Avoid misleading descriptions
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 text-white rounded-[2rem] p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_40%)]" />

                <div className="relative">
                  <h3 className="text-2xl font-black">
                    Verified Campus Marketplace
                  </h3>

                  <p className="mt-4 text-slate-300 leading-7">
                    Axyon is designed for safer student-to-student transactions inside your campus ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}