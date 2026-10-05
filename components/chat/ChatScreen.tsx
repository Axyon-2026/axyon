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

  /*
   * Determine what this conversation is about.
   *
   * Product conversation:
   *   productId + product
   *
   * Accommodation conversation:
   *   roomId + room
   */
  const isAccommodation = Boolean(
    selectedConversation?.roomId || selectedConversation?.room
  );

  const isItem = Boolean(
    selectedConversation?.productId || selectedConversation?.product
  );

  const productTitle =
    selectedConversation?.product?.title ||
    selectedConversation?.product?.name ||
    "Item";

  const roomTitle =
    selectedConversation?.room?.title ||
    selectedConversation?.room?.name ||
    selectedConversation?.room?.roomType ||
    "Accommodation";

  const contextTitle = isAccommodation ? roomTitle : productTitle;

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
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#020817]">
      {/* Header + listing context never participate in message scrolling */}
      <div className="shrink-0">
        <ChatHeader
          conversation={selectedConversation}
          currentUser={currentUser}
          onBack={() => setSelectedConversation(null)}
        />

        {/* Conversation context */}
        <div className="border-b border-white/[0.07] bg-[#071019] px-3 py-2.5 sm:px-5">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                isAccommodation
                  ? "border-amber-400/15 bg-amber-400/10"
                  : "border-sky-400/15 bg-sky-400/10"
              }`}
            >
              <span className="text-base">
                {isAccommodation ? "🏠" : "📦"}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                {isAccommodation
                  ? "Accommodation conversation"
                  : "Item conversation"}
              </p>

              <p className="truncate text-sm font-bold text-white">
                {contextTitle}
              </p>
            </div>

            <div className="hidden shrink-0 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold text-slate-400 sm:block">
              {isAccommodation ? "🏠 Accommodation" : "📦 Item"}
            </div>
          </div>
        </div>

        {/* Existing product card is shown only for item conversations. */}
        {isItem && !isAccommodation && (
          <CompactProductCard
            product={selectedConversation.product}
            conversation={selectedConversation}
            currentUser={currentUser}
            onCompleteSale={() => setShowDealModal(true)}
          />
        )}
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
            <div className="my-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.15)] sm:my-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-2xl">
                {isAccommodation ? "🏠" : "👋"}
              </div>

              <p className="mt-4 font-bold text-white">
                {isAccommodation
                  ? "Ask about this accommodation"
                  : "Start the conversation"}
              </p>

              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-400">
                {isAccommodation
                  ? "Ask about availability, rent, location or when you can meet."
                  : "Ask about availability, price or where to meet."}
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
      <div className="relative z-20 shrink-0 border-t border-white/[0.06] bg-[#071019] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-4xl">
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
      </div>

      {/* Complete-sale flow remains unchanged and is only meaningful
          for product/item conversations. */}
      <CompleteDealModal
        open={showDealModal && isItem && !isAccommodation}
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