"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readByBuyer?: boolean;
  readBySeller?: boolean;
};

type Participant = {
  id: string;
  name: string;
  profileImageUrl?: string | null;
  schoolName: string | null;
  schoolCity: string | null;
  classLevel: string | null;
  schoolVerified?: boolean;
};

type Product = {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  schoolName: string | null;
  schoolCity: string | null;
  status?: string;
};

type Conversation = {
  id: string;
  buyerId: string;
  sellerId: string;
  marketplaceType: string;
  product: Product | null;
  messages: Message[];
  buyer: Participant | null;
  seller: Participant | null;
};

type ChatResponse = {
  currentUserId: string;
  user: {
    id: string;
    name: string;
    profileImageUrl?: string | null;
    schoolName: string | null;
    schoolCity: string | null;
    classLevel: string | null;
    schoolVerified: boolean;
  };
  conversations: Conversation[];
};

export default function SchoolChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [conversationId, setConversationId] =
    useState("");

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );

  const inputRef = useRef<HTMLTextAreaElement | null>(
    null
  );

  const firstLoadRef = useRef(true);

  /*
   * Resolve the dynamic route once.
   */
  useEffect(() => {
    let active = true;

    async function resolveParams() {
      try {
        const resolved = await params;

        if (active) {
          setConversationId(resolved.id);
        }
      } catch {
        if (active) {
          setError(
            "Unable to open this conversation."
          );
          setLoading(false);
        }
      }
    }

    resolveParams();

    return () => {
      active = false;
    };
  }, [params]);

  /*
   * Scroll to the latest message.
   */
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      window.setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior,
          block: "end",
        });
      }, 50);
    },
    []
  );

  /*
   * Mark this conversation as read.
   */
  const markAsRead = useCallback(
    async (id: string) => {
      if (!id) return;

      try {
        await fetch(
          `/api/school/chat/${id}/read`,
          {
            method: "POST",
          }
        );
      } catch {
        /*
         * Read state is non-critical.
         * Never interrupt the chat because of it.
         */
      }
    },
    []
  );

  /*
   * Load only School Marketplace conversations.
   */
  const loadChat = useCallback(
    async (showLoading = false) => {
      if (!conversationId) return;

      if (showLoading) {
        setLoading(true);
      }

      try {
        setError("");

        const response = await fetch(
          "/api/school/chat",
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as Partial<ChatResponse> & {
            message?: string;
          };

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            window.location.href =
              "/school-marketplace/login";
            return;
          }

          throw new Error(
            data.message ||
              "Unable to load School Chat."
          );
        }

        const conversations =
          Array.isArray(data.conversations)
            ? data.conversations
            : [];

        const found = conversations.find(
          (item) =>
            item.id === conversationId &&
            item.marketplaceType === "SCHOOL"
        );

        if (!found) {
          setConversation(null);
          setError(
            "This School conversation is no longer available."
          );
          return;
        }

        if (data.currentUserId) {
          setCurrentUserId(data.currentUserId);
        }

        setConversation(found);

        /*
         * Mark incoming messages as read.
         */
        await markAsRead(conversationId);

        /*
         * Scroll only after the first successful load,
         * then keep the conversation at the bottom.
         */
        if (firstLoadRef.current) {
          firstLoadRef.current = false;
          scrollToBottom("auto");
        } else {
          scrollToBottom("smooth");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this conversation."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      conversationId,
      markAsRead,
      scrollToBottom,
    ]
  );

  /*
   * Initial load.
   */
  useEffect(() => {
    if (!conversationId) return;

    loadChat(true);
  }, [conversationId, loadChat]);

  /*
   * Lightweight refresh so a student can receive
   * new messages without manually refreshing.
   */
  useEffect(() => {
    if (!conversationId) return;

    const interval = window.setInterval(() => {
      loadChat(false);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [conversationId, loadChat]);

  /*
   * Auto-grow message input.
   */
  function handleTextChange(
    value: string
  ) {
    setText(value);

    const textarea = inputRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height =
      `${Math.min(textarea.scrollHeight, 140)}px`;
  }

  /*
   * Send School Chat message.
   */
  async function sendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmed = text.trim();

    if (
      !trimmed ||
      !conversation ||
      sending
    ) {
      return;
    }

    if (trimmed.length > 2000) {
      setError(
        "Your message is too long. Please keep it under 2000 characters."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        "/api/school/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId:
              conversation.id,
            text: trimmed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          window.location.href =
            "/school-marketplace/login";
          return;
        }

        throw new Error(
          data.message ||
            "Unable to send your message."
        );
      }

      setText("");

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      await loadChat(false);

      window.setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom("smooth");
      }, 50);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  /*
   * Retry loading after an error.
   */
  async function retry() {
    setRetrying(true);
    setError("");

    try {
      await loadChat(true);
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5">
          <div className="w-full text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.06] text-2xl shadow-2xl">
              💬
            </div>

            <div className="mx-auto mt-6 h-2 w-32 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-indigo-500" />
            </div>

            <p className="mt-5 text-sm font-bold text-slate-400">
              Opening School Chat...
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Please wait a moment
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="min-h-screen bg-[#070b14] px-4 py-6 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <a
            href="/school-marketplace/home"
            className="inline-flex items-center rounded-xl px-2 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            ← School Home
          </a>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-center shadow-2xl sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-indigo-500/10 text-4xl">
              💬
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight">
              Chat unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              {error ||
                "This conversation could not be loaded."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={retry}
                disabled={retrying}
                className="rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-black transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {retrying
                  ? "Trying again..."
                  : "Try Again"}
              </button>

              <a
                href="/school-marketplace/products"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-black text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Back to Marketplace
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const otherUser =
    currentUserId === conversation.sellerId
      ? conversation.buyer
      : conversation.seller;

  const otherName =
    otherUser?.name || "Student";

  const otherSchool =
    otherUser?.schoolName ||
    conversation.product?.schoolName ||
    "School";

  const otherCity =
    otherUser?.schoolCity ||
    conversation.product?.schoolCity ||
    "City";

  const otherClass =
    otherUser?.classLevel;

  const otherImage =
    otherUser?.profileImageUrl;

  return (
    <main className="min-h-[100dvh] bg-[#070b14] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col">

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070b14]/95 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <a
              href="/school-marketplace/products"
              aria-label="Back to marketplace"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              ←
            </a>

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-500/10 ring-1 ring-white/10">
              {otherImage ? (
                <img
                  src={otherImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  👤
                </span>
              )}

              {otherUser?.schoolVerified && (
                <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#070b14] bg-indigo-500 text-[8px] font-black">
                  ✓
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-black sm:text-base">
                  {otherName}
                </h1>

                {otherUser?.schoolVerified && (
                  <span className="hidden rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-300 sm:inline">
                    Verified
                  </span>
                )}
              </div>

              <p className="truncate text-xs text-slate-500">
                {otherSchool}
                {" · "}
                {otherCity}
                {otherClass
                  ? ` · Class ${otherClass}`
                  : ""}
              </p>
            </div>
          </div>
        </header>

        {/* CHAT CONTENT */}
        <div className="flex min-h-0 flex-1 flex-col">

          {/* PRODUCT CONTEXT */}
          {conversation.product && (
            <div className="px-4 pt-4 sm:px-6">
              <a
                href={`/school-marketplace/products/${conversation.product.id}`}
                className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 transition hover:bg-white/[0.07] sm:gap-4 sm:p-4"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/20 sm:h-16 sm:w-16">
                  {conversation.product.imageUrls?.[0] ? (
                    <img
                      src={
                        conversation.product
                          .imageUrls[0]
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      🛍️
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black sm:text-base">
                    {conversation.product.title}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-black text-indigo-300">
                      ₹
                      {conversation.product.price.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    <span className="text-xs text-slate-600">
                      ·
                    </span>

                    <span className="truncate text-xs text-slate-500">
                      Tap to view listing
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-slate-500">
                  ›
                </span>
              </a>
            </div>
          )}

          {/* MESSAGES */}
          <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6">
            {conversation.messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-16">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.04] text-3xl shadow-xl">
                    👋
                  </div>

                  <h2 className="mt-6 text-xl font-black tracking-tight">
                    Start the conversation
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Ask about the product,
                    condition, price or
                    availability.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {[
                      "Is this available?",
                      "Can you share more details?",
                      "Is the price negotiable?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setText(suggestion);

                          window.setTimeout(
                            () => {
                              inputRef.current?.focus();
                            },
                            50
                          );
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-slate-400 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-x-hidden">
                <div className="mb-6 flex justify-center">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                    School Chat
                  </span>
                </div>

                {conversation.messages.map(
                  (message, index) => {
                    const mine =
                      message.senderId ===
                      currentUserId;

                    const previous =
                      conversation.messages[
                        index - 1
                      ];

                    const sameSender =
                      previous?.senderId ===
                      message.senderId;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          mine
                            ? "justify-end"
                            : "justify-start"
                        } ${
                          sameSender
                            ? "mt-1"
                            : "mt-4"
                        }`}
                      >
                        <div
                          className={`flex max-w-[88%] items-end gap-2 sm:max-w-[75%] ${
                            mine
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {!sameSender ? (
                            <div className="hidden h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/[0.06] sm:flex">
                              {mine ? (
                                <div className="flex h-full w-full items-center justify-center text-xs">
                                  •
                                </div>
                              ) : otherImage ? (
                                <img
                                  src={otherImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs">
                                  👤
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="hidden h-7 w-7 shrink-0 sm:block" />
                          )}

                          <div
                            className={`rounded-[1.25rem] px-4 py-3 shadow-sm ${
                              mine
                                ? "rounded-br-md bg-indigo-600 text-white"
                                : "rounded-bl-md border border-white/10 bg-white/[0.07] text-slate-100"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-[14px] leading-6">
                              {message.text}
                            </p>

                            <div
                              className={`mt-1.5 flex items-center justify-end gap-1.5 text-[9px] font-bold ${
                                mine
                                  ? "text-indigo-200"
                                  : "text-slate-600"
                              }`}
                            >
                              <span>
                                {new Date(
                                  message.createdAt
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>

                              {mine && (
                                <span
                                  className={
                                    message.readByBuyer ||
                                    message.readBySeller
                                      ? "text-indigo-100"
                                      : ""
                                  }
                                >
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                <div
                  ref={messagesEndRef}
                  className="h-1"
                />
              </div>
            )}
          </section>

          {/* ERROR */}
          {error && (
            <div className="mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6">
              <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                  !
                </span>

                <p className="min-w-0 flex-1 text-xs font-bold leading-5 text-red-200">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={retry}
                  disabled={retrying}
                  className="shrink-0 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-black text-white transition hover:bg-white/[0.1] disabled:opacity-50"
                >
                  {retrying
                    ? "..."
                    : "Retry"}
                </button>
              </div>
            </div>
          )}

          {/* COMPOSER */}
          <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#070b14]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-6 sm:pt-4">
            <form
              onSubmit={sendMessage}
              className="mx-auto flex w-full max-w-3xl items-end gap-2"
            >
              <div className="relative min-w-0 flex-1">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(event) =>
                    handleTextChange(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      window.innerWidth >= 640
                    ) {
                      event.preventDefault();

                      if (
                        text.trim() &&
                        !sending
                      ) {
                        event.currentTarget.form?.requestSubmit();
                      }
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Write a message..."
                  aria-label="Write a message"
                  disabled={sending}
                  className="max-h-[140px] min-h-[52px] w-full resize-none rounded-[1.25rem] border border-white/10 bg-white/[0.06] px-4 py-3.5 pr-12 text-sm leading-6 text-white outline-none placeholder:text-slate-600 transition focus:border-indigo-400/50 focus:bg-white/[0.08] disabled:opacity-60"
                />

                <span className="pointer-events-none absolute bottom-2 right-3 text-[9px] font-bold text-slate-700">
                  {text.length}/2000
                </span>
              </div>

              <button
                type="submit"
                disabled={
                  sending ||
                  !text.trim()
                }
                aria-label="Send message"
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[1.25rem] bg-indigo-600 text-lg font-black shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "➤"
                )}
              </button>
            </form>

            <p className="mx-auto mt-2 hidden max-w-3xl text-[10px] font-bold text-slate-700 sm:block">
              Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}