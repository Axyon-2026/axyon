import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function RefundPolicyPage() {
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
            Refund & Cancellation Policy
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Version {siteConfig.legal.refundVersion}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-black text-slate-950">
                1. Scope
              </h2>
              <p className="mt-3">
                This policy applies to paid Axyon platform services, including
                Home Tuition subscription plans. Marketplace transactions
                directly between users are generally separate from Axyon
                platform-service payments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                2. Home Tuition Subscriptions
              </h2>
              <p className="mt-3">
                Home Tuition subscriptions provide the platform features
                described in the selected plan, including applicable tutor
                profile publication and access to the Axyon tutoring
                marketplace for the purchased subscription period.
              </p>
              <p className="mt-3">
                The applicable price, subscription duration and any promotional
                pricing are displayed before payment. Promotional pricing, when
                available, applies according to the dates and conditions shown
                with the offer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                3. Cancellation
              </h2>
              <p className="mt-3">
                An active Home Tuition subscription can be cancelled through
                the applicable Axyon account flow where cancellation is
                available.
              </p>
              <p className="mt-3">
                Cancellation stops the subscription according to the
                applicable subscription rules. Cancellation does not
                automatically create a refund for the unused portion of a
                subscription unless a refund is otherwise required by
                applicable law or specifically approved by Axyon.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                4. Payment Debited but Service Not Activated
              </h2>
              <p className="mt-3">
                If a payment is successfully debited but the corresponding
                Axyon subscription is not activated, Axyon may review the
                transaction using its subscription records and payment-provider
                records.
              </p>
              <p className="mt-3">
                Where an eligible payment reversal or refund is required, it
                will be processed through the applicable payment mechanism.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                5. Duplicate Payments
              </h2>
              <p className="mt-3">
                If the same subscription payment is accidentally charged more
                than once, the transaction records may be reviewed to determine
                the duplicate charge. Eligible duplicate-payment refunds will
                be handled through the applicable payment mechanism.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                6. Failed Payments
              </h2>
              <p className="mt-3">
                A failed payment does not create an active paid subscription.
                If a payment provider reports a failure after an amount appears
                to have been debited, the transaction may be reviewed against
                payment-provider records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                7. Marketplace Transactions
              </h2>
              <p className="mt-3">
                Transactions between marketplace users are generally separate
                from Axyon platform-service payments. Axyon platform
                subscription payments should not be confused with private
                transactions between students or other marketplace users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                8. Refund Requests
              </h2>
              <p className="mt-3">
                Refund or payment-support requests should include the relevant
                account information and, where available, the payment or
                transaction reference so that the matter can be reviewed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                9. Contact for Payment Support
              </h2>
              <p className="mt-3">
                Payment-related questions and refund requests can be sent to{" "}
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
              Important
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Please review the applicable plan, price, duration and
              cancellation terms before completing a Home Tuition subscription
              payment.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}