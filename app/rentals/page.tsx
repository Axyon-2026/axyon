"use client";

import Navbar from "@/components/Navbar";

const rentalIdeas = [
  {
    icon: "🛵",
    title: "Bikes & Scooters",
    text: "Students can rent bikes and scooters from other students for commuting around campus and the city.",
  },
  {
    icon: "🚗",
    title: "Cars",
    text: "Student-to-student car rentals for trips, events, errands and temporary transportation needs.",
  },
  {
    icon: "🚲",
    title: "Cycles",
    text: "Rent bicycles from students nearby for everyday campus travel without buying one.",
  },
  {
    icon: "📚",
    title: "Academic Items",
    text: "Rent semester books, calculators, study materials and other academic essentials.",
  },
  {
    icon: "💻",
    title: "Electronics",
    text: "Temporarily access laptops, gadgets and other useful technology for projects and campus life.",
  },
  {
    icon: "🎒",
    title: "Campus Essentials",
    text: "Rent useful hostel and student-life items that you only need for a limited period.",
  },
];

export default function RentalsPage() {
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
              🔁
            </div>

            <div className="mt-7 inline-flex rounded-full border border-green-200 bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-700">
              Student-to-student rentals
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-[-0.045em] sm:text-6xl">
              Rent from students.
              <br />
              <span className="text-green-600">
                Rent to students.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
              Axyon Rentals will let students list items and
              vehicles for rent and let other students rent
              them for the time they need.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
              🚧 Rentals are coming soon
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

      {/* RENTAL CATEGORIES */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600">
            What students can rent
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            More than just products.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            The upcoming Rentals experience is designed
            around things students actually need temporarily.
          </p>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rentalIdeas.map((item) => (
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

      {/* HOW IT WILL WORK */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_15px_50px_rgba(15,23,42,0.05)] sm:p-12">

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600">
              The idea
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Simple student-to-student renting.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">

            <RentalStep
              number="01"
              icon="📋"
              title="List"
              text="A student lists a vehicle or item they are willing to rent."
            />

            <RentalStep
              number="02"
              icon="💬"
              title="Connect"
              text="Another student discovers the listing and connects with the owner."
            />

            <RentalStep
              number="03"
              icon="🔑"
              title="Rent"
              text="They agree on the rental details and complete the exchange."
            />

          </div>
        </div>
      </section>

      {/* VEHICLE FEATURE */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-[0_25px_70px_rgba(15,23,42,0.12)] sm:p-12">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500/15 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400">
                Especially for campus mobility
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Your bike could help
                <br />
                another student.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Students with bikes, scooters, cars or cycles
                will be able to make them available to other
                students when they are not using them.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[430px]">
              <VehicleBadge icon="🛵" text="Scooters" />
              <VehicleBadge icon="🏍️" text="Bikes" />
              <VehicleBadge icon="🚗" text="Cars" />
              <VehicleBadge icon="🚲" text="Cycles" />
            </div>

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
            A new way to share on campus.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-green-950/70">
            Until Rentals launches, explore the existing
            Axyon Campus Marketplace and discover products
            from students around you.
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
        Axyon Rentals · Student-to-student · Coming soon
      </footer>
    </main>
  );
}

function RentalStep({
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

function VehicleBadge({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-xs font-black text-slate-300">
        {text}
      </p>
    </div>
  );
}