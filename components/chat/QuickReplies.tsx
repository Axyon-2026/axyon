"use client";

type Props = {
  replies: string[];
  onSelect: (text: string) => void;
};

export default function QuickReplies({
  replies,
  onSelect,
}: Props) {
  return (
    <div className="border-t border-white/5 bg-[#071019] px-3 py-2 sm:px-4">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-4xl
          gap-2
          overflow-x-auto
          overscroll-x-contain
          pb-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {replies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onSelect(reply)}
            className="
              shrink-0
              rounded-full
              border border-white/10
              bg-[#101826]
              px-3.5 py-2
              text-xs
              font-medium
              text-slate-300
              transition
              active:scale-95
              hover:border-green-500/60
              hover:bg-green-500/10
              hover:text-green-300
            "
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}