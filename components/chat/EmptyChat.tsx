"use client";

export default function EmptyChat() {
  return (
    <div className="flex h-full items-center justify-center bg-[#020817]">
      <div className="text-center">

        <div className="text-7xl mb-6">
          💬
        </div>

        <h2 className="text-3xl font-black text-white">
          No Chat Selected
        </h2>

        <p className="mt-3 text-slate-400">
          Select a conversation to start chatting.
        </p>

      </div>
    </div>
  );
}