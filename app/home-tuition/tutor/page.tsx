"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Profile = {
  id?: string;
  displayName: string;
  photoUrl: string;
  institution: string;
  college: string;
  bio: string;
  subjects: string[];
  classes: string[];
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  location: string;
  maxTravelDistance: string;
  availability: string;
  languages: string[];
  hourlyFee: string;
  demoAvailable: boolean;
  demoDetails: string;
  publicPhone: string;
  phoneVisibilityConfirmed: boolean;
  termsAcceptedAt: string | null;
  termsVersion: string | null;
  safetyAcceptedAt: string | null;
  safetyVersion: string | null;
};

const SUBJECTS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "Social Science",
];

const CLASSES = ["9", "10", "11", "12"];

const LANGUAGES = [
  "English",
  "Hindi",
  "Hinglish",
  "Punjabi",
  "Bengali",
  "Marathi",
];

const EMPTY_PROFILE: Profile = {
  displayName: "",
  photoUrl: "",
  institution: "",
  college: "",
  bio: "",
  subjects: [],
  classes: [],
  teachingMode: "BOTH",
  location: "",
  maxTravelDistance: "",
  availability: "",
  languages: [],
  hourlyFee: "",
  demoAvailable: false,
  demoDetails: "",
  publicPhone: "",
  phoneVisibilityConfirmed: false,
  termsAcceptedAt: null,
  termsVersion: null,
  safetyAcceptedAt: null,
  safetyVersion: null,
};

