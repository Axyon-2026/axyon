"use client";

type ChatSidebarProps = {
  conversations: any[];
  selectedConversation: any;
  currentUser: any;
  onSelect: (conversation: any) => void;
};

export default function ChatSidebar({
  conversations,
  selectedConversation,
  currentUser,
  onSelect,
}: ChatSidebarProps) {
  function otherUser(conversation: any) {
    if (!currentUser) return null;

    return conversation.buyerId === currentUser.id
      ? conversation.seller
      : conversation.buyer;
  }

  return (
    <aside
      className="
      w-full
      md:w-[360px]
      border-r
      border-white/10
      bg-[#0b1118]
      flex
      flex-col
      "
    >
      <div className="sticky top-0 z-20 bg-[#0b1118] border-b border-white/10 px-5 py-5">

        <h1 className="text-2xl font-black text-white">
          Chats
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Your marketplace conversations
        </p>

      </div>

      <div className="flex-1 overflow-y-auto">

        {conversations.length === 0 && (

          <div className="p-8 text-center text-slate-400">
            No conversations yet.
          </div>

        )}

        {conversations.map((conversation) => {

          const user = otherUser(conversation);

          const selected =
            selectedConversation?.id === conversation.id;

          return (

            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={`
              w-full
              px-5
              py-4
              text-left
              border-b
              border-white/5
              transition
              hover:bg-white/5

              ${
                selected
                  ? "bg-green-500/10 border-l-4 border-l-green-500"
                  : ""
              }
              `}
            >
              <div className="flex gap-3">

                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center font-black text-green-400 text-lg shrink-0">

                  {user?.name?.charAt(0)}

                </div>

                <div className="flex-1 min-w-0">

                  <div className="flex justify-between items-center">

                    <h2 className="truncate font-black text-white">

                      {user?.name}

                    </h2>

                    <span className="text-[10px] text-slate-500">

                      {conversation.messages?.length || 0}

                    </span>

                  </div>

                  <p className="text-green-400 text-sm truncate mt-1">

                    {conversation.product?.title}

                  </p>

                  <p className="text-slate-500 text-sm truncate mt-1">

                    {conversation.messages?.[
                      conversation.messages.length - 1
                    ]?.text || "No messages"}

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