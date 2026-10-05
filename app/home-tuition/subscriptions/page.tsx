"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Subscription = {
  id: string;
  purchasedPlanType: "MONTHLY" | "YEARLY";
  purchasedPrice: number;
  durationDays: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startsAt: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  plan?: {
    id: string;
    name: string;
    type: "MONTHLY" | "YEARLY";
    price: number;
    durationDays: number;
  } | null;
};

type Plan = {
  id: string;
  name: string;
  type: "MONTHLY" | "YEARLY";
  price: number;
  durationDays: number;
  description?: string | null;
};

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function date(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusMeta(status: Subscription["status"]) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "PENDING":
      return {
        label: "Payment pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
    default:
      return {
        label: "Cancelled",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
  }
}

export default function HomeTuitionSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [subscriptionResponse, plansResponse] = await Promise.all([
        fetch("/api/home-tuition/subscriptions", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/home-tuition/plans", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (subscriptionResponse.status === 401) {
        window.location.href =
          "/login?next=/home-tuition/subscriptions";
        return;
      }

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        throw new Error(
          subscriptionData?.error || "Unable to load subscriptions."
        );
      }

      const planData = plansResponse.ok
        ? await plansResponse.json()
        : { plans: [] };

      setSubscriptions(subscriptionData.subscriptions || []);
      setPlans(planData.plans || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subscription information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeSubscription = useMemo(
    () => subscriptions.find((item) => item.status === "ACTIVE") || null,
    [subscriptions]
  );

  const pendingSubscription = useMemo(
    () => subscriptions.find((item) => item.status === "PENDING") || null,
    [subscriptions]
  );

  async function cancelSubscription(subscriptionId: string) {
    if (
      !window.confirm(
        "Cancel this subscription? Your current access will be paused."
      )
    ) {
      return;
    }

    setBusyId(subscriptionId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/home-tuition/subscriptions/${subscriptionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "CANCEL",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to cancel subscription.");
      }

      setMessage("Subscription cancelled successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel subscription."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function recoverPayment(subscriptionId: string) {
    setBusyId(subscriptionId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/home-tuition/payments/recover",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            subscriptionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Payment could not be recovered. Please try again."
        );
      }

      setMessage(
        "Verified payment found. Your subscription has been restored."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to recover payment."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function renewSubscription(
    subscriptionId: string,
    planId?: string
  ) {
    setBusyId(subscriptionId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/home-tuition/subscriptions/${subscriptionId}/renew`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(
            planId ? { planId } : {}
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to create renewal."
        );
      }

      setMessage(
        "Renewal created. Continue to payment to activate it."
      );

      window.location.href = `/home-tuition/subscribe?subscriptionId=${encodeURIComponent(
        data.subscription?.id || ""
      )}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to renew subscription."
      );
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/home-tuition"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg">
              A
            </div>

            <div>
              <div className="text-sm font-black tracking-tight">
                Axyon
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Home Tuition
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/home-tuition"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Find Tutors
            </Link>

            <Link
              href="/home-tuition/tutor"
              className="rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Tutor Profile
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Subscription Center
          </div>

          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
            Manage your Home Tuition subscription
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Track access, expiry dates, renewals and payment status
            from one place. Axyon subscriptions do not auto-renew.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="h-56 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-56 animate-pulse rounded-3xl bg-white shadow-sm lg:col-span-2" />
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:col-span-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Current access
                    </p>

                    <h2 className="mt-3 text-2xl font-black">
                      {activeSubscription
                        ? "Active"
                        : pendingSubscription
                        ? "Payment pending"
                        : "No active plan"}
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    {activeSubscription ? "✓" : "•"}
                  </div>
                </div>

                {activeSubscription ? (
                  <div className="mt-8 space-y-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        Plan
                      </p>
                      <p className="mt-1 font-bold">
                        {activeSubscription.plan?.name ||
                          activeSubscription.purchasedPlanType}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Started
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {date(activeSubscription.startsAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Expires
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {date(activeSubscription.expiresAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-7 text-sm leading-6 text-slate-400">
                    Choose a Home Tuition plan to publish your tutor
                    profile and maintain active visibility.
                  </p>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Billing
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Plans & renewal
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Select a plan when you need to renew. Your
                      existing subscription and payment records remain
                      preserved.
                    </p>
                  </div>

                  <Link
                    href="/home-tuition/subscribe"
                    className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                  >
                    View plans
                  </Link>
                </div>

                {activeSubscription && (
                  <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-amber-900">
                        Auto-renewal is off
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        Renew manually before or after expiry whenever
                        you want to continue.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={busyId === activeSubscription.id}
                      onClick={() =>
                        renewSubscription(activeSubscription.id)
                      }
                      className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyId === activeSubscription.id
                        ? "Processing..."
                        : "Renew"}
                    </button>
                  </div>
                )}
              </section>
            </div>

            <section className="mt-7">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    History
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    Subscription activity
                  </h2>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                  {subscriptions.length} record
                  {subscriptions.length === 1 ? "" : "s"}
                </span>
              </div>

              {subscriptions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                    +
                  </div>

                  <h3 className="mt-4 text-lg font-black">
                    No subscriptions yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Start with a Home Tuition plan to publish and
                    maintain your tutor listing.
                  </p>

                  <Link
                    href="/home-tuition/subscribe"
                    className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
                  >
                    Explore plans
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => {
                    const meta = statusMeta(subscription.status);
                    const isBusy = busyId === subscription.id;

                    return (
                      <article
                        key={subscription.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-black">
                                {subscription.plan?.name ||
                                  `${subscription.purchasedPlanType} Plan`}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${meta.className}`}
                              >
                                {meta.label}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                              <div>
                                <p className="text-xs font-semibold text-slate-400">
                                  Amount
                                </p>
                                <p className="mt-1 font-black">
                                  {money(
                                    subscription.purchasedPrice
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-slate-400">
                                  Duration
                                </p>
                                <p className="mt-1 font-bold text-slate-700">
                                  {subscription.durationDays} days
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-slate-400">
                                  Created
                                </p>
                                <p className="mt-1 font-bold text-slate-700">
                                  {date(subscription.createdAt)}
                                </p>
                              </div>
                            </div>

                            {subscription.status === "ACTIVE" && (
                              <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                                <span>
                                  Started:{" "}
                                  {date(subscription.startsAt)}
                                </span>
                                <span>
                                  Expires:{" "}
                                  {date(subscription.expiresAt)}
                                </span>
                              </div>
                            )}

                            {subscription.razorpayPaymentId && (
                              <p className="mt-4 truncate text-[11px] font-mono text-slate-400">
                                Payment:{" "}
                                {subscription.razorpayPaymentId}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                            {subscription.status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() =>
                                    recoverPayment(subscription.id)
                                  }
                                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                  {isBusy
                                    ? "Checking..."
                                    : "Recover payment"}
                                </button>

                                <Link
                                  href="/home-tuition/subscribe"
                                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
                                >
                                  Continue
                                </Link>
                              </>
                            )}

                            {subscription.status === "ACTIVE" && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  cancelSubscription(
                                    subscription.id
                                  )
                                }
                                className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-black text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                              >
                                {isBusy
                                  ? "Processing..."
                                  : "Cancel"}
                              </button>
                            )}

                            {subscription.status === "EXPIRED" && (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  renewSubscription(
                                    subscription.id
                                  )
                                }
                                className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                              >
                                {isBusy
                                  ? "Processing..."
                                  : "Renew"}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {plans.length > 0 && (
              <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    Available plans
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    Choose a renewal duration
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-black">{plan.name}</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {plan.durationDays} days
                          </p>
                        </div>

                        <div className="text-lg font-black">
                          {money(plan.price)}
                        </div>
                      </div>

                      {plan.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {plan.description}
                        </p>
                      )}

                      {activeSubscription && (
                        <button
                          type="button"
                          disabled={
                            busyId === activeSubscription.id
                          }
                          onClick={() =>
                            renewSubscription(
                              activeSubscription.id,
                              plan.id
                            )
                          }
                          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Renew with this plan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}