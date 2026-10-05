"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Announcement = {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  style: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageUrl: string;
  style: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: FormState = {
  eyebrow: "",
  title: "",
  description: "",
  ctaText: "",
  ctaHref: "",
  imageUrl: "",
  style: "AURORA",
  isActive: false,
  startsAt: "",
  endsAt: "",
};

const styles = [
  {
    value: "AURORA",
    label: "Aurora",
    description: "Premium indigo/violet",
  },
  {
    value: "MIDNIGHT",
    label: "Midnight",
    description: "Dark and cinematic",
  },
  {
    value: "SUNSET",
    label: "Sunset",
    description: "Warm gradient",
  },
  {
    value: "MINIMAL",
    label: "Minimal",
    description: "Clean white",
  },
];

function formatDate(value: string | null) {
  if (!value) return "No schedule";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function getStatus(announcement: Announcement) {
  const now = new Date();

  if (!announcement.isActive) {
    return {
      label: "Disabled",
      className: "bg-slate-100 text-slate-600",
    };
  }

  if (announcement.startsAt && new Date(announcement.startsAt) > now) {
    return {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (announcement.endsAt && new Date(announcement.endsAt) < now) {
    return {
      label: "Expired",
      className: "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Live",
    className: "bg-green-100 text-green-700",
  };
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAnnouncements() {
    try {
      setError("");

      const response = await fetch("/api/admin/announcements", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load announcements");
      }

      setAnnouncements(data.announcements ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load announcements",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editAnnouncement(announcement: Announcement) {
    setError("");
    setSuccess("");

    setEditingId(announcement.id);

    setForm({
      eyebrow: announcement.eyebrow ?? "",
      title: announcement.title,
      description: announcement.description ?? "",
      ctaText: announcement.ctaText ?? "",
      ctaHref: announcement.ctaHref ?? "",
      imageUrl: announcement.imageUrl ?? "",
      style: announcement.style,
      isActive: announcement.isActive,
      startsAt: toDateTimeLocal(announcement.startsAt),
      endsAt: toDateTimeLocal(announcement.endsAt),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/announcements/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image upload failed");
      }

      updateForm("imageUrl", data.url);
      setSuccess("Announcement image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        eyebrow: form.eyebrow || null,
        title: form.title,
        description: form.description || null,
        ctaText: form.ctaText || null,
        ctaHref: form.ctaHref || null,
        imageUrl: form.imageUrl || null,
        style: form.style,
        isActive: form.isActive,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };

      const response = await fetch(
        editingId
          ? `/api/admin/announcements/${editingId}`
          : "/api/admin/announcements",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save announcement");
      }

      setSuccess(
        editingId
          ? "Announcement updated successfully."
          : "Announcement created successfully.",
      );

      resetForm();
      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save announcement",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAnnouncement(announcement: Announcement) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/announcements/${announcement.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !announcement.isActive,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update announcement");
      }

      setSuccess(
        announcement.isActive
          ? "Announcement disabled."
          : "Announcement enabled.",
      );

      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update announcement",
      );
    }
  }

  async function deleteAnnouncement(announcement: Announcement) {
    const confirmed = window.confirm(
      `Delete "${announcement.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(announcement.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/announcements/${announcement.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete announcement");
      }

      if (editingId === announcement.id) {
        resetForm();
      }

      setSuccess("Announcement deleted.");
      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete announcement",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-300">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Axyon Control Center
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Announcements
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Create and control promotional announcements displayed on the
                Axyon home page.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
            >
              + New announcement
            </button>
          </div>
        </div>

        {(error || success) && (
          <div
            className={[
              "mt-5 rounded-2xl border px-4 py-3 text-sm font-bold",
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700",
            ].join(" ")}
          >
            {error || success}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">
                  {editingId ? "Edit announcement" : "Create announcement"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This announcement can appear on the public Axyon home page.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-black text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={saveAnnouncement} className="mt-6 space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Eyebrow
                </label>

                <input
                  value={form.eyebrow}
                  onChange={(event) =>
                    updateForm("eyebrow", event.target.value)
                  }
                  placeholder="Axyon Update"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Title
                </label>

                <input
                  required
                  maxLength={160}
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Something important for students"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Explain the announcement in a short, clear message."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    CTA text
                  </label>

                  <input
                    value={form.ctaText}
                    onChange={(event) =>
                      updateForm("ctaText", event.target.value)
                    }
                    placeholder="Explore now"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    CTA destination
                  </label>

                  <input
                    value={form.ctaHref}
                    onChange={(event) =>
                      updateForm("ctaHref", event.target.value)
                    }
                    placeholder="/home-tuition"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Style
                </label>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {styles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => updateForm("style", style.value)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        form.style === style.value
                          ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                          : "border-slate-200 bg-white hover:border-slate-300",
                      ].join(" ")}
                    >
                      <p className="text-sm font-black">{style.label}</p>

                      <p
                        className={[
                          "mt-1 text-xs",
                          form.style === style.value
                            ? "text-slate-300"
                            : "text-slate-500",
                        ].join(" ")}
                      >
                        {style.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Announcement image
                </label>

                <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                    disabled={uploading}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-slate-800"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    JPG, PNG, WEBP and other image formats up to 8MB.
                  </p>

                  {uploading && (
                    <p className="mt-3 text-xs font-bold text-slate-600">
                      Uploading image...
                    </p>
                  )}

                  {form.imageUrl && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img
                        src={form.imageUrl}
                        alt="Announcement preview"
                        className="max-h-64 w-full object-cover"
                      />

                      <div className="flex items-center justify-between gap-3 p-3">
                        <p className="truncate text-xs text-slate-500">
                          Image uploaded
                        </p>

                        <button
                          type="button"
                          onClick={() => updateForm("imageUrl", "")}
                          className="shrink-0 text-xs font-black text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Start date & time
                  </label>

                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) =>
                      updateForm("startsAt", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty to start immediately.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    End date & time
                  </label>

                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(event) =>
                      updateForm("endsAt", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Leave empty for no expiry.
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-black">Enable announcement</p>

                  <p className="mt-1 text-xs text-slate-500">
                    The public page will only display enabled announcements
                    within their schedule.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateForm("isActive", event.target.checked)
                  }
                  className="h-5 w-5 rounded border-slate-300"
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create announcement"}
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-black">Live preview</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Preview of the announcement design.
                </p>
              </div>
              <div
                className={[
                  "mt-5 overflow-hidden rounded-[2rem] border shadow-xl",
                  form.style === "MIDNIGHT"
                    ? "border-slate-800 bg-slate-950 text-white"
                    : form.style === "SUNSET"
                      ? "border-rose-400/20 bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 text-white"
                      : form.style === "MINIMAL"
                        ? "border-slate-200 bg-white text-slate-950"
                        : "border-indigo-400/20 bg-gradient-to-br from-indigo-950 via-violet-900 to-slate-950 text-white",
                ].join(" ")}
              >
                <div className="p-6 sm:p-8">
                  {form.eyebrow && (
                    <p
                      className={[
                        "text-xs font-black uppercase tracking-[0.18em]",
                        form.style === "MINIMAL"
                          ? "text-slate-500"
                          : form.style === "SUNSET"
                            ? "text-orange-100"
                            : "text-violet-300",
                      ].join(" ")}
                    >
                      {form.eyebrow}
                    </p>
                  )}

                  <h3 className="mt-3 text-2xl font-black tracking-tight">
                    {form.title || "Your announcement title"}
                  </h3>

                  <p
                    className={[
                      "mt-3 text-sm leading-6",
                      form.style === "MINIMAL"
                        ? "text-slate-600"
                        : "text-white/75",
                    ].join(" ")}
                  >
                    {form.description ||
                      "Your announcement description will appear here."}
                  </p>

                  {form.ctaText && (
                    <div className="mt-5">
                      <span
                        className={[
                          "inline-flex rounded-full px-5 py-2.5 text-sm font-black",
                          form.style === "MINIMAL"
                            ? "bg-slate-950 text-white"
                            : "bg-white text-slate-950",
                        ].join(" ")}
                      >
                        {form.ctaText}
                        <span className="ml-2">→</span>
                      </span>
                    </div>
                  )}
                </div>

                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="h-52 w-full object-cover"
                  />
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Existing announcements</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage announcements already created.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                  {announcements.length}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-24 animate-pulse rounded-2xl bg-slate-100"
                      />
                    ))}
                  </>
                ) : announcements.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
                    <p className="text-sm font-black text-slate-700">
                      No announcements yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create your first announcement using the form.
                    </p>
                  </div>
                ) : (
                  announcements.map((announcement) => {
                    const status = getStatus(announcement);

                    return (
                      <div
                        key={announcement.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex gap-3">
                          {announcement.imageUrl ? (
                            <img
                              src={announcement.imageUrl}
                              alt=""
                              className="h-16 w-20 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                              📣
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-black text-slate-950">
                                {announcement.title}
                              </h3>

                              <span
                                className={[
                                  "rounded-full px-2.5 py-1 text-[10px] font-black",
                                  status.className,
                                ].join(" ")}
                              >
                                {status.label}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {announcement.style}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {announcement.startsAt
                                ? `Starts ${formatDate(announcement.startsAt)}`
                                : "Starts immediately"}
                            </p>

                            {announcement.endsAt && (
                              <p className="text-xs text-slate-400">
                                Ends {formatDate(announcement.endsAt)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => editAnnouncement(announcement)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleAnnouncement(announcement)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                          >
                            {announcement.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === announcement.id}
                            onClick={() => deleteAnnouncement(announcement)}
                            className="rounded-xl border border-red-100 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === announcement.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
