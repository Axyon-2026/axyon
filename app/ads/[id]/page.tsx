"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function AdDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [ad, setAd] = useState<any>(null);

  const [message, setMessage] =
    useState("Loading ad...");

  useEffect(() => {
    async function loadAd() {
      try {
        const { id } = await params;

        const res = await fetch(
          `/api/ads/${id}`
        );

        const data =
          await res.json();

        if (!res.ok) {
          setMessage(
            data.message ||
              "Failed to load ad"
          );

          return;
        }

        setAd(data.ad);
        setMessage("");

      } catch {

        setMessage(
          "Something went wrong"
        );

      }
    }

    loadAd();
  }, [params]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-10 pb-28">
        <div className="max-w-5xl mx-auto">

          {message && (
            <p className="text-slate-500 font-semibold">
              {message}
            </p>
          )}

          {ad && (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl">

              {ad.imageUrl && (
                <div className="bg-slate-100">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full max-h-[620px] object-contain"
                  />
                </div>
              )}

              <div className="p-6 sm:p-10">

                <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">
                  {ad.badge || "SPONSORED"}
                </span>

                <h1 className="mt-5 text-4xl sm:text-5xl font-black leading-tight">
                  {ad.title}
                </h1>

                <p className="mt-5 text-lg leading-9 text-slate-600 whitespace-pre-line">
                  {ad.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                  <a
                    href="/"
                    className="rounded-full border border-slate-300 px-6 py-4 font-black hover:border-green-500"
                  >
                    Back to Home
                  </a>

                  {ad.buttonLink &&
                    ad.buttonLink !== "/" &&
                    ad.buttonLink !== "#" && (

                    <a
                      href={ad.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-green-600 px-6 py-4 font-black text-white hover:bg-green-700"
                    >
                      {ad.buttonText || "Visit Link"}
                    </a>

                  )}

                </div>

              </div>

            </div>
          )}

        </div>
      </section>
    </main>
  );
}