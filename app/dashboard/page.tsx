"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("Loading dashboard...");
  const router = useRouter();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        const dashboardData = await res.json();

        if (!res.ok) {
          if (
            dashboardData.marketplaceType === "SCHOOL" ||
            dashboardData.user?.marketplaceType === "SCHOOL"
          ) {
            router.replace("/school-marketplace/home");
            return;
          }

          setMessage(
            dashboardData.message || "Failed to load dashboard"
          );
          return;
        }

        if (dashboardData.user?.role === "ADMIN") {
          router.replace("/admin");
          return;
        }

        if (dashboardData.user?.marketplaceType === "SCHOOL") {
          router.replace("/school-marketplace/home");
          return;
        }

        if (dashboardData.user?.marketplaceType !== "CAMPUS") {
          setMessage(
            "This dashboard is only available for Campus Marketplace accounts."
          );
          return;
        }

        setData(dashboardData);
        setMessage("");
      } catch {
        setMessage("Something went wrong");
      }
    }

    fetchDashboard();
  }, [router]);

  const activeListings = data?.activeListings?.length ?? 0;
  const purchases = data?.purchasedProducts?.length ?? 0;
  const soldListings = data?.soldListings?.length ?? 0;
  const accommodation = data?.availableRooms?.length ?? 0;
  const conversations = data?.conversations?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <Navbar />

      <section className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#0b1724] via-[#071019] to-[#06110e] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.2)] sm:p-7 lg:p-9">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/[0.06] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-400/[0.04] blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                      Campus Dashboard
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Welcome back
                    {data?.user?.name
                      ? `, ${data.user.name.split(" ")[0]}`
                      : ""}
                    .
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                    Manage your listings, purchases, accommodation and
                    conversations from one place.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="/create-product"
                    className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-[#03120b] transition hover:bg-emerald-400 active:scale-95 sm:px-5"
                  >
                    + Sell Product
                  </a>

                  <a
                    href="/create-room"
                    className="rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/[0.08] active:scale-95 sm:px-5"
                  >
                    + Accommodation
                  </a>

                  <a
                    href="/chat"
                    className="rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/[0.08] active:scale-95 sm:px-5"
                  >
                    💬 Chat
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* LOADING / ERROR */}
          {message && (
            <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#071019] px-5 py-4 text-sm text-slate-400">
              <span className="mr-2">•</span>
              {message}
            </div>
          )}

          {data && (
            <>
              {/* STATS */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  {
                    label: "Active Listings",
                    value: activeListings,
                    icon: "📦",
                    href: "/marketplace",
                  },
                  {
                    label: "Purchases",
                    value: purchases,
                    icon: "🛍️",
                    href: "/marketplace",
                  },
                  {
                    label: "Products Sold",
                    value: soldListings,
                    icon: "✓",
                    href: "/dashboard",
                  },
                  {
                    label: "Accommodation",
                    value: accommodation,
                    icon: "🏠",
                    href: "/rooms",
                  },
                  {
                    label: "Conversations",
                    value: conversations,
                    icon: "💬",
                    href: "/chat",
                  },
                ].map((stat) => (
                  <a
                    key={stat.label}
                    href={stat.href}
                    className="group rounded-2xl border border-white/[0.07] bg-[#071019] p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#0a1521] sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl">{stat.icon}</span>
                      <span className="text-slate-700 transition group-hover:text-slate-500">
                        ↗
                      </span>
                    </div>

                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                      {stat.value}
                    </p>
                  </a>
                ))}
              </div>

              {/* PROFILE + PRODUCTS */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* PROFILE */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#071019] p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400/70">
                        Account
                      </p>
                      <h2 className="mt-1 text-xl font-black">
                        Profile
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-xl">
                      👤
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
                        Name
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-200">
                        {data.user?.name || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
                        Email
                      </p>
                      <p className="mt-1 break-all text-sm font-bold text-slate-200">
                        {data.user?.email || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
                        College
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-200">
                        {data.user?.college || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-600">
                        Joined
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-200">
                        {data.user?.createdAt
                          ? new Date(
                              data.user.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#071019] p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] sm:p-6 lg:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400/70">
                        Marketplace
                      </p>
                      <h2 className="mt-1 text-xl font-black">
                        My Listed Products
                      </h2>
                    </div>

                    <a
                      href="/create-product"
                      className="shrink-0 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[10px] font-black text-slate-300 transition hover:bg-white/[0.07]"
                    >
                      + Add
                    </a>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {data.listedProducts?.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-10 text-center sm:col-span-2">
                        <div className="text-3xl">📦</div>
                        <p className="mt-3 text-sm font-bold text-slate-300">
                          No products listed yet
                        </p>
                        <a
                          href="/create-product"
                          className="mt-3 inline-block text-xs font-bold text-emerald-400 hover:text-emerald-300"
                        >
                          Create your first listing →
                        </a>
                      </div>
                    )}

                    {data.listedProducts?.map((product: any) => (
                      <div
                        key={product.id}
                        className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b1420]"
                      >
                        <div className="relative h-40 overflow-hidden bg-[#101a27] sm:h-44">
                          {product.imageUrls?.length > 0 ? (
                            <img
                              src={product.imageUrls[0]}
                              alt={product.title}
                              className="h-full w-full object-cover transition duration-500 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-slate-600">
                              No Image
                            </div>
                          )}

                          <div className="absolute left-3 top-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                                product.status === "AVAILABLE"
                                  ? "bg-emerald-400 text-[#03120b]"
                                  : product.status === "SOLD"
                                    ? "bg-sky-400 text-[#03120b]"
                                    : "bg-red-400 text-[#210606]"
                              }`}
                            >
                              {product.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="min-w-0 truncate text-sm font-black text-white">
                              {product.title}
                            </h3>

                            <span className="shrink-0 text-sm font-black text-emerald-400">
                              ₹{product.price}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {product.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[9px] font-bold text-slate-400">
                              {product.category}
                            </span>

                            <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[9px] font-bold text-slate-400">
                              {product.condition}
                            </span>
                          </div>

                          <a
                            href={`/product/${product.id}`}
                            className="mt-4 block rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 text-center text-xs font-black text-slate-200 transition hover:bg-white/[0.08]"
                          >
                            View Listing
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACCOMMODATION */}
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#071019] p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-400/70">
                      Housing
                    </p>
                    <h2 className="mt-1 text-xl font-black">
                      My Accommodation
                    </h2>
                  </div>

                  <a
                    href="/create-room"
                    className="shrink-0 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[10px] font-black text-slate-300 transition hover:bg-white/[0.07]"
                  >
                    + Add Listing
                  </a>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {data.roomListings?.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-10 text-center md:col-span-2">
                      <div className="text-3xl">🏠</div>
                      <p className="mt-3 text-sm font-bold text-slate-300">
                        No accommodation listed
                      </p>
                      <a
                        href="/create-room"
                        className="mt-3 inline-block text-xs font-bold text-emerald-400 hover:text-emerald-300"
                      >
                        List accommodation →
                      </a>
                    </div>
                  )}

                  {data.roomListings?.map((room: any) => (
                    <div
                      key={room.id}
                      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b1420]"
                    >
                      <div className="relative h-40 overflow-hidden bg-[#101a27] sm:h-44">
                        {room.imageUrls?.length > 0 ? (
                          <img
                            src={room.imageUrls[0]}
                            alt={room.title}
                            className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold text-slate-600">
                            No Image
                          </div>
                        )}

                        <div className="absolute left-3 top-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                              room.status === "AVAILABLE"
                                ? "bg-emerald-400 text-[#03120b]"
                                : room.status === "OCCUPIED"
                                  ? "bg-sky-400 text-[#03120b]"
                                  : "bg-red-400 text-[#210606]"
                            }`}
                          >
                            {room.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 truncate text-sm font-black">
                            {room.title}
                          </h3>

                          <span className="shrink-0 text-sm font-black text-amber-300">
                            ₹{room.rent}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {room.description}
                        </p>

                        <span className="mt-3 inline-block rounded-full bg-white/[0.05] px-2 py-1 text-[9px] font-bold text-slate-400">
                          {room.roomType}
                        </span>

                        <a
                          href={`/rooms/${room.id}`}
                          className="mt-4 block rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 text-center text-xs font-black text-slate-200 transition hover:bg-white/[0.08]"
                        >
                          View Accommodation
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PURCHASES + CHATS */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* PURCHASES */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#071019] p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-400/70">
                        Activity
                      </p>
                      <h2 className="mt-1 text-xl font-black">
                        Recent Purchases
                      </h2>
                    </div>

                    <span className="text-xl">🛍️</span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {data.purchasedProducts?.length === 0 && (
                      <div className="rounded-xl bg-white/[0.025] px-4 py-8 text-center">
                        <p className="text-xs text-slate-500">
                          No purchases yet.
                        </p>
                      </div>
                    )}

                    {data.purchasedProducts?.map((product: any) => (
                      <a
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] p-3.5 transition hover:bg-white/[0.05]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-200">
                            {product.title}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-600">
                            Purchased
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-black text-emerald-400">
                          ₹{product.finalPrice ?? product.price}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* CHATS */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#071019] p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400/70">
                        Messages
                      </p>
                      <h2 className="mt-1 text-xl font-black">
                        Recent Chats
                      </h2>
                    </div>

                    <a
                      href="/chat"
                      className="text-[10px] font-black text-emerald-400 hover:text-emerald-300"
                    >
                      Open Chat →
                    </a>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {data.conversations?.length === 0 && (
                      <div className="rounded-xl bg-white/[0.025] px-4 py-8 text-center">
                        <p className="text-xs text-slate-500">
                          No conversations yet.
                        </p>
                      </div>
                    )}

                    {data.conversations?.slice(0, 5).map(
                      (conversation: any) => {
                        const lastMessage =
                          conversation.messages?.[
                            conversation.messages.length - 1
                          ];

                        const isAccommodation = Boolean(
                          conversation.roomId ||
                            conversation.room
                        );

                        const contextTitle = isAccommodation
                          ? conversation.room?.title ||
                            "Accommodation"
                          : conversation.product?.title ||
                            "Marketplace item";

                        return (
                          <a
                            key={conversation.id}
                            href={`/chat/${conversation.id}`}
                            className="block rounded-xl border border-white/[0.05] bg-white/[0.025] p-3.5 transition hover:bg-white/[0.05]"
                          >
                            <div className="flex items-center gap-2">
                              <span>
                                {isAccommodation ? "🏠" : "📦"}
                              </span>

                              <p className="min-w-0 flex-1 truncate text-xs font-black text-slate-300">
                                {contextTitle}
                              </p>

                              <span className="text-[9px] text-slate-600">
                                {isAccommodation
                                  ? "Accommodation"
                                  : "Item"}
                              </span>
                            </div>

                            <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                              {lastMessage?.text ||
                                "Start the conversation"}
                            </p>
                          </a>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}