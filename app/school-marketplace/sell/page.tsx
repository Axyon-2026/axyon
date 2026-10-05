"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

type PreviewImage = {
  file: File;
  url: string;
};

export default function SchoolSellPage() {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch(
          "/api/school/products",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          window.location.replace(
            "/school-marketplace/login"
          );
          return;
        }

        if (!response.ok) {
          setError(
            "Unable to verify your School Marketplace access."
          );
        }
      } catch {
        setError(
          "Unable to verify your School Marketplace access."
        );
      } finally {
        setChecking(false);
      }
    }

    checkAccess();
  }, []);

  function handleImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    if (
      images.length + selectedFiles.length >
      5
    ) {
      setError(
        "You can upload a maximum of 5 images."
      );
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type)
    );

    if (invalidFile) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );
      event.target.value = "";
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) =>
        file.size > 5 * 1024 * 1024
    );

    if (oversizedFile) {
      setError(
        "Each image must be smaller than 5MB."
      );
      event.target.value = "";
      return;
    }

    const newImages = selectedFiles.map(
      (file) => ({
        file,
        url: URL.createObjectURL(file),
      })
    );

    setImages((current) => [
      ...current,
      ...newImages,
    ]);

    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => {
      const image = current[index];

      if (image) {
        URL.revokeObjectURL(image.url);
      }

      return current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (images.length === 0) {
      setError(
        "Please add at least one product photo."
      );
      return;
    }

    if (images.length > 5) {
      setError(
        "You can upload a maximum of 5 images."
      );
      return;
    }

    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    images.forEach((image) => {
      formData.append(
        "images",
        image.file
      );
    });

    try {
      const response = await fetch(
        "/api/school/products",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          window.location.replace(
            "/school-marketplace/login"
          );
          return;
        }

        setError(
          data.message ||
            "Unable to create your listing."
        );

        return;
      }

      setSuccess(
        "Your product has been listed successfully."
      );

      form.reset();

      images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });

      setImages([]);

      setTimeout(() => {
        window.location.replace(
          "/school-marketplace/products"
        );
      }, 1000);
    } catch {
      setError(
        "Something went wrong while creating your listing."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#070b14] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mx-auto mt-5 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

          <p className="mt-4 text-sm font-bold text-slate-500">
            Checking School Marketplace access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 sm:text-xs sm:tracking-wider">
              Axyon · School Marketplace
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Sell an Item
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Create a listing for verified students across schools.
            </p>
          </div>

          <a
            href="/school-marketplace/home"
            className="inline-flex min-h-10 w-fit shrink-0 items-center rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            ← Home
          </a>
        </header>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl sm:mt-8 sm:rounded-[2rem] sm:p-7 lg:p-8"
        >
          {/* BASIC INFORMATION */}
          <section>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">
                Step 1
              </p>

              <h2 className="mt-2 text-xl font-black">
                Product information
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Give buyers enough information to understand what
                you're selling.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {/* TITLE */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400"
                >
                  Product Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Example: Class 10 Science Books"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/60 focus:bg-black/30"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={6}
                  placeholder="Describe the product, its condition, what is included, etc."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/60 focus:bg-black/30"
                />

                <p className="mt-2 text-[11px] text-slate-700">
                  Be clear about condition, included items, and
                  anything buyers should know.
                </p>
              </div>

              {/* PRICE */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400"
                >
                  Price
                </label>

                <div className="flex min-h-12 items-center overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-indigo-400/60">
                  <span className="pl-4 text-sm font-black text-slate-500">
                    ₹
                  </span>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    min="1"
                    max="500000"
                    step="1"
                    placeholder="Enter price"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-slate-700"
                  />
                </div>

                <p className="mt-2 text-[11px] text-slate-700">
                  Maximum listing price: ₹5,00,000
                </p>
              </div>

              {/* CATEGORY + CONDITION */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400"
                  >
                    Category
                  </label>

                  <select
                    id="category"
                    name="category"
                    required
                    defaultValue=""
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-[#101620] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-indigo-400/60"
                  >
                    <option value="" disabled>
                      Select category
                    </option>

                    <option value="Books">
                      Books
                    </option>

                    <option value="School Supplies">
                      School Supplies
                    </option>

                    <option value="Uniform">
                      Uniform
                    </option>

                    <option value="Electronics">
                      Electronics
                    </option>

                    <option value="Sports">
                      Sports
                    </option>

                    <option value="Stationery">
                      Stationery
                    </option>

                    <option value="Bags">
                      Bags
                    </option>

                    <option value="Cycles">
                      Cycles
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="condition"
                    className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400"
                  >
                    Condition
                  </label>

                  <select
                    id="condition"
                    name="condition"
                    required
                    defaultValue=""
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-[#101620] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-indigo-400/60"
                  >
                    <option value="" disabled>
                      Select condition
                    </option>

                    <option value="New">
                      New
                    </option>

                    <option value="Like New">
                      Like New
                    </option>

                    <option value="Good">
                      Good
                    </option>

                    <option value="Fair">
                      Fair
                    </option>

                    <option value="Used">
                      Used
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* IMAGES */}
          <section className="mt-9 border-t border-white/10 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">
                  Step 2
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Product photos
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add up to 5 clear photos. The first photo will be
                  your main listing image.
                </p>
              </div>

              <div className="shrink-0 rounded-full bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black text-indigo-300">
                {images.length}/5
              </div>
            </div>

            <label
              className={`mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-8 text-center transition hover:border-indigo-400/30 hover:bg-white/[0.05] ${
                images.length >= 5
                  ? "cursor-not-allowed opacity-40"
                  : ""
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                📷
              </div>

              <p className="mt-4 text-sm font-black">
                Add product photos
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-600">
                JPG, PNG or WEBP · Maximum 5MB each
              </p>

              {images.length < 5 && (
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImages}
                  className="hidden"
                />
              )}
            </label>

            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {images.map((image, index) => (
                  <div
                    key={`${image.file.name}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                  >
                    <img
                      src={image.url}
                      alt={`Product photo ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
                      aria-label={`Remove photo ${index + 1}`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-lg font-black text-white backdrop-blur transition hover:bg-red-500"
                    >
                      ×
                    </button>

                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/75 px-2 py-2 text-center text-[9px] font-black uppercase tracking-wider">
                        Main photo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SELLER INFORMATION */}
          <section className="mt-9 border-t border-white/10 pt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">
              Step 3
            </p>

            <h2 className="mt-2 text-xl font-black">
              Seller information
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Your verified School Marketplace account automatically
              attaches your school and city to this listing.
            </p>

            <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.04] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm">
                  ✓
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-emerald-300">
                    Verified School Account
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your verified school information is automatically
                    attached to your listing and cannot be manually
                    changed here.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3.5">
              <p className="text-xs font-bold leading-5 text-red-200 sm:text-sm">
                {error}
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3.5">
              <p className="text-xs font-bold leading-5 text-emerald-300 sm:text-sm">
                {success}
              </p>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-7 flex min-h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Publishing Listing..."
              : "Publish Listing"}
          </button>

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-700">
            Your listing will appear only inside the School Marketplace.
          </p>
        </form>

        <div className="h-6 sm:h-10" />
      </div>
    </main>
  );
}