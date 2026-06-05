"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading ads...");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [badge, setBadge] = useState("SPONSORED");
  const [emoji, setEmoji] = useState("✨");
  const [image, setImage] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  async function fetchAds() {
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load ads");
        return;
      }

      setAds(data.ads || []);
      setMessage("");
    } catch {
      setMessage("Something went wrong");
    }
  }

  useEffect(() => {
    fetchAds();
  }, []);

  async function createAd(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    setCreating(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("buttonText", buttonText);
      formData.append("buttonLink", buttonLink);
      formData.append("badge", badge);
      formData.append("emoji", emoji);

      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/admin/ads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create ad");
        return;
      }

      setTitle("");
      setDescription("");
      setButtonText("");
      setButtonLink("");
      setBadge("SPONSORED");
      setEmoji("✨");
      setImage(null);

      fetchAds();
    } catch {
      alert("Failed to create ad");
    } finally {
      setCreating(false);
    }
  }

  async function updateAd(adId: string, action: string) {
    const res = await fetch("/api/admin/ads", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adId,
        action,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update ad");
      return;
    }

    fetchAds();
  }

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="px-4 py-10 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#071b34] via-[#071019] to-[#0f3b2e] p-8 sm:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-500/20 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-black text-green-400">
                Axyon Advertising System
              </span>

              <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl">
                Homepage Ad Banners
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                Create premium floating homepage campaigns, announcements,
                startup promotions, campus offers, and sponsored ad banners.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[460px_1fr]">
            <form
              onSubmit={createAd}
              className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-500/10 text-4xl">
                  📢
                </div>

                <div>
                  <h2 className="text-3xl font-black">Create Ad</h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Only one ad banner stays active at a time.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Banner Title
                  </label>

                  <input
                    placeholder="e.g. Startup Fest 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none transition-all focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Description
                  </label>

                  <textarea
                    placeholder="Describe your campaign..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none transition-all focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-300">
                      Button Text
                    </label>

                    <input
                      placeholder="Join Now"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none transition-all focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-300">
                      Button Link
                    </label>

                    <input
                      placeholder="/events"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none transition-all focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-300">
                      Badge
                    </label>

                    <input
                      placeholder="SPONSORED"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none transition-all focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-300">
                      Emoji
                    </label>

                    <input
                      placeholder="🚀"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none transition-all focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-300">
                    Banner Image
                  </label>

                  <div className="rounded-[2rem] border-2 border-dashed border-white/10 bg-white/[0.04] p-5 text-center transition-all hover:border-green-500/40">
                    <div className="text-4xl">🖼️</div>

                    <p className="mt-3 text-sm font-bold text-slate-300">
                      Upload ad banner image
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      PNG, JPG, WEBP supported. Max 5MB.
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;

                        if (!file) {
                          setImage(null);
                          return;
                        }

                        if (!file.type.startsWith("image/")) {
                          alert("Only image files are allowed");
                          setImage(null);
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          alert("Image must be under 5MB");
                          setImage(null);
                          return;
                        }

                        setImage(file);
                      }}
                      className="mt-4 block w-full text-sm text-slate-400"
                    />

                    {image && (
                      <p className="mt-3 text-sm font-black text-green-400">
                        {image.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  disabled={creating}
                  className="mt-3 w-full rounded-full bg-green-500 px-6 py-5 text-lg font-black text-black shadow-[0_0_40px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.02] hover:bg-green-400 disabled:opacity-60"
                >
                  {creating ? "Publishing..." : "Publish Ad Banner"}
                </button>
              </div>
            </form>

            <div>
              {message && <p className="mb-5 text-slate-400">{message}</p>}

              {ads.length === 0 && !message && (
                <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                  <div className="text-6xl">📢</div>

                  <h2 className="mt-5 text-3xl font-black">
                    No Ad Banners Yet
                  </h2>

                  <p className="mt-3 text-slate-400">
                    Create your first homepage campaign from the form.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
                  >
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-500/10 blur-3xl" />

                    <div className="relative z-10">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-5">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-green-500/10">
                            {ad.imageUrl ? (
                              <img
                                src={ad.imageUrl}
                                alt={ad.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-5xl">
                                {ad.emoji || "✨"}
                              </div>
                            )}
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${
                                ad.isActive
                                  ? "bg-green-500 text-black"
                                  : "bg-white/10 text-slate-400"
                              }`}
                            >
                              {ad.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>

                            <h2 className="mt-4 text-3xl font-black">
                              {ad.title}
                            </h2>

                            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                              {ad.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm">
                                {ad.badge}
                              </span>

                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm">
                                {ad.buttonText}
                              </span>

                              {ad.buttonLink && (
                                <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-400">
                                  {ad.buttonLink}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {!ad.isActive && (
                            <button
                              onClick={() => updateAd(ad.id, "ACTIVATE")}
                              className="rounded-full border border-green-500/20 bg-green-500/10 px-6 py-3 font-black text-green-400 transition-all hover:border-green-500"
                            >
                              Activate
                            </button>
                          )}

                          {ad.isActive && (
                            <button
                              onClick={() => updateAd(ad.id, "REMOVE")}
                              className="rounded-full border border-red-500/20 bg-red-500/10 px-6 py-3 font-black text-red-400 transition-all hover:border-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}