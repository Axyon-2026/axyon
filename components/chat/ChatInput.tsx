"use client";

import { useRef } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);

    const textarea = e.target;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  function handleSend() {
    if (!message.trim() || sending) return;

    sendMessage();

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  }

  return (
    <div
      className="
        border-t border-white/10
        bg-[#071019]
        px-3
        pt-3
        pb-[max(12px,env(safe-area-inset-bottom))]
        sm:px-4
      "
    >
      <div className="mx-auto flex w-full max-w-4xl items-end gap-2">
        <div
          className="
            flex min-h-12 min-w-0 flex-1
            items-end
            rounded-2xl
            border border-white/10
            bg-[#101826]
            transition
            focus-within:border-green-500/70
            focus-within:ring-2
            focus-within:ring-green-500/10
          "
        >
          <textarea
            ref={textareaRef}
            value={message}
            rows={1}
            maxLength={2000}
            disabled={sending}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message..."
            aria-label="Message"
            className="
              max-h-[120px]
              min-h-12
              w-full
              resize-none
              overflow-y-auto
              bg-transparent
              px-4
              py-[13px]
              text-[16px]
              leading-[22px]
              text-white
              outline-none
              placeholder:text-slate-500
              disabled:opacity-60
            "
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !message.trim()}
          aria-label="Send message"
          className="
            flex h-12 min-w-12 shrink-0
            items-center justify-center
            rounded-2xl
            bg-green-500
            px-4
            font-black
            text-[#071019]
            transition
            active:scale-95
            hover:bg-green-400
            disabled:cursor-not-allowed
            disabled:bg-slate-700
            disabled:text-slate-400
          "
        >
          {sending ? (
            <span className="text-lg">•••</span>
          ) : (
            <>
              <span className="hidden sm:inline">
                Send
              </span>

              <span className="text-xl sm:hidden">
                ↑
              </span>
            </>
          )}
        </button>
      </div>

      <p className="mx-auto mt-1.5 hidden max-w-4xl text-right text-[10px] text-slate-600 sm:block">
        Enter to send • Shift + Enter for a new line
      </p>
    </div>
  );
}