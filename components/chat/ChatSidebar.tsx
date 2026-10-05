"use client";

import { useMemo, useState } from "react";

type ChatSidebarProps = {
  conversations: any[];
  currentUser: any;
  selectedConversation: any;
  setSelectedConversation: (conversation: any) => void;
  status: string;
};

export default function ChatSidebar({
  conversations,
  currentUser,
  selectedConversation,
  setSelectedConversation,
  status,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");

  function getOtherUser(conversation: any) {
    return conversation.buyerId === currentUser?.id
      ? conversation.seller
      : conversation.buyer;
  }

  function getLastMessage(conversation: any) {
    const messages = conversation.messages || [];

    return messages.length > 0
      ? messages[messages.length - 1]
      : null;
  }

  function getUnreadCount(conversation: any) {
    if (!currentUser) return 0;

    const messages = conversation.messages || [];
    const isBuyer =
      conversation.buyerId === currentUser.id;

    return messages.filter((msg: any) => {
      if (msg.senderId === currentUser.id) {
        return false;
      }

      return isBuyer
        ? !msg.readByBuyer
        : !msg.readBySeller;
    }).length;
  }

  function getConversationType(conversation: any) {
    if (conversation.roomId) {
      return {
        icon: "🏠",
        label: "Accommodation",
      };
    }

    if (conversation.productId || conversation.product) {
      return {
        icon: "📦",
        label: "Item",
      };
    }

    return {
      icon: "💬",
      label: "Chat",
    };
  }

  function formatTime(date: string) {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const otherUser =
        conversation.buyerId === currentUser?.id
          ? conversation.seller
          : conversation.buyer;

      const userName =
        otherUser?.name?.toLowerCase() || "";

      const productTitle =
        conversation.product?.title?.toLowerCase() || "";

      const roomTitle =
        conversation.room?.title?.toLowerCase() || "";

      const type =
        getConversationType(conversation).label.toLowerCase();

      return (
        userName.includes(query) ||
        productTitle.includes(query) ||
        roomTitle.includes(query) ||
        type.includes(query)
      );
    });
  }, [conversations, currentUser, search]);

  const unreadTotal = useMemo(() => {
    return conversations.reduce(
      (total, conversation) =>
        total + getUnreadCount(conversation),
      0
    );
  }, [conversations, currentUser]);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-white/[0.07] bg-[#071019] text-white">
      {/* HEADER */}
      <div className="shrink-0 border-b border-white/[0.07] bg-[#08121d]/95 px-4 pb-4 pt-5 backdrop-blur-xl sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-lg">
                💬
              </span>

              <div>
                <h1 className="text-xl font-black tracking-tight">
                  Messages
                </h1>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                  Campus Chat
                </p>
              </div>
            </div>
          </div>

          {conversations.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadTotal > 0 && (
                <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-green-500 px-2 text-[11px] font-black text-black">
                  {unreadTotal > 99 ? "99+" : unreadTotal}
                </span>
              )}

              <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-xs font-black text-slate-400">
                {conversations.length}
              </span>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Your conversations with students across Axyon.
        </p>
      </div>

      {/* SEARCH */}
      <div className="shrink-0 px-4 pb-3 pt-4 sm:px-5">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-500">
            ⌕
          </span>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="h-11 w-full rounded-2xl border border-white/[0.08] bg-[#101a27] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-green-500/40 focus:bg-[#111d2b] focus:ring-4 focus:ring-green-500/5"
          />
        </div>
      </div>

      {/* STATUS */}
      {status && (
        <div className="shrink-0 px-5 py-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-xs leading-5 text-slate-500">
            {status}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!status && conversations.length === 0 && (
        <div className="flex min-h-0 flex-1 items-center justify-center px-8">
          <div className="max-w-xs text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-green-500/10 bg-green-500/[0.07] text-2xl shadow-[0_0_40px_rgba(34,197,94,0.06)]">
              💬
            </div>

            <h2 className="mt-5 text-base font-black">
              No conversations yet
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Open a marketplace listing and chat with
              the seller to start a conversation.
            </p>
          </div>
        </div>
      )}

      {/* SEARCH EMPTY */}
      {!status &&
        conversations.length > 0 &&
        filteredConversations.length === 0 && (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6">
            <div className="text-center">
              <div className="text-2xl">⌕</div>

              <p className="mt-3 text-sm font-black text-white">
                No chats found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Try another name or listing.
              </p>
            </div>
          </div>
        )}

      {/* CONVERSATIONS */}
      {!status && filteredConversations.length > 0 && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <div className="px-2 pb-4 sm:px-3">
            {filteredConversations.map((conversation) => {
              const otherUser =
                getOtherUser(conversation);

              const lastMessage =
                getLastMessage(conversation);

              const unreadCount =
                getUnreadCount(conversation);

              const active =
                selectedConversation?.id ===
                conversation.id;

              const conversationType =
                getConversationType(conversation);

              const title =
                conversationType.label === "Accommodation"
                  ? conversation.room?.title ||
                    "Accommodation"
                  : conversation.product?.title ||
                    "Marketplace item";

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    setSelectedConversation(conversation)
                  }
                  className={`group relative mb-1.5 w-full rounded-2xl px-3 py-3.5 text-left transition-all duration-200 ${
                    active
                      ? "bg-green-500/[0.09] shadow-inner shadow-green-500/[0.03]"
                      : "hover:bg-white/[0.035]"
                  }`}
                >
                  {active && (
                    <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
                  )}

                  <div className="flex min-w-0 gap-3">
                    {/* AVATAR */}
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-green-400 to-emerald-600 text-base font-black text-[#071019] shadow-lg">
                        {otherUser?.profileImageUrl ? (
                          <img
                            src={otherUser.profileImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          otherUser?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#071019] bg-green-400" />
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2
                          className={`min-w-0 flex-1 truncate text-sm ${
                            unreadCount > 0
                              ? "font-black text-white"
                              : "font-bold text-slate-200"
                          }`}
                        >
                          {otherUser?.name ||
                            "Axyon User"}
                        </h2>

                        {lastMessage && (
                          <span
                            className={`shrink-0 text-[10px] ${
                              unreadCount > 0
                                ? "font-bold text-green-400"
                                : "text-slate-600"
                            }`}
                          >
                            {formatTime(
                              lastMessage.createdAt
                            )}
                          </span>
                        )}
                      </div>

                      {/* LISTING CONTEXT */}
                      <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                        <span className="shrink-0 text-[11px]">
                          {conversationType.icon}
                        </span>

                        <span
                          className={`truncate text-[10px] font-black uppercase tracking-[0.08em] ${
                            conversationType.label ===
                            "Accommodation"
                              ? "text-violet-300"
                              : "text-green-400"
                          }`}
                        >
                          {conversationType.label}
                        </span>

                        <span className="shrink-0 text-[10px] text-slate-700">
                          ·
                        </span>

                        <span className="min-w-0 truncate text-[11px] font-semibold text-slate-500">
                          {title}
                        </span>
                      </div>

                      {/* LAST MESSAGE */}
                      <div className="mt-1.5 flex min-w-0 items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-xs ${
                            unreadCount > 0
                              ? "font-semibold text-slate-200"
                              : "text-slate-500"
                          }`}
                        >
                          {lastMessage
                            ? lastMessage.senderId ===
                              currentUser?.id
                              ? `You: ${lastMessage.text}`
                              : lastMessage.text
                            : "Start the conversation"}
                        </p>

                        {unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-green-500 px-1.5 text-[9px] font-black text-black">
                            {unreadCount > 99
                              ? "99+"
                              : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}