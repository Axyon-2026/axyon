"use client";

import Navbar from "@/components/Navbar";

const barterIdeas = [
  {
    icon: "📱",
    title: "Phone ↔ Accessories",
    text: "Exchange useful gadgets and accessories with other students.",
  },
  {
    icon: "📚",
    title: "Books ↔ Calculator",
    text: "Trade academic items you no longer need for something useful.",
  },
  {
    icon: "🪑",
    title: "Furniture ↔ Essentials",
    text: "Exchange hostel and room essentials within the student community.",
  },
  {
    icon: "🎮",
    title: "Games & Hobbies",
    text: "Swap games, sports equipment and hobby items with students.",
  },
  {
    icon: "👕",
    title: "Clothes & Accessories",
    text: "Give unused clothes and accessories a second life through student exchanges.",
  },
  {
    icon: "🔧",
    title: "Useful Equipment",
    text: "Exchange tools, equipment and other things that are useful around campus.",
  },
];

export default function BarterPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f7] text-slate-950">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -right-40 top-10 h-[450px] w-[450px] rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-green-50 text-4xl ring-1 ring-green-100 shadow-sm">
              🤝
            </div>

            <div className="mt-7 inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-700">
              Student-to-student exchange
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-[-0.045em] sm:text-6xl">
              Trade what you have.
              <br />
              <span className="text-green-600">
                Get what you need.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
              Axyon Barter will let students exchange
              products directly with each other instead of
              always buying something new.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
              🚧 Barter is coming soon
            </div>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/marketplace"
                className="rounded-2xl bg-slate-950 px-7 py-4 text-center text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Browse Marketplace
              </a>

              <a
                href="/marketplace-home"
                className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"
              >
                Back to Campus
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600">
            Possible exchanges
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Give something useful. Get something useful.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            Barter is designed around practical exchanges
            between students.
          </p>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {barterIdeas.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.045)] transition hover:-translate-y-1 hover:border-green-200"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl ring-1 ring-green-100">
                {item.icon}
              </div>

              <h3 className="mt-6 text-xl font-black">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {item.text}
              </p>

              <div className="mt-6 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                Coming soon
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_15px_50px_rgba(15,23,42,0.05)] sm:p-12">

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600">
              How it could work
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Simple student exchanges.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">

            <BarterStep
              number="01"
              icon="📦"
              title="List"
              text="Show the item you have and what you would like to exchange it for."
            />

            <BarterStep
              number="02"
              icon="🤝"
              title="Match"
              text="Find another student whose item matches what you need."
            />

            <BarterStep
              number="03"
              icon="🔄"
              title="Exchange"
              text="Connect, agree on the exchange and trade directly."
            />

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">

        <div className="rounded-[2.5rem] bg-green-500 p-8 sm:p-12">

          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-950">
            Coming soon
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            A smarter way to exchange on campus.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-green-950/70">
            Until Barter launches, explore the existing
            Campus Marketplace and discover products
            available from students.
          </p>

          <a
            href="/marketplace"
            className="mt-7 inline-block rounded-2xl bg-slate-950 px-7 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Explore Marketplace →
          </a>

        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-xs font-medium text-slate-400">
        Axyon Barter · Student-to-student · Coming soon
      </footer>
    </main>
  );
}

function BarterStep({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl ring-1 ring-green-100">
        {icon}
      </div>

      <p className="mt-4 text-[10px] font-black tracking-widest text-green-600">
        {number}
      </p>

      <h3 className="mt-1 text-lg font-black">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}