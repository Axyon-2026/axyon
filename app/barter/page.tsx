"use client";

import Navbar from "@/components/Navbar";

export default function BarterPage() {
  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-5xl mx-auto">
            🤝
          </div>

          <h1 className="mt-8 text-5xl font-black">
            Barter System Coming Soon
          </h1>

          <p className="mt-6 text-slate-400 text-lg leading-8 max-w-2xl mx-auto">
            Exchange products directly with students instead of buying.
            Smarter, cheaper, and community-driven campus trading.
          </p>

          <div className="mt-10 bg-white/[0.04] border border-white/10 rounded-[2rem] p-8">
            <h2 className="text-3xl font-black">
              Example Exchanges
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              <div className="bg-white/[0.04] rounded-3xl p-5">
                <div className="text-4xl">📱</div>

                <p className="mt-4 font-bold">
                  Phone ↔ Headphones
                </p>
              </div>

              <div className="bg-white/[0.04] rounded-3xl p-5">
                <div className="text-4xl">📚</div>

                <p className="mt-4 font-bold">
                  Books ↔ Calculator
                </p>
              </div>

              <div className="bg-white/[0.04] rounded-3xl p-5">
                <div className="text-4xl">🪑</div>

                <p className="mt-4 font-bold">
                  Chair ↔ Study Table
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}