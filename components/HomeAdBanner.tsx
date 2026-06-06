"use client";

import { useEffect, useState } from "react";

export default function HomeAdBanner() {
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch("/api/ads/active");
        const data = await res.json();

        if (res.ok) {
          setAds(data.ads || []);
        }
      } catch {}
    }

    fetchAds();
  }, []);

  if (ads.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-green-600 text-sm font-black">
              Sponsored on Axyon
            </p>

            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-950">
              Campus Offers & Promotions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <a
             
              key={ad.id}
              href={ad.buttonLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              {ad.imageUrl && (
                <div className="h-56 overflow-hidden bg-slate-100">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              )}

              <div className="p-6">
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  {ad.badge || "SPONSORED"}
                </span>

                <h3 className="mt-4 text-2xl font-black text-slate-950 leading-tight">
                  {ad.title}
                </h3>

                <p className="mt-3 text-slate-600 leading-7 line-clamp-3">
                  {ad.description}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white group-hover:bg-green-600 transition">
                  {ad.buttonText || "View More"} →
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}