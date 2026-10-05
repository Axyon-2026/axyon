"use client";

import Link from "next/link";

type ChatHeaderProps = {
  conversation: any;
  currentUser: any;
  onBack?: () => void;
};

export default function ChatHeader({
  conversation,
  currentUser,
  onBack,
}: ChatHeaderProps) {
  if (!conversation) return null;

  const otherUser =
    conversation.buyerId === currentUser?.id
      ? conversation.seller
      : conversation.buyer;

  const isAccommodation = Boolean(
    conversation.roomId || conversation.room
  );

  const isItem = Boolean(
    conversation.productId || conversation.product
  );

  const productTitle =
    conversation.product?.title ||
    conversation.product?.name ||
    "Item";

  const roomTitle =
    conversation.room?.title ||
    conversation.room?.name ||
    conversation.room?.roomType ||
    "Accommodation";

  const contextTitle = isAccommodation ? roomTitle : productTitle;

  const profileImage =
    otherUser?.profileImageUrl ||
    otherUser?.image ||
    otherUser?.avatarUrl ||
    null;

  const initials =
    otherUser?.name
      ?.trim()
      ?.split(/\s+/)
      ?.slice(0, 2)
      ?.map((part: string) => part.charAt(0))
      ?.join("")
      ?.toUpperCase() || "?";

  return (
    <header className="relative z-30 shrink-0 border-b border-white/[0.07] bg-[#071019]/95 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] w-full items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-5">
        {/* Mobile back */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-xl border border-white/[0.07]
            bg-white/[0.03]
            text-lg text-slate-200
            transition-all duration-200
            hover:border-white/[0.12]
            hover:bg-white/[0.07]
            active:scale-95
            md:hidden
          "
        >
          ←
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-emerald-400 to-emerald-700 text-sm font-black text-[#071019] shadow-lg shadow-emerald-950/20 sm:h-12 sm:w-12">
            {profileImage ? (
              <img
                src={profileImage}
                alt={otherUser?.name || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* Online-style indicator */}
          <span
            className="
              absolute -bottom-0.5 -right-0.5
              h-3 w-3 rounded-full
              border-2 border-[#071019]
              bg-emerald-400
            "
            aria-hidden="true"
          />
        </div>

        {/* User + conversation context */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[15px] font-black tracking-tight text-white sm:text-base">
              {otherUser?.name || "Axyon User"}
            </h2>
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-[11px]">
              {isAccommodation ? "🏠" : isItem ? "📦" : "💬"}
            </span>

            <p className="truncate text-[11px] font-semibold text-slate-400 sm:text-xs">
              {contextTitle}
            </p>
          </div>
        </div>

        {/* Context badge */}
        <div className="hidden shrink-0 sm:block">
          <div
            className={`
              rounded-full border px-2.5 py-1.5
              text-[10px] font-black uppercase tracking-[0.12em]
              ${
                isAccommodation
                  ? "border-amber-400/15 bg-amber-400/10 text-amber-300"
                  : "border-sky-400/15 bg-sky-400/10 text-sky-300"
              }
            `}
          >
            {isAccommodation ? "Accommodation" : "Item"}
          </div>
        </div>

        {/* View listing */}
        {conversation.product?.id && (
          <Link
            href={`/product/${conversation.product.id}`}
            className="
              flex shrink-0 items-center gap-1.5
              rounded-xl
              border border-emerald-400/20
              bg-emerald-400/10
              px-3 py-2
              text-[11px] font-black
              text-emerald-300
              transition-all duration-200
              hover:border-emerald-400/30
              hover:bg-emerald-400/15
              hover:text-emerald-200
              active:scale-95
              sm:px-3.5
            "
          >
            <span className="hidden sm:inline">View</span>
            <span className="sm:hidden">Open</span>
            <span aria-hidden="true">↗</span>
          </Link>
        )}

        {/* Accommodation link if the room has an id */}
        {isAccommodation && conversation.room?.id && (
          <Link
            href={`/rooms/${conversation.room.id}`}
            className="
              flex shrink-0 items-center gap-1.5
              rounded-xl
              border border-amber-400/20
              bg-amber-400/10
              px-3 py-2
              text-[11px] font-black
              text-amber-300
              transition-all duration-200
              hover:border-amber-400/30
              hover:bg-amber-400/15
              hover:text-amber-200
              active:scale-95
              sm:px-3.5
            "
          >
            <span className="hidden sm:inline">View</span>
            <span className="sm:hidden">Open</span>
            <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
    </header>
  );
}