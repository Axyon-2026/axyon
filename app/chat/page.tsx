"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import EmptyChat from "@/components/chat/EmptyChat";

export default function ChatPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadChatInbox() {
      try {
        setLoading(true);
        setError("");

        const [userRes, chatsRes] = await Promise.all([
          fetch("/api/auth/me", {
            cache: "no-store",
          }),
          fetch("/api/chat", {
            cache: "no-store",
          }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
        }

        const chatData = await chatsRes.json();

        if (!chatsRes.ok) {
          setError(
            chatData.message || "Failed to load conversations."
          );
          return;
        }

        setConversations(chatData.conversations || []);
      } catch (error) {
        console.error("CHAT INBOX ERROR:", error);
        setError("Failed to load conversations.");
      } finally {
        setLoading(false);
      }
    }

    loadChatInbox();
  }, []);

  function openConversation(conversation: any) {
    if (!conversation?.id) return;

    router.push(`/chat/${conversation.id}`);
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#020817] text-white">
      <Navbar />

      <section
        className="
          flex
          h-[calc(100dvh-80px)]
          min-h-0
          overflow-hidden
        "
      >
        <div
          className="
            h-full
            min-h-0
            w-full
            md:w-[360px]
            md:shrink-0
            lg:w-[380px]
          "
        >
          <ChatSidebar
            conversations={conversations}
            currentUser={currentUser}
            selectedConversation={null}
            setSelectedConversation={openConversation}
            status={
              loading
                ? "Loading chats..."
                : error
                  ? error
                  : ""
            }
          />
        </div>

        <div className="hidden min-h-0 min-w-0 flex-1 md:block">
          <EmptyChat />
        </div>
      </section>
    </main>
  );
}