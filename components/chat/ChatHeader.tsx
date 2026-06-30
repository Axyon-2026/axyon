"use client";

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
    <div className="sticky top-0 z-20 border-b border-white/10 bg-[#071019]/95 backdrop-blur-xl">

      <div className="flex items-center gap-4 px-5 py-4">

        <button
          onClick={onBack}
          className="md:hidden text-2xl"
        >
          ←
        </button>

        <div className="relative">

          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 flex items-center justify-center text-xl font-black text-green-400">

            {otherUser?.name?.charAt(0)}

          </div>

          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#071019]" />

        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2">

            <h2 className="text-lg font-black truncate text-white">

              {otherUser?.name}

            </h2>

            <span className="text-green-400">

              ✅

            </span>

          </div>

          <p className="text-sm text-slate-400 truncate mt-1">

            {conversation.product?.title}

          </p>

          <div className="flex gap-2 mt-2 flex-wrap">

            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">

              ₹{conversation.product?.price}

            </span>

            <span className="text-xs bg-white/5 text-slate-300 px-2 py-1 rounded-full">

              {conversation.product?.condition}

            </span>

          </div>

        </div>

        <a
          href={`/product/${conversation.product?.id}`}
          className="hidden md:flex items-center justify-center rounded-xl border border-green-500 text-green-400 px-4 py-2 hover:bg-green-500 hover:text-black transition font-semibold"
        >
          View
        </a>

      </div>

    </div>
  );
}