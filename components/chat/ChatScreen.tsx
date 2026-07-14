"use client";

import { useState } from "react";
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
  if (!selectedConversation) {
    return <EmptyChat />;
  }
  const [showDealModal, setShowDealModal] = useState(false);
  const [finalPrice, setFinalPrice] = useState(
    selectedConversation.product.price,
  );

  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [creatingDeal, setCreatingDeal] = useState(false);

  async function completeDeal() {
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
          finalPrice: Number(finalPrice),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Deal request sent successfully!");

      setShowDealModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to create deal.");
    } finally {
      setCreatingDeal(false);
    }
  }
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#020817]">
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

      <div
        className="
          flex-1
          overflow-y-auto
          px-4
          py-4
          space-y-4
          overscroll-contain
        "
      >
        <MessageList
          messages={selectedConversation.messages || []}
          currentUserId={currentUser?.id}
        />

        <div ref={messagesEndRef} />
      </div>

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

      <CompleteDealModal
        open={showDealModal}
        onClose={() => setShowDealModal(false)}
        finalPrice={finalPrice}
        setFinalPrice={setFinalPrice}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        loading={creatingDeal}
        onContinue={completeDeal}
      />
    </div>
  );
}
