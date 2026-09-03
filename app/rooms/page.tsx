"use client";

import Navbar from "@/components/Navbar";
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
  availableFrom?: string | null;
  status?: string;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("ALL");
  const [maxRent, setMaxRent] = useState("ALL");

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to load rooms.");
          return;
        }

        setRooms(data.rooms || []);
      } catch {
        setMessage("Something went wrong while loading accommodations.");
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        !query ||
        room.title?.toLowerCase().includes(query) ||
        room.college?.toLowerCase().includes(query) ||
        room.address?.toLowerCase().includes(query) ||
        room.landmark?.toLowerCase().includes(query) ||
        room.roomType?.toLowerCase().includes(query);

      const matchesType =
        roomType === "ALL" ||
        room.roomType === roomType;

      const matchesRent =
        maxRent === "ALL" ||
        room.rent <= Number(maxRent);

      return matchesSearch && matchesType && matchesRent;
    });
  }, [rooms, search, roomType, maxRent]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Student Accommodation
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Find your next place
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Discover student-friendly rooms, PGs and hostels close to your
              college.
            </p>
          </div>

          <a
            href="/create-room"
            className="inline-flex items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-green-400"
          >
            + List Accommodation
          </a>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_180px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by college, location, room..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-green-500"
              />
            </div>

            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-green-500"
            >
              <option value="ALL">All room types</option>
              <option value="SINGLE">Single</option>
              <option value="SHARED">Shared</option>
              <option value="PG">PG</option>
              <option value="HOSTEL">Hostel</option>
              <option value="APARTMENT">Apartment</option>
            </select>

            <select
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-green-500"
            >
              <option value="ALL">Any budget</option>
              <option value="5000">Up to ₹5,000</option>
              <option value="10000">Up to ₹10,000</option>
              <option value="15000">Up to ₹15,000</option>
              <option value="20000">Up to ₹20,000</option>
              <option value="30000">Up to ₹30,000</option>
            </select>
          </div>

          {(search || roomType !== "ALL" || maxRent !== "ALL") && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-300">
                  {filteredRooms.length}
                </span>{" "}
                accommodation{filteredRooms.length === 1 ? "" : "s"}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoomType("ALL");
                  setMaxRent("ALL");
                }}
                className="text-xs font-bold text-green-400 hover:text-green-300"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Status */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
              >
                <div className="h-60 animate-pulse bg-slate-800" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-800" />
                  <div className="h-8 w-1/2 animate-pulse rounded bg-slate-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {message && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-sm text-red-300">
            {message}
          </div>
        )}

        {/* Empty state */}
        {!loading && !message && filteredRooms.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
              🏠
            </div>

            <h2 className="text-2xl font-black">
              {rooms.length === 0
                ? "No accommodations yet"
                : "No matching accommodations"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {rooms.length === 0
                ? "Be the first student to list a room, PG or hostel."
                : "Try changing your search or filters to find more options."}
            </p>

            {rooms.length === 0 && (
              <a
                href="/create-room"
                className="mt-6 inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-green-400"
              >
                List an Accommodation
              </a>
            )}
          </div>
        )}

        {/* Room cards */}
        {!loading && filteredRooms.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  Available accommodations
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredRooms.length} place
                  {filteredRooms.length === 1 ? "" : "s"} available
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <article
                  key={room.id}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl"
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden bg-slate-800">
                    {room.imageUrls?.length ? (
                      <img
                        src={room.imageUrls[0]}
                        alt={room.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        🏠
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-green-300 backdrop-blur">
                        {room.roomType}
                      </span>

                      {room.imageUrls &&
                        room.imageUrls.length > 1 && (
                          <span className="rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                            📷 {room.imageUrls.length}
                          </span>
                        )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                      <span className="text-xs font-bold text-white/90">
                        Available
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="line-clamp-1 text-xl font-black text-white">
                        {room.title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-sm text-slate-400">
                        📍 {room.address}
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-black text-green-400">
                          ₹{Number(room.rent).toLocaleString("en-IN")}
                          <span className="ml-1 text-xs font-semibold text-slate-500">
                            / month
                          </span>
                        </p>

                        {room.deposit ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Deposit: ₹
                            {Number(room.deposit).toLocaleString("en-IN")}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">
                            No deposit specified
                          </p>
                        )}
                      </div>
                    </div>

                    {/* College */}
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Near college
                      </p>

                      <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-200">
                        🎓 {room.college}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
                      {room.description}
                    </p>

                    {/* Amenities */}
                    {room.amenities &&
                      room.amenities.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {room.amenities
                            .slice(0, 3)
                            .map((amenity) => (
                              <span
                                key={amenity}
                                className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300"
                              >
                                {amenity}
                              </span>
                            ))}

                          {room.amenities.length > 3 && (
                            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                    {/* Success fee */}
                    <div className="mt-5 rounded-xl border border-green-500/10 bg-green-500/5 px-3 py-2.5">
                      <p className="text-xs font-semibold text-green-300">
                        ✓ Success fee: Up to 10%
                      </p>
                    </div>

                    {/* Button */}
                    <a
                      href={`/rooms/${room.id}`}
                      className="mt-5 block w-full rounded-xl bg-white py-3 text-center text-sm font-extrabold text-slate-950 transition hover:bg-green-400"
                    >
                      View Accommodation
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}