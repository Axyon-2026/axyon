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
                1. Agreement and Scope
              </h2>
              <p className="mt-3">
                These Terms & Conditions govern access to and use of Axyon
                and its platform services. By accessing or using a service,
                you agree to the terms applicable to that service. If you
                do not agree, do not use the relevant service.
              </p>
              <p className="mt-3">
                Additional notices or rules may apply to particular
                features. If a mandatory legal requirement applies, these
                terms do not override that requirement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                2. Axyon Services
              </h2>
              <p className="mt-3">
                Axyon is a digital platform supporting student-focused
                services and education-related marketplaces. Depending on
                eligibility and availability, features may include separate
                School and Campus experiences, marketplace listings,
                community tools and Home Tuition services.
              </p>
              <p className="mt-3">
                Features, access rules and availability may differ by
                service. A user&apos;s access to one marketplace does not
                automatically establish eligibility for another marketplace.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                3. Accounts and Accurate Information
              </h2>
              <p className="mt-3">
                You must provide information that is accurate and not
                misleading when creating an account or using a service.
                You are responsible for keeping your account credentials
                confidential and for activity carried out through your
                account, subject to applicable law.
              </p>
              <p className="mt-3">
                Do not impersonate another person, falsify eligibility
                information, bypass access controls or use another
                person&apos;s credentials without authorization. Contact
                Axyon promptly if you believe your account has been
                compromised.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                4. Eligibility and Verification
              </h2>
              <p className="mt-3">
                Some services require eligibility checks, account
                verification or supporting information. You must provide
                accurate information and cooperate with reasonable
                verification requirements for the service you use.
              </p>
              <p className="mt-3">
                Access may be restricted while required verification is
                incomplete or where information cannot be validated.
                Verification does not guarantee the conduct, qualifications
                or future performance of another user.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                5. Marketplace Content and Listings
              </h2>
              <p className="mt-3">
                You are responsible for the information, listings,
                descriptions, photographs and other content you submit.
                You must have the rights and permissions needed to submit
                that content and must not misrepresent an item, service,
                identity, qualification or offer.
              </p>
              <p className="mt-3">
                Axyon may remove or restrict content that appears unlawful,
                fraudulent, misleading, unsafe, abusive or inconsistent
                with these terms or applicable law. Axyon does not guarantee
                that every user-provided listing is accurate or that every
                user will fulfil their commitments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                6. Home Tuition Marketplace
              </h2>
              <p className="mt-3">
                Axyon Home Tuition allows eligible tutors to create
                profiles and allows users to discover tutoring services.
                Axyon provides the platform and related features described
                in the applicable service and plan.
              </p>
              <p className="mt-3">
                Tutors are responsible for ensuring that their profile
                information, qualifications, experience, availability and
                service descriptions are accurate. Students and tutors are
                responsible for evaluating suitability, communicating
                clearly and agreeing on the terms of any private tuition
                arrangement.
              </p>
              <p className="mt-3">
                Unless expressly stated otherwise, Axyon is not itself the
                tutor or student in a private tuition arrangement merely
                because it publishes a profile or facilitates discovery.
                Private arrangements between users remain distinct from
                Axyon platform subscription payments.
              </p>
              <p className="mt-3">
                Users should take appropriate precautions when communicating
                or meeting, protect sensitive information and report
                suspected fraud, harassment or unsafe conduct.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                7. Subscription Plans and Pricing
              </h2>
              <p className="mt-3">
                Available Home Tuition plans, their prices, duration and
                applicable features are displayed before purchase. Where
                a promotional offer is active, the applicable offer price
                and terms are displayed through the relevant plan or
                checkout flow.
              </p>
              <p className="mt-3">
                A completed subscription purchase is recorded using the
                purchase price and duration applicable to that subscription.
                A later change to the advertised price of a plan does not
                automatically change the recorded purchase price of an
                existing subscription.
              </p>
              <p className="mt-3">
                You should review the plan details before confirming
                payment. Features and access are subject to the purchased
                plan, subscription status and applicable platform rules.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                8. Payment and Activation
              </h2>
              <p className="mt-3">
                Paid subscriptions are subject to payment-provider
                processing and Axyon&apos;s payment verification process.
                Starting checkout or seeing a bank debit does not, by
                itself, prove that Axyon has confirmed payment or activated
                the subscription.
              </p>
              <p className="mt-3">
                A subscription is treated as active according to its
                recorded status in Axyon&apos;s system. If payment appears
                successful but the subscription remains pending, contact
                support with the relevant transaction reference so the
                payment can be reviewed.
              </p>
              <p className="mt-3">
                Axyon may retain relevant transaction and subscription
                records to verify payment, manage access, issue invoices
                and investigate payment issues. Third-party payment
                providers may also apply their own terms and privacy
                practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                9. Cancellation
              </h2>
              <p className="mt-3">
                Where the cancellation option is available, a tutor may
                cancel a Home Tuition subscription through the applicable
                account flow. Under Axyon&apos;s current cancellation rule,
                successful cancellation pauses platform access immediately.
              </p>
              <p className="mt-3">
                Cancellation does not automatically create a refund or
                reverse a completed payment. Refund requests are handled
                separately under the{" "}
                <Link
                  href="/refund-policy"
                  className="font-bold text-green-700 hover:text-green-800"
                >
                  Refund Policy
                </Link>
                .
              </p>
              <p className="mt-3">
                Cancelling an Axyon subscription does not automatically
                cancel a private tuition agreement between users. Any
                separate arrangement between a tutor and student must be
                addressed between the relevant parties, subject to
                applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                10. Refunds and Payment Disputes
              </h2>
              <p className="mt-3">
                Axyon generally limits refunds to confirmed duplicate
                charges, confirmed payment errors, and circumstances in
                which a refund is required by applicable law. Requests
                are assessed using relevant transaction records and
                applicable requirements.
              </p>
              <p className="mt-3">
                A pending payment, cancellation request or unused
                subscription period does not automatically mean that
                a refund is due. This clause does not limit legal rights
                that cannot be excluded.
              </p>
              <p className="mt-3">
                See the full{" "}
                <Link
                  href="/refund-policy"
                  className="font-bold text-green-700 hover:text-green-800"
                >
                  Refund Policy
                </Link>{" "}
                for the request process and relevant conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                11. User Conduct and Prohibited Activity
              </h2>
              <p className="mt-3">You must not use Axyon to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Commit fraud, impersonation or unlawful activity.</li>
                <li>Harass, threaten, exploit or abuse another user.</li>
                <li>
                  Publish knowingly false, deceptive or unauthorized content.
                </li>
                <li>
                  Bypass verification, access controls or payment safeguards.
                </li>
                <li>
                  Interfere with platform operation or attempt unauthorized
                  access.
                </li>
                <li>
                  Upload malicious code or misuse another person&apos;s
                  information.
                </li>
                <li>
                  Misuse the platform to arrange prohibited or unsafe
                  activity.
                </li>
              </ul>
              <p className="mt-3">
                You must comply with applicable law and any additional
                reasonable rules presented for the service you use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                12. Suspension and Termination
              </h2>
              <p className="mt-3">
                Axyon may restrict, suspend or terminate account or service
                access where reasonably necessary to address a suspected
                terms violation, security issue, verification problem,
                safety concern, legal requirement or misuse of the
                platform.
              </p>
              <p className="mt-3">
                Where appropriate and lawful, Axyon may request further
                information or provide an explanation. The response may
                depend on the nature of the issue and applicable legal
                or safety requirements.
              </p>
              <p className="mt-3">
                Suspension, termination and cancellation are distinct
                from refund decisions. Any refund remains subject to the
                Refund Policy and applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                13. Intellectual Property
              </h2>
              <p className="mt-3">
                The Axyon platform, including its branding, design,
                software and platform materials, may be protected by
                intellectual property laws. Except where permitted by
                law or expressly authorized, you may not copy, distribute,
                modify or commercially exploit protected platform materials.
              </p>
              <p className="mt-3">
                You retain responsibility for content you submit and must
                have the rights needed to provide it. By submitting content,
                you authorize Axyon to host, process and display it as
                reasonably necessary to provide the relevant platform
                features, subject to applicable law and the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                14. Availability and Third-Party Services
              </h2>
              <p className="mt-3">
                Axyon may change, suspend or discontinue features as the
                platform develops, subject to applicable law and any
                binding service commitment. The platform may depend on
                third-party services, networks and providers that Axyon
                does not fully control.
              </p>
              <p className="mt-3">
                Axyon does not guarantee uninterrupted availability or
                that every listing, user interaction or third-party service
                will be error-free. Nothing in this section excludes
                liability or obligations that cannot lawfully be excluded.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                15. Privacy
              </h2>
              <p className="mt-3">
                Axyon handles personal information as described in the{" "}
                <Link
                  href="/privacy"
                  className="font-bold text-green-700 hover:text-green-800"
                >
                  Privacy Policy
                </Link>
                . By using the platform, you should review that policy
                to understand the information involved and the available
                privacy choices and rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                16. Complaints and Support
              </h2>
              <p className="mt-3">
                For account, safety, subscription, payment or service
                concerns, contact Axyon using the published support
                details. Include the relevant account or transaction
                reference and a clear description of the issue. Do not
                include passwords, one-time passcodes or full payment
                authentication details.
              </p>
              <p className="mt-3">
                Axyon may need to verify account ownership and review
                relevant records before responding. Any legally required
                complaint process or remedy remains available as required
                by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                17. Changes to These Terms
              </h2>
              <p className="mt-3">
                Axyon may update these terms to reflect changes in its
                services, operations or legal requirements. The current
                version will be published on this page. Where applicable
                law requires notice, consent or another process for a
                material change, that requirement should be followed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                18. Applicable Law and Disputes
              </h2>
              <p className="mt-3">
                These terms are subject to applicable law. Any governing-law,
                jurisdiction or dispute-resolution provision must be applied
                consistently with mandatory legal requirements and the
                rights available to the parties.
              </p>
              <p className="mt-3">
                This policy does not attempt to exclude a court, forum or
                remedy where such exclusion would be unlawful.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                19. Contact Axyon
              </h2>
              <p className="mt-3">
                For questions about these terms or Axyon services, contact:
              </p>
              <div className="mt-3 space-y-2">
                <p>
                  <strong className="text-slate-950">Email: </strong>
                  <a
                    className="font-bold text-green-700 hover:text-green-800"
                    href={`mailto:${siteConfig.email}`}
                  >
                    {siteConfig.email}
                  </a>
                </p>
                <p>
                  <strong className="text-slate-950">Phone: </strong>
                  <a
                    className="font-bold text-green-700 hover:text-green-800"
                    href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}
                  >
                    {siteConfig.phone}
                  </a>
                </p>
                <p>
                  <strong className="text-slate-950">Address: </strong>
                  {siteConfig.address}
                </p>
              </div>
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
                Refund Policy
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