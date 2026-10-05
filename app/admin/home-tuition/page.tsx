"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TutorStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "SUSPENDED" | "DELETED";

type Plan = {
  id: string;
  name: string;
  type: "MONTHLY" | "YEARLY";
  price: number;
  durationDays: number;
  description: string | null;

  offerEnabled: boolean;
  discountPercent: number | null;
  offerPrice: number | null;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  offerMessage: string | null;

  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Tutor = {
  id: string;
  displayName: string;
  photoUrl?: string | null;
  institution?: string | null;
  college?: string | null;
  subjects: string[];
  classes: string[];
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  location?: string | null;
  hourlyFee: number;
  demoAvailable: boolean;
  phoneVisibilityConfirmed: boolean;
  status: TutorStatus;
  termsAcceptedAt?: string | null;
  termsVersion?: string | null;
  safetyAcceptedAt?: string | null;
  safetyVersion?: string | null;
  publishedAt?: string | null;
  pausedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    marketplaceType: string;
    isSuspended: boolean;
    studentVerified: boolean;
    studentVerificationStatus: string;
  };

  subscriptions: Array<{
    id: string;
    purchasedPlanType: "MONTHLY" | "YEARLY";
    purchasedPrice: number;
    durationDays: number;
    status: string;
    startsAt?: string | null;
    expiresAt?: string | null;
    activatedAt?: string | null;
    createdAt: string;
  }>;

  _count: {
    reviews: number;
    reports: number;
    subscriptions: number;
  };
};

