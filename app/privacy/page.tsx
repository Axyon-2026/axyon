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
                1. Introduction and Scope
              </h2>
              <p className="mt-3">
                This Privacy Policy explains how Axyon handles personal
                information in connection with its website, accounts,
                marketplaces, Home Tuition services, support interactions
                and related platform features.
              </p>
              <p className="mt-3">
                The information processed depends on the service you use,
                the information you provide and the features available to
                your account. This policy should be read together with the
                Terms & Conditions and any applicable service-specific
                notices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                2. Information We May Collect
              </h2>
              <p className="mt-3">
                Depending on your use of Axyon, information may include:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Account information such as your name, email address,
                  phone number, account identifier and authentication-related
                  records.
                </li>
                <li>
                  Profile and marketplace information, including listings,
                  descriptions, preferences and information you choose to
                  publish.
                </li>
                <li>
                  Eligibility and verification information submitted for
                  a particular marketplace or service, which may include
                  school or college details, documents or photographs where
                  required by that service.
                </li>
                <li>
                  Home Tuition information such as tutor profile details,
                  subscription plan, subscription status, purchase amount,
                  transaction references and invoice records.
                </li>
                <li>
                  Communications you send to support and information
                  reasonably needed to investigate your request.
                </li>
                <li>
                  Technical and security information generated through
                  ordinary service operation, such as session-related
                  records, request information and diagnostic logs, where
                  collected by the application or its providers.
                </li>
              </ul>
              <p className="mt-3">
                Axyon should collect and use information appropriate to the
                relevant purpose. The exact categories may differ by feature
                and by the technical services enabled for the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                3. Information from Payment Providers
              </h2>
              <p className="mt-3">
                When you purchase a paid service, payment processing may be
                provided by a third-party payment provider. Axyon may receive
                or store transaction information necessary to confirm
                payment, activate a subscription, maintain payment records,
                issue an invoice, investigate an error or respond to a
                payment dispute.
              </p>
              <p className="mt-3">
                Payment providers may process information under their own
                privacy notices and terms. Do not send card security codes,
                passwords or one-time passcodes to Axyon support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                4. How We Use Information
              </h2>
              <p className="mt-3">
                Subject to applicable law, information may be used to:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Create and manage accounts and provide requested services.
                </li>
                <li>Authenticate users and maintain session security.</li>
                <li>Check eligibility and complete applicable verification.</li>
                <li>Display and manage marketplace profiles and listings.</li>
                <li>Process subscriptions, verify payments and maintain invoices.</li>
                <li>
                  Send service, account, transaction and support communications.
                </li>
                <li>
                  Investigate fraud, abuse, security incidents and disputes.
                </li>
                <li>
                  Maintain, troubleshoot and improve platform reliability.
                </li>
                <li>
                  Meet applicable legal, regulatory and recordkeeping obligations.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                5. Legal Grounds and Choices
              </h2>
              <p className="mt-3">
                Where applicable law requires a legal basis for processing,
                the relevant basis may depend on the purpose and context.
                This can include providing a service you request, meeting
                legal obligations, protecting legitimate security interests,
                or obtaining consent where consent is required.
              </p>
              <p className="mt-3">
                Where processing relies on consent, you may have the right
                to withdraw that consent, subject to applicable law and the
                consequences of doing so. Withdrawal does not necessarily
                affect processing that was lawful before withdrawal or
                processing supported by another valid legal basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                6. Sharing and Service Providers
              </h2>
              <p className="mt-3">
                Axyon may share relevant information with service providers
                that help operate the platform, such as hosting, database,
                email-delivery, authentication, storage and payment
                processing providers, where those providers need the
                information to perform their services.
              </p>
              <p className="mt-3">
                Information may also be disclosed where reasonably necessary
                to address a security incident, investigate suspected
                unlawful activity, enforce platform terms, protect users,
                or comply with a valid legal requirement.
              </p>
              <p className="mt-3">
                Axyon does not promise that every provider has the same
                practices. The applicable provider&apos;s own terms and
                privacy information may also apply to its processing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                7. Public Profiles and User-Provided Content
              </h2>
              <p className="mt-3">
                Information that you submit for publication may be visible
                to other users according to the features and access controls
                of the relevant marketplace. Do not publish information
                that you do not want other users to see.
              </p>
              <p className="mt-3">
                Information shared directly with another user may be copied
                or retained by that user independently of Axyon. Removing
                information from a profile does not necessarily remove
                copies already made by others or records that must be
                retained for a valid reason.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                8. Cookies, Sessions and Similar Technologies
              </h2>
              <p className="mt-3">
                Axyon may use cookies or similar technologies where needed
                for account authentication, session management, security
                and platform functionality. The precise technologies and
                purposes depend on the features and providers enabled.
              </p>
              <p className="mt-3">
                Blocking or deleting essential session technologies may
                prevent some account features from working correctly.
                Any optional analytics or advertising technologies, if
                enabled, should be described in a service-specific notice
                and managed as required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                9. Data Retention
              </h2>
              <p className="mt-3">
                Information may be retained for as long as reasonably
                necessary for the purpose for which it was collected,
                including account operation, security, payment records,
                dispute resolution and applicable legal obligations.
              </p>
              <p className="mt-3">
                Different records may have different retention periods.
                Deletion of an account or profile does not necessarily
                require immediate deletion of transaction, security or
                other records that must or may lawfully be retained.
                Retention periods should be determined according to the
                type of record and applicable requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                10. Security
              </h2>
              <p className="mt-3">
                Axyon uses measures intended to protect information against
                unauthorized access, loss, misuse and alteration. No
                internet-based service or storage system can be guaranteed
                to be completely secure.
              </p>
              <p className="mt-3">
                Users should keep credentials confidential, avoid sharing
                authentication codes and promptly report suspected
                unauthorized account activity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                11. Your Privacy Requests
              </h2>
              <p className="mt-3">
                Depending on applicable law and the circumstances, you may
                be entitled to request access to personal information,
                correction of inaccurate information, deletion, a copy of
                certain information, withdrawal of consent, or other
                available remedies.
              </p>
              <p className="mt-3">
                Contact Axyon using the details below and describe the
                request. Axyon may need to verify your identity and clarify
                the information involved before responding. Some requests
                may be limited where retention or processing is required
                or permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                12. Children and Eligibility
              </h2>
              <p className="mt-3">
                Axyon offers different services with different eligibility
                requirements. Users should provide accurate age, identity
                and eligibility information where requested and use only
                services for which they are eligible.
              </p>
              <p className="mt-3">
                Where a service involves children or information about
                children, applicable legal requirements and the service&apos;s
                eligibility and consent rules must be followed. Contact
                Axyon if you believe personal information has been submitted
                improperly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                13. International Processing
              </h2>
              <p className="mt-3">
                Some service providers may process or store information in
                locations different from the location where you use Axyon.
                Where cross-border processing occurs, Axyon should apply
                the safeguards and requirements applicable to that
                processing.
              </p>
              <p className="mt-3">
                The locations of the actual providers and any applicable
                transfer safeguards should be confirmed from the services
                used by the deployed application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                14. Changes to This Policy
              </h2>
              <p className="mt-3">
                Axyon may update this policy as its services, technical
                practices or legal requirements change. The current version
                will be published on this page. Where applicable law
                requires notice or consent for a material change, Axyon
                should follow that requirement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                15. Contact Axyon
              </h2>
              <p className="mt-3">
                For privacy questions or requests, contact:
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
                href="/terms"
                className="text-slate-600 hover:text-green-700"
              >
                Terms & Conditions
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