export default function TutorOnboardingPage() {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        const response = await fetch("/api/home-tuition/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/login?next=/home-tuition/tutor";
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Unable to load tutor profile.");
        }

        if (data.profile) {
          setProfile({
            ...EMPTY_PROFILE,
            ...data.profile,
            maxTravelDistance:
              data.profile.maxTravelDistance == null
                ? ""
                : String(data.profile.maxTravelDistance),
            hourlyFee:
              data.profile.hourlyFee == null
                ? ""
                : String(data.profile.hourlyFee),
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your tutor profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const progress = useMemo(() => {
    return `${(step / 4) * 100}%`;
  }, [step]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
    setError("");
  }

  function toggleArrayValue(
    key: "subjects" | "classes" | "languages",
    value: string,
  ) {
    setProfile((current) => {
      const currentValues = current[key];

      return {
        ...current,
        [key]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  }

  function validateStep() {
    if (step === 1) {
      if (!profile.displayName.trim()) {
        setError("Enter the name you want students to see.");
        return false;
      }

      if (!profile.bio.trim() || profile.bio.trim().length < 30) {
        setError(
          "Write at least 30 characters about your teaching experience.",
        );
        return false;
      }

      if (!profile.college.trim()) {
        setError("Add your college or institution.");
        return false;
      }
    }

    if (step === 2) {
      if (profile.subjects.length === 0) {
        setError("Select at least one subject.");
        return false;
      }

      if (profile.classes.length === 0) {
        setError("Select at least one class.");
        return false;
      }

      if (!profile.availability.trim()) {
        setError("Add your teaching availability.");
        return false;
      }
    }

    if (step === 3) {
      const fee = Number(profile.hourlyFee);

      if (!Number.isFinite(fee) || fee <= 0) {
        setError("Enter a valid hourly fee.");
        return false;
      }

      if (!profile.publicPhone.trim()) {
        setError("Add a contact number for students.");
        return false;
      }

      if (!profile.phoneVisibilityConfirmed) {
        setError(
          "Confirm that your contact number may be shared privately with students.",
        );
        return false;
      }
    }

    if (step === 4) {
      if (!profile.termsAcceptedAt || profile.termsVersion !== "1.0") {
        setError("Accept the current Home Tuition Terms.");
        return false;
      }

      if (!profile.safetyAcceptedAt || profile.safetyVersion !== "1.0") {
        setError("Accept the current Home Tuition Safety requirements.");
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateStep()) return;

    setError("");
    setStep((current) => Math.min(4, current + 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(1, current - 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadPhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be 5 MB or smaller.");
      return;
    }

    try {
      setPhotoUploading(true);
      setPhotoError("");
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/home-tuition/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to upload photo.");
      }

      update("photoUrl", data.url);
      setMessage("Profile photo uploaded successfully.");
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Unable to upload photo.",
      );
    } finally {
      setPhotoUploading(false);
    }
  }

  async function saveProfile() {
    if (!validateStep()) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...profile,
        maxTravelDistance: profile.maxTravelDistance
          ? Number(profile.maxTravelDistance)
          : null,
        hourlyFee: Number(profile.hourlyFee),
        termsAccepted: true,
        safetyAccepted: true,
      };

      const response = await fetch("/api/home-tuition/profile", {
        method: profile.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save tutor profile.");
      }

      if (data.profile) {
        setProfile((current) => ({
          ...current,
          ...data.profile,
          maxTravelDistance:
            data.profile.maxTravelDistance == null
              ? current.maxTravelDistance
              : String(data.profile.maxTravelDistance),
          hourlyFee:
            data.profile.hourlyFee == null
              ? current.hourlyFee
              : String(data.profile.hourlyFee),
        }));
      }

      setMessage("Tutor profile saved successfully.");

      setTimeout(() => {
        router.push("/home-tuition/tutor/subscription");
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save tutor profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProfile() {
    if (!profile.id) return;

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      const subscriptionsResponse = await fetch(
        "/api/home-tuition/subscriptions",
        {
          cache: "no-store",
        },
      );

      const subscriptionsData = await subscriptionsResponse.json();

      if (!subscriptionsResponse.ok) {
        throw new Error(
          subscriptionsData.error ||
            "Unable to check your subscription status.",
        );
      }

      const activeSubscription = subscriptionsData.subscriptions?.find(
        (subscription: { status: string; expiresAt: string | null }) =>
          subscription.status === "ACTIVE" &&
          subscription.expiresAt &&
          new Date(subscription.expiresAt).getTime() > Date.now(),
      );

      const confirmed = activeSubscription
        ? window.confirm(
            `Your subscription is still active and expires on ${new Date(
              activeSubscription.expiresAt,
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}.\n\nDeleting your tutor profile will remove it from the public directory, but your subscription and payment records will remain intact. Your subscription will not be automatically refunded.\n\nIf you only want to temporarily hide your profile, use "Pause Profile" instead.\n\nDelete your profile anyway?`,
          )
        : window.confirm(
            "Remove your tutor profile from the public directory?\n\nYour profile will be soft-deleted and your subscription/payment history will remain preserved.",
          );

      if (!confirmed) {
        setDeleting(false);
        return;
      }

      const response = await fetch(`/api/home-tuition/profile/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "DELETE",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to remove tutor profile.");
      }

      setMessage(
        "Your tutor profile has been removed from the public directory.",
      );

      setProfile((current) => ({
        ...current,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove tutor profile.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="h-8 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 h-[650px] animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/home-tuition"
            className="flex items-center gap-2 text-lg font-black"
          >
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <span>Axyon</span>
          </Link>

          <Link
            href="/home-tuition"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            Exit
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="text-sm font-bold text-indigo-600">Become a tutor</p>

          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
            Build your tutor profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Tell students what you teach, when you are available and how you
            prefer to teach.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 gap-2">
              {["Profile", "Teaching", "Contact", "Safety"].map(
                (label, index) => {
                  const itemStep = index + 1;
                  const active = step >= itemStep;

                  return (
                    <div
                      key={label}
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (itemStep < step) {
                            setStep(itemStep);
                          }
                        }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {itemStep}
                      </button>

                      <span
                        className={`hidden truncate text-xs font-bold sm:block ${
                          active ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                },
              )}
            </div>

            <span className="text-xs font-bold text-slate-400">{step}/4</span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: progress }}
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-8">
            {step === 1 && (
              <div>
                <StepHeading
                  eyebrow="Step 1"
                  title="Introduce yourself"
                  description="Create a profile that gives students a clear first impression."
                />

                <div className="mt-8 grid gap-5">
                  <Field
                    label="Display name"
                    required
                    value={profile.displayName}
                    onChange={(value) => update("displayName", value)}
                    placeholder="e.g. Ankit Pandey"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="College / institution"
                      value={profile.college}
                      onChange={(value) => update("college", value)}
                      placeholder="e.g. University name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Profile photo</label>

                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-black text-slate-400">
                        {profile.photoUrl ? (
                          <img
                            src={profile.photoUrl}
                            alt="Tutor profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          profile.displayName?.charAt(0)?.toUpperCase() || "A"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <label className="inline-flex cursor-pointer items-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-600">
                          {photoUploading ? "Uploading..." : "Upload photo"}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={photoUploading}
                            onChange={(event) => {
                              const file = event.target.files?.[0];

                              if (file) {
                                void uploadPhoto(file);
                              }

                              event.currentTarget.value = "";
                            }}
                            className="hidden"
                          />
                        </label>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          JPG, PNG or WebP. Maximum 5 MB. Use a clear, recent
                          photo.
                        </p>

                        {photoError && (
                          <p className="mt-2 text-xs font-semibold text-red-600">
                            {photoError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold">
                      About you <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      value={profile.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={6}
                      maxLength={1500}
                      placeholder="Describe your academic background, teaching experience and the kind of students you enjoy helping..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {profile.bio.length}/1500
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepHeading
                  eyebrow="Step 2"
                  title="Set your teaching preferences"
                  description="Choose exactly what you want to teach and how students can learn from you."
                />

                <div className="mt-8 space-y-7">
                  <ChoiceGroup
                    label="Subjects"
                    required
                    values={SUBJECTS}
                    selected={profile.subjects}
                    onToggle={(value) => toggleArrayValue("subjects", value)}
                  />

                  <ChoiceGroup
                    label="Classes"
                    required
                    values={CLASSES}
                    selected={profile.classes}
                    onToggle={(value) => toggleArrayValue("classes", value)}
                    prefix="Class "
                  />

                  <div>
                    <label className="text-sm font-bold">Teaching mode</label>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {[
                        ["ONLINE", "Online", "Teach remotely"],
                        ["OFFLINE", "Offline", "Meet students locally"],
                        ["BOTH", "Both", "Offer both options"],
                      ].map(([value, title, description]) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() =>
                            update(
                              "teachingMode",
                              value as Profile["teachingMode"],
                            )
                          }
                          className={`rounded-2xl border p-4 text-left transition ${
                            profile.teachingMode === value
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <p className="font-bold">{title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Teaching location"
                      value={profile.location}
                      onChange={(value) => update("location", value)}
                      placeholder="e.g. Gurugram"
                    />

                    <Field
                      label="Maximum travel distance"
                      value={profile.maxTravelDistance}
                      onChange={(value) =>
                        update("maxTravelDistance", value.replace(/\D/g, ""))
                      }
                      placeholder="e.g. 5 km"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">
                      Availability <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      value={profile.availability}
                      onChange={(e) => update("availability", e.target.value)}
                      rows={4}
                      placeholder="e.g. Weekdays 5–8 PM, Saturday and Sunday mornings"
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <ChoiceGroup
                    label="Languages"
                    values={LANGUAGES}
                    selected={profile.languages}
                    onToggle={(value) => toggleArrayValue("languages", value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepHeading
                  eyebrow="Step 3"
                  title="Set your fee and contact details"
                  description="Your number stays private and is only used through the approved contact flow."
                />

                <div className="mt-8 space-y-6">
                  <div className="rounded-2xl bg-slate-950 p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Your hourly fee
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-3xl font-black">₹</span>

                      <input
                        value={profile.hourlyFee}
                        onChange={(e) =>
                          update("hourlyFee", e.target.value.replace(/\D/g, ""))
                        }
                        inputMode="numeric"
                        placeholder="500"
                        className="w-full max-w-xs border-b border-white/20 bg-transparent px-1 py-1 text-3xl font-black outline-none placeholder:text-slate-600 focus:border-indigo-400"
                      />

                      <span className="text-sm font-semibold text-slate-400">
                        / hour
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Students will see your hourly fee on your public tutor
                      profile.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold">
                      Contact number <span className="text-red-500">*</span>
                    </label>

                    <input
                      value={profile.publicPhone}
                      onChange={(e) => update("publicPhone", e.target.value)}
                      inputMode="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />

                    <div className="mt-3 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                      <span className="mt-0.5">🔒</span>

                      <p className="text-xs leading-5 text-amber-900">
                        Your phone number will not be displayed as text.
                        Students can use Call or WhatsApp buttons when your
                        profile is active.
                      </p>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={profile.phoneVisibilityConfirmed}
                      onChange={(e) =>
                        update("phoneVisibilityConfirmed", e.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-indigo-600"
                    />

                    <span>
                      <span className="block text-sm font-bold">
                        Allow private contact access
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        I understand that verified students may use the
                        protected Call / WhatsApp contact actions while my tutor
                        profile is active.
                      </span>
                    </span>
                  </label>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">Demo session</p>

                        <p className="mt-1 text-xs text-slate-500">
                          Let students know if you offer a demo.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          update("demoAvailable", !profile.demoAvailable)
                        }
                        className={`relative h-7 w-12 rounded-full transition ${
                          profile.demoAvailable
                            ? "bg-indigo-600"
                            : "bg-slate-300"
                        }`}
                        aria-label="Toggle demo availability"
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                            profile.demoAvailable ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {profile.demoAvailable && (
                      <textarea
                        value={profile.demoDetails}
                        onChange={(e) => update("demoDetails", e.target.value)}
                        rows={3}
                        placeholder="Explain your demo session..."
                        className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <StepHeading
                  eyebrow="Step 4"
                  title="Safety and publishing"
                  description="Review the requirements before your profile can be published."
                />

                <div className="mt-8 space-y-4">
                  <AcceptanceCard
                    title="Home Tuition Terms"
                    description="I agree to the current Axyon Home Tuition Terms and understand that the information in my profile must remain accurate."
                    checked={
                      Boolean(profile.termsAcceptedAt) &&
                      profile.termsVersion === "1.0"
                    }
                    onChange={(checked) => {
                      if (checked) {
                        update("termsAcceptedAt", new Date().toISOString());
                        update("termsVersion", "1.0");
                      } else {
                        update("termsAcceptedAt", null);
                        update("termsVersion", null);
                      }
                    }}
                  />

                  <AcceptanceCard
                    title="Safety requirements"
                    description="I agree to follow Axyon's Home Tuition safety requirements and understand that unsafe or misleading activity may result in suspension."
                    checked={
                      Boolean(profile.safetyAcceptedAt) &&
                      profile.safetyVersion === "1.0"
                    }
                    onChange={(checked) => {
                      if (checked) {
                        update("safetyAcceptedAt", new Date().toISOString());
                        update("safetyVersion", "1.0");
                      } else {
                        update("safetyAcceptedAt", null);
                        update("safetyVersion", null);
                      }
                    }}
                  />

                  <div className="rounded-2xl bg-indigo-50 p-5">
                    <p className="font-bold text-indigo-950">
                      What happens next?
                    </p>

                    <div className="mt-4 space-y-3">
                      {[
                        "Save your tutor profile.",
                        "Choose a Home Tuition subscription plan.",
                        "Complete the Razorpay payment.",
                        "Your active profile becomes visible to students.",
                      ].map((item, index) => (
                        <div key={item} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                            {index + 1}
                          </span>

                          <p className="text-sm leading-6 text-indigo-900">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {profile.id && (
                  <button
                    type="button"
                    onClick={deleteProfile}
                    disabled={deleting || saving}
                    className="text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {deleting ? "Removing..." : "Remove tutor profile"}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={saving}
                    className="h-12 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="h-12 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-indigo-600"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving}
                    className="h-12 rounded-xl bg-indigo-600 px-7 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save tutor profile"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "tel";
}) {
  return (
    <div>
      <label className="text-sm font-bold">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function ChoiceGroup({
  label,
  required,
  values,
  selected,
  onToggle,
  prefix,
}: {
  label: string;
  required?: boolean;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  prefix?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => {
          const active = selected.includes(value);

          return (
            <button
              type="button"
              key={value}
              onClick={() => onToggle(value)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {prefix}
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AcceptanceCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
        checked
          ? "border-indigo-400 bg-indigo-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-indigo-600"
      />

      <span>
        <span className="block font-bold">{title}</span>

        <span className="mt-1 block text-sm leading-6 text-slate-500">
          {description}
        </span>
      </span>
    </label>
  );
}
