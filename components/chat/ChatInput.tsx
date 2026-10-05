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
    <div className="px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-end gap-2">
          {/* Message field */}
          <div
            className="
              flex min-h-12 min-w-0 flex-1 items-end
              rounded-2xl
              border border-white/[0.08]
              bg-[#101826]
              shadow-[0_8px_30px_rgba(0,0,0,0.16)]
              transition-all duration-200
              focus-within:border-emerald-400/40
              focus-within:bg-[#111c2b]
              focus-within:shadow-[0_8px_35px_rgba(16,185,129,0.06)]
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
              placeholder="Write a message..."
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !message.trim()}
            aria-label="Send message"
            className="
              flex h-12 shrink-0 items-center justify-center
              rounded-2xl
              border border-emerald-300/10
              bg-emerald-500
              px-3.5
              font-black
              text-[#03120b]
              shadow-[0_8px_24px_rgba(16,185,129,0.12)]
              transition-all duration-200
              hover:bg-emerald-400
              hover:shadow-[0_10px_30px_rgba(16,185,129,0.18)]
              active:scale-95
              disabled:cursor-not-allowed
              disabled:border-white/[0.05]
              disabled:bg-slate-800
              disabled:text-slate-500
              disabled:shadow-none
              sm:min-w-[76px]
            "
          >
            {sending ? (
              <span
                className="flex items-center gap-1"
                aria-label="Sending"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                  style={{ animationDelay: "120ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                  style={{ animationDelay: "240ms" }}
                />
              </span>
            ) : (
              <>
                <span className="hidden text-xs sm:inline">
                  Send
                </span>

                <span
                  className="text-xl leading-none sm:ml-1"
                  aria-hidden="true"
                >
                  ↑
                </span>
              </>
            )}
          </button>
        </div>

        {/* Keyboard hint + character count */}
        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="hidden text-[10px] text-slate-600 sm:block">
            Enter to send • Shift + Enter for a new line
          </p>

          <p
            className={`ml-auto text-[10px] ${
              message.length > 1900
                ? "text-amber-400"
                : "text-slate-700"
            }`}
          >
            {message.length}/2000
          </p>
        </div>
      </div>
    </div>
  );
}