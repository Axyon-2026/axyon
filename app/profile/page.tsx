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
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

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
      } catch {
        setMessage("Unable to load your profile.");
      }
    }

    fetchUser();
  }, []);

  async function uploadProfileImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Profile image must be under 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("Uploading profile photo...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Image upload failed");
        return;
      }

      setProfileImageUrl(data.imageUrl);
      setMessage(
        "Profile photo uploaded. Click Update Profile to save it."
      );
      setEditing(true);
    } catch {
      setMessage("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    await uploadProfileImage(file);

    e.target.value = "";
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Name is required.");
      return;
    }

    setMessage("Updating profile...");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          college: college.trim(),
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
    } catch {
      setMessage("Profile update failed.");
    }
  }

  const isAdmin = user?.role === "ADMIN";
  const isVerified =
    user?.studentVerificationStatus === "APPROVED";

  const initials =
    name?.trim()?.charAt(0)?.toUpperCase() || "A";

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <Navbar />

      <section className="px-3 py-5 pb-20 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* HEADER */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:rounded-[32px] sm:p-9 lg:p-11">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Axyon Profile
                  </span>

                  <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Your profile
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                    Manage your identity, college information,
                    profile photo and account details.
                  </p>
                </div>

                {isAdmin && (
                  <span className="w-fit rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-black text-purple-300">
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {user && (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              {/* MAIN PROFILE CARD */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_45px_rgba(15,23,42,0.05)] sm:p-7">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  {/* AVATAR */}
                  <div className="relative shrink-0">
                    <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_12px_35px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:h-32 sm:w-32">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-4xl font-black text-white">
                          {initials}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={uploading}
                      aria-label="Change profile photo"
                      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-white shadow-lg transition hover:bg-emerald-600 disabled:opacity-60"
                    >
                      ✎
                    </button>
                  </div>

                  {/* USER INFO */}
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <h2 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      {name || "Axyon User"}
                    </h2>

                    <p className="mt-2 break-all text-sm text-slate-500">
                      {user.email}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700">
                        {user.role}
                      </span>

                      {college && (
                        <span className="max-w-full truncate rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                          🎓 {college}
                        </span>
                      )}

                      {phone && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                          📞 {phone}
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-black ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-700"
                            : "border border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isVerified ? "✓ VERIFIED" : user.studentVerificationStatus || "NOT_SUBMITTED"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setEditing(!editing)}
                    className="rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(16,185,129,0.16)] transition hover:bg-emerald-700"
                  >
                    {editing ? "Close Editor" : "Edit Profile"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      cameraInputRef.current?.click()
                    }
                    disabled={uploading}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {uploading
                      ? "Uploading..."
                      : "📷 Open Camera"}
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

                {/* EDITOR */}
                {editing && (
                  <form
                    onSubmit={handleUpdate}
                    className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 sm:p-6"
                  >
                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                        Account settings
                      </p>

                      <h3 className="mt-1 text-xl font-black text-slate-900">
                        Edit Profile
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                          Full Name
                        </label>

                        <input
                          type="text"
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                          College Name
                        </label>

                        <input
                          type="text"
                          placeholder="College Name"
                          value={college}
                          onChange={(e) =>
                            setCollege(e.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={uploading}
                        className="w-full rounded-2xl bg-slate-950 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        {uploading
                          ? "Uploading..."
                          : "Update Profile"}
                      </button>
                    </div>
                  </form>
                )}

                {message && (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                      message.includes("successfully")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : message.includes("Loading") ||
                            message.includes("Uploading") ||
                            message.includes("Updating")
                          ? "border-slate-200 bg-slate-50 text-slate-600"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>

              {/* SIDE INFORMATION */}
              <aside className="space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
                    🛡️
                  </div>

                  <h3 className="mt-4 text-xl font-black text-slate-900">
                    Account status
                  </h3>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                      <span className="text-xs font-bold text-slate-500">
                        Account
                      </span>

                      <span className="text-xs font-black text-emerald-600">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                      <span className="text-xs font-bold text-slate-500">
                        Verification
                      </span>

                      <span
                        className={`text-right text-xs font-black ${
                          isVerified
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {isVerified
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3">
                      <span className="text-xs font-bold text-slate-500">
                        Role
                      </span>

                      <span className="text-xs font-black text-slate-800">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] bg-[#06100c] p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

                  <div className="relative">
                    <span className="text-2xl">✨</span>

                    <h3 className="mt-4 text-xl font-black">
                      Keep your profile current
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      A clear name, college and profile
                      photo make it easier for other
                      students to recognize you.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {!user && !message.includes("Loading") && (
            <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Unable to load your profile.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}