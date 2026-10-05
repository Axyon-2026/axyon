"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  marketplaceType: "SCHOOL" | "CAMPUS";
  schoolName?: string | null;
  schoolCity?: string | null;
  classLevel?: string | null;
  schoolVerified?: boolean;
  schoolVerificationStatus?: string;
  schoolStudentPhotoUrl?: string | null;
  profileImageUrl?: string | null;
};

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  imageUrls: string[];
  schoolName?: string | null;
  schoolCity?: string | null;
};

export default function SchoolHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadHome() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          window.location.replace("/school-marketplace/login");
          return;
        }

        const data = await response.json();
        const currentUser = data.user;

        if (currentUser?.marketplaceType === "CAMPUS") {
          window.location.replace("/marketplace-home");
          return;
        }

        if (currentUser?.marketplaceType !== "SCHOOL") {
          window.location.replace("/");
          return;
        }

        if (
          currentUser.schoolVerified !== true ||
          currentUser.schoolVerificationStatus !== "APPROVED"
        ) {
          window.location.replace("/school-marketplace");
          return;
        }

        setUser(currentUser);

        const productsResponse = await fetch(
          "/api/school/products",
          {
            cache: "no-store",
          }
        );

        if (productsResponse.ok) {
          const productData = await productsResponse.json();

          setProducts(
            Array.isArray(productData.products)
              ? productData.products.slice(0, 6)
              : []
          );
        }
      } catch {
        window.location.replace("/school-marketplace/login");
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      window.location.replace("/school-marketplace");
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="px-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1 shadow-xl ring-1 ring-slate-200">
            <img
              src="/icon.png"
              alt="Axyon"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mx-auto mt-5 h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-600" />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-500">
            Opening School Marketplace...
          </p>
        </div>
      </main>
    );
  }

  const profileImage =
    user.schoolStudentPhotoUrl ||
    user.profileImageUrl ||
    "";

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-2xl">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center gap-3">

            <a
              href="/school-marketplace/home"
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-[0_8px_24px_rgba(79,70,229,0.15)] ring-1 ring-slate-200">
                <img
                  src="/icon.png"
                  alt="Axyon"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-lg font-black tracking-tight">
                  Axyon
                </p>

                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  School Marketplace
                </p>
              </div>
            </a>

            {/* DESKTOP NAV */}
            <nav className="ml-auto hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 lg:flex">
              <HeaderLink
                href="/school-marketplace/home"
                active
              >
                Home
              </HeaderLink>

              <HeaderLink href="/school-marketplace/products">
                Marketplace
              </HeaderLink>

              <HeaderLink href="/school-marketplace/chat">
                Chat
              </HeaderLink>

              <HeaderLink href="/support">
                Support
              </HeaderLink>
            </nav>

            {/* ACTIONS */}
            <div className="ml-auto flex items-center gap-2 lg:ml-3">

              <a
                href="/notifications"
                aria-label="Notifications"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                🔔
              </a>

              <a
                href="/school-marketplace/sell"
                className="hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_8px_25px_rgba(79,70,229,0.2)] transition hover:-translate-y-0.5 hover:brightness-105 sm:block"
              >
                Sell Item
              </a>

              {/* PROFILE ICON ONLY */}
              <a
                href="/school-marketplace/profile"
                aria-label="Open profile"
                title="Profile"
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${user.name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </a>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:px-5 sm:text-sm"
              >
                {loggingOut ? "..." : "Logout"}
              </button>
            </div>
          </div>

          {/* MOBILE NAV */}
          <div className="flex gap-2 overflow-x-auto pb-3 pt-2 lg:hidden">
            <MobileNavLink
              href="/school-marketplace/home"
              active
            >
              Home
            </MobileNavLink>

            <MobileNavLink href="/school-marketplace/products">
              Marketplace
            </MobileNavLink>

            <MobileNavLink href="/school-marketplace/chat">
              Chat
            </MobileNavLink>

            <MobileNavLink href="/support">
              Support
            </MobileNavLink>

            <MobileNavLink href="/school-marketplace/sell">
              Sell
            </MobileNavLink>

            <MobileNavLink href="/school-marketplace/profile">
              Profile
            </MobileNavLink>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-[1500px] px-5 pb-14 pt-14 sm:px-8 lg:px-10 lg:pb-18 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Verified School Marketplace
              </div>

              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
                Hey, {user.name.split(" ")[0]}.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  Welcome back.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Discover useful things from students,
                sell what you no longer need, and
                connect through your verified school
                community.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/school-marketplace/products"
                  className="rounded-2xl bg-slate-950 px-8 py-4 text-center text-sm font-black text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Browse Marketplace
                </a>

                <a
                  href="/school-marketplace/sell"
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
                >
                  + Sell Something
                </a>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">

                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">
                      {user.name}
                    </p>

                    <p className="mt-1 text-xs font-bold text-indigo-600">
                      Verified School Student
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <ProfileInfo
                    icon="🏫"
                    label="School"
                    value={user.schoolName || "School"}
                  />

                  <ProfileInfo
                    icon="📍"
                    label="City"
                    value={user.schoolCity || "City"}
                  />

                  <ProfileInfo
                    icon="🎓"
                    label="Class"
                    value={
                      user.classLevel
                        ? `Class ${user.classLevel}`
                        : "Class"
                    }
                  />
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  <span>✓</span>
                  Your school account is verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <section className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-600">
          Your marketplace
        </p>

        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Everything you need
          </h2>

          <p className="text-sm text-slate-400">
            Your school marketplace, in one place.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            icon="🛍️"
            title="Marketplace"
            text="Discover products from verified students."
            href="/school-marketplace/products"
          />

          <ActionCard
            icon="📦"
            title="My Listings"
            text="Manage everything you are currently selling."
            href="/school-marketplace/my-listings"
          />

          <ActionCard
            icon="💬"
            title="My Chats"
            text="Continue conversations with other students."
            href="/school-marketplace/chat"
          />

          <ActionCard
            icon="🛡️"
            title="Support"
            text="Get help from the Axyon support team."
            href="/support"
          />
        </div>
      </section>

      {/* RECENT LISTINGS */}
      <section className="mx-auto max-w-[1500px] px-5 pb-14 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-600">
              Discover
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Recent listings
            </h2>
          </div>

          <a
            href="/school-marketplace/products"
            className="text-sm font-black text-indigo-600"
          >
            View all →
          </a>
        </div>

        {products.length === 0 ? (
          <div className="mt-7 rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
              🛍️
            </div>

            <h3 className="mt-5 text-lg font-black">
              No listings yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Be one of the first students to list
              something on your school marketplace.
            </p>

            <a
              href="/school-marketplace/sell"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white"
            >
              Create Listing
            </a>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/school-marketplace/products/${product.id}`}
                className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  {product.imageUrls?.[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      🛍️
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black text-slate-700 shadow-sm">
                    {product.condition}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="line-clamp-2 font-black leading-5">
                      {product.title}
                    </h3>

                    <span className="shrink-0 text-lg font-black text-indigo-600">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    {product.schoolName || ""}
                    {product.schoolCity
                      ? ` · ${product.schoolCity}`
                      : ""}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">
                      {product.category}
                    </span>

                    <span className="text-xs font-black text-indigo-600">
                      View →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-[1500px] px-5 pb-16 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-600">
                Built around trust
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                A better way to trade with students.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                Axyon keeps the school marketplace
                focused, verified and simple.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TrustItem
                icon="🛡️"
                title="Verified"
                text="School accounts are reviewed."
              />

              <TrustItem
                icon="✨"
                title="Simple"
                text="Everything in one place."
              />

              <TrustItem
                icon="💬"
                title="Connected"
                text="Chat directly with students."
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-xs font-medium text-slate-400">
        Axyon School Marketplace · Safe · Verified · Student-focused
      </footer>
    </main>
  );
}

function HeaderLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${
        active
          ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
          : "text-slate-500 hover:bg-white hover:text-indigo-600"
      }`}
    >
      {children}
    </a>
  );
}

function MobileNavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black ${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white text-slate-500"
      }`}
    >
      {children}
    </a>
  );
}

function ProfileInfo({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-black text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  text,
  href,
}: {
  icon: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
        {icon}
      </div>

      <h3 className="mt-5 font-black">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>

      <p className="mt-5 text-xs font-black text-indigo-600">
        Open →
      </p>
    </a>
  );
}

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-black">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}