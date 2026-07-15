"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] =useState(true);
  const [message, setMessage] = useState("");

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
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-black">
              Student Rooms
            </h1>

            <p className="text-slate-500 mt-2">
              Find PGs, hostels and rooms near your campus.
            </p>
          </div>

          <a
            href="/create-room"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            List Room
          </a>

        </div>

        {loading && (
          <p className="text-slate-500">
            Loading rooms...
          </p>
        )}

        {message && (
          <p className="text-red-500">
            {message}
          </p>
        )}

        {!loading && rooms.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <h2 className="text-2xl font-bold">
              No rooms available.
            </h2>

            <p className="text-slate-500 mt-3">
              Be the first student to list one.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {rooms.map((room) => (

            <div
              key={room.id}
              className="bg-white rounded-3xl overflow-hidden border shadow-sm"
            >

              <div className="h-60 bg-slate-100">

                {room.imageUrls?.length > 0 ? (

                  <img
                    src={room.imageUrls[0]}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🏠
                  </div>

                )}

              </div>

              <div className="p-5">

                <h2 className="text-xl font-black">
                  {room.title}
                </h2>

                <p className="mt-2 text-green-600 font-black text-2xl">
                  ₹{room.rent}/month
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    {room.roomType}
                  </span>

                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                    {room.college}
                  </span>

                </div>

                <p className="mt-4 text-slate-500 line-clamp-2">
                  {room.description}
                </p>

                <a
                  href={`/rooms/${room.id}`}
                  className="block mt-6 text-center bg-slate-950 hover:bg-slate-800 text-white rounded-xl py-3 font-bold"
                >
                  View Room
                </a>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}