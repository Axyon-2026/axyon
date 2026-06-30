import MessageBubble from "./MessageBubble";

type MessageListProps = {
  messages: any[];
  currentUserId: string;
};

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  return (
    <>
      {messages?.map((msg: any) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isMine={msg.senderId === currentUserId}
        />
      ))}
    </>
  );
}