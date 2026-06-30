type MessageBubbleProps = {
  msg: any;
  isMine: boolean;
};

export default function MessageBubble({
  msg,
  isMine,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`w-fit max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-[1.5rem] shadow-sm transition-all ${
          isMine
            ? "bg-green-500 text-black rounded-3xl rounded-br-md shadow-lg"
            : "bg-[#16202b] border border-white/5 text-white rounded-3xl rounded-bl-md"
        }`}
      >
        <p className="leading-6 break-words text-[15px] whitespace-pre-wrap">
          {msg.text}
        </p>

        <div className="flex items-center justify-end gap-2 mt-2">
          <p
            className={`text-xs ${
              isMine
                ? "text-black/60"
                : "text-slate-500"
            }`}
          >
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {isMine && (
            <span className="text-xs text-black/60">
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}