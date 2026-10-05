import Link from "next/link";
import { siteConfig } from "@/lib/site";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M18.244 2H21.5l-7.11 8.128L22.75 22h-6.58l-5.15-6.74L5.12 22H1.86l7.6-8.69L1.25 2h6.75l4.65 6.16L18.244 2Zm-1.15 17.86h1.8L7.02 4.03H5.09L17.094 19.86Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.55 12 3.55 12 3.55s-7.55 0-9.4.53A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.53 9.4.53 9.4.53s7.55 0 9.4-.53a3 3 0 0 0 2.1-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.55 15.6V8.4L15.75 12l-6.2 3.6Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">
                AX
              </div>

              <div>
                <p className="font-black">{siteConfig.brandName}</p>
                <p className="text-xs text-slate-400">
                  {siteConfig.companyName}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              A student-focused digital ecosystem connecting school and
              college communities through dedicated marketplaces and services,
              including Axyon Home Tuition.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Home Tuition
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Verified Campus tutors can publish tutoring profiles through
                applicable Axyon subscription plans. Students can discover
                available tutors and review their profiles.
              </p>

              <Link
                href="/home-tuition"
                className="mt-3 inline-flex text-sm font-bold text-white hover:text-indigo-300"
              >
                Explore Home Tuition →
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Company
            </h2>

            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              <Link className="transition hover:text-white" href="/about">
                About Us
              </Link>

              <Link className="transition hover:text-white" href="/contact">
                Contact Us
              </Link>

              <Link className="transition hover:text-white" href="/help">
                Help & FAQ
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Services
            </h2>

            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              <Link
                className="transition hover:text-white"
                href="/home-tuition"
              >
                Home Tuition
              </Link>

              <Link
                className="transition hover:text-white"
                href="/marketplace"
              >
                Campus Marketplace
              </Link>

              <Link
                className="transition hover:text-white"
                href="/school-marketplace"
              >
                School Marketplace
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Legal & Support
            </h2>

            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              <Link className="transition hover:text-white" href="/terms">
                Terms & Conditions
              </Link>

              <Link className="transition hover:text-white" href="/privacy">
                Privacy Policy
              </Link>

              <Link
                className="transition hover:text-white"
                href="/refund-policy"
              >
                Refund & Cancellation
              </Link>

              <Link className="transition hover:text-white" href="/contact">
                Payment Support
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Contact
            </p>

            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <a
                href={`mailto:${siteConfig.email}`}
                className="block transition hover:text-white"
              >
                {siteConfig.email}
              </a>

              <a
                href={`tel:${siteConfig.phone}`}
                className="block transition hover:text-white"
              >
                +91 {siteConfig.phone}
              </a>
            </div>
          </div>

          <div className="md:text-right">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Social
            </p>

            <div className="mt-3 flex items-center gap-3 md:justify-end">
              {siteConfig.social.instagram && (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Axyon on Instagram"
                  title="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:bg-white/10 hover:text-white"
                >
                  <InstagramIcon />
                </a>
              )}

              {siteConfig.social.x && (
                <a
                  href={siteConfig.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Axyon on X"
                  title="X"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:bg-white/10 hover:text-white"
                >
                  <XIcon />
                </a>
              )}

              {siteConfig.social.youtube && (
                <a
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Axyon on YouTube"
                  title="YouTube"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-1 hover:bg-white/10 hover:text-white"
                >
                  <YouTubeIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.companyName}. All rights
            reserved.
          </p>

          <p>Axyon · Built for student communities.</p>
        </div>
      </div>
    </footer>
  );
}