"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatScreen from "@/components/chat/ChatScreen";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();

  const conversationId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<any>(null);

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

  const loadCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      setCurrentUser(data.user);
    } catch (error) {
      console.error("CURRENT USER ERROR:", error);
    }
  }, []);

  const markConversationRead = useCallback(
    async (id: string) => {
      if (!id) return;

      try {
        const res = await fetch(
          `/api/chat/${id}/read`,
          {
            method: "POST",
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);

          console.error(
            "MARK READ ERROR:",
            data?.message || res.statusText
          );
        }
      } catch (error) {
        console.error("MARK READ ERROR:", error);
      }
    },
    []
  );

  const loadConversations = useCallback(async () => {
    if (!conversationId) return;

    try {
      const res = await fetch("/api/chat", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(
          data.message || "Failed to load chats."
        );
        return;
      }

      const chats = data.conversations || [];

      setConversations(chats);

      const activeConversation = chats.find(
        (conversation: any) =>
          conversation.id === conversationId
      );

      if (!activeConversation) {
        setSelectedConversation(null);
        setStatus("Conversation not found.");
        return;
      }

      setSelectedConversation(activeConversation);
      setStatus("");
    } catch (error) {
      console.error("LOAD CHAT ERROR:", error);
      setStatus("Failed to load chats.");
    }
  }, [conversationId]);

  /*
   * Load logged-in user once.
   */
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  /*
   * When the route changes:
   * 1. clear the old conversation immediately
   * 2. load the new one
   * 3. mark ONLY that conversation as read
   */
  useEffect(() => {
    if (!conversationId) return;

    setSelectedConversation(null);
    setMessage("");
    setStatus("Loading chat...");

    async function openConversation() {
      await loadConversations();
      await markConversationRead(conversationId);

      /*
       * Reload once after marking read so sidebar
       * unread badges update immediately.
       */
      await loadConversations();
    }

    openConversation();
  }, [
    conversationId,
    loadConversations,
    markConversationRead,
  ]);

  /*
   * Poll for new messages.
   *
   * GET /api/chat no longer marks everything read,
   * so polling is now safe.
   */
  useEffect(() => {
    if (!conversationId) return;

    const interval = window.setInterval(async () => {
      await loadConversations();

      /*
       * Since this conversation is currently open,
       * incoming messages can be marked read here.
       */
      await markConversationRead(conversationId);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    conversationId,
    loadConversations,
    markConversationRead,
  ]);

  async function sendMessage() {
    const text = message.trim();

    if (
      !selectedConversation ||
      !text ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          conversationId:
            selectedConversation.id,
          text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to send message."
        );
        return;
      }

      setMessage("");

      await loadConversations();
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function openConversation(conversation: any) {
    if (!conversation?.id) return;

    if (conversation.id === conversationId) {
      setSelectedConversation(conversation);
      return;
    }

    setMessage("");

    router.push(`/chat/${conversation.id}`);
  }

  function backToInbox() {
    router.push("/chat");
  }

  return (
    <main
      className="
        h-[100dvh]
        overflow-hidden
        bg-[#020817]
        text-white
      "
    >
      <Navbar />

      <section
        className="
          flex
          h-[calc(100dvh-80px)]
          min-h-0
          overflow-hidden
        "
      >
        {/* Desktop sidebar */}
        <div
          className="
            hidden
            h-full
            min-h-0
            w-[360px]
            shrink-0
            md:block
            lg:w-[380px]
          "
        >
          <ChatSidebar
            conversations={conversations}
            currentUser={currentUser}
            selectedConversation={selectedConversation}
            setSelectedConversation={openConversation}
            status={status}
          />
        </div>

        {/* Active conversation */}
        <div
          className="
            h-full
            min-h-0
            min-w-0
            flex-1
            overflow-hidden
          "
        >
          <ChatScreen
            currentUser={currentUser}
            selectedConversation={selectedConversation}
            setSelectedConversation={backToInbox}
            message={message}
            setMessage={setMessage}
            sending={sending}
            sendMessage={sendMessage}
            quickReplies={quickReplies}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </section>
    </main>
  );
}