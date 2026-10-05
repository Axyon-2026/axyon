"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Announcement = {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  style: string;
};

function getStyle(style: string) {
  switch (style) {
    case "MIDNIGHT":
      return {
        card: "bg-slate-950 text-white border-slate-800",
        eyebrow: "text-cyan-300",
        description: "text-slate-300",
        button:
          "bg-white text-slate-950 hover:bg-slate-100",
        glow:
          "bg-cyan-500/20",
      };

    case "SUNSET":
      return {
        card:
          "bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 text-white border-white/10",
        eyebrow: "text-orange-100",
        description: "text-white/80",
        button:
          "bg-white text-rose-600 hover:bg-white/90",
        glow:
          "bg-yellow-300/20",
      };

    case "MINIMAL":
      return {
        card:
          "bg-white text-slate-950 border-slate-200 shadow-sm",
        eyebrow: "text-slate-500",
        description: "text-slate-600",
        button:
          "bg-slate-950 text-white hover:bg-slate-800",
        glow:
          "bg-slate-200/60",
      };

    case "AURORA":
    default:
      return {
        card:
          "bg-gradient-to-br from-indigo-950 via-violet-900 to-slate-950 text-white border-indigo-400/20",
        eyebrow: "text-violet-200",
        description: "text-white/75",
        button:
          "bg-white text-indigo-950 hover:bg-violet-50",
        glow:
          "bg-violet-400/20",
      };
  }
}

function isSafeHref(href: string | null) {
  if (!href) {
    return false;
  }

  return (
    href.startsWith("/") ||
    href.startsWith("https://") ||
    href.startsWith("http://")
  );
}

export default function SiteAnnouncement() {
  const pathname = usePathname();

  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname !== "/") {
      setAnnouncement(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAnnouncement() {
      try {
        const response = await fetch(
          "/api/announcements",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch announcement"
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setAnnouncement(
            data.announcement ?? null
          );
        }
      } catch {
        if (!cancelled) {
          setAnnouncement(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnnouncement();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname !== "/" || loading || !announcement) {
    return null;
  }

  const theme = getStyle(announcement.style);

  const hasImage = Boolean(announcement.imageUrl);
  const hasText =
    Boolean(announcement.eyebrow) ||
    Boolean(announcement.title) ||
    Boolean(announcement.description);

  const hasCta =
    Boolean(announcement.ctaText) &&
    isSafeHref(announcement.ctaHref);

  return (
    <section
      aria-label="Announcement"
      className="px-4 pt-5 sm:px-6 sm:pt-7"
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={[
            "relative overflow-hidden rounded-[2rem] border",
            "shadow-[0_24px_70px_rgba(15,23,42,0.16)]",
            theme.card,
          ].join(" ")}
        >
          <div
            className={[
              "pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl",
              theme.glow,
            ].join(" ")}
          />

          <div
            className={[
              "pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full blur-3xl",
              theme.glow,
            ].join(" ")}
          />

          <div
            className={[
              "relative grid",
              hasImage && hasText
                ? "lg:grid-cols-[1.05fr_0.95fr]"
                : "grid-cols-1",
            ].join(" ")}
          >
            {hasText && (
              <div
                className={[
                  "flex flex-col justify-center",
                  hasImage
                    ? "px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12"
                    : "px-7 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14",
                ].join(" ")}
              >
                {announcement.eyebrow && (
                  <div
                    className={[
                      "mb-3 text-xs font-bold uppercase tracking-[0.18em]",
                      theme.eyebrow,
                    ].join(" ")}
                  >
                    {announcement.eyebrow}
                  </div>
                )}

                <h2 className="max-w-3xl text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  {announcement.title}
                </h2>

                {announcement.description && (
                  <p
                    className={[
                      "mt-4 max-w-2xl text-sm leading-7 sm:text-base",
                      theme.description,
                    ].join(" ")}
                  >
                    {announcement.description}
                  </p>
                )}

                {hasCta && (
                  <div className="mt-6">
                    <a
                      href={announcement.ctaHref!}
                      className={[
                        "inline-flex items-center justify-center rounded-full px-5 py-3",
                        "text-sm font-bold shadow-lg transition",
                        "focus:outline-none focus:ring-2 focus:ring-white/60",
                        theme.button,
                      ].join(" ")}
                    >
                      {announcement.ctaText}

                      <span
                        aria-hidden="true"
                        className="ml-2 text-base"
                      >
                        →
                      </span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {hasImage && announcement.imageUrl && (
              <div
                className={[
                  "relative min-h-[230px] overflow-hidden",
                  hasText
                    ? "lg:min-h-[330px]"
                    : "min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]",
                ].join(" ")}
              >
                <img
                  src={announcement.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}