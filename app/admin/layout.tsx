"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: string;
  role?: string;
  name?: string | null;
  email?: string | null;
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();

        const currentUser = data?.user ?? data;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "ADMIN") {
          if (currentUser.marketplaceType === "SCHOOL") {
            router.replace("/school-marketplace/home");
          } else {
            router.replace("/marketplace-home");
          }
          return;
        }

        if (active) {
          setUser(currentUser);
          setChecking(false);
        }
      } catch {
        router.replace("/login");
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [router, pathname]);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p className="text-sm font-medium text-white">
            Verifying admin access
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait...
          </p>
        </div>
      </main>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {children}
    </div>
  );
}