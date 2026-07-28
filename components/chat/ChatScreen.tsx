"use client";

import { useEffect, useRef, useState } from "react";

import CompleteDealModal from "./CompleteDealModal";
import ChatHeader from "./ChatHeader";
import CompactProductCard from "./CompactProductCard";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import QuickReplies from "./QuickReplies";
import EmptyChat from "./EmptyChat";

type Props = {
  currentUser: any;
  selectedConversation: any;
  setSelectedConversation: (conversation: any) => void;

  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;

  sending: boolean;
  sendMessage: () => void;

  quickReplies: string[];

  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatScreen({
  currentUser,
  selectedConversation,
  setSelectedConversation,
  message,
  setMessage,
  sending,
  sendMessage,
  quickReplies,
  messagesEndRef,
}: Props) {
  const [showDealModal, setShowDealModal] = useState(false);
  const [creatingDeal, setCreatingDeal] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousConversationRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef(0);

  const conversationId = selectedConversation?.id ?? null;
  const messages = selectedConversation?.messages || [];
  const messageCount = messages.length;

  useEffect(() => {
    if (!conversationId) return;

    const changedConversation =
      previousConversationRef.current !== conversationId;

    if (changedConversation) {
      previousConversationRef.current = conversationId;
      previousMessageCountRef.current = messageCount;

      requestAnimationFrame(() => {
        const container = scrollContainerRef.current;

        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });

      return;
    }

    const receivedNewMessage =
      messageCount > previousMessageCountRef.current;

    previousMessageCountRef.current = messageCount;

    if (!receivedNewMessage) return;

    const container = scrollContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    // Only auto-scroll when the user is already near the latest messages.
    if (distanceFromBottom < 180) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, [conversationId, messageCount, messagesEndRef]);

  if (!selectedConversation) {
    return <EmptyChat />;
  }

  async function completeDeal() {
    if (creatingDeal) return;

    try {
      setCreatingDeal(true);

      const res = await fetch("/api/deals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedConversation.productId,
          buyerId: selectedConversation.buyerId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to complete deal.");
        return;
      }

      setShowDealModal(false);

      // Keep the user inside chat.
      // The next conversation refresh will receive SOLD from the API.
      alert("Deal completed successfully.");
    } catch (error) {
      console.error("COMPLETE DEAL ERROR:", error);
      alert("Failed to complete deal.");
    } finally {
      setCreatingDeal(false);
    }
  }

  return (
    <section
      className="
        flex
        h-full
        min-h-0
        min-w-0
        flex-col
        overflow-hidden
        bg-[#020817]
      "
    >
      {/* Never part of message scrolling */}
      <div className="shrink-0">
        <ChatHeader
          conversation={selectedConversation}
          currentUser={currentUser}
          onBack={() => setSelectedConversation(null)}
        />

        <CompactProductCard
          product={selectedConversation.product}
          conversation={selectedConversation}
          currentUser={currentUser}
          onCompleteSale={() => setShowDealModal(true)}
        />
      </div>

      {/* ONLY this section scrolls */}
      <div
        ref={scrollContainerRef}
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          scroll-smooth
          px-3
          py-5
          sm:px-5
          md:px-6
          [overflow-anchor:none]
          [-webkit-overflow-scrolling:touch]
        "
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {messages.length === 0 && (
            <div className="py-10 text-center">
              <div className="text-3xl">👋</div>

              <p className="mt-3 font-bold text-white">
                Start the conversation
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Ask about availability, price or where to meet.
              </p>
            </div>
          )}

          <MessageList
            messages={messages}
            currentUserId={currentUser?.id}
          />

          <div
            ref={messagesEndRef}
            className="h-px shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Composer stays outside the scrolling region */}
      <div className="relative z-20 shrink-0 bg-[#071019]">
        <QuickReplies
          replies={quickReplies}
          onSelect={(reply) => setMessage(reply)}
        />

        <ChatInput
          message={message}
          setMessage={setMessage}
          sending={sending}
          sendMessage={sendMessage}
        />
      </div>

      <CompleteDealModal
        open={showDealModal}
        onClose={() => {
          if (!creatingDeal) {
            setShowDealModal(false);
          }
        }}
        loading={creatingDeal}
        onContinue={completeDeal}
      />
    </section>
  );
}