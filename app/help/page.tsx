import Link from "next/link";

const faqs = [
  {
    q: "What is Axyon?",
    a: "Axyon is a student-focused digital ecosystem with separate experiences for school and college communities.",
  },
  {
    q: "Why are school and college marketplaces separate?",
    a: "The two communities have different requirements and access boundaries. Axyon keeps their marketplace experiences and user access separated.",
  },
  {
    q: "Do I need an account to use Axyon?",
    a: "Some public marketplace browsing may be available without an account, while protected actions such as creating listings, messaging or other account-specific features require the relevant account.",
  },
  {
    q: "How does school verification work?",
    a: "School users provide the information and documents requested during registration. Access to the School Marketplace is subject to Axyon's verification and approval process.",
  },
  {
    q: "How can I contact Axyon?",
    a: "You can contact Axyon through the contact details provided on the Contact Us page.",
  },
  {
    q: "Where can I find the policies?",
    a: "The Terms & Conditions, Privacy Policy and Refund & Cancellation Policy are available in the website footer.",
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          ← Back to Axyon
        </Link>

        <div className="mt-10">
          <p className="text-sm font-black uppercase tracking-widest text-green-600">
            Help & FAQ
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Frequently asked questions.
          </h1>

          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <summary className="cursor-pointer list-none pr-8 text-base font-black">
                  {faq.q}
                </summary>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-slate-950 p-7 text-white">
            <h2 className="text-xl font-black">Still need help?</h2>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Contact the Axyon team for assistance with account, marketplace
              or platform-related questions.
            </p>

            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
            >
              Contact Axyon
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
