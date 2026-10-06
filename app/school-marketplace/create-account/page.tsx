"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateImage(file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.type)) {
    return "Only JPG, PNG or WEBP images are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Each image must be 5MB or smaller.";
  }

  return "";
}

export default function SchoolCreateAccountPage() {
  const [checking, setChecking] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolCity, setSchoolCity] = useState("");
  const [classLevel, setClassLevel] = useState("");

  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);

  const [schoolId, setSchoolId] = useState<File | null>(null);

  const [studentPhotoPreview, setStudentPhotoPreview] = useState("");

  const [schoolIdPreview, setSchoolIdPreview] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;

          if (user?.marketplaceType === "CAMPUS") {
            window.location.replace("/marketplace-home");
            return;
          }

          if (user?.marketplaceType === "SCHOOL") {
            if (
              user.schoolVerified === true &&
              user.schoolVerificationStatus === "APPROVED"
            ) {
              window.location.replace("/school-marketplace/home");
              return;
            }

            if (
              user.schoolVerificationStatus === "PENDING" ||
              user.schoolVerificationStatus === "REJECTED"
            ) {
              window.location.replace("/school-marketplace");
              return;
            }
          }
        }
      } catch {
        // Treat as logged out.
      }

      setChecking(false);
    }

    checkExistingSession();
  }, []);

  function handleStudentPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const validation = validateImage(file);

    if (validation) {
      setError(validation);
      return;
    }

    setError("");
    setStudentPhoto(file);
    setStudentPhotoPreview(URL.createObjectURL(file));
  }

  function handleSchoolId(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const validation = validateImage(file);

    if (validation) {
      setError(validation);
      return;
    }

    setError("");
    setSchoolId(file);
    setSchoolIdPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!studentPhoto) {
      setError("Please upload your student photo.");
      return;
    }

    if (!schoolId) {
      setError("Please upload your School ID.");
      return;
    }

    if (!classLevel) {
      setError("Please select your class.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("schoolName", schoolName.trim());
      formData.append("schoolCity", schoolCity.trim());
      formData.append("classLevel", classLevel);
      formData.append("studentPhoto", studentPhoto);
      formData.append("schoolId", schoolId);

      const response = await fetch("/api/school/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || 
          data.error || 
          "Unable to create your School account.",
        );
        return;
      }

      setSuccess(
        "School account created successfully. Your verification is now under review by Axyon.",
      );

      setPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <p className="text-sm font-bold text-slate-500">Checking account...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-5 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-2xl">
        <a
          href="/school-marketplace"
          className="text-sm font-bold text-slate-500"
        >
          ← School Marketplace
        </a>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mt-7">
            <div className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-black text-indigo-300">
              School Marketplace
            </div>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              Create your School Account
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              One-time verification. Once approved, your account unlocks the
              complete School Marketplace.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-200">
              {success}

              <a
                href="/school-marketplace/login"
                className="mt-4 block rounded-xl bg-emerald-500/10 px-4 py-3 text-center font-black text-emerald-300"
              >
                Go to School Login →
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Your full name"
              />

              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />
            </div>

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Create a strong password"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="School Name"
                value={schoolName}
                onChange={setSchoolName}
                placeholder="Your school"
              />

              <Field
                label="City"
                value={schoolCity}
                onChange={setSchoolCity}
                placeholder="School city"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                Class
              </label>

              <select
                value={classLevel}
                onChange={(event) => setClassLevel(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-[#0b111d] px-4 py-4 text-sm text-white outline-none focus:border-indigo-400/50"
              >
                <option value="">Select your class</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>

            <UploadBox
              title="Student Photo"
              description="Upload a clear photo of yourself."
              preview={studentPhotoPreview}
              inputId="student-photo"
              onChange={handleStudentPhoto}
            />

            <UploadBox
              title="School ID"
              description="Upload your valid School ID card."
              preview={schoolIdPreview}
              inputId="school-id"
              onChange={handleSchoolId}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create School Account"}
            </button>
          </form>

          <div className="mt-7 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-slate-600">
              Already have a School account?
            </p>

            <a
              href="/school-marketplace/login"
              className="mt-2 inline-block text-sm font-black text-indigo-400"
            >
              School Login →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm outline-none placeholder:text-slate-700 focus:border-indigo-400/50"
      />
    </div>
  );
}

function UploadBox({
  title,
  description,
  preview,
  inputId,
  onChange,
}: {
  title: string;
  description: string;
  preview: string;
  inputId: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
        {title}
      </label>

      <label
        htmlFor={inputId}
        className="block cursor-pointer rounded-2xl border border-dashed border-white/15 bg-black/10 p-5 transition hover:border-indigo-400/40"
      >
        {preview ? (
          <div className="overflow-hidden rounded-xl">
            <img
              src={preview}
              alt={title}
              className="max-h-64 w-full object-contain"
            />
          </div>
        ) : (
          <div className="py-7 text-center">
            <div className="text-3xl">📷</div>

            <p className="mt-3 text-sm font-black">{title}</p>

            <p className="mt-1 text-xs text-slate-600">{description}</p>

            <p className="mt-3 text-[10px] font-bold text-slate-700">
              JPG · PNG · WEBP · MAX 5MB
            </p>
          </div>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
