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
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#020817] text-white">
      <Navbar />

      <section className="flex min-h-0 flex-1 overflow-hidden">
        {/* CHAT SIDEBAR */}
        <div className="h-full min-h-0 w-full shrink-0 md:w-[360px] lg:w-[380px]">
          <div className="h-full overflow-hidden border-r border-white/10 bg-[#071019]">
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
        </div>

        {/* DESKTOP EMPTY STATE */}
        <div className="hidden min-h-0 min-w-0 flex-1 md:block">
          <div className="h-full bg-[#020817]">
            <EmptyChat />
          </div>
        </div>
      </section>
    </main>
  );
}