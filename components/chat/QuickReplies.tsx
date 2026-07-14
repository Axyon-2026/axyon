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
    <div className="border-t border-white/5 bg-[#071019] px-3 py-2">

      <div className="flex gap-2 overflow-x-auto no-scrollbar">

        {replies.map((reply) => (
          <button
            key={reply}
            onClick={() => onSelect(reply)}
            className="
              shrink-0
              rounded-full
              border
              border-white/10
              bg-[#101826]
              px-4
              py-2
              text-xs
              text-slate-300
              transition
              hover:border-green-500
              hover:text-green-400
            "
          >
            {reply}
          </button>
        ))}

      </div>

    </div>
  );
}