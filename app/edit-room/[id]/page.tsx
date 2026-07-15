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
  const [amenities, setAmenities] = useState("");

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await fetch(`/api/rooms/edit/${id}`);
        const room = await res.json();

        if (!res.ok) {
          alert(room.message);
          router.push("/dashboard");
          return;
        }

        setTitle(room.title);
        setDescription(room.description);
        setRoomType(room.roomType);
        setRent(String(room.rent));
        setDeposit(String(room.deposit ?? ""));
        setAddress(room.address);
        setLandmark(room.landmark ?? "");
        setCollege(room.college);
        setAmenities(room.amenities.join(", "));
      } catch {
        alert("Failed to load accommodation.");
      } finally {
        setFetching(false);
      }
    }

    if (id) {
      loadRoom();
    }
  }, [id, router]);

  async function submit() {
    if (loading) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/rooms/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          roomType,
          rent,
          deposit,
          address,
          landmark,
          college,
          amenities: amenities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Accommodation updated successfully.");

      router.push(`/rooms/${id}`);
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto py-20 text-center">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-black">
          Edit Accommodation
        </h1>

        <div className="mt-8 space-y-5">

          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 h-40"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option>SINGLE</option>
            <option>SHARED</option>
            <option>PG</option>
            <option>HOSTEL</option>
            <option>APARTMENT</option>
          </select>

          <input
            type="number"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
          />

          <input
            type="number"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
          />

          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />

          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />

          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-xl p-4 font-bold"
          >
            {loading ? "Saving..." : "Update Accommodation"}
          </button>

        </div>

      </section>

    </main>
  );
}