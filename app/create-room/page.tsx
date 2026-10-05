"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateRoomPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomType, setRoomType] = useState("SINGLE");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [college, setCollege] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [amenities, setAmenities] = useState("");

  const [images, setImages] = useState<File[]>([]);

  function handleImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = Array.from(e.target.files || []);

    if (selected.length > 5) {
      alert("You can upload a maximum of 5 images.");
      e.target.value = "";
      return;
    }

    setImages(selected);
  }

  async function submit() {
    if (loading) return;

    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    if (!college.trim()) {
      alert("College is required.");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    if (images.length > 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }

    if (!description.trim()) {
      alert("Description is required.");
      return;
    }

    if (!rent || Number(rent) < 1) {
      alert("Please enter a valid monthly rent.");
      return;
    }

    if (!address.trim()) {
      alert("Address is required.");
      return;
    }

    const form = new FormData();

    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("roomType", roomType);
    form.append("rent", rent);
    form.append("deposit", deposit);
    form.append("address", address.trim());
    form.append("landmark", landmark.trim());
    form.append("college", college.trim());
    form.append("contactNumber", contactNumber.trim());
    form.append("amenities", amenities);

    images.forEach((image) => {
      form.append("images", image);
    });

    try {
      setLoading(true);

      const res = await fetch("/api/rooms", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to create accommodation."
        );
        return;
      }

      alert("Accommodation listed successfully.");

      router.push("/rooms");
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <Navbar />

      <section className="px-3 py-5 pb-20 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:rounded-[32px] sm:p-9 lg:p-11">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Student Accommodation
              </span>

              <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                List your accommodation.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                Help students find your room, PG, hostel or
                apartment near their campus.
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* FORM */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_45px_rgba(15,23,42,0.05)] sm:p-7">
              {/* FEE NOTICE */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" />

                <div className="relative flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                    💰
                  </div>

                  <div>
                    <p className="font-black text-emerald-700">
                      Success fee: Up to 10%
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-800/70">
                      A success fee may apply when your
                      accommodation listing results in a
                      successful arrangement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-7 mt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                  Accommodation details
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  Tell students about the space
                </h2>
              </div>

              <div className="space-y-6">
                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Title *
                  </label>

                  <input
                    placeholder="Example: Single room near campus"
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
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Description *
                  </label>

                  <textarea
                    placeholder="Describe the accommodation, location and important details..."
                    className="
                      min-h-[160px] w-full
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
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                  />

                  <p className="mt-2 text-[10px] text-slate-400">
                    Mention the location, room condition,
                    rules and anything important for
                    students.
                  </p>
                </div>

                {/* TYPE */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Accommodation Type *
                  </label>

                  <select
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
                    value={roomType}
                    onChange={(e) =>
                      setRoomType(e.target.value)
                    }
                  >
                    <option value="SINGLE">Single</option>
                    <option value="SHARED">Shared</option>
                    <option value="PG">PG</option>
                    <option value="HOSTEL">Hostel</option>
                    <option value="APARTMENT">
                      Apartment
                    </option>
                  </select>
                </div>

                {/* RENT + DEPOSIT */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                      Monthly Rent *
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-600">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="1"
                        placeholder="Monthly rent"
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
                        value={rent}
                        onChange={(e) =>
                          setRent(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                      Deposit
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        placeholder="Optional deposit"
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
                        value={deposit}
                        onChange={(e) =>
                          setDeposit(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Address *
                  </label>

                  <input
                    placeholder="Full accommodation address"
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
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                  />
                </div>

                {/* LANDMARK */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Landmark
                  </label>

                  <input
                    placeholder="Nearby landmark (optional)"
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
                    value={landmark}
                    onChange={(e) =>
                      setLandmark(e.target.value)
                    }
                  />
                </div>

                {/* COLLEGE */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    College *
                  </label>

                  <input
                    placeholder="College / university"
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
                    value={college}
                    onChange={(e) =>
                      setCollege(e.target.value)
                    }
                  />
                </div>

                {/* CONTACT */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Contact Number{" "}
                    <span className="font-normal normal-case tracking-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="tel"
                    placeholder="Phone number (optional)"
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
                    value={contactNumber}
                    onChange={(e) =>
                      setContactNumber(e.target.value)
                    }
                  />
                </div>

                {/* AMENITIES */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Amenities
                  </label>

                  <input
                    placeholder="WiFi, AC, Parking, Washing Machine..."
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
                    value={amenities}
                    onChange={(e) =>
                      setAmenities(e.target.value)
                    }
                  />

                  <p className="mt-2 text-[10px] text-slate-400">
                    Separate amenities with commas.
                  </p>
                </div>

                {/* IMAGES */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                    Accommodation Images *
                  </label>

                  <label
                    htmlFor="room-images"
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
                      🏠
                    </div>

                    <p className="mt-4 text-sm font-black text-slate-800">
                      Upload accommodation images
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Upload 1 to 5 clear images
                    </p>

                    <span className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white">
                      Choose Images
                    </span>

                    <input
                      id="room-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImages}
                      className="sr-only"
                    />
                  </label>

                  {images.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {images.map((image, index) => (
                        <div
                          key={`${image.name}-${index}`}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Accommodation preview ${
                              index + 1
                            }`}
                            className="aspect-square w-full object-cover"
                          />

                          <p className="truncate px-3 py-2 text-[10px] font-semibold text-slate-500">
                            Image {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="
                    flex h-13 w-full
                    items-center justify-center
                    gap-2 rounded-2xl
                    bg-emerald-600 px-5 py-3.5
                    text-sm font-black text-white
                    shadow-[0_10px_30px_rgba(16,185,129,0.18)]
                    transition-all
                    hover:bg-emerald-700
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Accommodation
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
                  🏠
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-900">
                  Make your listing useful
                </h3>

                <ul className="mt-5 space-y-3">
                  {[
                    "Use a clear and specific title",
                    "Add bright, clear accommodation photos",
                    "Mention nearby landmarks",
                    "Include important amenities",
                    "Keep rent and deposit accurate",
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
                    Student-focused accommodation
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Give students enough information to
                    understand the space before they contact
                    you.
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