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
            Refund Policy
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Version {siteConfig.legal.refundVersion}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-black text-slate-950">
                1. Purpose and Scope
              </h2>
              <p className="mt-3">
                This policy explains how refund requests for payments made
                directly to Axyon for paid platform services are assessed.
                It applies to Home Tuition subscription payments and other
                paid Axyon services where applicable.
              </p>
              <p className="mt-3">
                Payments made directly between users for private tuition or
                other marketplace arrangements are separate from payments
                made to Axyon. Unless Axyon expressly handles such a payment,
                this policy does not determine refunds for those private
                transactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                2. General Refund Rule
              </h2>
              <p className="mt-3">
                Axyon generally limits refunds to confirmed duplicate
                charges, confirmed payment errors, and circumstances in
                which a refund or repayment is required by applicable law.
              </p>
              <p className="mt-3">
                Refund requests are assessed against the available Axyon
                subscription and transaction records and, where relevant,
                the payment provider&apos;s records. Submitting a request
                does not by itself mean that a refund has been approved.
              </p>
              <p className="mt-3">
                An unused subscription period, a change of plans, a decision
                to stop using the service, or cancellation alone does not
                automatically qualify a payment for a refund. This does not
                limit any rights that cannot lawfully be excluded.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                3. Duplicate Charges
              </h2>
              <p className="mt-3">
                If you believe that you were charged more than once for the
                same purchase, contact Axyon support with the relevant
                transaction references. Axyon may compare payment-provider
                records and subscription records to determine whether a
                duplicate charge occurred.
              </p>
              <p className="mt-3">
                Where a duplicate charge is confirmed and a refund is
                appropriate, Axyon will arrange the applicable refund through
                the available payment mechanism, subject to applicable law
                and payment-provider requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                4. Confirmed Payment Errors
              </h2>
              <p className="mt-3">
                A payment error may include a confirmed incorrect charge or
                another verified payment-processing error. Axyon will review
                the relevant transaction information before deciding what
                corrective action is appropriate.
              </p>
              <p className="mt-3">
                If a payment was debited but the subscription remains
                pending, this does not by itself establish that the payment
                failed or that a refund is due. Payment status may need to be
                verified against the payment provider before the issue can
                be resolved.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                5. Failed, Pending and Unverified Payments
              </h2>
              <p className="mt-3">
                A payment attempt that has not been confirmed as successful
                does not establish that a paid subscription has been
                activated. A transaction may remain under review while Axyon
                checks payment-provider information and its own records.
              </p>
              <p className="mt-3">
                If your bank or payment provider shows a debit but Axyon
                does not show the expected subscription status, contact
                support. Please do not assume that a pending status means
                that a refund has already been initiated.
              </p>
              <p className="mt-3">
                Where a payment reversal or refund is required, the
                appropriate process will depend on the confirmed transaction
                status, payment-provider procedures and applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                6. Subscription Cancellation and Refunds
              </h2>
              <p className="mt-3">
                Cancelling a Home Tuition subscription and requesting a
                refund are separate matters. Under Axyon&apos;s current
                cancellation rule, successful cancellation pauses
                subscription access immediately. Cancellation does not
                automatically refund the original payment or any unused
                subscription period.
              </p>
              <p className="mt-3">
                A refund may still be considered where a duplicate charge,
                confirmed payment error or applicable legal requirement
                provides a basis for it.
              </p>
              <p className="mt-3">
                Cancellation and refund requests are handled separately.
                Cancelling a subscription does not, by itself, confirm that
                a refund has been approved or initiated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                7. How to Request a Refund
              </h2>
              <p className="mt-3">
                Contact Axyon using the support details at the end of this
                policy. Include enough information for the transaction to
                be identified, such as:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  The email address associated with your Axyon account.
                </li>
                <li>The approximate date and amount of the payment.</li>
                <li>The subscription or order reference, if available.</li>
                <li>
                  The payment-provider transaction or payment ID, if
                  available.
                </li>
                <li>
                  A brief description of the issue and the resolution
                  requested.
                </li>
              </ul>
              <p className="mt-3">
                Do not send passwords, one-time passcodes, full card numbers,
                card security codes or other authentication secrets. Axyon
                may request relevant non-sensitive information needed to
                investigate the transaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                8. Review and Processing
              </h2>
              <p className="mt-3">
                Axyon may review account records, subscription status,
                payment-provider records and relevant communications before
                reaching a decision. Additional information may be requested
                if the transaction cannot be identified or verified.
              </p>
              <p className="mt-3">
                Where a refund is approved or required, the method and timing
                of the transaction may depend on the payment provider,
                banking arrangements and applicable law. Axyon does not
                promise a fixed processing period in this policy.
              </p>
              <p className="mt-3">
                A refund request, an approved refund, and the actual credit
                appearing in a bank or payment account are different stages.
                Contact support if you need an update on a particular case.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                9. Statutory Rights
              </h2>
              <p className="mt-3">
                Nothing in this policy is intended to remove or restrict a
                consumer right or other legal entitlement that cannot be
                excluded or limited under applicable law. Where a mandatory
                legal requirement conflicts with this policy, the mandatory
                requirement applies to the extent of the conflict.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950">
                10. Contact Axyon
              </h2>
              <p className="mt-3">
                For refund requests or payment disputes, contact:
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
                href="/privacy"
                className="text-slate-600 hover:text-green-700"
              >
                Privacy Policy
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