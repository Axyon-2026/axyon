"use client";

import { useEffect, useState } from "react";

export default function HomeAdBanner() {
  const [ad, setAd] = useState<any>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch("/api/ads/active");
        const data = await res.json();

        if (res.ok && data.ad) {
          setAd(data.ad);
        }
      } catch {}
    }

    fetchAd();
  }, []);

  if (!ad || closed) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 lg:bottom-8 lg:right-8 lg:left-auto lg:max-w-lg lg:translate-x-0">
      <div className="relative overflow-hidden rounded-[2rem] border border-green-500/20 bg-[#071019]/95 text-white shadow-[0_0_55px_rgba(34,197,94,0.35)] backdrop-blur-2xl">

        <button
          onClick={() => setClosed(true)}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg font-black hover:bg-black/70"
        >
          ×
        </button>

        {ad.imageUrl && (
          <div className="relative h-44 w-full overflow-hidden sm:h-52">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#071019] via-[#071019]/30 to-transparent" />
          </div>
        )}

        <div className="relative p-5 sm:p-6">

          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-green-500/20 blur-3xl" />

          <div className="relative z-10">

            <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-black text-green-400">
              {ad.badge || "SPONSORED"}
            </span>

            <div className="mt-4 flex gap-4">

              {!ad.imageUrl && (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-3xl">
                  {ad.emoji || "✨"}
                </div>
              )}

              <div>

                <h3 className="pr-8 text-2xl font-black leading-tight">
                  {ad.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {ad.description}
                </p>

              </div>

            </div>

            {ad.buttonLink && (
              <a
                href={ad.buttonLink}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-black transition hover:scale-105 hover:bg-green-400"
              >
                {ad.buttonText || "Learn More"}
                <span>→</span>
              </a>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}