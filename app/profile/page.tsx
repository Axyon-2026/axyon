"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("Loading profile...");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!res.ok) {
        setMessage("Please login to manage profile");
        return;
      }

      setUser(data.user);
      setName(data.user.name || "");
      setPhone(data.user.phone || "");
      setCollege(data.user.college || "");
      setProfileImageUrl(data.user.profileImageUrl || "");
      setMessage("");
    }

    fetchUser();
  }, []);

  async function uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("Uploading profile photo...");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Image upload failed");
      setUploading(false);
      return;
    }

    setProfileImageUrl(data.imageUrl);
    setMessage("Profile photo uploaded successfully!");
    setUploading(false);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadProfileImage(file);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Updating profile...");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        college,
        profileImageUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Profile update failed");
      return;
    }

    setMessage("Profile updated successfully!");
    setUser(data.user);
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center py-16 px-6">
        <div
          className={`w-full max-w-2xl rounded-2xl p-8 border ${
            isAdmin
              ? "bg-purple-950/30 border-purple-600"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Manage Profile</h1>
              <p className="mt-2 text-slate-400">
                Update your Axyon account information.
              </p>
            </div>

            {isAdmin && (
              <span className="bg-purple-600 px-4 py-2 rounded-full text-sm font-medium">
                ADMIN
              </span>
            )}
          </div>

          {user && (
            <div className="mb-8 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-full bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-slate-400">
                      {name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-slate-300">Email: {user.email}</p>
                  <p className="text-slate-300 mt-2">Role: {user.role}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-medium"
                >
                  Open Camera
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-slate-700 hover:border-slate-500 px-4 py-3 rounded-xl font-medium"
                >
                  Choose from Files
                </button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <input
              type="text"
              placeholder="College Name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <button
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Update Profile"}
            </button>
          </form>

          {message && (
            <p className="mt-5 text-sm text-slate-300">{message}</p>
          )}
        </div>
      </section>
    </main>
  );
}