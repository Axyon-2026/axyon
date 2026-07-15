"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("Loading room...");

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to load room.");
          return;
        }

        setRoom(data.room);
        const me = await fetch("/api/auth/me");

        if (me.ok) {
          const user = await me.json();
          setCurrentUser(user.user);
        }
        setMessage("");
      } catch {
        setMessage("Something went wrong.");
      }
    }

    fetchRoom();
  }, [params.id]);

  if (message) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="py-20 text-center text-slate-500">{message}</div>
      </main>
    );
  }

  if (!room) return null;

  const image = room.imageUrls?.length > 0 ? room.imageUrls[0] : "";
  const isOwner = currentUser?.id === room.ownerId;
  async function deleteRoom() {
    if (!confirm("Remove this accommodation?")) return;

    try {
      setDeleting(true);

      const res = await fetch("/api/rooms/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: room.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Accommodation removed.");

      router.push("/dashboard");
    } finally {
      setDeleting(false);
    }
  }
  async function occupyRoom() {
    if (!confirm("Mark this accommodation as occupied?")) return;

    const res = await fetch("/api/rooms/occupy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: room.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Accommodation marked as occupied.");

    router.refresh();
  }
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="bg-white rounded-3xl overflow-hidden border">
              <div className="aspect-square bg-slate-100">
                {image ? (
                  <img
                    src={image}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl">
                    🏠
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl border p-8">
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-bold">
                  {room.roomType}
                </span>

                <span className="bg-slate-100 text-slate-700 px-3 py-2 rounded-full text-xs font-bold">
                  {room.college}
                </span>

                {room.owner?.studentVerified && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-xs font-bold">
                    Verified Student
                  </span>
                )}
              </div>

              <h1 className="mt-6 text-4xl font-black">{room.title}</h1>

              <p className="mt-5 text-5xl font-black text-green-600">
                ₹{room.rent}/month
              </p>

              {room.deposit > 0 && (
                <p className="mt-3 text-slate-500">Deposit: ₹{room.deposit}</p>
              )}

              <div className="mt-8">
                <h2 className="text-xl font-black">Description</h2>

                <p className="mt-4 text-slate-600 whitespace-pre-wrap leading-7">
                  {room.description}
                </p>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-black">Address</h2>

                <p className="mt-4 text-slate-600">{room.address}</p>

                {room.landmark && (
                  <p className="text-slate-500 mt-2">
                    Landmark: {room.landmark}
                  </p>
                )}
              </div>

              {room.amenities?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-black">Amenities</h2>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {room.amenities.map((item: string) => (
                      <span
                        key={item}
                        className="bg-slate-100 px-3 py-2 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 bg-slate-100 rounded-2xl p-5">
                <h3 className="font-black text-lg">Listed by</h3>

                <p className="mt-3 font-semibold">{room.owner?.name}</p>

                <p className="text-slate-500">{room.owner?.college}</p>

                {room.owner?.studentVerified && (
                  <span className="inline-block mt-3 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    ✓ Verified Student
                  </span>
                )}
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              {isOwner && room.status === "AVAILABLE" && (
                <>
                  <a
                    href={`/edit-room/${room.id}`}
                    className="flex-1 rounded-xl bg-blue-600 text-white text-center py-4 font-bold"
                  >
                    Edit
                  </a>

                  <button
                    onClick={occupyRoom}
                    className="flex-1 rounded-xl bg-green-600 text-white py-4 font-bold"
                  >
                    Occupied
                  </button>

                  <button
                    onClick={deleteRoom}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-red-600 text-white py-4 font-bold"
                  >
                    Delete
                  </button>
                </>
              )}

              {!isOwner && room.status === "AVAILABLE" && (
                <a
                  href="/chat"
                  className="flex-1 rounded-xl bg-green-600 text-white text-center py-4 font-bold"
                >
                  Contact Owner
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
