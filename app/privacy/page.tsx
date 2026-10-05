import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="text-sm font-bold text-slate-500 hover:text-slate-950"
        >
          ← Back to Axyon
        </Link>

        <article className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-black uppercase tracking-widest text-green-600">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Version {siteConfig.legal.privacyVersion}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-black text-slate-950">
                1. Information We Collect
              </h2>
              <p className="mt-3">
                Depending on the service used, Axyon may collect information
                such as name, email address, phone number, marketplace
                information, account credentials, verification information,
                listing information and transaction-related information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                2. Verification Information
              </h2>
              <p className="mt-3">
                School and college verification may require documents or
                photographs. Such information is used for verification,
                security and access-control purposes associated with the
                relevant marketplace.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                3. How Information Is Used
              </h2>
              <p className="mt-3">
                Information may be used to provide services, authenticate
                accounts, verify eligibility, process transactions, provide
                support, maintain security, prevent abuse and communicate
                important service information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                4. Service Providers
              </h2>
              <p className="mt-3">
                Axyon may use third-party providers for services such as
                hosting, cloud storage, email delivery, authentication,
                analytics or payment processing. These providers may process
                information as necessary to provide their services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                5. Security
              </h2>
              <p className="mt-3">
                Axyon uses reasonable technical and organizational measures
                intended to protect information. No internet-based system can
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                6. Data Retention
              </h2>
              <p className="mt-3">
                Information may be retained for as long as reasonably necessary
                for service operation, security, legal, accounting and dispute
                resolution requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                7. Your Questions
              </h2>
              <p className="mt-3">
                Privacy-related questions can be sent to{" "}
                <a
                  className="font-bold text-green-700"
                  href={`mailto:${siteConfig.email}`}
                >
                  {siteConfig.email}
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
