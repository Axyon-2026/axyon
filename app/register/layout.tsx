"use client";

import { useEffect, useState } from "react";

export default function CampusRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          const user = data.user;

          if (user?.marketplaceType === "SCHOOL") {
            window.location.replace(
              "/school-marketplace/home"
            );
            return;
          }

          if (user?.role === "ADMIN") {
            window.location.replace("/admin");
            return;
          }

          if (
            user?.marketplaceType === "CAMPUS"
          ) {
            window.location.replace(
              "/marketplace-home"
            );
            return;
          }
        }
      } catch {
        // Treat as logged out.
      }

      setAllowed(true);
      setChecking(false);
    }

    checkSession();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7faf9]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-500">
            Checking account...
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}