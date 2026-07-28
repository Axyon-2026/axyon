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

  return (
    <header
      className="
        relative z-30
        shrink-0
        border-b border-white/10
        bg-[#071019]
      "
    >
      <div className="flex min-h-16 items-center gap-3 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            text-xl
            text-white
            transition
            active:scale-95
            hover:bg-white/10
            md:hidden
          "
        >
          ←
        </button>

        <div
          className="
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-full
            bg-gradient-to-br
            from-green-400
            to-emerald-600
            text-lg
            font-black
            text-[#071019]
          "
        >
          {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-black text-white">
            {otherUser?.name || "Axyon User"}
          </h2>

          <p className="mt-0.5 truncate text-xs text-slate-400">
            {conversation.product?.title || "Marketplace conversation"}
          </p>
        </div>

        {conversation.product?.id && (
          <Link
            href={`/product/${conversation.product.id}`}
            className="
              shrink-0
              rounded-xl
              border border-green-500/40
              bg-green-500/10
              px-3 py-2
              text-xs
              font-bold
              text-green-300
              transition
              active:scale-95
              hover:bg-green-500
              hover:text-[#071019]
            "
          >
            View
          </Link>
        )}
      </div>
    </header>
  );
}