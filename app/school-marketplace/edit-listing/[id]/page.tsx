"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  category: string;
  condition: string;
  status: string;
  imageUrls?: string[];
  sellerId?: string;
};

const categories = [
  "Books",
  "Notes",
  "Stationary",
  "Electronics",
  "Furniture",
  "Sports",
  "Clothing",
  "Accessories",
  "Others",
];

const conditions = [
  "NEW",
  "LIKE_NEW",
  "GOOD",
  "USED",
];

export default function SchoolEditListingPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<Product | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

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

        const response = await fetch(
          `/api/school/products/${id}`,
          {
            cache: "no-store",
          }
        );

        if (response.status === 401 || response.status === 403) {
          window.location.replace("/school-marketplace");
          return;
        }

        if (response.status === 404) {
          setError("Listing not found.");
          return;
        }

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();
        const loadedProduct = data.product as Product;

        if (loadedProduct.sellerId !== user.id) {
          setError("You can edit only your own listing.");
          return;
        }

        setProduct(loadedProduct);
        setTitle(loadedProduct.title || "");
        setDescription(loadedProduct.description || "");
        setPrice(String(loadedProduct.price ?? ""));
        setCategory(loadedProduct.category || "");
        setCondition(loadedProduct.condition || "");
        setImageUrls(
          Array.isArray(loadedProduct.imageUrls)
            ? loadedProduct.imageUrls
            : []
        );
      } catch {
        setError("Unable to load this listing.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!id) return;

    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const numericPrice = Number(price);

    if (!cleanTitle) {
      setError("Please enter a listing title.");
      return;
    }

    if (!cleanDescription) {
      setError("Please enter a description.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!condition) {
      setError("Please select the item condition.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/school/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: cleanTitle,
            description: cleanDescription,
            price: numericPrice,
            category,
            condition,
            imageUrls,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update listing."
        );
      }

      setSuccess("Listing updated successfully.");

      setTimeout(() => {
        router.push(
          `/school-marketplace/products/${id}`
        );
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update listing."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!id || !product) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this listing? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setRemoving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/school/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to remove listing."
        );
      }

      router.replace("/school-marketplace/my-listings");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove listing."
      );
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#070b14] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mx-auto mt-5 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

          <p className="mt-4 text-sm font-bold text-slate-500">
            Loading listing...
          </p>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <a
            href="/school-marketplace/my-listings"
            className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            ← My Listings
          </a>

          <div className="mt-8 rounded-[1.5rem] border border-red-400/20 bg-red-500/[0.06] p-6 sm:rounded-[2rem] sm:p-10">
            <p className="text-sm font-bold leading-6 text-red-200">
              {error}
            </p>

            <a
              href="/school-marketplace/my-listings"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-white/[0.07] px-5 py-3 text-xs font-black"
            >
              Back to My Listings
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  const isAvailable = product.status === "AVAILABLE";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* TOP BAR */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/school-marketplace/my-listings"
            className="inline-flex min-h-10 w-fit items-center rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            ← My Listings
          </a>

          <a
            href={`/school-marketplace/products/${product.id}`}
            className="inline-flex min-h-10 w-fit items-center rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            View Listing
          </a>
        </div>

        {/* HEADING */}
        <div className="mt-8 sm:mt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 sm:text-xs">
            School Marketplace
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Edit Listing
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Update the details of your School Marketplace listing.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSave}
          className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 sm:mt-10 sm:rounded-[2rem] sm:p-7"
        >
          {/* IMAGE PREVIEW */}
          {imageUrls.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Listing Images
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imageUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="aspect-square overflow-hidden rounded-2xl bg-black/20"
                  >
                    <img
                      src={url}
                      alt={`${title || "Listing"} image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[11px] leading-5 text-slate-600">
                Existing listing images are kept when you save changes.
              </p>
            </div>
          )}

          {/* TITLE */}
          <div className={imageUrls.length ? "mt-7" : ""}>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Title
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              disabled={!isAvailable || saving || removing}
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What are you selling?"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mt-5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={6}
              maxLength={2000}
              disabled={!isAvailable || saving || removing}
              className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe your item..."
            />
          </div>

          {/* PRICE */}
          <div className="mt-5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Price
            </label>

            <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-indigo-400/50">
              <span className="px-4 text-sm font-black text-slate-500">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                disabled={!isAvailable || saving || removing}
                className="min-h-12 min-w-0 flex-1 bg-transparent pr-4 text-sm font-semibold text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0"
              />
            </div>
          </div>

          {/* CATEGORY + CONDITION */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                disabled={!isAvailable || saving || removing}
                className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#101620] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select category</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Condition
              </label>

              <select
                value={condition}
                onChange={(event) =>
                  setCondition(event.target.value)
                }
                disabled={!isAvailable || saving || removing}
                className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#101620] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select condition</option>

                {conditions.map((item) => (
                  <option key={item} value={item}>
                    {item.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
            <span className="text-xs font-bold text-slate-500">
              Current status
            </span>

            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-black text-indigo-300">
              {product.status}
            </span>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3">
              <p className="text-xs font-bold leading-5 text-red-200">
                {error}
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3">
              <p className="text-xs font-bold leading-5 text-emerald-300">
                {success}
              </p>
            </div>
          )}

          {/* SAVE */}
          <button
            type="submit"
            disabled={!isAvailable || saving || removing}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

          {!isAvailable && (
            <p className="mt-3 text-center text-xs font-bold leading-5 text-amber-300/80">
              This listing is {product.status.toLowerCase()} and cannot
              be edited.
            </p>
          )}
        </form>

        {/* REMOVE */}
        {isAvailable && (
          <section className="mt-5 rounded-[1.5rem] border border-red-400/10 bg-red-500/[0.025] p-4 sm:rounded-[2rem] sm:p-6">
            <p className="text-sm font-black text-white">
              Remove this listing
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Removing a listing will hide it from the School Marketplace
              and archive its related conversations.
            </p>

            <button
              type="button"
              onClick={handleRemove}
              disabled={saving || removing}
              className="mt-4 min-h-11 w-full rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-xs font-black text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5"
            >
              {removing ? "Removing Listing..." : "Remove Listing"}
            </button>
          </section>
        )}

        <div className="h-8 sm:h-12" />
      </div>
    </main>
  );
}