"use client";

type Props = {
  replies: string[];
  onSelect: (text: string) => void;
};

export default function QuickReplies({
  replies,
  onSelect,
}: Props) {
  if (!replies?.length) return null;

  return (
    <div className="border-t border-white/[0.05] bg-[#071019] px-3 pt-2.5 sm:px-5">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[10px]">⚡</span>

          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-600">
            Quick reply
          </span>
        </div>

        <div
          className="
            flex w-full gap-2
            overflow-x-auto
            overscroll-x-contain
            pb-2
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
                border border-white/[0.08]
                bg-[#101826]
                px-3.5 py-2
                text-[11px]
                font-bold
                text-slate-400
                shadow-[0_4px_15px_rgba(0,0,0,0.1)]
                transition-all duration-200
                hover:border-emerald-400/25
                hover:bg-emerald-400/[0.07]
                hover:text-emerald-300
                active:scale-95
                sm:px-4
                sm:text-xs
              "
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}