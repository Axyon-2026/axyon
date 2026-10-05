"use client";

export default function EmptyChat() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center bg-[#020817] px-5">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/[0.08] bg-white/[0.035] text-4xl shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          💬
        </div>

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/70">
          Axyon Chat
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          No chat selected
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Select a conversation from the list to chat with another Axyon
          student.
        </p>

        <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-2">
          <div className="h-px flex-1 bg-white/[0.06]" />

          <span className="text-[10px] font-bold text-slate-700">
            📦 Buy & Sell
          </span>

          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}