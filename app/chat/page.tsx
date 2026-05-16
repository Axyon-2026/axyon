"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Loading chats...");
  const [sending, setSending] = useState(false);

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
        const updatedSelected = chats.find(
          (conversation: any) => conversation.id === keepSelectedId
        );

        setSelectedConversation(updatedSelected || chats[0]);
      } else if (!selectedConversation) {
        setSelectedConversation(chats[0]);
      } else {
        const updatedSelected = chats.find(
          (conversation: any) => conversation.id === selectedConversation.id
        );

        setSelectedConversation(updatedSelected || chats[0]);
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

  async function sendMessage() {
    if (!selectedConversation || !message.trim() || sending) {
      return;
    }

    setSending(true);

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
    setSending(false);
  }

  function getOtherUser(conversation: any) {
    if (!currentUser) return null;

    if (conversation.buyerId === currentUser.id) {
      return conversation.seller;
    }

    return conversation.buyer;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="h-[calc(100vh-80px)] flex">
        <div className="w-[350px] border-r border-slate-800 bg-slate-900 overflow-y-auto">
          <div className="p-5 border-b border-slate-800">
            <h1 className="text-2xl font-bold">Messages</h1>

            <p className="text-sm text-slate-400 mt-1">
              Buyer ↔ Seller conversations
            </p>
          </div>

          {status && <p className="p-5 text-slate-400">{status}</p>}

          {!status && conversations.length === 0 && (
            <p className="p-5 text-slate-400">No chats yet.</p>
          )}

          {conversations.map((conversation) => {
            const lastMessage =
              conversation.messages?.[conversation.messages.length - 1];

            const otherUser = getOtherUser(conversation);

            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full text-left p-5 border-b border-slate-800 hover:bg-slate-800 transition ${
                  selectedConversation?.id === conversation.id
                    ? "bg-slate-800"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {conversation.product?.title || "Product Chat"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      With {otherUser?.name || "User"}
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    {conversation.messages?.length || 0}
                  </span>
                </div>

                <p className="text-sm text-slate-400 mt-2 line-clamp-1">
                  {lastMessage?.text || "No messages"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="p-5 border-b border-slate-800 bg-slate-900">
                <h2 className="text-xl font-semibold">
                  {selectedConversation.product?.title || "Product Conversation"}
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Price: ₹{selectedConversation.product?.price || "N/A"}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
                {selectedConversation.messages?.map((msg: any) => {
                  const isMine = msg.senderId === currentUser?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[75%] p-4 rounded-2xl ${
                        isMine
                          ? "ml-auto bg-blue-600"
                          : "mr-auto bg-slate-800"
                      }`}
                    >
                      <p className="text-slate-100">{msg.text}</p>

                      <p
                        className={`text-xs mt-2 ${
                          isMine ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900 flex gap-3">
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
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
                />

                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-medium disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}