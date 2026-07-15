"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatScreen from "@/components/chat/ChatScreen";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("Loading chats...");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "📍 Meet at college gate?",
    "☕ Meet at canteen?",
    "🕒 Is this still available?",
    "🚶 Can you come to hostel?",
    "💰 Final price?",
    "📦 Available today?",
  ];

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
      } else {
        setSelectedConversation((prev: any) => {
          if (!prev) return chats[0];

          return chats.find((c: any) => c.id === prev.id) || chats[0];
        });
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
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedConversation?.messages?.length]);

  async function sendMessage() {
    if (!selectedConversation) return;

    if (!message.trim()) return;

    if (sending) return;

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
        alert(data.message);
        return;
      }

      setMessage("");

      await fetchChats(selectedConversation.id);
    } catch {
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="flex h-[calc(100dvh-80px)] overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          currentUser={currentUser}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          status={status}
        />

        <ChatScreen
          currentUser={currentUser}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          message={message}
          setMessage={setMessage}
          sending={sending}
          sendMessage={sendMessage}
          quickReplies={quickReplies}
          messagesEndRef={messagesEndRef}
        />
      </section>
    </main>
  );
}
