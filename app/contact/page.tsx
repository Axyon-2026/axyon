import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          ← Back to Axyon
        </Link>

        <div className="mt-10">
          <p className="text-sm font-black uppercase tracking-widest text-green-600">
            Contact & Support
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Get in touch with Axyon.
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            Contact Axyon for general questions, account assistance, Home
            Tuition support, payment issues, refund requests or business
            enquiries.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <a
              href={`mailto:${siteConfig.email}`}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-xl text-white">
                ✉
              </div>

              <p className="mt-5 text-sm font-bold text-slate-500">
                Email Support
              </p>

              <p className="mt-2 break-all text-lg font-black">
                {siteConfig.email}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                General support, account questions, payment assistance and
                refund enquiries.
              </p>
            </a>

            <a
              href={`tel:${siteConfig.phone}`}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-xl text-white">
                ☎
              </div>

              <p className="mt-5 text-sm font-bold text-slate-500">
                Phone Support
              </p>

              <p className="mt-2 text-lg font-black">
                +91 {siteConfig.phone}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Contact the Axyon team for platform-related assistance.
              </p>
            </a>
          </div>

          <div className="mt-8 rounded-3xl border border-indigo-100 bg-indigo-50 p-7">
            <p className="text-sm font-black uppercase tracking-wider text-indigo-600">
              Payment & Home Tuition Support
            </p>

            <h2 className="mt-2 text-2xl font-black text-indigo-950">
              Need help with a subscription payment?
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-indigo-900/75">
              If you have a question about a Home Tuition subscription,
              payment, duplicate charge, payment that was debited but not
              activated, cancellation or refund, contact Axyon and provide the
              relevant payment or transaction reference where available.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
              >
                Email Payment Support
              </a>

              <Link
                href="/refund-policy"
                className="inline-flex rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
              >
                View Refund Policy
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Link
              href="/about"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-black">About Axyon</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Learn what Axyon is and how its student-focused services work.
              </p>
              <p className="mt-4 text-sm font-bold text-green-700">
                Learn more →
              </p>
            </Link>

            <Link
              href="/terms"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-black">Terms & Conditions</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review the rules governing Axyon services and subscriptions.
              </p>
              <p className="mt-4 text-sm font-bold text-green-700">
                Read terms →
              </p>
            </Link>

            <Link
              href="/privacy"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-black">Privacy Policy</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Understand how information is used across Axyon services.
              </p>
              <p className="mt-4 text-sm font-bold text-green-700">
                Read policy →
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}