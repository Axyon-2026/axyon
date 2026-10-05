"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  type: "MONTHLY" | "YEARLY";
  price: number;
  durationDays: number;
  description: string | null;
  offerEnabled: boolean;
  discountPercent: number;
  offerPrice: number | null;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  offerMessage: string | null;
};

type Profile = {
  id: string;
  displayName: string;
  status: string;
  termsAcceptedAt: string | null;
  termsVersion: string | null;
  safetyAcceptedAt: string | null;
  safetyVersion: string | null;
};

type Subscription = {
  id: string;
  status: string;
  purchasedPrice: number;
  purchasedPlanType: "MONTHLY" | "YEARLY";
  startsAt: string | null;
  expiresAt: string | null;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

function isOfferCurrentlyActive(plan: Plan) {
  if (!plan.offerEnabled) return false;

  const now = Date.now();

  if (
    plan.offerStartsAt &&
    new Date(plan.offerStartsAt).getTime() > now
  ) {
    return false;
  }

  if (
    plan.offerEndsAt &&
    new Date(plan.offerEndsAt).getTime() < now
  ) {
    return false;
  }

  return true;
}

function getEffectivePrice(plan: Plan) {
  if (!isOfferCurrentlyActive(plan)) {
    return {
      price: plan.price,
      originalPrice: plan.price,
      offerActive: false,
      discountPercent: 0,
    };
  }

  const discountedPrice =
    plan.offerPrice !== null && plan.offerPrice !== undefined
      ? plan.offerPrice
      : plan.discountPercent > 0
      ? Math.max(
          1,
          Math.round(
            plan.price * (1 - plan.discountPercent / 100)
          )
        )
      : plan.price;

  const actualDiscount =
    plan.price > 0
      ? Math.max(
          0,
          Math.round(
            ((plan.price - discountedPrice) / plan.price) * 100
          )
        )
      : 0;

  return {
    price: discountedPrice,
    originalPrice: plan.price,
    offerActive: discountedPrice < plan.price,
    discountPercent: actualDiscount,
  };
}

function formatOfferExpiry(date: string | null) {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HomeTuitionSubscribePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [plansResponse, profileResponse, subscriptionsResponse] =
        await Promise.all([
          fetch("/api/home-tuition/plans", {
            cache: "no-store",
          }),
          fetch("/api/home-tuition/profile", {
            cache: "no-store",
          }),
          fetch("/api/home-tuition/subscriptions", {
            cache: "no-store",
          }),
        ]);

      if (profileResponse.status === 401) {
        window.location.href =
          "/login?next=/home-tuition/subscribe";
        return;
      }

      const plansData = await plansResponse.json();
      const profileData = await profileResponse.json();
      const subscriptionsData = await subscriptionsResponse.json();

      if (!plansResponse.ok) {
        throw new Error(
          plansData.error || "Unable to load subscription plans."
        );
      }

      if (!profileResponse.ok) {
        throw new Error(
          profileData.error || "Unable to load tutor profile."
        );
      }

      if (!subscriptionsResponse.ok) {
        throw new Error(
          subscriptionsData.error ||
            "Unable to load subscriptions."
        );
      }

      setPlans(plansData.plans || []);
      setProfile(profileData.profile || null);
      setSubscriptions(subscriptionsData.subscriptions || []);

      if (plansData.plans?.length) {
        setSelectedPlan(plansData.plans[0].id);
      }
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

  const activeSubscription = subscriptions.find(
    (subscription) => subscription.status === "ACTIVE"
  );

  const pendingSubscription = subscriptions.find(
    (subscription) => subscription.status === "PENDING"
  );

  const selectedPlanData = plans.find(
    (plan) => plan.id === selectedPlan
  );

  const selectedPricing = selectedPlanData
    ? getEffectivePrice(selectedPlanData)
    : null;

  async function startSubscription() {
    if (!profile) {
      setError("Create your tutor profile first.");
      return;
    }

    if (!selectedPlanData) {
      setError("Select a subscription plan.");
      return;
    }

    if (
      !profile.termsAcceptedAt ||
      profile.termsVersion !== "1.0" ||
      !profile.safetyAcceptedAt ||
      profile.safetyVersion !== "1.0"
    ) {
      setError(
        "Current Terms and Safety requirements must be accepted in your tutor profile."
      );
      return;
    }

    if (activeSubscription) {
      setError(
        "You already have an active Home Tuition subscription."
      );
      return;
    }

    if (pendingSubscription) {
      setError(
        "You already have a pending subscription. Complete that payment before creating another one."
      );
      return;
    }

    try {
      setPaymentLoading(true);
      setError("");
      setMessage("");

      const subscriptionResponse = await fetch(
        "/api/home-tuition/subscriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: selectedPlanData.id,
          }),
        }
      );

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        throw new Error(
          subscriptionData.error ||
            "Unable to create subscription."
        );
      }

      const subscription = subscriptionData.subscription;

      const orderResponse = await fetch(
        "/api/home-tuition/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscriptionId: subscription.id,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error || "Unable to create payment order."
        );
      }

      await loadRazorpay();

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Axyon",
        description: `${selectedPlanData.name} Home Tuition subscription`,
        order_id: orderData.orderId,
        theme: {
          color: "#4f46e5",
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch(
              "/api/home-tuition/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subscriptionId: subscription.id,
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error ||
                  "Payment verification failed."
              );
            }

            setMessage(
              "Payment successful. Your tutor profile is now active."
            );

            await loadData();
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Payment verification failed."
            );
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setMessage(
              "Payment window closed. Your subscription remains pending."
            );
          },
        },
      });

      razorpay.on("payment.failed", (response: any) => {
        setPaymentLoading(false);
        setError(
          response?.error?.description ||
            "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (err) {
      setPaymentLoading(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment."
      );
    }
  }

  async function loadRazorpay() {
    if (window.Razorpay) return;

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(
            new Error("Unable to load payment service.")
          )
        );
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error("Unable to load payment service.")
        );

      document.body.appendChild(script);
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 h-[500px] animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/home-tuition"
            className="flex items-center gap-2 text-lg font-black"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm text-white">
              A
            </span>
            Axyon
          </Link>

          <Link
            href="/home-tuition/tutor"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Edit profile
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-indigo-600">
            Home Tuition
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Choose your subscription
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Activate your tutor profile and make it visible to students.
            There is no automatic renewal.
          </p>
        </div>

        {profile && (
          <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Tutor profile
              </p>

              <p className="mt-1 text-lg font-black">
                {profile.displayName}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                profile.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700"
                  : profile.status === "PAUSED"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {profile.status}
            </span>
          </div>
        )}

        {activeSubscription && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-black text-emerald-900">
              Your tutor profile is active
            </p>

            <p className="mt-1 text-sm text-emerald-800">
              Your current subscription expires on{" "}
              {activeSubscription.expiresAt
                ? new Date(
                    activeSubscription.expiresAt
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "a later date"}
              .
            </p>

            <Link
              href="/home-tuition/tutor"
              className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
            >
              Manage profile
            </Link>
          </div>
        )}

        {pendingSubscription && !activeSubscription && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-black text-amber-900">
              Payment is pending
            </p>

            <p className="mt-1 text-sm text-amber-800">
              A subscription is already awaiting payment. Complete that
              payment before creating another subscription.
            </p>
          </div>
        )}

        {!profile && (
          <div className="mt-7 rounded-3xl border border-indigo-200 bg-indigo-50 p-6">
            <h2 className="text-lg font-black text-indigo-950">
              Create your tutor profile first
            </h2>

            <p className="mt-2 text-sm leading-6 text-indigo-800">
              Your profile, contact consent and safety requirements must be
              completed before purchasing a subscription.
            </p>

            <Link
              href="/home-tuition/tutor"
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
            >
              Create tutor profile
            </Link>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {plans.length > 0 && !activeSubscription && (
          <section className="mt-8">
            <div className="grid gap-5 md:grid-cols-2">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.id;
                const pricing = getEffectivePrice(plan);
                const expiry = pricing.offerActive
                  ? formatOfferExpiry(plan.offerEndsAt)
                  : null;

                return (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition sm:p-7 ${
                      selected
                        ? "border-indigo-500 bg-white shadow-xl shadow-indigo-100 ring-2 ring-indigo-100"
                        : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg"
                    }`}
                  >
                    {pricing.offerActive && (
                      <div className="absolute left-0 right-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-white">
                        <span className="text-xs font-black uppercase tracking-wider">
                          Limited-time offer
                        </span>

                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black">
                          {pricing.discountPercent}% OFF
                        </span>
                      </div>
                    )}

                    {selected && (
                      <span
                        className={`absolute right-5 ${
                          pricing.offerActive
                            ? "top-14"
                            : "top-5"
                        } rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white`}
                      >
                        Selected
                      </span>
                    )}

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600 ${
                        pricing.offerActive ? "mt-9" : ""
                      }`}
                    >
                      {plan.type === "YEARLY" ? "★" : "↻"}
                    </div>

                    <p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">
                      {plan.type === "YEARLY"
                        ? "Yearly"
                        : "Monthly"}
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      {plan.name}
                    </h2>

                    <div className="mt-5">
                      {pricing.offerActive ? (
                        <div className="flex flex-wrap items-end gap-3">
                          <span className="text-4xl font-black text-slate-950">
                            ₹{pricing.price}
                          </span>

                          <span className="pb-1 text-lg font-bold text-slate-400 line-through">
                            ₹{pricing.originalPrice}
                          </span>

                          <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                            Save {pricing.discountPercent}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-black">
                            ₹{pricing.price}
                          </span>
                        </div>
                      )}

                      <span className="mt-1 block text-sm font-semibold text-slate-400">
                        /{" "}
                        {plan.type === "YEARLY"
                          ? "year"
                          : "month"}
                      </span>
                    </div>

                    {pricing.offerActive && plan.offerMessage && (
                      <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                        <p className="text-sm font-bold text-indigo-900">
                          {plan.offerMessage}
                        </p>

                        {expiry && (
                          <p className="mt-1 text-xs font-semibold text-indigo-600">
                            Offer ends {expiry}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="mt-4 min-h-12 text-sm leading-6 text-slate-500">
                      {plan.description ||
                        `Active tutor listing for ${plan.durationDays} days.`}
                    </p>

                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                      {[
                        "Public tutor profile",
                        "Call and WhatsApp contact",
                        "Student reviews",
                        "Profile visibility while active",
                      ].map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3 text-sm font-semibold text-slate-700"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-600">
                            ✓
                          </span>

                          {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:p-7 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-black">
                  Ready to activate your profile?
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Secure payment through Razorpay. No automatic renewal.
                </p>

                {selectedPricing?.offerActive && (
                  <p className="mt-2 text-sm font-bold text-emerald-400">
                    Promotional price: ₹{selectedPricing.price}
                    {" · "}
                    {selectedPricing.discountPercent}% off
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={startSubscription}
                disabled={
                  paymentLoading ||
                  !profile ||
                  Boolean(activeSubscription) ||
                  Boolean(pendingSubscription)
                }
                className="h-12 rounded-xl bg-indigo-600 px-7 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentLoading
                  ? "Opening payment..."
                  : selectedPricing
                  ? `Pay ₹${selectedPricing.price}`
                  : "Select a plan"}
              </button>
            </div>
          </section>
        )}

        {plans.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-black">
              No subscription plans are currently available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please check again later.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            [
              "Secure payments",
              "Payments are processed through Razorpay.",
            ],
            [
              "No auto-renewal",
              "Every subscription ends on its expiry date.",
            ],
            [
              "Keep control",
              "Pause or remove your profile whenever needed.",
            ],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <p className="font-black">{title}</p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}