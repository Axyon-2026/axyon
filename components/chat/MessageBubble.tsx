"use client";

type MessageBubbleProps = {
  msg: any;
  isMine: boolean;
};

export default function MessageBubble({
  msg,
  isMine,
}: MessageBubbleProps) {
  const time = msg?.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`flex w-full ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          group relative
          max-w-[88%]
          sm:max-w-[75%]
          md:max-w-[68%]
          px-3.5 py-2.5
          sm:px-4 sm:py-3
          shadow-[0_6px_22px_rgba(0,0,0,0.14)]
          transition-all duration-200
          ${
            isMine
              ? `
                rounded-[20px]
                rounded-br-[6px]
                border border-emerald-300/10
                bg-emerald-500
                text-[#03120b]
              `
              : `
                rounded-[20px]
                rounded-bl-[6px]
                border border-white/[0.07]
                bg-[#16202b]
                text-white
              `
          }
        `}
      >
        <p
          className={`
            break-words whitespace-pre-wrap
            text-[14px]
            leading-[1.45rem]
            sm:text-[15px]
            sm:leading-6
            ${
              isMine
                ? "font-medium text-[#03120b]"
                : "font-medium text-slate-100"
            }
          `}
        >
          {msg?.text || ""}
        </p>

        <div
          className={`
            mt-1.5 flex items-center justify-end gap-1.5
            ${
              isMine
                ? "text-[#03120b]/55"
                : "text-slate-500"
            }
          `}
        >
          <span className="text-[10px] font-medium sm:text-[11px]">
            {time}
          </span>

          {isMine && (
            <span
              aria-label="Sent"
              className="text-[11px] font-black leading-none"
            >
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}