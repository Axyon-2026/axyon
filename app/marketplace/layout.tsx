"use client";

import { useEffect, useState } from "react";

export default function CampusMarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    async function checkMarketplace() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          // Anonymous users are allowed
          // to browse Campus Marketplace.
          setAllowed(true);
          return;
        }

        const data =
          await response.json();

        const user = data.user;

        if (
          user?.marketplaceType ===
          "SCHOOL"
        ) {
          window.location.replace(
            "/school-marketplace/home"
          );
          return;
        }

        // CAMPUS users can stay.
        // Unknown/anonymous users can browse.
        setAllowed(true);
      } catch {
        // If session lookup fails, preserve
        // public Campus browsing.
        setAllowed(true);
      } finally {
        setChecking(false);
      }
    }

    checkMarketplace();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-500">
            Opening Campus Marketplace...
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}