type Counts = {
  total: number;
  draft: number;
  active: number;
  paused: number;
  suspended: number;
  deleted: number;
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function statusClass(status: TutorStatus) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "SUSPENDED":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "PAUSED":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "DELETED":
      return "border-slate-200 bg-slate-100 text-slate-500";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function offerIsCurrentlyActive(plan: Plan) {
  if (!plan.offerEnabled) return false;

  const now = Date.now();

  const starts =
    !plan.offerStartsAt ||
    new Date(plan.offerStartsAt).getTime() <= now;

  const ends =
    !plan.offerEndsAt ||
    new Date(plan.offerEndsAt).getTime() >= now;

  return starts && ends;
}

export default function HomeTuitionAdminPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);

  const [counts, setCounts] = useState<Counts>({
    total: 0,
    active: 0,
    draft: 0,
    paused: 0,
    suspended: 0,
    deleted: 0,
  });

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | TutorStatus>("ALL");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planBusyId, setPlanBusyId] = useState<string | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [planName, setPlanName] = useState("");
  const [planType, setPlanType] =
    useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [planPrice, setPlanPrice] = useState("");
  const [planDuration, setPlanDuration] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const [offerEnabled, setOfferEnabled] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerStartsAt, setOfferStartsAt] = useState("");
  const [offerEndsAt, setOfferEndsAt] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  const [planError, setPlanError] = useState("");

  async function loadPlans() {
    setPlansLoading(true);
    setPlanError("");

    try {
      const response = await fetch("/api/home-tuition/plans", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin";
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load plans.");
      }

      setPlans(data.plans || []);
    } catch (err) {
      setPlanError(
        err instanceof Error
          ? err.message
          : "Unable to load subscription plans.",
      );
    } finally {
      setPlansLoading(false);
    }
  }

  function resetPlanForm() {
    setPlanName("");
    setPlanType("MONTHLY");
    setPlanPrice("");
    setPlanDuration("");
    setPlanDescription("");

    setOfferEnabled(false);
    setDiscountPercent("");
    setOfferPrice("");
    setOfferStartsAt("");
    setOfferEndsAt("");
    setOfferMessage("");

    setEditingPlan(null);
    setShowPlanForm(false);
    setPlanError("");
  }

  function startEditPlan(plan: Plan) {
    setEditingPlan(plan);

    setPlanName(plan.name);
    setPlanType(plan.type);
    setPlanPrice(String(plan.price));
    setPlanDuration(String(plan.durationDays));
    setPlanDescription(plan.description || "");

    setOfferEnabled(Boolean(plan.offerEnabled));
    setDiscountPercent(
      plan.discountPercent == null
        ? ""
        : String(plan.discountPercent),
    );
    setOfferPrice(
      plan.offerPrice == null ? "" : String(plan.offerPrice),
    );
    setOfferStartsAt(toDateTimeLocal(plan.offerStartsAt));
    setOfferEndsAt(toDateTimeLocal(plan.offerEndsAt));
    setOfferMessage(plan.offerMessage || "");

    setPlanError("");
    setShowPlanForm(true);
  }

  async function savePlan() {
    setPlanError("");

    const price = Number(planPrice);
    const durationDays = Number(planDuration);

    if (!planName.trim()) {
      setPlanError("Plan name is required.");
      return;
    }

    if (!Number.isInteger(price) || price <= 0) {
      setPlanError("Price must be a positive integer.");
      return;
    }

    if (!Number.isInteger(durationDays) || durationDays <= 0) {
      setPlanError("Duration must be a positive integer.");
      return;
    }

    const discount =
      discountPercent.trim() === ""
        ? null
        : Number(discountPercent);

    const promotionalPrice =
      offerPrice.trim() === "" ? null : Number(offerPrice);

    if (
      discount !== null &&
      (!Number.isInteger(discount) ||
        discount < 1 ||
        discount > 99)
    ) {
      setPlanError("Discount must be between 1% and 99%.");
      return;
    }

    if (
      promotionalPrice !== null &&
      (!Number.isInteger(promotionalPrice) ||
        promotionalPrice <= 0)
    ) {
      setPlanError("Offer price must be a positive integer.");
      return;
    }

    if (
      promotionalPrice !== null &&
      promotionalPrice >= price
    ) {
      setPlanError(
        "Offer price must be lower than the original price.",
      );
      return;
    }

    if (
      offerEnabled &&
      promotionalPrice === null &&
      discount === null
    ) {
      setPlanError(
        "Add either an offer price or a discount percentage.",
      );
      return;
    }

    if (
      offerEnabled &&
      discount !== null &&
      promotionalPrice !== null
    ) {
      const calculatedPrice = Math.max(
        1,
        Math.round(price * (1 - discount / 100)),
      );

      if (promotionalPrice !== calculatedPrice) {
        setPlanError(
          `Offer price should be ₹${calculatedPrice.toLocaleString(
            "en-IN",
          )} for a ${discount}% discount, or remove one of the two values.`,
        );
        return;
      }
    }

    if (
      offerStartsAt &&
      offerEndsAt &&
      new Date(offerEndsAt).getTime() <
        new Date(offerStartsAt).getTime()
    ) {
      setPlanError(
        "Offer end date must be after the start date.",
      );
      return;
    }

    if (
      offerEnabled &&
      offerEndsAt &&
      new Date(offerEndsAt).getTime() < Date.now()
    ) {
      setPlanError(
        "Offer end date has already passed. Choose a future date.",
      );
      return;
    }

    setPlanBusyId(editingPlan?.id || "new");

    try {
      const response = await fetch(
        editingPlan
          ? `/api/home-tuition/plans/${editingPlan.id}`
          : "/api/home-tuition/plans",
        {
          method: editingPlan ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: planName.trim(),
            type: planType,
            price,
            durationDays,
            description: planDescription.trim(),

            offerEnabled,
            discountPercent: discount,
            offerPrice: promotionalPrice,
            offerStartsAt: offerStartsAt || null,
            offerEndsAt: offerEndsAt || null,
            offerMessage: offerMessage.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save plan.");
      }

      await loadPlans();
      resetPlanForm();
    } catch (err) {
      setPlanError(
        err instanceof Error
          ? err.message
          : "Unable to save plan.",
      );
    } finally {
      setPlanBusyId(null);
    }
  }

  async function deactivatePlan(plan: Plan) {
    if (
      !window.confirm(
        `Deactivate ${plan.name}? Tutors will no longer be able to purchase this plan.`,
      )
    ) {
      return;
    }

    setPlanBusyId(plan.id);
    setPlanError("");

    try {
      const response = await fetch(
        `/api/home-tuition/plans/${plan.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to deactivate plan.",
        );
      }

      await loadPlans();
    } catch (err) {
      setPlanError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate plan.",
      );
    } finally {
      setPlanBusyId(null);
    }
  }

  async function loadTutors() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/home-tuition/admin/tutors",
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load tutors.",
        );
      }

      setTutors(data.tutors || []);

      setCounts(
        data.counts || {
          total: 0,
          active: 0,
          draft: 0,
          paused: 0,
          suspended: 0,
          deleted: 0,
        },
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tutors.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTutors();
    loadPlans();
  }, []);

  const filteredTutors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tutors.filter((tutor) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        tutor.status === statusFilter;

      if (!matchesStatus) return false;

      if (!query) return true;

      return [
        tutor.displayName,
        tutor.user?.name,
        tutor.user?.email,
        tutor.institution,
        tutor.college,
        tutor.location,
        ...(tutor.subjects || []),
        ...(tutor.classes || []),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        );
    });
  }, [tutors, search, statusFilter]);

  async function changeStatus(
    tutor: Tutor,
    action: "SUSPEND" | "UNSUSPEND",
  ) {
    const isSuspending = action === "SUSPEND";

    if (
      isSuspending &&
      !window.confirm(
        `Suspend ${tutor.displayName}? The tutor will disappear from public Home Tuition listings.`,
      )
    ) {
      return;
    }

    if (
      !isSuspending &&
      !window.confirm(`Unsuspend ${tutor.displayName}?`)
    ) {
      return;
    }

    setBusyId(tutor.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/home-tuition/admin/tutors/${tutor.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ action }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update tutor.",
        );
      }

      const newTutor = tutors.find(
        (item) => item.id === tutor.id,
      );

      if (newTutor && data.tutor) {
        const updated = {
          ...newTutor,
          status: data.tutor.status,
          pausedAt: data.tutor.pausedAt,
          publishedAt: data.tutor.publishedAt,
        };

        setTutors((current) =>
          current.map((item) =>
            item.id === tutor.id ? updated : item,
          ),
        );

        setSelectedTutor((current) =>
          current?.id === tutor.id ? updated : current,
        );
      }

      setMessage(
        isSuspending
          ? `${tutor.displayName} has been suspended.`
          : `${tutor.displayName} has been unsuspended.`,
      );

      await loadTutors();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update tutor.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="text-sm font-bold text-slate-500 hover:text-slate-950"
          >
            ← Admin Dashboard
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/home-tuition"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white"
            >
              Tutor moderation
            </Link>

            <Link
              href="/admin/home-tuition/reports"
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-700"
            >
              Reports
            </Link>
          </div>
        </div>

        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-300">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Home Tuition Administration
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Tutor moderation
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Review tutor profiles and control their public
                availability. Suspension is recorded in the admin
                audit log.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadTutors();
                loadPlans();
              }}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15"
            >
              ↻ Refresh
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Total", counts.total],
              ["Active", counts.active],
              ["Draft", counts.draft],
              ["Paused", counts.paused],
              ["Suspended", counts.suspended],
              ["Deleted", counts.deleted],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>

                <p className="mt-1 text-2xl font-black">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {message}
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tutor, email, institution, subject..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "ALL"
                    | TutorStatus,
                )
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-400 focus:bg-white"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="PAUSED">Paused</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>
        </section>

        <section className="mt-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-3xl bg-white shadow-sm"
                />
              ))}
            </div>
          ) : filteredTutors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-black">
                No tutor profiles found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing the search or status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTutors.map((tutor) => {
                const latestSubscription =
                  tutor.subscriptions[0];

                const busy = busyId === tutor.id;

                return (
                  <article
                    key={tutor.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xl font-black">
                          {tutor.photoUrl ? (
                            <img
                              src={tutor.photoUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            tutor.displayName
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-lg font-black">
                              {tutor.displayName}
                            </h2>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass(
                                tutor.status,
                              )}`}
                            >
                              {tutor.status}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {tutor.user.email}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {tutor.subjects
                              .slice(0, 4)
                              .map((subject) => (
                                <span
                                  key={subject}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"
                                >
                                  {subject}
                                </span>
                              ))}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span>
                              {tutor.user.studentVerified
                                ? "Student verified"
                                : "Student not verified"}
                            </span>

                            <span>
                              {tutor._count.reviews} reviews
                            </span>

                            <span>
                              {tutor._count.reports} reports
                            </span>

                            <span>
                              {tutor._count.subscriptions}{" "}
                              subscriptions
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTutor(tutor)
                          }
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50"
                        >
                          View details
                        </button>

                        {tutor.status !== "DELETED" &&
                          tutor.status !== "SUSPENDED" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                changeStatus(
                                  tutor,
                                  "SUSPEND",
                                )
                              }
                              className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                            >
                              {busy
                                ? "Processing..."
                                : "Suspend tutor"}
                            </button>
                          )}

                        {tutor.status === "SUSPENDED" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              changeStatus(
                                tutor,
                                "UNSUSPEND",
                              )
                            }
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {busy
                              ? "Processing..."
                              : "Unsuspend tutor"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Fee
                        </p>

                        <p className="mt-1 text-sm font-black">
                          {money(tutor.hourlyFee)}/hr
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Mode
                        </p>

                        <p className="mt-1 text-sm font-black">
                          {tutor.teachingMode}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Profile created
                        </p>

                        <p className="mt-1 text-sm font-black">
                          {formatDate(tutor.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Latest subscription
                        </p>

                        <p className="mt-1 text-sm font-black">
                          {latestSubscription
                            ? latestSubscription.status
                            : "None"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-500">
                Subscription billing
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Tutor subscription plans
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Create and manage the plans available to Home
                Tuition tutors, including limited-time promotional
                pricing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetPlanForm();
                setShowPlanForm(true);
              }}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-indigo-700"
            >
              + New plan
            </button>
          </div>

          {planError && (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {planError}
            </div>
          )}

          {showPlanForm && (
            <div className="mt-6 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">
                  {editingPlan
                    ? "Edit subscription plan"
                    : "Create subscription plan"}
                </h3>

                <button
                  type="button"
                  onClick={resetPlanForm}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-white"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Plan name
                  </span>

                  <input
                    value={planName}
                    onChange={(event) =>
                      setPlanName(event.target.value)
                    }
                    placeholder="Monthly Tutor Plan"
                    maxLength={100}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Billing type
                  </span>

                  <select
                    value={planType}
                    onChange={(event) =>
                      setPlanType(
                        event.target.value as
                          | "MONTHLY"
                          | "YEARLY",
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400"
                  >
                    <option value="MONTHLY">
                      Monthly
                    </option>

                    <option value="YEARLY">
                      Yearly
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Price (₹)
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={planPrice}
                    onChange={(event) =>
                      setPlanPrice(event.target.value)
                    }
                    placeholder="999"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Duration (days)
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={planDuration}
                    onChange={(event) =>
                      setPlanDuration(event.target.value)
                    }
                    placeholder="30"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Description
                  </span>

                  <textarea
                    value={planDescription}
                    onChange={(event) =>
                      setPlanDescription(event.target.value)
                    }
                    maxLength={1000}
                    rows={3}
                    placeholder="Describe what this subscription provides."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <div className="sm:col-span-2 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-amber-950">
                        Promotional offer
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        Enable this to show promotional pricing
                        on the public Home Tuition plans page.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setOfferEnabled(
                          (current) => !current,
                        )
                      }
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        offerEnabled
                          ? "bg-amber-500"
                          : "bg-slate-300"
                      }`}
                      aria-label="Toggle promotional offer"
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                          offerEnabled
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {offerEnabled && (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Discount %
                        </span>

                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={discountPercent}
                          onChange={(event) =>
                            setDiscountPercent(
                              event.target.value,
                            )
                          }
                          placeholder="20"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        />

                        <p className="mt-1.5 text-[11px] text-slate-500">
                          Example: 20 means 20% off.
                        </p>
                      </label>

                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Offer price (₹)
                        </span>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={offerPrice}
                          onChange={(event) =>
                            setOfferPrice(
                              event.target.value,
                            )
                          }
                          placeholder="799"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        />

                        <p className="mt-1.5 text-[11px] text-slate-500">
                          Leave blank to calculate from the
                          discount percentage.
                        </p>
                      </label>

                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Starts
                        </span>

                        <input
                          type="datetime-local"
                          value={offerStartsAt}
                          onChange={(event) =>
                            setOfferStartsAt(
                              event.target.value,
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-amber-400"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Ends
                        </span>

                        <input
                          type="datetime-local"
                          value={offerEndsAt}
                          onChange={(event) =>
                            setOfferEndsAt(
                              event.target.value,
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-amber-400"
                        />
                      </label>

                      <label className="sm:col-span-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Offer message
                        </span>

                        <input
                          value={offerMessage}
                          onChange={(event) =>
                            setOfferMessage(
                              event.target.value,
                            )
                          }
                          maxLength={160}
                          placeholder="Limited-time launch offer"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-amber-400"
                        />
                      </label>

                      <div className="sm:col-span-2 rounded-2xl bg-white/80 p-4">
                        <p className="text-xs font-black text-slate-700">
                          Pricing behavior
                        </p>

                        <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                          <li>
                            • An explicit offer price is used when
                            provided.
                          </li>

                          <li>
                            • Otherwise the offer price is
                            calculated from the discount percentage.
                          </li>

                          <li>
                            • If both are entered, they must match
                            the calculated promotional price.
                          </li>

                          <li>
                            • The offer is only active within its
                            configured start/end dates.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={savePlan}
                  disabled={
                    planBusyId ===
                    (editingPlan?.id || "new")
                  }
                  className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {planBusyId ===
                  (editingPlan?.id || "new")
                    ? "Saving..."
                    : editingPlan
                      ? "Save changes"
                      : "Create plan"}
                </button>
              </div>
            </div>
          )}

          {plansLoading ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm font-medium text-slate-500">
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 p-8 text-center">
              <p className="font-black">
                No active subscription plans
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create the first plan for Home Tuition tutors.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {plans.map((plan) => {
                const currentOffer = offerIsCurrentlyActive(plan);

                return (
                  <article
                    key={plan.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black">
                            {plan.name}
                          </h3>

                          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-700">
                            {plan.type}
                          </span>

                          {plan.offerEnabled && (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${
                                currentOffer
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-slate-100 text-slate-500"
                              }`}
                            >
                              {currentOffer
                                ? "OFFER LIVE"
                                : "OFFER SCHEDULED"}
                            </span>
                          )}
                        </div>

                        {plan.offerEnabled &&
                        currentOffer &&
                        plan.offerPrice != null ? (
                          <div className="mt-3 flex flex-wrap items-end gap-2">
                            <span className="text-2xl font-black text-emerald-700">
                              {money(plan.offerPrice)}
                            </span>

                            <span className="pb-0.5 text-sm font-bold text-slate-400 line-through">
                              {money(plan.price)}
                            </span>

                            {plan.discountPercent != null && (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
                                {plan.discountPercent}% OFF
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-2xl font-black">
                            {money(plan.price)}
                          </p>
                        )}

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {plan.durationDays} days
                        </p>

                        {plan.description && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {plan.description}
                          </p>
                        )}

                        {plan.offerEnabled && (
                          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black text-white">
                                PROMOTION
                              </span>

                              {plan.discountPercent !=
                                null && (
                                <span className="text-xs font-black text-amber-900">
                                  {plan.discountPercent}% off
                                </span>
                              )}

                              {plan.offerPrice != null && (
                                <span className="text-xs font-black text-amber-900">
                                  {money(plan.offerPrice)}
                                </span>
                              )}
                            </div>

                            {plan.offerMessage && (
                              <p className="mt-2 text-xs font-semibold leading-5 text-amber-800">
                                {plan.offerMessage}
                              </p>
                            )}

                            <div className="mt-2 space-y-1 text-[11px] text-amber-700">
                              {plan.offerStartsAt && (
                                <p>
                                  Starts:{" "}
                                  {formatDateTime(
                                    plan.offerStartsAt,
                                  )}
                                </p>
                              )}

                              {plan.offerEndsAt && (
                                <p>
                                  Ends:{" "}
                                  {formatDateTime(
                                    plan.offerEndsAt,
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            startEditPlan(plan)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            planBusyId === plan.id
                          }
                          onClick={() =>
                            deactivatePlan(plan)
                          }
                          className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >
                          {planBusyId === plan.id
                            ? "..."
                            : "Deactivate"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {selectedTutor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  Tutor profile
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {selectedTutor.displayName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTutor(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Account
                </p>

                <p className="mt-1 text-sm font-black">
                  {selectedTutor.user.email}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${statusClass(
                    selectedTutor.status,
                  )}`}
                >
                  {selectedTutor.status}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Institution
                </p>

                <p className="mt-1 text-sm font-black">
                  {selectedTutor.institution ||
                    selectedTutor.college ||
                    "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-black">
                  {selectedTutor.location || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Student verification
                </p>

                <p className="mt-1 text-sm font-black">
                  {
                    selectedTutor.user
                      .studentVerificationStatus
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phone consent
                </p>

                <p className="mt-1 text-sm font-black">
                  {selectedTutor.phoneVisibilityConfirmed
                    ? "Confirmed"
                    : "Not confirmed"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Compliance
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">
                    Terms
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {selectedTutor.termsVersion ||
                      "Not accepted"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Safety
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {selectedTutor.safetyVersion ||
                      "Not accepted"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Published
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {formatDate(
                      selectedTutor.publishedAt,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {formatDate(selectedTutor.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Subscriptions
              </p>

              {selectedTutor.subscriptions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No subscription records.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {selectedTutor.subscriptions.map(
                    (subscription) => (
                      <div
                        key={subscription.id}
                        className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-black">
                            {
                              subscription.purchasedPlanType
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            {money(
                              subscription.purchasedPrice,
                            )}{" "}
                            ·{" "}
                            {subscription.durationDays}{" "}
                            days
                          </p>
                        </div>

                        <span className="text-xs font-black text-slate-600">
                          {subscription.status}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {selectedTutor.status !== "DELETED" &&
                selectedTutor.status !== "SUSPENDED" && (
                  <button
                    type="button"
                    disabled={
                      busyId === selectedTutor.id
                    }
                    onClick={() =>
                      changeStatus(
                        selectedTutor,
                        "SUSPEND",
                      )
                    }
                    className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    Suspend tutor
                  </button>
                )}

              {selectedTutor.status === "SUSPENDED" && (
                <button
                  type="button"
                  disabled={
                    busyId === selectedTutor.id
                  }
                  onClick={() =>
                    changeStatus(
                      selectedTutor,
                      "UNSUSPEND",
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Unsuspend tutor
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedTutor(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}