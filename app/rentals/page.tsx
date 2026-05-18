"use client";

import Navbar from "@/components/Navbar";

export default function RentalsPage() {
  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-5xl mx-auto">
            🔁
          </div>

          <h1 className="mt-8 text-5xl font-black">
            Rentals Coming Soon
          </h1>

          <p className="mt-6 text-slate-400 text-lg leading-8 max-w-2xl mx-auto">
            Students will soon be able to rent books, electronics,
            hostel essentials, bikes, calculators, and more —
            directly inside the Axyon ecosystem.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
              <div className="text-4xl">📚</div>

              <h2 className="mt-4 text-xl font-black">
                Academic Rentals
              </h2>

              <p className="mt-3 text-slate-400 leading-7">
                Rent semester books and study materials.
              </p>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
              <div className="text-4xl">💻</div>

              <h2 className="mt-4 text-xl font-black">
                Electronics
              </h2>

              <p className="mt-3 text-slate-400 leading-7">
                Share gadgets and tech affordably.
              </p>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6">
              <div className="text-4xl">🏠</div>

              <h2 className="mt-4 text-xl font-black">
                Hostel Essentials
              </h2>

              <p className="mt-3 text-slate-400 leading-7">
                Rent temporary items during college life.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}