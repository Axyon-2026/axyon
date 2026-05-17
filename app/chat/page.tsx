"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [conversations, setConversations] =
    useState<any[]>([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<any>(null);

  const [message, setMessage] =
    useState("");

  const [status, setStatus] =
    useState("Loading chats...");

  const [sending, setSending] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  async function fetchCurrentUser() {
    try {
      const res =
        await fetch("/api/auth/me");

      if (res.ok) {
        const data =
          await res.json();

        setCurrentUser(
          data.user
        );
      }
    } catch {
      setCurrentUser(null);
    }
  }

  async function fetchChats(
    keepSelectedId?: string
  ) {
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

      const chats =
        data.conversations || [];

      setConversations(chats);

      if (chats.length === 0) {
        setSelectedConversation(
          null
        );

        setStatus("");

        return;
      }

      if (keepSelectedId) {
        const updated =
          chats.find(
            (c: any) =>
              c.id ===
              keepSelectedId
          );

        setSelectedConversation(
          updated || chats[0]
        );

      } else if (
        !selectedConversation
      ) {
        setSelectedConversation(
          chats[0]
        );

      } else {
        const updated =
          chats.find(
            (c: any) =>
              c.id ===
              selectedConversation.id
          );

        setSelectedConversation(
          updated || chats[0]
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

    fetchCurrentUser();
    fetchChats();

  }, []);

  // auto refresh every 2 sec
  useEffect(() => {

    const interval =
      setInterval(() => {

        fetchChats(
          selectedConversation?.id
        );

      }, 2000);

    return () =>
      clearInterval(interval);

  }, [selectedConversation]);

  // auto scroll
  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [selectedConversation]);

  async function sendMessage() {

    if (
      !selectedConversation ||
      !message.trim() ||
      sending
    ) {
      return;
    }

    setSending(true);

    try {

      const res =
        await fetch("/api/chat", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            conversationId:
              selectedConversation.id,

            text: message.trim(),
          }),
        });

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.message ||
            "Failed to send message"
        );

        setSending(false);

        return;
      }

      setMessage("");

      await fetchChats(
        selectedConversation.id
      );

    } catch {

      alert(
        "Failed to send message"
      );

    } finally {

      setSending(false);

    }
  }

  function getOtherUser(
    conversation: any
  ) {

    if (!currentUser)
      return null;

    if (
      conversation.buyerId ===
      currentUser.id
    ) {
      return conversation.seller;
    }

    return conversation.buyer;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="h-[calc(100vh-80px)] flex overflow-hidden">
        {/* sidebar */}

        <div
          className={`
            ${
              selectedConversation
                ? "hidden md:flex"
                : "flex"
            }

            w-full
            md:w-[360px]
            flex-col
            border-r
            border-slate-200
            bg-white
          `}
        >
          <div className="p-5 border-b border-slate-200">
            <h1 className="text-3xl font-black">
              Chats
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Buyer ↔ Seller conversations
            </p>
          </div>

          {status && (
            <p className="p-5 text-slate-500">
              {status}
            </p>
          )}

          {!status &&
            conversations.length ===
              0 && (
              <div className="flex-1 flex items-center justify-center px-8 text-center text-slate-500">
                No chats yet.
              </div>
            )}

          <div className="flex-1 overflow-y-auto">
            {conversations.map(
              (conversation) => {

                const lastMessage =
                  conversation
                    .messages?.[
                    conversation
                      .messages
                      .length - 1
                  ];

                const otherUser =
                  getOtherUser(
                    conversation
                  );

                return (
                  <button
                    key={
                      conversation.id
                    }

                    onClick={() =>
                      setSelectedConversation(
                        conversation
                      )
                    }

                    className={`
                    w-full
                    text-left
                    px-4
                    py-4
                    border-b
                    border-slate-100
                    hover:bg-slate-50
                    transition

                    ${
                      selectedConversation?.id ===
                      conversation.id
                        ? "bg-green-50"
                        : ""
                    }
                  `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="
                        w-12
                        h-12
                        rounded-full
                        bg-green-100
                        text-green-700
                        flex
                        items-center
                        justify-center
                        font-black
                        shrink-0
                      "
                      >
                        {otherUser?.name?.charAt(
                          0
                        ) || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black truncate">
                            {
                              otherUser?.name
                            }
                          </p>

                          <span className="text-[10px] text-slate-400">
                            {
                              conversation
                                .messages
                                ?.length
                            }
                          </span>
                        </div>

                        <p className="text-xs text-green-700 font-bold mt-1 truncate">
                          {
                            conversation
                              .product
                              ?.title
                          }
                        </p>

                        <p className="text-sm text-slate-500 mt-1 truncate">
                          {lastMessage?.text ||
                            "No messages"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* chat area */}

        <div
          className={`
            flex-1
            flex
            flex-col
            bg-[#f8fafc]

            ${
              !selectedConversation
                ? "hidden md:flex"
                : "flex"
            }
          `}
        >
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
                <button
                  onClick={() =>
                    setSelectedConversation(
                      null
                    )
                  }

                  className="md:hidden text-2xl"
                >
                  ←
                </button>

                <div
                  className="
                  w-12
                  h-12
                  rounded-full
                  bg-green-100
                  text-green-700
                  flex
                  items-center
                  justify-center
                  font-black
                "
                >
                  {getOtherUser(
                    selectedConversation
                  )
                    ?.name?.charAt(
                      0
                    ) || "U"}
                </div>

                <div className="min-w-0">
                  <h2 className="font-black truncate">
                    {getOtherUser(
                      selectedConversation
                    )?.name ||
                      "User"}
                  </h2>

                  <p className="text-sm text-slate-500 truncate">
                    {
                      selectedConversation
                        .product?.title
                    }
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                {selectedConversation.messages?.map(
                  (msg: any) => {

                    const isMine =
                      msg.senderId ===
                      currentUser?.id;

                    return (
                      <div
                        key={msg.id}

                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`
                          max-w-[85%]
                          sm:max-w-[70%]
                          px-4
                          py-3
                          rounded-[1.5rem]
                          shadow-sm

                          ${
                            isMine
                              ? "bg-green-600 text-white rounded-br-md"
                              : "bg-white border border-slate-200 text-slate-900 rounded-bl-md"
                          }
                        `}
                        >
                          <p className="leading-7 break-words">
                            {msg.text}
                          </p>

                          <p
                            className={`
                            text-[10px]
                            mt-2

                            ${
                              isMine
                                ? "text-green-100"
                                : "text-slate-400"
                            }
                          `}
                          >
                            {new Date(
                              msg.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",

                                minute:
                                  "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />
              </div>

              <div className="bg-white border-t border-slate-200 p-3">
                <div className="flex items-center gap-3">
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
                        e.key ===
                        "Enter"
                      ) {
                        sendMessage();
                      }
                    }}

                    className="
                      flex-1
                      px-5
                      py-4
                      rounded-full
                      bg-slate-100
                      border
                      border-slate-200
                      outline-none
                      focus:border-green-500
                      focus:bg-white
                    "
                  />

                  <button
                    onClick={
                      sendMessage
                    }

                    disabled={sending}

                    className="
                      bg-green-600
                      hover:bg-green-700
                      text-white
                      px-6
                      py-4
                      rounded-full
                      font-black
                      disabled:opacity-60
                    "
                  >
                    {sending
                      ? "..."
                      : "Send"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}