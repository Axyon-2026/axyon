import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function TermsPage() {
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
            Terms & Conditions
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Version {siteConfig.legal.termsVersion}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-black text-slate-950">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By accessing or using Axyon, you agree to these Terms &
                Conditions and any applicable policies published on the
                platform. If you do not agree, you should not use the relevant
                services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                2. Axyon Services
              </h2>
              <p className="mt-3">
                Axyon is a student-focused digital ecosystem providing
                separate experiences for school students, college students and
                education-related services. Available features may include
                student marketplaces, community tools and Home Tuition.
              </p>
              <p className="mt-3">
                Different services may have separate eligibility,
                verification, account and access requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                3. Eligibility and Accounts
              </h2>
              <p className="mt-3">
                Users must provide accurate information and are responsible for
                maintaining the confidentiality of their account credentials.
                Users must not impersonate another person or create accounts
                using misleading information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                4. Separate Communities
              </h2>
              <p className="mt-3">
                Axyon maintains separate access boundaries for School and
                Campus Marketplace users. Users must use only the marketplace
                for which they are eligible and verified.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                5. Marketplace Listings
              </h2>
              <p className="mt-3">
                Users are responsible for the accuracy, legality and ownership
                of items or services they list. Prohibited, unlawful,
                misleading or unsafe listings may be removed and may result in
                account restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                6. Home Tuition Service
              </h2>
              <p className="mt-3">
                Axyon Home Tuition provides a tutoring marketplace through which
                eligible Campus tutors can create and publish tutoring
                profiles and students can discover available tutors.
              </p>
              <p className="mt-3">
                Home Tuition subscription plans are Axyon platform services.
                The applicable plan provides the features and access described
                on the plan and during the subscription flow for the purchased
                subscription period.
              </p>
              <p className="mt-3">
                Axyon does not become the tutor or student in a private tuition
                arrangement merely because a tutor profile is published on the
                platform. Any tutoring arrangement between users is separate
                from the Axyon platform subscription unless expressly stated
                otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                7. Home Tuition Subscriptions
              </h2>
              <p className="mt-3">
                Available Home Tuition subscription plans, prices, duration and
                applicable promotional offers are displayed before payment.
                Where an offer is active, the applicable discounted price is
                shown before checkout.
              </p>
              <p className="mt-3">
                A successful payment creates or activates the applicable
                subscription according to Axyon&apos;s payment and activation
                process. Subscription pricing applicable to a completed
                purchase is recorded with that subscription and does not
                automatically change because a plan is later edited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                8. Payments
              </h2>
              <p className="mt-3">
                Where paid services are offered, the applicable price and plan
                are shown before payment. Payment processing may be handled by
                third-party payment providers subject to their own terms.
              </p>
              <p className="mt-3">
                Axyon may record payment and subscription information required
                to confirm activation, maintain service records, issue
                applicable invoices and provide payment support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                9. Cancellation and Refunds
              </h2>
              <p className="mt-3">
                Cancellation and refund requests are handled according to the
                applicable Refund & Cancellation Policy. Cancellation of a
                subscription does not automatically mean that a refund is due.
              </p>
              <p className="mt-3">
                Payment failures, duplicate payments and cases where a payment
                is debited but the applicable service is not activated may be
                reviewed using Axyon and payment-provider records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                10. User Conduct
              </h2>
              <p className="mt-3">
                Users must not misuse the platform, attempt unauthorized
                access, harass other users, distribute malicious content,
                manipulate transactions or interfere with platform operation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                11. Suspension and Termination
              </h2>
              <p className="mt-3">
                Axyon may restrict, suspend or terminate access where there is
                a violation of these terms, applicable law, safety requirements
                or platform rules.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                12. Changes
              </h2>
              <p className="mt-3">
                These terms may be updated as Axyon develops. The current
                version published on the platform applies to continued use
                after an update.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                13. Contact
              </h2>
              <p className="mt-3">
                Questions regarding these terms or Axyon services can be sent
                to{" "}
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

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-black text-slate-950">
              Related policies
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold">
              <Link
                href="/privacy"
                className="text-slate-600 hover:text-green-700"
              >
                Privacy Policy
              </Link>

              <Link
                href="/refund-policy"
                className="text-slate-600 hover:text-green-700"
              >
                Refund & Cancellation Policy
              </Link>

              <Link
                href="/contact"
                className="text-slate-600 hover:text-green-700"
              >
                Contact Axyon
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}