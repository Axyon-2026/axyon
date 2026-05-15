"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [conversations, setConversations] =
    useState<any[]>([]);

  const [selectedConversation,
    setSelectedConversation] =
    useState<any>(null);

  const [message, setMessage] =
    useState("");

  const [status, setStatus] =
    useState("Loading chats...");

  async function fetchChats() {

    try {

      const res =
        await fetch("/api/chat");

      const data =
        await res.json();

      if (!res.ok) {
        setStatus(
          data.message ||
            "Failed to load chats"
        );

        return;
      }

      setConversations(
        data.conversations || []
      );

      if (
        data.conversations &&
        data.conversations.length > 0 &&
        !selectedConversation
      ) {
        setSelectedConversation(
          data.conversations[0]
        );
      }

      setStatus("");

    } catch {

      setStatus(
        "Failed to load chats"
      );

    }
  }

  useEffect(() => {
    fetchChats();
  }, []);

  async function sendMessage() {

    if (
      !selectedConversation ||
      !message.trim()
    ) {
      return;
    }

    const sellerId =
      selectedConversation.sellerId;

    const productId =
      selectedConversation.productId;

    const res =
      await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          sellerId,
          productId,
          text: message,
        }),
      });

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data.message ||
          "Failed to send message"
      );

      return;
    }

    setMessage("");

    fetchChats();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="h-[calc(100vh-80px)] flex">
        <div className="w-[350px] border-r border-slate-800 bg-slate-900 overflow-y-auto">
          <div className="p-5 border-b border-slate-800">
            <h1 className="text-2xl font-bold">
              Messages
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Buyer ↔ Seller conversations
            </p>
          </div>

          {status && (
            <p className="p-5 text-slate-400">
              {status}
            </p>
          )}

          {conversations.map(
            (conversation) => {

              const lastMessage =
                conversation.messages?.[
                  conversation.messages
                    .length - 1
                ];

              return (
                <button
                  key={conversation.id}

                  onClick={() =>
                    setSelectedConversation(
                      conversation
                    )
                  }

                  className={`w-full text-left p-5 border-b border-slate-800 hover:bg-slate-800 transition ${
                    selectedConversation?.id ===
                    conversation.id
                      ? "bg-slate-800"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      Product Chat
                    </p>

                    <span className="text-xs text-slate-500">
                      {
                        conversation
                          .messages
                          ?.length
                      }
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mt-2 line-clamp-1">
                    {lastMessage?.text ||
                      "No messages"}
                  </p>
                </button>
              );
            }
          )}
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
                  Product Conversation
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Secure campus chat system
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
                {selectedConversation.messages.map(
                  (msg: any) => (
                    <div
                      key={msg.id}
                      className="max-w-[75%] bg-slate-800 p-4 rounded-2xl"
                    >
                      <p className="text-slate-100">
                        {msg.text}
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(
                          msg.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900 flex gap-3">
                <input
                  type="text"

                  placeholder="Type your message..."

                  value={message}

                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }

                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      sendMessage();
                    }
                  }}

                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
                />

                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-medium"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}