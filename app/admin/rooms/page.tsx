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
  marketplaceType?: "CAMPUS" | "SCHOOL" | string;
  schoolName?: string | null;
  city?: string | null;
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
  const [marketplace, setMarketplace] = useState("ALL");
  const [busyId, setBusyId] = useState("");

  async function loadRooms() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/rooms", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message || "Failed to load accommodations."
        );
        return;
      }

      setRooms(data.rooms || []);
    } catch {
      setMessage(
        "Something went wrong while loading accommodations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function removeRoom(roomId: string) {
    const room = rooms.find((item) => item.id === roomId);

    if (!room) return;

    const confirmed = window.confirm(
      `Remove "${room.title}" from the public accommodation listings?\n\nUse this only when the accommodation violates Axyon's rules or is inappropriate.`
    );

    if (!confirmed) return;

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
          action: "REMOVE",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message || "Failed to remove accommodation."
        );
        return;
      }

      setRooms((current) =>
        current.map((item) =>
          item.id === roomId
            ? {
                ...item,
                status: "REMOVED",
              }
            : item
        )
      );

      setMessage(
        data.message || "Accommodation removed successfully."
      );
    } catch {
      setMessage(
        "Something went wrong while removing the accommodation."
      );
    } finally {
      setBusyId("");
    }
  }

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const normalizedMarketplace = String(
        room.marketplaceType || ""
      ).toUpperCase();

      const matchesMarketplace =
        marketplace === "ALL" ||
        normalizedMarketplace === marketplace;

      const matchesSearch =
        !query ||
        room.title?.toLowerCase().includes(query) ||
        room.college?.toLowerCase().includes(query) ||
        room.address?.toLowerCase().includes(query) ||
        room.roomType?.toLowerCase().includes(query) ||
        room.owner?.name?.toLowerCase().includes(query) ||
        room.owner?.email?.toLowerCase().includes(query) ||
        room.schoolName?.toLowerCase().includes(query) ||
        room.city?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "ALL" ||
        String(room.status).toUpperCase() === filter;

      return (
        matchesSearch &&
        matchesFilter &&
        matchesMarketplace
      );
    });
  }, [rooms, search, filter, marketplace]);

  const availableCount = rooms.filter(
    (room) =>
      String(room.status).toUpperCase() === "AVAILABLE"
  ).length;

  const removedCount = rooms.filter(
    (room) =>
      String(room.status).toUpperCase() === "REMOVED"
  ).length;

  const campusCount = rooms.filter(
    (room) =>
      String(room.marketplaceType).toUpperCase() ===
      "CAMPUS"
  ).length;

  const schoolCount = rooms.filter(
    (room) =>
      String(room.marketplaceType).toUpperCase() ===
      "SCHOOL"
  ).length;

  function marketplaceLabel(room: Room) {
    const type = String(
      room.marketplaceType || ""
    ).toUpperCase();

    if (type === "SCHOOL") {
      return "School Marketplace";
    }

    if (type === "CAMPUS") {
      return "Campus Marketplace";
    }

    return "Marketplace";
  }

  function marketplaceClasses(room: Room) {
    const type = String(
      room.marketplaceType || ""
    ).toUpperCase();

    if (type === "SCHOOL") {
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    }

    return "border-green-500/20 bg-green-500/10 text-green-300";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <a
            href="/admin"
            className="mb-5 inline-flex text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            ← Back to Admin
          </a>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400">
                <span>🛡</span>
                Accommodation Moderation
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Accommodation Listings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Monitor accommodation across Campus and School Marketplace.
                Admins can remove inappropriate listings but cannot create,
                sell, edit, buy or restore them.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRooms}
              disabled={loading}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>

          {/* PERMISSION NOTICE */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                🛡
              </div>

              <div>
                <p className="text-sm font-black">
                  Moderation-only access
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Admin accounts are for platform oversight. The only
                  accommodation action available here is removing
                  inappropriate content.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-black">
              {rooms.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              All accommodations
            </p>
          </div>

          <div className="rounded-3xl border border-green-500/10 bg-green-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Campus
            </p>

            <p className="mt-2 text-3xl font-black text-green-400">
              {campusCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Campus Marketplace
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              School
            </p>

            <p className="mt-2 text-3xl font-black text-blue-400">
              {schoolCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              School Marketplace
            </p>
          </div>

          <div className="rounded-3xl border border-green-500/10 bg-green-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Public
            </p>

            <p className="mt-2 text-3xl font-black text-green-400">
              {availableCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Currently available
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/10 bg-red-500/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Removed
            </p>

            <p className="mt-2 text-3xl font-black text-red-400">
              {removedCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Moderated listings
            </p>
          </div>
        </div>

        {/* SEARCH / FILTER */}
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, college, location or owner..."
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
            />

            <select
              value={marketplace}
              onChange={(e) =>
                setMarketplace(e.target.value)
              }
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-green-500"
            >
              <option value="ALL">
                All marketplaces
              </option>
              <option value="CAMPUS">
                Campus Marketplace
              </option>
              <option value="SCHOOL">
                School Marketplace
              </option>
            </select>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-green-500"
            >
              <option value="ALL">
                All statuses
              </option>
              <option value="AVAILABLE">
                Available
              </option>
              <option value="OCCUPIED">
                Occupied
              </option>
              <option value="REMOVED">
                Removed
              </option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing{" "}
              <strong className="text-slate-300">
                {filteredRooms.length}
              </strong>{" "}
              accommodations
            </span>

            {(search ||
              marketplace !== "ALL" ||
              filter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setMarketplace("ALL");
                  setFilter("ALL");
                }}
                className="font-black text-green-400 hover:text-green-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300">
            {message}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-3xl bg-slate-900"
              />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredRooms.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              🏠
            </div>

            <h2 className="mt-5 text-xl font-black">
              No listings found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* LISTINGS */}
        {!loading && filteredRooms.length > 0 && (
          <div className="space-y-5">
            {filteredRooms.map((room) => {
              const isRemoved =
                String(room.status).toUpperCase() ===
                "REMOVED";

              const isBusy = busyId === room.id;

              return (
                <article
                  key={room.id}
                  className={`overflow-hidden rounded-3xl border bg-slate-900 shadow-sm ${
                    isRemoved
                      ? "border-red-500/20"
                      : "border-slate-800"
                  }`}
                >
                  <div className="grid lg:grid-cols-[300px_1fr]">
                    {/* IMAGE */}
                    <div className="relative h-64 bg-slate-800 lg:h-full lg:min-h-[440px]">
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

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-black backdrop-blur ${
                            marketplaceClasses(room)
                          }`}
                        >
                          {marketplaceLabel(room)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-black ${
                            isRemoved
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-slate-950"
                          }`}
                        >
                          {isRemoved
                            ? "REMOVED"
                            : room.status}
                        </span>
                      </div>

                      {room.imageUrls &&
                        room.imageUrls.length > 1 && (
                          <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                            📷 {room.imageUrls.length} images
                          </div>
                        )}
                    </div>

                    {/* DETAILS */}
                    <div className="p-5 sm:p-6 lg:p-7">
                      <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-black tracking-tight">
                              {room.title}
                            </h2>

                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                              {room.roomType}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            📍 {room.address}
                            {room.landmark
                              ? ` · ${room.landmark}`
                              : ""}
                          </p>

                          {(room.schoolName ||
                            room.city) && (
                            <p className="mt-1 text-xs text-slate-500">
                              {room.schoolName ||
                                room.city}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          <p className="text-2xl font-black text-green-400">
                            ₹
                            {Number(
                              room.rent
                            ).toLocaleString(
                              "en-IN"
                            )}
                            <span className="ml-1 text-xs font-semibold text-slate-500">
                              /month
                            </span>
                          </p>

                          {room.deposit ? (
                            <p className="mt-1 text-xs text-slate-500 xl:text-right">
                              Deposit ₹
                              {Number(
                                room.deposit
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* COLLEGE */}
                      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          College
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-200">
                          🎓 {room.college}
                        </p>
                      </div>

                      {/* DESCRIPTION */}
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">
                        {room.description}
                      </p>

                      {/* AMENITIES */}
                      {room.amenities &&
                        room.amenities.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {room.amenities.map(
                              (amenity) => (
                                <span
                                  key={amenity}
                                  className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300"
                                >
                                  {amenity}
                                </span>
                              )
                            )}
                          </div>
                        )}

                      {/* OWNER */}
                      <div className="mt-5 border-t border-slate-800 pt-5">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Listed by
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold text-white">
                              {room.owner?.name ||
                                "Unknown owner"}

                              {room.owner
                                ?.studentVerified && (
                                <span className="ml-2 text-xs font-bold text-green-400">
                                  ✓ Verified
                                </span>
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {room.owner?.email ||
                                "No email"}
                            </p>

                            {room.owner?.phone && (
                              <p className="mt-1 text-xs text-slate-500">
                                📞{" "}
                                {room.owner.phone}
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

                      {/* ADMIN ACTIONS */}
                      <div className="mt-5 border-t border-slate-800 pt-5">
                        <div className="mb-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                          <p className="text-xs font-bold text-slate-300">
                            Admin moderation
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-slate-500">
                            Admins can view this listing and remove it if it
                            is inappropriate. Editing, creating, buying,
                            selling and restoring are unavailable.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <a
                            href={`/rooms/${room.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:border-slate-600 hover:bg-slate-800"
                          >
                            View Listing
                          </a>

                          {!isRemoved ? (
                            <button
                              type="button"
                              onClick={() =>
                                removeRoom(
                                  room.id
                                )
                              }
                              disabled={isBusy}
                              className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isBusy
                                ? "Removing..."
                                : "Remove Listing"}
                            </button>
                          ) : (
                            <div className="flex flex-1 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-400">
                              Removed
                            </div>
                          )}
                        </div>
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