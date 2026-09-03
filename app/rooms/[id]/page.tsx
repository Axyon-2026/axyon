"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<any>(null);

  const [room, setRoom] =
    useState<any>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [contacting, setContacting] =
    useState(false);

  const [message, setMessage] =
    useState("Loading accommodation...");

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(
          `/api/rooms/${params.id}`
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(
            data.message ||
              "Failed to load accommodation."
          );
          return;
        }

        setRoom(data.room);

        const me = await fetch(
          "/api/auth/me"
        );

        if (me.ok) {
          const user =
            await me.json();

          setCurrentUser(
            user.user
          );
        }

        setMessage("");
      } catch {
        setMessage(
          "Something went wrong."
        );
      }
    }

    if (params.id) {
      fetchRoom();
    }
  }, [params.id]);

  async function deleteRoom() {
    if (
      !confirm(
        "Remove this accommodation?"
      )
    ) {
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(
        "/api/rooms/delete",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            roomId: room.id,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to remove accommodation."
        );
        return;
      }

      alert(
        "Accommodation removed."
      );

      router.push(
        "/dashboard"
      );
    } catch {
      alert(
        "Something went wrong."
      );
    } finally {
      setDeleting(false);
    }
  }

  async function occupyRoom() {
    if (
      !confirm(
        "Mark this accommodation as occupied?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        "/api/rooms/occupy",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            roomId: room.id,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to update accommodation."
        );
        return;
      }

      alert(
        "Accommodation marked as occupied."
      );

      window.location.reload();
    } catch {
      alert(
        "Something went wrong."
      );
    }
  }

  /*
   * IMPORTANT:
   * Create/find the conversation for THIS
   * accommodation before opening chat.
   */
  async function contactOwner() {
    if (contacting) return;

    try {
      setContacting(true);

      const res = await fetch(
        "/api/rooms/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            roomId: room.id,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to open chat."
        );
        return;
      }

      if (!data.conversationId) {
        alert(
          "Unable to open this accommodation chat."
        );
        return;
      }

      router.push(
        `/chat/${data.conversationId}`
      );
    } catch {
      alert(
        "Something went wrong while opening chat."
      );
    } finally {
      setContacting(false);
    }
  }

  if (message) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-slate-400">
          {message}
        </div>
      </main>
    );
  }

  if (!room) {
    return null;
  }

  const images =
    Array.isArray(
      room.imageUrls
    )
      ? room.imageUrls
      : [];

  const isOwner =
    currentUser?.id ===
    room.ownerId;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-black text-green-400">
            Student Accommodation
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            {room.title}
          </h1>

          <p className="mt-3 text-slate-400">
            Find accommodation near your
            college and connect directly
            with the owner.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

          {/* IMAGES */}

          <div>
            <div className="grid gap-4 sm:grid-cols-2">

              {images.length > 0 ? (
                images.map(
                  (
                    image: string,
                    index: number
                  ) => (
                    <div
                      key={`${image}-${index}`}
                      className={`overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 ${
                        index === 0
                          ? "sm:col-span-2"
                          : ""
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${room.title} image ${
                          index + 1
                        }`}
                        className={`w-full object-cover ${
                          index === 0
                            ? "aspect-[16/9]"
                            : "aspect-square"
                        }`}
                      />
                    </div>
                  )
                )
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-7xl">
                  🏠
                </div>
              )}

            </div>

            {images.length > 0 && (
              <p className="mt-3 text-sm font-semibold text-slate-500">
                {images.length}{" "}
                {images.length === 1
                  ? "image"
                  : "images"}{" "}
                available
              </p>
            )}
          </div>

          {/* DETAILS */}

          <div>
            <div className="rounded-[2rem] border border-slate-800 bg-white p-6 text-slate-950 shadow-2xl sm:p-8">

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-green-100 px-3 py-2 text-xs font-black text-green-700">
                  {room.roomType}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                  {room.college}
                </span>

                {room.owner
                  ?.studentVerified && (
                  <span className="rounded-full bg-blue-100 px-3 py-2 text-xs font-black text-blue-700">
                    ✓ Verified Student
                  </span>
                )}

              </div>

              <h2 className="mt-6 text-4xl font-black">
                ₹
                {Number(
                  room.rent
                ).toLocaleString(
                  "en-IN"
                )}
                <span className="text-lg font-bold text-slate-500">
                  /month
                </span>
              </h2>

              {room.deposit > 0 && (
                <p className="mt-3 text-slate-500">
                  Security deposit: ₹
                  {Number(
                    room.deposit
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              )}

              {/* SUCCESS FEE */}

              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-black text-green-800">
                  Axyon Success Fee
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Success fee up to 10%.
                </p>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-8">
                <h3 className="text-lg font-black">
                  Description
                </h3>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                  {room.description}
                </p>
              </div>

              {/* LOCATION */}

              <div className="mt-8">
                <h3 className="text-lg font-black">
                  Location
                </h3>

                <p className="mt-3 text-slate-600">
                  {room.address}
                </p>

                {room.landmark && (
                  <p className="mt-2 text-sm text-slate-500">
                    Landmark:{" "}
                    {room.landmark}
                  </p>
                )}
              </div>

              {/* AMENITIES */}

              {room.amenities
                ?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-black">
                    Amenities
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.amenities.map(
                      (
                        item: string
                      ) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* OWNER */}

              <div className="mt-8 rounded-2xl bg-slate-100 p-5">
                <h3 className="font-black">
                  Listed by
                </h3>

                <p className="mt-3 font-bold">
                  {room.owner?.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {room.owner?.college}
                </p>

                {room.owner
                  ?.studentVerified && (
                  <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                    ✓ Verified Student
                  </span>
                )}

                {room.contactNumber && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Contact Number
                    </p>

                    <p className="mt-1 font-bold text-slate-700">
                      {room.contactNumber}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

              {isOwner &&
                room.status ===
                  "AVAILABLE" && (
                  <>
                    <a
                      href={`/edit-room/${room.id}`}
                      className="flex-1 rounded-xl bg-blue-600 px-5 py-4 text-center font-black text-white hover:bg-blue-700"
                    >
                      Edit Listing
                    </a>

                    <button
                      onClick={
                        occupyRoom
                      }
                      className="flex-1 rounded-xl bg-green-600 px-5 py-4 font-black text-white hover:bg-green-700"
                    >
                      Mark Occupied
                    </button>

                    <button
                      onClick={
                        deleteRoom
                      }
                      disabled={
                        deleting
                      }
                      className="flex-1 rounded-xl bg-red-600 px-5 py-4 font-black text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting
                        ? "Removing..."
                        : "Remove Listing"}
                    </button>
                  </>
                )}

              {!isOwner &&
                room.status ===
                  "AVAILABLE" && (
                  <button
                    onClick={
                      contactOwner
                    }
                    disabled={
                      contacting
                    }
                    className="w-full rounded-xl bg-green-600 px-5 py-4 font-black text-white shadow-lg shadow-green-950/20 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {contacting
                      ? "Opening Chat..."
                      : "Contact Owner"}
                  </button>
                )}

            </div>
          </div>

        </div>
      </section>
    </main>
  );
}