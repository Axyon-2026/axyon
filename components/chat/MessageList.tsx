"use client";

import MessageBubble from "./MessageBubble";

type MessageListProps = {
  messages: any[];
  currentUserId: string;
};

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  if (!messages?.length) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2.5 sm:gap-3">
      {messages.map((msg: any) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isMine={msg.senderId === currentUserId}
        />
      ))}
    </div>
  );
}