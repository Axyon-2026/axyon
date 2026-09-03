"use client";

import Navbar from "@/components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditRoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await fetch(
          `/api/rooms/edit/${id}`
        );

        const room = await res.json();

        if (!res.ok) {
          alert(
            room.message ||
              "Failed to load accommodation."
          );

          router.push("/dashboard");
          return;
        }

        setTitle(room.title || "");
        setDescription(
          room.description || ""
        );
        setRoomType(
          room.roomType || "SINGLE"
        );
        setRent(
          String(room.rent ?? "")
        );
        setDeposit(
          String(room.deposit ?? "")
        );
        setAddress(
          room.address || ""
        );
        setLandmark(
          room.landmark || ""
        );
        setCollege(
          room.college || ""
        );
        setContactNumber(
          room.contactNumber || ""
        );

        setAmenities(
          Array.isArray(room.amenities)
            ? room.amenities.join(", ")
            : ""
        );

        setExistingImages(
          Array.isArray(room.imageUrls)
            ? room.imageUrls
            : []
        );
      } catch {
        alert(
          "Failed to load accommodation."
        );
      } finally {
        setFetching(false);
      }
    }

    if (id) {
      loadRoom();
    }
  }, [id, router]);

  function removeExistingImage(
    index: number
  ) {
    setExistingImages((prev) =>
      prev.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  }

  function handleNewImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = Array.from(
      e.target.files || []
    );

    const availableSlots =
      5 - existingImages.length;

    if (selected.length > availableSlots) {
      alert(
        `You can add only ${availableSlots} more image${
          availableSlots === 1
            ? ""
            : "s"
        }. Maximum is 5 images.`
      );

      e.target.value = "";
      return;
    }

    setNewImages(selected);
  }

  function removeNewImage(
    index: number
  ) {
    setNewImages((prev) =>
      prev.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  }

  async function submit() {
    if (loading) return;

    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    if (!description.trim()) {
      alert(
        "Description is required."
      );
      return;
    }

    if (!college.trim()) {
      alert(
        "College is required."
      );
      return;
    }

    if (!address.trim()) {
      alert(
        "Address is required."
      );
      return;
    }

    if (!rent || Number(rent) < 1) {
      alert(
        "Please enter a valid monthly rent."
      );
      return;
    }

    const totalImages =
      existingImages.length +
      newImages.length;

    if (totalImages === 0) {
      alert(
        "Accommodation must have at least one image."
      );
      return;
    }

    if (totalImages > 5) {
      alert(
        "You can have a maximum of 5 images."
      );
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();

      form.append(
        "title",
        title.trim()
      );

      form.append(
        "description",
        description.trim()
      );

      form.append(
        "roomType",
        roomType
      );

      form.append(
        "rent",
        rent
      );

      form.append(
        "deposit",
        deposit
      );

      form.append(
        "address",
        address.trim()
      );

      form.append(
        "landmark",
        landmark.trim()
      );

      form.append(
        "college",
        college.trim()
      );

      form.append(
        "contactNumber",
        contactNumber.trim()
      );

      form.append(
        "amenities",
        amenities
      );

      form.append(
        "existingImages",
        JSON.stringify(
          existingImages
        )
      );

      newImages.forEach(
        (image) => {
          form.append(
            "images",
            image
          );
        }
      );

      const res = await fetch(
        `/api/rooms/edit/${id}`,
        {
          method: "PUT",
          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to update accommodation."
        );
        return;
      }

      alert(
        "Accommodation updated successfully."
      );

      router.push(
        `/rooms/${id}`
      );
    } catch {
      alert(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-slate-400">
          Loading accommodation...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        <div className="mb-8">
          <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black text-blue-400">
            Manage Listing
          </span>

          <h1 className="mt-5 text-4xl font-black sm:text-5xl">
            Edit Accommodation
          </h1>

          <p className="mt-3 text-slate-400">
            Update your accommodation details
            and manage its images.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Title *
              </label>

              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Description *
              </label>

              <textarea
                className="h-40 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-500 focus:border-green-500"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </div>

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

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Monthly Rent *
                </label>

                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                  value={rent}
                  onChange={(e) =>
                    setRent(
                      e.target.value
                    )
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                  value={deposit}
                  onChange={(e) =>
                    setDeposit(
                      e.target.value
                    )
                  }
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Address *
              </label>

              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Landmark
              </label>

              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                value={landmark}
                onChange={(e) =>
                  setLandmark(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                College *
              </label>

              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                value={college}
                onChange={(e) =>
                  setCollege(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Contact Number{" "}
                <span className="font-normal text-slate-500">
                  (optional)
                </span>
              </label>

              <input
                type="tel"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                value={contactNumber}
                onChange={(e) =>
                  setContactNumber(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Amenities
              </label>

              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-green-500"
                value={amenities}
                onChange={(e) =>
                  setAmenities(
                    e.target.value
                  )
                }
              />
            </div>

            {/* EXISTING IMAGES */}

            <div className="pt-3">
              <div className="flex items-center justify-between gap-3">

                <label className="block text-sm font-bold text-white">
                  Current Images
                </label>

                <span className="text-xs font-bold text-slate-500">
                  {existingImages.length} / 5
                </span>

              </div>

              {existingImages.length === 0 ? (
                <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  No current images. Add at least
                  one image below.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {existingImages.map(
                    (image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950"
                      >
                        <img
                          src={image}
                          alt={`Current image ${
                            index + 1
                          }`}
                          className="aspect-square w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-2 text-xs font-black text-white shadow-lg hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}

                </div>
              )}
            </div>

            {/* NEW IMAGES */}

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Add Images
              </label>

              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-5">

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={
                    existingImages.length >= 5
                  }
                  onChange={handleNewImages}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-green-600 file:px-5 file:py-3 file:font-bold file:text-white"
                />

                <p className="mt-3 text-xs text-slate-500">
                  Maximum 5 images total.
                  You currently have{" "}
                  {existingImages.length +
                    newImages.length}{" "}
                  selected.
                </p>

              </div>

              {newImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {newImages.map(
                    (image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-slate-950"
                      >
                        <img
                          src={URL.createObjectURL(
                            image
                          )}
                          alt={`New image ${
                            index + 1
                          }`}
                          className="aspect-square w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-2 text-xs font-black text-white shadow-lg hover:bg-red-700"
                        >
                          Remove
                        </button>
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
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </div>
      </section>
    </main>
  );
}