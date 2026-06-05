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
    <div className="fixed bottom-24 left-1/2 z-40 w-[94%] max-w-sm -translate-x-1/2 lg:bottom-8 lg:right-8 lg:left-auto lg:max-w-md lg:translate-x-0">
      <div
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          border
          border-white/10
          bg-[#071019]/95
          shadow-[0_0_60px_rgba(34,197,94,0.22)]
          backdrop-blur-2xl
        "
      >
        <button
          onClick={() => setClosed(true)}
          className="
            absolute
            right-3
            top-3
            z-30
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-lg
            font-black
            text-white
            backdrop-blur-xl
            transition
            hover:bg-black/80
          "
        >
          ×
        </button>

        {ad.imageUrl && (
          <div className="relative h-44 w-full overflow-hidden">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="h-full w-full object-cover"
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#071019]
                via-[#071019]/20
                to-transparent
              "
            />
          </div>
        )}

        <div className="relative p-5">

          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-500/20 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center justify-between gap-3">

              <span
                className="
                  inline-flex
                  rounded-full
                  border
                  border-green-500/20
                  bg-green-500/10
                  px-3
                  py-1
                  text-[11px]
                  font-black
                  tracking-wide
                  text-green-400
                "
              >
                {ad.badge || "SPONSORED"}
              </span>

              {!ad.imageUrl && (
                <div className="text-3xl">
                  {ad.emoji || "✨"}
                </div>
              )}

            </div>

            <h3 className="mt-4 text-2xl font-black leading-tight text-white">
              {ad.title}
            </h3>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
              {ad.description}
            </p>

            {ad.buttonLink && (
              <a
                href={ad.buttonLink}
                target="_blank"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-green-500
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-black
                  shadow-lg
                  shadow-green-500/20
                  transition-all
                  hover:scale-105
                  hover:bg-green-400
                "
              >
                {ad.buttonText || "Visit"}
                <span>→</span>
              </a>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}