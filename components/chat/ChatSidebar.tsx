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

    const isBuyer = conversation.buyerId === currentUser.id;

    return messages.filter((msg: any) => {
      if (msg.senderId === currentUser.id) return false;

      return isBuyer
        ? !msg.readByBuyer
        : !msg.readBySeller;
    }).length;
  }

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const otherUser =
        conversation.buyerId === currentUser?.id
          ? conversation.seller
          : conversation.buyer;

      const userName = otherUser?.name?.toLowerCase() || "";
      const productTitle =
        conversation.product?.title?.toLowerCase() || "";

      return (
        userName.includes(query) ||
        productTitle.includes(query)
      );
    });
  }, [conversations, currentUser, search]);

  return (
    <aside
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        border-r
        border-white/10
        bg-[#071019]
      "
    >
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Messages
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Buy • Sell • Connect
            </p>
          </div>

          {conversations.length > 0 && (
            <div
              className="
                flex h-9 min-w-9
                items-center justify-center
                rounded-full
                bg-green-500/10
                px-3
                text-sm
                font-bold
                text-green-400
              "
            >
              {conversations.length}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="shrink-0 px-4 pb-3 pt-4">
        <div className="relative">
          <span
            className="
              pointer-events-none
              absolute left-4 top-1/2
              -translate-y-1/2
              text-slate-500
            "
          >
            ⌕
          </span>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people or listings"
            className="
              h-12
              w-full
              rounded-2xl
              border
              border-white/10
              bg-[#101826]
              pl-11
              pr-4
              text-sm
              text-white
              outline-none
              transition
              placeholder:text-slate-500
              focus:border-green-500/70
              focus:ring-2
              focus:ring-green-500/10
            "
          />
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="shrink-0 px-5 py-3 text-sm text-slate-400">
          {status}
        </div>
      )}

      {/* Empty inbox */}
      {!status && conversations.length === 0 && (
        <div className="flex min-h-0 flex-1 items-center justify-center px-8">
          <div className="max-w-xs text-center">
            <div
              className="
                mx-auto
                flex h-16 w-16
                items-center justify-center
                rounded-2xl
                bg-green-500/10
                text-3xl
              "
            >
              💬
            </div>

            <h2 className="mt-5 text-lg font-black text-white">
              No conversations yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Open a marketplace listing and chat with the seller to
              start a conversation.
            </p>
          </div>
        </div>
      )}

      {/* No search result */}
      {!status &&
        conversations.length > 0 &&
        filteredConversations.length === 0 && (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6">
            <div className="text-center">
              <p className="font-bold text-white">
                No chats found
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Try another name or listing.
              </p>
            </div>
          </div>
        )}

      {/* Conversation list */}
      {!status && filteredConversations.length > 0 && (
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            [scrollbar-width:thin]
          "
        >
          {filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = getLastMessage(conversation);
            const unreadCount = getUnreadCount(conversation);

            const active =
              selectedConversation?.id === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  setSelectedConversation(conversation)
                }
                className={`
                  relative
                  w-full
                  border-b
                  border-white/5
                  px-4
                  py-4
                  text-left
                  transition
                  ${
                    active
                      ? "bg-green-500/10"
                      : "hover:bg-white/[0.04]"
                  }
                `}
              >
                {active && (
                  <span
                    className="
                      absolute
                      bottom-3
                      left-0
                      top-3
                      w-1
                      rounded-r-full
                      bg-green-500
                    "
                  />
                )}

                <div className="flex min-w-0 items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="
                      flex h-12 w-12
                      shrink-0
                      items-center justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-green-400
                      to-emerald-600
                      text-lg
                      font-black
                      text-[#071019]
                    "
                  >
                    {otherUser?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`
                          min-w-0
                          flex-1
                          truncate
                          ${
                            unreadCount > 0
                              ? "font-black text-white"
                              : "font-bold text-slate-100"
                          }
                        `}
                      >
                        {otherUser?.name || "Axyon User"}
                      </h2>

                      {lastMessage && (
                        <span
                          className={`
                            shrink-0
                            text-[11px]
                            ${
                              unreadCount > 0
                                ? "font-bold text-green-400"
                                : "text-slate-500"
                            }
                          `}
                        >
                          {new Date(
                            lastMessage.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-xs font-semibold text-green-400">
                      {conversation.product?.title ||
                        "Marketplace listing"}
                    </p>

                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      <p
                        className={`
                          min-w-0
                          flex-1
                          truncate
                          text-sm
                          ${
                            unreadCount > 0
                              ? "font-semibold text-slate-200"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {lastMessage
                          ? lastMessage.senderId ===
                            currentUser?.id
                            ? `You: ${lastMessage.text}`
                            : lastMessage.text
                          : "Start the conversation"}
                      </p>

                      {unreadCount > 0 && (
                        <span
                          className="
                            flex h-5 min-w-5
                            shrink-0
                            items-center justify-center
                            rounded-full
                            bg-green-500
                            px-1.5
                            text-[10px]
                            font-black
                            text-black
                          "
                        >
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
      )}
    </aside>
  );
}