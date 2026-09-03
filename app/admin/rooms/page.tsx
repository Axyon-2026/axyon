"use client";

import { useEffect, useMemo, useState } from "react";

type Room = {
  id: string;
  title: string;
  description: string;
  roomType: string;
  rent: number;
  deposit?: number | null;
  address: string;
  landmark?: string | null;
  college: string;
  imageUrls?: string[];
  amenities?: string[];
  status: string;
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    college?: string | null;
    studentVerified?: boolean;
  };
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [busyId, setBusyId] = useState("");

  async function loadRooms() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/rooms");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load accommodations.");
        return;
      }

      setRooms(data.rooms || []);
    } catch {
      setMessage("Something went wrong while loading accommodations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function updateRoom(roomId: string, action: "REMOVE" | "RESTORE") {
    const room = rooms.find((item) => item.id === roomId);

    if (!room) return;

    if (
      action === "REMOVE" &&
      !window.confirm(
        `Remove "${room.title}" from the public accommodation listings?`
      )
    ) {
      return;
    }

    try {
      setBusyId(roomId);
      setMessage("");

      const res = await fetch("/api/admin/rooms", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to update accommodation.");
        return;
      }

      setRooms((current) =>
        current.map((item) =>
          item.id === roomId
            ? {
                ...item,
                status:
                  action === "REMOVE"
                    ? "REMOVED"
                    : "AVAILABLE",
              }
            : item
        )
      );

      setMessage(data.message || "Accommodation updated.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setBusyId("");
    }
  }

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        !query ||
        room.title?.toLowerCase().includes(query) ||
        room.college?.toLowerCase().includes(query) ||
        room.address?.toLowerCase().includes(query) ||
        room.roomType?.toLowerCase().includes(query) ||
        room.owner?.name?.toLowerCase().includes(query) ||
        room.owner?.email?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "ALL" ||
        room.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [rooms, search, filter]);

  const availableCount = rooms.filter(
    (room) => room.status === "AVAILABLE"
  ).length;

  const removedCount = rooms.filter(
    (room) => room.status === "REMOVED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/admin"
            className="mb-4 inline-flex text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            ← Back to Admin
          </a>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                🏠 Accommodation Moderation
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Accommodation Listings
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Review, search and moderate student accommodation listings.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRooms}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Listings
            </p>
            <p className="mt-2 text-3xl font-black">
              {rooms.length}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/10 bg-green-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Public Listings
            </p>
            <p className="mt-2 text-3xl font-black text-green-400">
              {availableCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Removed
            </p>
            <p className="mt-2 text-3xl font-black text-red-400">
              {removedCount}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, college, location, owner..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-green-500"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-green-500"
            >
              <option value="ALL">All listings</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
            {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading accommodation listings...
          </div>
        )}

        {/* Empty */}
        {!loading && filteredRooms.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <div className="text-5xl">🏠</div>

            <h2 className="mt-4 text-xl font-black">
              No listings found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filter.
            </p>
          </div>
        )}

        {/* Listings */}
        {!loading && filteredRooms.length > 0 && (
          <div className="space-y-5">
            {filteredRooms.map((room) => {
              const isRemoved = room.status === "REMOVED";
              const isBusy = busyId === room.id;

              return (
                <article
                  key={room.id}
                  className={`overflow-hidden rounded-3xl border bg-slate-900 ${
                    isRemoved
                      ? "border-red-500/20"
                      : "border-slate-800"
                  }`}
                >
                  <div className="grid lg:grid-cols-[280px_1fr]">
                    {/* Image */}
                    <div className="relative h-64 bg-slate-800 lg:h-full">
                      {room.imageUrls?.length ? (
                        <img
                          src={room.imageUrls[0]}
                          alt={room.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl">
                          🏠
                        </div>
                      )}

                      <div className="absolute left-4 top-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-black ${
                            isRemoved
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-slate-950"
                          }`}
                        >
                          {isRemoved ? "REMOVED" : room.status}
                        </span>
                      </div>

                      {room.imageUrls &&
                        room.imageUrls.length > 1 && (
                          <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                            📷 {room.imageUrls.length} images
                          </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-black">
                              {room.title}
                            </h2>

                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                              {room.roomType}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-400">
                            📍 {room.address}
                            {room.landmark
                              ? ` · ${room.landmark}`
                              : ""}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <p className="text-2xl font-black text-green-400">
                            ₹
                            {Number(
                              room.rent
                            ).toLocaleString("en-IN")}
                            <span className="ml-1 text-xs font-semibold text-slate-500">
                              /month
                            </span>
                          </p>

                          {room.deposit ? (
                            <p className="mt-1 text-right text-xs text-slate-500">
                              Deposit ₹
                              {Number(
                                room.deposit
                              ).toLocaleString("en-IN")}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* College */}
                      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          College
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-200">
                          🎓 {room.college}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                        {room.description}
                      </p>

                      {/* Amenities */}
                      {room.amenities &&
                        room.amenities.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {room.amenities.map(
                              (amenity) => (
                                <span
                                  key={amenity}
                                  className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300"
                                >
                                  {amenity}
                                </span>
                              )
                            )}
                          </div>
                        )}

                      {/* Owner */}
                      <div className="mt-5 border-t border-slate-800 pt-5">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Listed by
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold text-white">
                              {room.owner?.name || "Unknown owner"}
                              {room.owner?.studentVerified && (
                                <span className="ml-2 text-xs font-bold text-green-400">
                                  ✓ Verified
                                </span>
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {room.owner?.email || "No email"}
                            </p>

                            {room.owner?.phone && (
                              <p className="mt-1 text-xs text-slate-500">
                                📞 {room.owner.phone}
                              </p>
                            )}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xs text-slate-500">
                              Listed on
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-300">
                              {new Date(
                                room.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <a
                          href={`/rooms/${room.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          View Listing
                        </a>

                        {!isRemoved ? (
                          <button
                            type="button"
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "REMOVE"
                              )
                            }
                            disabled={isBusy}
                            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy
                              ? "Removing..."
                              : "Remove Listing"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "RESTORE"
                              )
                            }
                            disabled={isBusy}
                            className="flex-1 rounded-xl bg-green-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy
                              ? "Restoring..."
                              : "Restore Listing"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}