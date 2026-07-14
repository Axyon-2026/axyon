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
  const [amenities, setAmenities] = useState("");

  const [images, setImages] = useState<File[]>([]);

  async function submit() {
    if (loading) return;

    const form = new FormData();

    form.append("title", title);
    form.append("description", description);
    form.append("roomType", roomType);
    form.append("rent", rent);
    form.append("deposit", deposit);
    form.append("address", address);
    form.append("landmark", landmark);
    form.append("college", college);
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
        alert(data.message);
        return;
      }

      alert("Room listed successfully.");

      router.push("/rooms");
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-black">
          List a Room
        </h1>

        <div className="mt-8 space-y-5">

          <input
            placeholder="Title"
            className="w-full border rounded-xl p-4"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            className="w-full border rounded-xl p-4 h-40"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
          />

          <select
            className="w-full border rounded-xl p-4"
            value={roomType}
            onChange={(e)=>setRoomType(e.target.value)}
          >
            <option>SINGLE</option>
            <option>SHARED</option>
            <option>PG</option>
            <option>HOSTEL</option>
            <option>APARTMENT</option>
          </select>

          <input
            placeholder="Monthly Rent"
            type="number"
            className="w-full border rounded-xl p-4"
            value={rent}
            onChange={(e)=>setRent(e.target.value)}
          />

          <input
            placeholder="Deposit"
            type="number"
            className="w-full border rounded-xl p-4"
            value={deposit}
            onChange={(e)=>setDeposit(e.target.value)}
          />

          <input
            placeholder="Address"
            className="w-full border rounded-xl p-4"
            value={address}
            onChange={(e)=>setAddress(e.target.value)}
          />

          <input
            placeholder="Landmark"
            className="w-full border rounded-xl p-4"
            value={landmark}
            onChange={(e)=>setLandmark(e.target.value)}
          />

          <input
            placeholder="College"
            className="w-full border rounded-xl p-4"
            value={college}
            onChange={(e)=>setCollege(e.target.value)}
          />

          <input
            placeholder="Amenities (comma separated)"
            className="w-full border rounded-xl p-4"
            value={amenities}
            onChange={(e)=>setAmenities(e.target.value)}
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e)=>
              setImages(
                Array.from(e.target.files || [])
              )
            }
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-xl p-4 font-bold"
          >
            {loading ? "Creating..." : "Publish Room"}
          </button>

        </div>

      </section>

    </main>
  );
}