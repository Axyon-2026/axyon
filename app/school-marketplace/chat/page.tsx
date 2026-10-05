"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readByBuyer: boolean;
  readBySeller: boolean;
};

type Participant = {
  id: string;
  name: string;
  profileImageUrl?: string | null;
  schoolName?: string | null;
  schoolCity?: string | null;
  classLevel?: string | null;
  schoolVerified?: boolean;
  marketplaceType?: string;
  isSuspended?: boolean;
};

type Product = {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  status: string;
  marketplaceType: string;
  schoolName?: string | null;
  schoolCity?: string | null;
};

type Conversation = {
  id: string;
  buyerId: string;
  sellerId: string;
  marketplaceType: string;
  isArchived: boolean;
  updatedAt: string;
  product?: Product | null;
  messages?: Message[];
  buyer?: Participant | null;
  seller?: Participant | null;
};

export default function SchoolChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setError("");

      const response = await fetch("/api/school/chat", {
        cache: "no-store",
      });

      if (response.status === 403) {
        window.location.replace("/school-marketplace");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load conversations.");
      }

      const data = await response.json();

      setCurrentUserId(data.currentUserId || null);
      setConversations(
        Array.isArray(data.conversations) ? data.conversations : []
      );
    } catch {
      setError("Unable to load your conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getOtherParticipant(conversation: Conversation) {
    if (!currentUserId) {
      return conversation.seller;
    }

    return conversation.buyerId === currentUserId
      ? conversation.seller
      : conversation.buyer;
  }

  function getLatestMessage(conversation: Conversation) {
    if (!conversation.messages?.length) {
      return null;
    }

    return conversation.messages[conversation.messages.length - 1];
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white">
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg">
              <img
                src="/icon.png"
                alt="Axyon"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mx-auto mt-5 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading your conversations...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/95 backdrop-blur-2xl">
        <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <a
              href="/school-marketplace/home"
              className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-lg sm:h-11 sm:w-11 sm:rounded-2xl">
                <img
                  src="/icon.png"
                  alt="Axyon"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-base font-black sm:text-lg">Axyon</p>

                <p className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 xs:block sm:block">
                  School Marketplace
                </p>
              </div>
            </a>

            <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <a
                href="/school-marketplace/home"
                className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-[11px] font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white sm:px-4 sm:text-xs"
              >
                Home
              </a>

              <a
                href="/school-marketplace/profile"
                className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-[11px] font-black text-slate-400 transition hover:bg-white/[0.08] hover:text-white sm:px-4 sm:text-xs"
              >
                Profile
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {/* TITLE */}
        <div className="max-w-3xl">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-indigo-300 sm:px-4 sm:text-[10px] sm:tracking-[0.18em]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 sm:h-2 sm:w-2" />
            School Chat
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:mt-5 sm:text-5xl">
            Your conversations
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:mt-4 sm:text-base sm:leading-7">
            Continue conversations with verified students about School
            Marketplace listings.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-500/[0.05] p-4 sm:mt-8 sm:p-5">
            <p className="text-sm font-bold leading-6 text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadChats();
              }}
              className="mt-4 min-h-11 rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-black transition hover:bg-white/[0.1]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && conversations.length === 0 && (
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-7 text-center sm:mt-10 sm:rounded-[2rem] sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-indigo-500/10 text-3xl sm:h-20 sm:w-20 sm:rounded-[1.75rem] sm:text-4xl">
              💬
            </div>

            <h2 className="mt-5 text-xl font-black sm:mt-6">
              No conversations yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Start a conversation by opening a School Marketplace listing
              and choosing Chat with Seller.
            </p>

            <a
              href="/school-marketplace/products"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-black shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:brightness-110 sm:mt-7"
            >
              Browse Marketplace
            </a>
          </div>
        )}

        {/* CONVERSATIONS */}
        {!error && conversations.length > 0 && (
          <div className="mt-8 space-y-3.5 sm:mt-10 sm:space-y-4">
            {conversations.map((conversation) => {
              const participant = getOtherParticipant(conversation);
              const latest = getLatestMessage(conversation);
              const product = conversation.product;

              return (
                <a
                  key={conversation.id}
                  href={`/school-marketplace/chat/${conversation.id}`}
                  className="group block overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[0.055] sm:rounded-[1.75rem]"
                >
                  <div className="flex gap-3.5 p-4 sm:gap-4 sm:p-6">
                    {/* PRODUCT IMAGE */}
                    <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-black/20 sm:h-24 sm:w-24 sm:rounded-2xl">
                      {product?.imageUrls?.[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl sm:text-2xl">
                          🛍️
                        </div>
                      )}
                    </div>

                    {/* MAIN */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-sm font-black sm:text-base">
                            {product?.title || "School Marketplace Item"}
                          </h2>

                          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="max-w-[160px] truncate text-xs text-slate-500 sm:max-w-none">
                              {participant?.name || "Student"}
                            </span>

                            {participant?.schoolVerified && (
                              <span className="shrink-0 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-300">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 pt-0.5 text-[9px] font-bold text-slate-600 sm:text-[10px]">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      </div>

                      {/* INFO */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                        {participant?.schoolName && (
                          <span className="max-w-[190px] truncate rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[8px] font-bold text-slate-500 sm:max-w-none sm:px-2.5 sm:py-1 sm:text-[9px]">
                            🏫 {participant.schoolName}
                          </span>
                        )}

                        {participant?.schoolCity && (
                          <span className="max-w-[130px] truncate rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[8px] font-bold text-slate-500 sm:max-w-none sm:px-2.5 sm:py-1 sm:text-[9px]">
                            📍 {participant.schoolCity}
                          </span>
                        )}

                        {product?.price !== undefined && (
                          <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-[8px] font-black text-indigo-300 sm:px-2.5 sm:py-1 sm:text-[9px]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* MESSAGE */}
                      <div className="mt-3 flex min-w-0 items-center gap-2 sm:mt-4 sm:gap-3">
                        <p className="min-w-0 flex-1 truncate text-xs leading-5 text-slate-500">
                          {latest?.text || "Open conversation"}
                        </p>

                        <span className="shrink-0 text-sm font-black text-indigo-400 transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 px-4 py-7 text-center text-[11px] leading-5 text-slate-700 sm:px-5 sm:py-8 sm:text-xs">
        Axyon School Marketplace · Private student conversations
      </footer>
    </main>
  );
}