"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

type Ad = {
  id: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  emoji?: string;
  imageUrl?: string;
  isActive?: boolean;
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [message, setMessage] = useState("Loading ads...");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [buttonText, setButtonText] =
    useState("Learn More");
  const [buttonLink, setButtonLink] =
    useState("/");
  const [badge, setBadge] =
    useState("SPONSORED");
  const [emoji, setEmoji] =
    useState("✨");
  const [image, setImage] =
    useState<File | null>(null);

  async function fetchAds() {
    try {
      setMessage("Loading ads...");

      const res = await fetch(
        "/api/admin/ads",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to load ads."
        );
        return;
      }

      setAds(data.ads || []);
      setMessage("");
    } catch {
      setMessage(
        "Something went wrong while loading ads."
      );
    }
  }

  useEffect(() => {
    fetchAds();
  }, []);

  async function createAd(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a banner title.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );
      formData.append(
        "description",
        description.trim()
      );
      formData.append(
        "buttonText",
        buttonText.trim()
      );
      formData.append(
        "buttonLink",
        buttonLink.trim()
      );
      formData.append(
        "badge",
        badge.trim()
      );
      formData.append(
        "emoji",
        emoji.trim()
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      const res = await fetch(
        "/api/admin/ads",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to create ad."
        );
        return;
      }

      setTitle("");
      setDescription("");
      setButtonText("Learn More");
      setButtonLink("/");
      setBadge("SPONSORED");
      setEmoji("✨");
      setImage(null);

      const input =
        document.getElementById(
          "ad-image"
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      await fetchAds();
    } catch {
      alert(
        "Something went wrong while creating the ad."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateAd(
    adId: string,
    action: string
  ) {
    try {
      const res = await fetch(
        "/api/admin/ads",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            adId,
            action,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to update ad."
        );
        return;
      }

      await fetchAds();
    } catch {
      alert(
        "Something went wrong while updating the ad."
      );
    }
  }

  const activeAds = useMemo(
    () =>
      ads.filter(
        (ad) => ad.isActive
      ).length,
    [ads]
  );

  const inactiveAds =
    ads.length - activeAds;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-6 shadow-2xl sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Axyon Advertising System
              </div>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Homepage Ads
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                    Create and manage premium homepage
                    campaigns, startup promotions, campus
                    events, sponsored products, and
                    business advertisements.
                  </p>
                </div>

                <a
                  href="/admin"
                  className="inline-flex w-fit rounded-full border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
                >
                  ← Admin Dashboard
                </a>
              </div>

              {/* STATS */}
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Total Ads
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {ads.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    Active
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-300">
                    {activeAds}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                    Inactive
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {inactiveAds}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
            {/* CREATE */}
            <form
              onSubmit={createAd}
              className="h-fit rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl">
                  📢
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    Create Ad
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Publish a new homepage campaign.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
                    Banner Title
                  </label>

                  <input
                    placeholder="e.g. Startup Fest 2026"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
                    Description
                  </label>

                  <textarea
                    placeholder="Describe your campaign..."
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                {/* BUTTON */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
                      Button Text
                    </label>

                    <input
                      placeholder="Shop Now"
                      value={buttonText}
                      onChange={(e) =>
                        setButtonText(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500/60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
                      Button Link
                    </label>

                    <input
                      placeholder="/marketplace"
                      value={buttonLink}
                      onChange={(e) =>
                        setButtonLink(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                {/* BADGE / EMOJI */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
                      Badge
                    </label>

                    <input
                      placeholder="SPONSORED"
                      value={badge}
                      onChange={(e) =>
                        setBadge(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500/60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
                      Emoji
                    </label>

                    <input
                      placeholder="🚀"
                      value={emoji}
                      onChange={(e) =>
                        setEmoji(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                {/* IMAGE */}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
                    Banner Image
                  </label>

                  <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-6 text-center transition hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                      🖼️
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-300">
                      Upload banner image
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      JPG, PNG, WEBP or other image
                    </p>

                    <input
                      id="ad-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImage(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                      className="hidden"
                    />

                    {image && (
                      <div className="mt-4 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400">
                        ✓ {image.name}
                      </div>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-emerald-500 px-6 py-4 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Publishing..."
                    : "Publish Ad Banner"}
                </button>
              </div>
            </form>

            {/* ADS */}
            <div className="min-w-0">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Campaign Library
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Existing Ads
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={fetchAds}
                  className="rounded-full border border-slate-700 px-4 py-2 text-xs font-black text-slate-400 transition hover:border-emerald-500/50 hover:text-white"
                >
                  ↻ Refresh
                </button>
              </div>

              {message && (
                <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                    ⏳
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-400">
                    {message}
                  </p>
                </div>
              )}

              {!message &&
                ads.length === 0 && (
                  <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-10 text-center shadow-xl sm:p-14">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-3xl">
                      📢
                    </div>

                    <h2 className="mt-5 text-2xl font-black">
                      No Ads Yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Create your first homepage campaign
                      using the form beside this panel.
                    </p>
                  </div>
                )}

              <div className="space-y-5">
                {!message &&
                  ads.map((ad) => (
                    <article
                      key={ad.id}
                      className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-xl"
                    >
                      {/* IMAGE */}
                      {ad.imageUrl && (
                        <div className="relative overflow-hidden border-b border-slate-800">
                          <img
                            src={ad.imageUrl}
                            alt={
                              ad.title ||
                              "Advertisement"
                            }
                            className="h-48 w-full object-cover sm:h-64"
                          />

                          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider backdrop-blur">
                            {ad.badge ||
                              "SPONSORED"}
                          </div>
                        </div>
                      )}

                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl">
                              {ad.emoji ||
                                "✨"}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                                    ad.isActive
                                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                      : "border-slate-700 bg-slate-950 text-slate-500"
                                  }`}
                                >
                                  {ad.isActive
                                    ? "ACTIVE"
                                    : "INACTIVE"}
                                </span>

                                {!ad.imageUrl && (
                                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                                    {ad.badge ||
                                      "SPONSORED"}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-3 break-words text-xl font-black sm:text-2xl">
                                {ad.title ||
                                  "Untitled Ad"}
                              </h3>

                              {ad.description && (
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                                  {
                                    ad.description
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* CAMPAIGN DETAILS */}
                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                              Button
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-300">
                              {ad.buttonText ||
                                "Learn More"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                              Destination
                            </p>

                            <p className="mt-1 break-all font-mono text-xs font-bold text-slate-400">
                              {ad.buttonLink ||
                                "/"}
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          {!ad.isActive && (
                            <button
                              type="button"
                              onClick={() =>
                                updateAd(
                                  ad.id,
                                  "ACTIVATE"
                                )
                              }
                              className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
                            >
                              Activate
                            </button>
                          )}

                          {ad.isActive && (
                            <button
                              type="button"
                              onClick={() =>
                                updateAd(
                                  ad.id,
                                  "REMOVE"
                                )
                              }
                              className="rounded-full border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-400 transition hover:border-amber-500/50"
                            >
                              Deactivate
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              updateAd(
                                ad.id,
                                "DELETE"
                              )
                            }
                            className="rounded-full border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-black text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}