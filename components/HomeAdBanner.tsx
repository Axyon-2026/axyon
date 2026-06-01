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
    <div className="fixed bottom-24 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 lg:bottom-8 lg:right-8 lg:left-auto lg:translate-x-0">
      <div className="relative overflow-hidden rounded-[2rem] border border-green-500/20 bg-[#071019]/95 p-5 text-white shadow-[0_0_50px_rgba(34,197,94,0.3)] backdrop-blur-2xl">
        <button
          onClick={() => setClosed(true)}
          className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
        >
          ×
        </button>

        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-500/20 blur-3xl" />

        <div className="relative">
          <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-black text-green-400">
            {ad.badge || "SPONSORED"}
          </span>

          <div className="mt-4 flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-3xl">
              {ad.emoji || "✨"}
            </div>

            <div>
              <h3 className="pr-8 text-xl font-black">{ad.title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {ad.description}
              </p>
            </div>
          </div>

          {ad.buttonLink && (
            <a
              href={ad.buttonLink}
              className="mt-5 inline-block rounded-full bg-green-500 px-5 py-3 text-sm font-black text-black hover:bg-green-400"
            >
              {ad.buttonText || "Learn More"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}