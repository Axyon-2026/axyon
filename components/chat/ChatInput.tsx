"use client";

type ChatInputProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sending: boolean;
  sendMessage: () => void;
};

export default function ChatInput({
  message,
  setMessage,
  sending,
  sendMessage,
}: ChatInputProps) {
  return (
    <div className="border-t border-white/10 bg-[#071019] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="flex items-center gap-3">

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
          className="
            flex-1
            h-12
            rounded-full
            border
            border-white/10
            bg-[#101826]
            px-5
            text-white
            outline-none
            placeholder:text-slate-500
            focus:border-green-500
          "
        />

        <button
          disabled={sending}
          onClick={sendMessage}
          className="
            h-12
            rounded-full
            bg-green-500
            px-6
            font-bold
            text-black
            transition
            hover:bg-green-400
            disabled:opacity-60
          "
        >
          {sending ? "..." : "Send"}
        </button>

      </div>
    </div>
  );
}