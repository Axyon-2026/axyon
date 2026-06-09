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
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("Loading profile...");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!res.ok) {
        window.location.href = "/login";
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
    setMessage("Profile photo uploaded. Click Update Profile to save it.");
    setUploading(false);
    setEditing(true);
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
    setEditing(false);
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-10 pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d1721] p-6 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black text-green-400">
                    Axyon Profile
                  </p>

                  <h1 className="mt-2 text-4xl sm:text-5xl font-black">
                    Profile Dashboard
                  </h1>

                  <p className="mt-3 text-slate-400">
                    Manage your identity, college info, and account details.
                  </p>
                </div>

                {isAdmin && (
                  <span className="w-fit rounded-full bg-purple-500/20 border border-purple-500/30 px-5 py-3 text-sm font-black text-purple-300">
                    ADMIN
                  </span>
                )}
              </div>

              {user && (
                <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#081018] p-6 sm:p-8">
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                    <div className="relative">
                      <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white/10 bg-[#111c27] shadow-xl">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl font-black text-slate-400">
                            {name?.charAt(0)?.toUpperCase() || "A"}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-black font-black shadow-lg hover:bg-green-400"
                      >
                        ✎
                      </button>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-3xl font-black">
                        {name || "Axyon User"}
                      </h2>

                      <p className="mt-2 break-all text-slate-400">
                        {user.email}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold">
                          {user.role}
                        </span>

                        {college && (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold">
                            {college}
                          </span>
                        )}

                        {phone && (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold">
                            {phone}
                          </span>
                        )}

                        <span
                          className={`rounded-full px-4 py-2 text-sm font-black ${
                            user.studentVerificationStatus === "APPROVED"
                              ? "bg-green-500 text-black"
                              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          }`}
                        >
                          {user.studentVerificationStatus || "NOT_SUBMITTED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setEditing(!editing)}
                      className="rounded-2xl bg-green-500 py-4 font-black text-black transition-all hover:bg-green-400"
                    >
                      {editing ? "Close Editor" : "Edit Profile"}
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="rounded-2xl border border-white/10 py-4 font-bold transition-all hover:border-green-500"
                    >
                      Open Camera
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

              {editing && (
                <form
                  onSubmit={handleUpdate}
                  className="mt-8 rounded-[2rem] border border-white/10 bg-[#081018] p-6 sm:p-8 space-y-5"
                >
                  <h2 className="text-2xl font-black">Edit Profile</h2>

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#111c27] px-5 py-4 outline-none transition-all focus:border-green-500"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#111c27] px-5 py-4 outline-none transition-all focus:border-green-500"
                  />

                  <input
                    type="text"
                    placeholder="College Name"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#111c27] px-5 py-4 outline-none transition-all focus:border-green-500"
                  />

                  <button
                    disabled={uploading}
                    className="w-full rounded-2xl bg-green-500 py-4 font-black text-black shadow-[0_0_30px_rgba(34,197,94,0.35)] transition-all hover:bg-green-400 disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Update Profile"}
                  </button>
                </form>
              )}

              {message && (
                <p className="mt-6 text-sm font-semibold text-slate-300">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}