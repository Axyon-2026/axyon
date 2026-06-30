type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  sending,
}: ChatInputProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#071019]/95 backdrop-blur-xl px-3 py-3 md:px-5 md:py-4">
      <div className="flex items-center gap-3">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-white/5 border border-white/10 px-5 py-3 outline-none text-white placeholder:text-slate-500 focus:border-green-500"
        />

        <button
          onClick={onSend}
          disabled={sending || !value.trim()}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black rounded-full px-6 py-3 font-black transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}