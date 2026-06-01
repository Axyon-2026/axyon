"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading ads...");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("Advertise Now");
  const [buttonLink, setButtonLink] = useState("/support");
  const [badge, setBadge] = useState("SPONSORED");
  const [emoji, setEmoji] = useState("✨");

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

    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        buttonText,
        buttonLink,
        badge,
        emoji,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to create ad");
      return;
    }

    setTitle("");
    setDescription("");
    setButtonText("Advertise Now");
    setButtonLink("/support");
    setBadge("SPONSORED");
    setEmoji("✨");

    fetchAds();
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
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black text-green-400">
                Admin Control
              </p>

              <h1 className="mt-2 text-5xl font-black">Ad Banners</h1>

              <p className="mt-4 max-w-2xl text-slate-400">
                Create, activate, and remove interactive homepage ad banners.
              </p>
            </div>

            <a
              href="/admin"
              className="rounded-full border border-white/10 px-5 py-3 font-black hover:border-green-500"
            >
              Back to Admin
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={createAd}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <h2 className="text-2xl font-black">Create New Ad</h2>

              <input
                placeholder="Ad title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none focus:border-green-500"
              />

              <textarea
                placeholder="Ad description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none focus:border-green-500"
              />

              <input
                placeholder="Button text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none focus:border-green-500"
              />

              <input
                placeholder="Button link"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none focus:border-green-500"
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <input
                  placeholder="Badge"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none focus:border-green-500"
                />

                <input
                  placeholder="Emoji"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 outline-none focus:border-green-500"
                />
              </div>

              <button className="mt-5 w-full rounded-full bg-green-500 px-6 py-4 font-black text-black hover:bg-green-400">
                Publish Ad Banner
              </button>
            </form>

            <div>
              {message && <p className="text-slate-400">{message}</p>}

              <div className="space-y-5">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            ad.isActive
                              ? "bg-green-500 text-black"
                              : "bg-white/10 text-slate-400"
                          }`}
                        >
                          {ad.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>

                        <h2 className="mt-4 text-2xl font-black">
                          {ad.emoji} {ad.title}
                        </h2>

                        <p className="mt-2 text-slate-400">
                          {ad.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!ad.isActive && (
                          <button
                            onClick={() => updateAd(ad.id, "ACTIVATE")}
                            className="rounded-full border border-green-500/30 px-5 py-3 font-black text-green-400 hover:border-green-500"
                          >
                            Activate
                          </button>
                        )}

                        {ad.isActive && (
                          <button
                            onClick={() => updateAd(ad.id, "REMOVE")}
                            className="rounded-full border border-red-500/30 px-5 py-3 font-black text-red-400 hover:border-red-500"
                          >
                            Remove
                          </button>
                        )}
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