"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [message, setMessage] = useState("");
  const quickReplies = [
  "📍 Meet at college gate?",
  "☕ Meet at canteen?",
  "🕒 Is this still available?",
  "🚶 Can you come to hostel?",
  "💰 Final price?",
  "📦 Available today?",
];
  const [status, setStatus] = useState("Loading chats...");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {
      setCurrentUser(null);
    }
  }

  async function fetchChats(keepSelectedId?: string) {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || "Failed to load chats");
        return;
      }

      const chats = data.conversations || [];
      setConversations(chats);

      if (chats.length === 0) {
        setSelectedConversation(null);
        setStatus("");
        return;
      }

      if (keepSelectedId) {
        const updated = chats.find((c: any) => c.id === keepSelectedId);
        setSelectedConversation(updated || chats[0]);
      } else if (!selectedConversation) {
        setSelectedConversation(chats[0]);
      } else {
        const updated = chats.find(
          (c: any) => c.id === selectedConversation.id
        );
        setSelectedConversation(updated || chats[0]);
      }

      setStatus("");
    } catch {
      setStatus("Failed to load chats");
    }
  }

  useEffect(() => {
    fetchCurrentUser();
    fetchChats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats(selectedConversation?.id);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedConversation]);

  async function sendMessage() {
    if (!selectedConversation || !message.trim() || sending) return;

    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          text: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send message");
        setSending(false);
        return;
      }

      setMessage("");
      await fetchChats(selectedConversation.id);
    } catch {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function getOtherUser(conversation: any) {
    if (!currentUser) return null;

    if (conversation.buyerId === currentUser.id) {
      return conversation.seller;
    }

    return conversation.buyer;
  }

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] flex overflow-hidden pb-24 md:pb-0">
        <div
          className={`${
            selectedConversation ? "hidden md:flex" : "flex"
          } w-full md:w-[380px] flex-col border-r border-white/10 bg-[#071019]`}
        >
          <div className="border-b border-white/10 px-4 py-4 bg-[#0d1721]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-xs font-black uppercase tracking-wider">
                  Axyon Chat
                </p>

                <h1 className="text-2xl font-black mt-1">Messages</h1>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xl">
                💬
              </div>
            </div>

            <p className="text-sm text-slate-400 mt-3">
              Chat with campus buyers and sellers.
            </p>
          </div>

          {status && <p className="p-5 text-slate-400">{status}</p>}

          {!status && conversations.length === 0 && (
            <div className="flex-1 flex items-center justify-center px-8 text-center">
              <div>
                <div className="text-6xl">💬</div>

                <h2 className="mt-5 text-2xl font-black">No chats yet</h2>

                <p className="mt-3 text-slate-400">
                  Start a conversation from any product page.
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-28 md:pb-6">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const lastMessage =
                conversation.messages?.[conversation.messages.length - 1];
              const unreadCount = conversation.unreadCount || 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full text-left px-4 py-4 border-b border-white/5 hover:bg-white/[0.04] transition ${
                    selectedConversation?.id === conversation.id
                      ? "bg-green-500/10 border-l-4 border-green-500"
                      : unreadCount > 0
                      ? "bg-green-500/[0.04]"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-black">
                        {otherUser?.name?.charAt(0) || "U"}
                      </div>

                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#071019]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-black truncate">
                          {otherUser?.name || "User"}
                        </h2>

                        {unreadCount > 0 && (
                          <div className="min-w-5 h-5 px-1 rounded-full bg-green-500 text-black text-[10px] font-black flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.6)]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-green-400 font-bold mt-1 truncate">
                        {conversation.product?.title || "Product Chat"}
                      </p>

                      <p
                        className={`text-sm truncate mt-1 ${
                          unreadCount > 0
                            ? "text-white font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        {lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col bg-[#020817] ${
            !selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="text-center max-w-md">
                <div className="text-7xl">💬</div>

                <h2 className="mt-6 text-3xl font-black">
                  Your Conversations
                </h2>

                <p className="mt-4 text-slate-400 leading-7">
                  Buy, sell, negotiate, and connect safely with students from
                  your campus.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 bg-[#071019]/95 backdrop-blur-xl px-4 py-4 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden text-2xl mr-1"
                >
                  ←
                </button>

                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-black">
                    {getOtherUser(selectedConversation)?.name?.charAt(0) ||
                      "U"}
                  </div>

                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#071019]" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-black truncate text-white text-lg">
                    {getOtherUser(selectedConversation)?.name || "User"}
                  </h2>

                  <p className="text-sm text-slate-400 truncate">
                    {selectedConversation.product?.title || "Product Chat"}
                  </p>
                </div>

                <button className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition">
                  🚩
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 md:px-6 py-5 space-y-4 pb-28 md:pb-8">
                {selectedConversation.messages?.map((msg: any) => {
                  const isMine = msg.senderId === currentUser?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[75%] lg:max-w-[60%] px-4 py-3 rounded-[1.5rem] shadow-sm ${
                         isMine
                         ? "bg-green-500 text-black rounded-[1.8rem] rounded-br-md shadow-lg"
                         : "bg-[#16202b] border border-white/5 text-white rounded-[1.8rem] rounded-bl-md"
                        }`}
                      >
                        <p className="leading-7 break-words text-[15px]">
                          {msg.text}
                        </p>

                        <div className="flex items-center justify-end gap-2 mt-2">
                          <p
                            className={`text-[10px] ${
                              isMine ? "text-black/60" : "text-slate-500"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>

                          {isMine && (
                            <span className="text-[10px] text-black/60">
                              ✓✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 bg-[#071019]/95 backdrop-blur-xl px-3 py-3 md:px-5 md:py-4">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                   {quickReplies.map((reply) => (
                     <button
                       key={reply}
                       onClick={() => setMessage(reply)}
                       className="
                         shrink-0
                         px-4
                         py-2.5
                         rounded-full
                         bg-[#0f1a24]
                         border
                         border-white/10
                         text-[13px]
                         text-slate-300
                         hover:border-green-500
                         hover:text-green-400
                         active:scale-95
                         transition-all
                       "
                     >
                       {reply}
                     </button>
                   ))}
                 </div>

                  <div className="flex items-center gap-3">

  <input
    type="text"
    placeholder="Type your message..."
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    }}
    className="
      flex-1
      h-14
      px-5
      rounded-full
      bg-[#0f1a24]
      border
      border-white/10
      outline-none
      text-white
      placeholder:text-slate-500
      focus:border-green-500
    "
  />

  <button
    onClick={sendMessage}
    disabled={sending}
    className="
      h-14
      min-w-[90px]
      px-6
      rounded-full
      bg-green-500
      hover:bg-green-400
      active:scale-95
      text-black
      font-black
      transition-all
      disabled:opacity-60
      shadow-[0_0_25px_rgba(34,197,94,0.25)]
    "
  >
    {sending ? "..." : "Send"}
    </button>

</div>

</div>

</div>

            </>
          )}
        </div>
      </section>
    </main>
  );
}