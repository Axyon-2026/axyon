"use client";

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
  function getOtherUser(conversation: any) {
    return conversation.buyerId === currentUser?.id
      ? conversation.seller
      : conversation.buyer;
  }

  return (
    <aside
  className="
    w-full
    md:w-[360px]
    lg:w-[380px]
    bg-[#071019]
    border-r
    border-white/10
    flex
    flex-col
    h-full
    overflow-hidden
    shrink-0
  "
>

      {/* Header */}

      <div className="px-5 py-4 border-b border-white/10">

        <h1 className="text-2xl font-black text-white">
          Messages
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Buy • Sell • Negotiate
        </p>

      </div>

      {/* Search */}

      <div className="p-4">

        <input
          placeholder="Search chats..."
          className="
            w-full
            h-11
            rounded-xl
            bg-[#0f1722]
            border
            border-white/10
            px-4
            text-sm
            outline-none
            focus:border-green-500
          "
        />

      </div>

      {/* Status */}

      {status && (

        <div className="px-5 pb-3 text-sm text-slate-400">

          {status}

        </div>

      )}

      {/* Empty */}

      {!status && conversations.length === 0 && (

        <div className="flex-1 flex items-center justify-center px-6">

          <div className="text-center">

            <div className="text-5xl">

              💬

            </div>

            <h2 className="mt-4 font-bold">

              No conversations

            </h2>

            <p className="mt-2 text-sm text-slate-400">

              Start chatting from any product.

            </p>

          </div>

        </div>

      )}

      {/* Chats */}

     <div
        className="
          flex-1
          overflow-y-auto
          overscroll-contain
          pb-24
          md:pb-0
        "
      >

        {conversations.map((conversation) => {

          const otherUser = getOtherUser(conversation);

          const lastMessage =
            conversation.messages?.[
              conversation.messages.length - 1
            ];

          const active =
            selectedConversation?.id === conversation.id;

          return (

            <button
              key={conversation.id}
              onClick={() =>
                setSelectedConversation(conversation)
              }
              className={`
                w-full
                px-4
                py-4
                text-left
                transition
                border-b
                border-white/5

                ${
                  active
                    ? "bg-green-500/10"
                    : "hover:bg-white/5"
                }
              `}
            >

              <div className="flex gap-3">

                <div className="relative">

                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center font-bold text-black">

                    {otherUser?.name?.charAt(0)}

                  </div>

                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#071019]" />

                </div>

                <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between gap-2">

                   <h2 className="truncate font-bold text-white">

                      {otherUser?.name}

                    </h2>

                    <span className="text-xs text-slate-500">

                      {lastMessage
                        ? new Date(
                            lastMessage.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}

                    </span>

                  </div>

                  <p className="truncate text-xs text-green-400 mt-1">

                    {conversation.product?.title}

                  </p>

                  <p className="truncate text-sm text-slate-400 mt-1">

                    {lastMessage?.text || "No messages"}

                  </p>

                </div>

              </div>

            </button>

          );

        })}

      </div>

    </aside>
  );
} 