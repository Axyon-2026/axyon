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
    <header className="sticky top-0 z-40 bg-[#071019]/95 backdrop-blur-xl border-b border-white/10">

      <div className="h-16 px-4 flex items-center">

        {/* Back Button */}

        <button
          onClick={onBack}
          className="mr-3 md:hidden text-white text-2xl"
        >
          ←
        </button>

        {/* Avatar */}

        <div className="relative">

          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-white text-lg">

            {otherUser?.name?.charAt(0)?.toUpperCase()}

          </div>

          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-[#071019]" />

        </div>

        {/* User Info */}

        <div className="ml-3 flex-1 min-w-0">

          <h2 className="truncate font-bold text-white">

            {otherUser?.name}

          </h2>

          <p className="truncate text-xs text-slate-400">

            {conversation.product?.title}

          </p>

        </div>

        {/* View Product */}

        <Link
          href={`/product/${conversation.product?.id}`}
          className="
          rounded-lg
          border
          border-green-500
          px-3
          py-2
          text-xs
          font-semibold
          text-green-400
          transition
          hover:bg-green-500
          hover:text-black
          "
        >
          View
        </Link>

      </div>

    </header>
  );
}