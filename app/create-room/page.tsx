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
    const selected = Array.from(
      e.target.files || []
    );

    if (selected.length > 5) {
      alert(
        "You can upload a maximum of 5 images."
      );

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
      alert(
        "Please upload at least one image."
      );
      return;
    }

    if (images.length > 5) {
      alert(
        "You can upload a maximum of 5 images."
      );
      return;
    }

    if (!description.trim()) {
      alert("Description is required.");
      return;
    }

    if (!rent || Number(rent) < 1) {
      alert(
        "Please enter a valid monthly rent."
      );
      return;
    }

    if (!address.trim()) {
      alert("Address is required.");
      return;
    }

    const form = new FormData();

    form.append("title", title.trim());
    form.append(
      "description",
      description.trim()
    );
    form.append("roomType", roomType);
    form.append("rent", rent);
    form.append("deposit", deposit);
    form.append("address", address.trim());
    form.append("landmark", landmark.trim());
    form.append("college", college.trim());
    form.append(
      "contactNumber",
      contactNumber.trim()
    );
    form.append("amenities", amenities);

    images.forEach((image) => {
      form.append("images", image);
    });

    try {
      setLoading(true);

      const res = await fetch(
        "/api/rooms",
        {
          method: "POST",
          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to create accommodation."
        );
        return;
      }

      alert(
        "Accommodation listed successfully."
      );

      router.push("/rooms");
    } catch {
      alert(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        <div className="mb-8">
          <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-black text-green-400">
            Student Accommodation
          </span>

          <h1 className="mt-5 text-4xl font-black sm:text-5xl">
            List your accommodation
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Help students find your room,
            PG, hostel or apartment near
            their campus.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
            <p className="font-black text-green-400">
              Success fee: Up to 10%
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-300">
              A success fee may apply when your
              accommodation listing results in a
              successful arrangement.
            </p>
          </div>

          <div className="space-y-5">

            {/* TITLE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Title *
              </label>

              <input
                placeholder="Example: Single room near campus"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Description *
              </label>

              <textarea
                placeholder="Describe the accommodation, location and important details..."
                className="h-40 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </div>

            {/* ROOM TYPE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Accommodation Type *
              </label>

              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                value={roomType}
                onChange={(e) =>
                  setRoomType(
                    e.target.value
                  )
                }
              >
                <option value="SINGLE">
                  Single
                </option>

                <option value="SHARED">
                  Shared
                </option>

                <option value="PG">
                  PG
                </option>

                <option value="HOSTEL">
                  Hostel
                </option>

                <option value="APARTMENT">
                  Apartment
                </option>
              </select>
            </div>

            {/* RENT + DEPOSIT */}

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Monthly Rent *
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="₹ Monthly rent"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                  value={rent}
                  onChange={(e) =>
                    setRent(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Deposit
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="₹ Deposit (optional)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                  value={deposit}
                  onChange={(e) =>
                    setDeposit(
                      e.target.value
                    )
                  }
                />
              </div>

            </div>

            {/* ADDRESS */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Address *
              </label>

              <input
                placeholder="Full accommodation address"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />
            </div>

            {/* LANDMARK */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Landmark
              </label>

              <input
                placeholder="Nearby landmark (optional)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={landmark}
                onChange={(e) =>
                  setLandmark(
                    e.target.value
                  )
                }
              />
            </div>

            {/* COLLEGE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                College *
              </label>

              <input
                placeholder="College / university"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={college}
                onChange={(e) =>
                  setCollege(
                    e.target.value
                  )
                }
              />
            </div>

            {/* CONTACT */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Contact Number{" "}
                <span className="font-normal text-slate-500">
                  (optional)
                </span>
              </label>

              <input
                type="tel"
                placeholder="Phone number (optional)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={contactNumber}
                onChange={(e) =>
                  setContactNumber(
                    e.target.value
                  )
                }
              />
            </div>

            {/* AMENITIES */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Amenities
              </label>

              <input
                placeholder="WiFi, AC, Parking, Washing Machine..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={amenities}
                onChange={(e) =>
                  setAmenities(
                    e.target.value
                  )
                }
              />

              <p className="mt-2 text-xs text-slate-500">
                Separate amenities with commas.
              </p>
            </div>

            {/* IMAGES */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Accommodation Images *
              </label>

              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-5">

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImages}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-green-600 file:px-5 file:py-3 file:font-bold file:text-white hover:file:bg-green-700"
                />

                <p className="mt-3 text-xs text-slate-500">
                  Upload 1 to 5 images.
                </p>

              </div>

              {images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                  {images.map(
                    (image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950"
                      >
                        <img
                          src={URL.createObjectURL(
                            image
                          )}
                          alt={`Preview ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />

                        <p className="truncate px-3 py-2 text-xs text-slate-400">
                          Image {index + 1}
                        </p>
                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="w-full rounded-xl bg-green-600 p-4 font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Publishing..."
                : "Publish Accommodation"}
            </button>

          </div>
        </div>
      </section>
    </main>
  );
}