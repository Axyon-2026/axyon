import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="text-sm font-bold text-slate-500 transition hover:text-slate-950"
        >
          ← Back to Axyon
        </Link>

        <div className="mt-10 max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-green-600">
            About Axyon
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            A student-focused digital ecosystem.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Axyon is designed to give students dedicated digital spaces for
            school communities, college communities and education-related
            services.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
              🎓
            </div>

            <h2 className="mt-5 text-xl font-black">Campus Marketplace</h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              A dedicated marketplace experience for verified college
              communities to discover and exchange relevant products and
              services.
            </p>

            <Link
              href="/marketplace"
              className="mt-5 inline-flex text-sm font-black text-indigo-600 hover:text-indigo-800"
            >
              Visit Campus Marketplace →
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl">
              🏫
            </div>

            <h2 className="mt-5 text-xl font-black">School Marketplace</h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              A separate marketplace environment designed for verified school
              students, with school-specific access and verification.
            </p>

            <Link
              href="/school-marketplace"
              className="mt-5 inline-flex text-sm font-black text-amber-700 hover:text-amber-900"
            >
              Visit School Marketplace →
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-black">Home Tuition</h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Axyon's Home Tuition service helps students discover available
              verified Campus tutors. Tutors can purchase applicable
              subscription plans to publish and maintain their tutoring
              profiles.
            </p>

            <Link
              href="/home-tuition"
              className="mt-5 inline-flex text-sm font-black text-green-700 hover:text-green-900"
            >
              Explore Home Tuition →
            </Link>
          </div>
        </div>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-indigo-600">
                How Axyon works
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Separate experiences for different student communities.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Axyon keeps its school and college marketplace experiences
                separate so that access, verification and community-specific
                functionality can be handled independently.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Home Tuition operates as a separate service within the Axyon
                ecosystem. Students can browse available tutor profiles, while
                eligible Campus users can create tutor profiles and purchase
                subscription plans when they want their profiles published.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-7 text-white">
              <p className="text-sm font-black uppercase tracking-wider text-slate-400">
                Platform principles
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="font-black">Verification</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Marketplace access and applicable services use verification
                    controls appropriate to the relevant student community.
                  </p>
                </div>

                <div>
                  <p className="font-black">Separation</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    School and Campus Marketplace experiences use separate
                    access and data boundaries.
                  </p>
                </div>

                <div>
                  <p className="font-black">Transparency</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Service terms, payment information and refund conditions
                    are provided through the applicable policy pages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-green-100 bg-green-50 p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-wider text-green-700">
            Home Tuition subscriptions
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-green-950">
            What the subscription payment covers
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-green-950/75">
            Home Tuition subscription payments are payments for an Axyon
            platform service. Depending on the selected plan, a successful
            payment activates the tutor subscription and enables the
            applicable profile publication/access period.
          </p>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-green-950/75">
            The subscription does not constitute a tuition fee paid to Axyon
            for teaching. Any private tutoring arrangement, lesson schedule,
            fee or other agreement between a tutor and student is separate from
            the Axyon platform subscription.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/terms"
              className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white transition hover:bg-green-800"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/refund-policy"
              className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-black text-green-800 transition hover:bg-green-100"
            >
              Refund Policy
            </Link>

            <Link
              href="/contact"
              className="rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-black text-green-800 transition hover:bg-green-100"
            >
              Contact Support
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">
            Questions?
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Need information about an Axyon service?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Visit the relevant service page or contact Axyon support for
            account, payment, subscription or general platform assistance.
          </p>

          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Contact Axyon
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}