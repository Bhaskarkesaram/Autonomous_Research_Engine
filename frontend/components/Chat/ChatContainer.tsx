"use client";

import { useStore } from "../../store/useStore";
import { motion } from "framer-motion";
import { useEffect, useRef, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

export default function ChatContainer() {
  const { conversations, currentChatId, stream, error, thinking } = useStore();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentChat = useMemo(
    () => conversations.find((c) => c.id === currentChatId),
    [conversations, currentChatId]
  );

  const messages = currentChat?.messages ?? [];
  const isStreaming = Boolean(stream);

  useEffect(() => {
    if (!autoScroll) return;
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length, stream, autoScroll]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    setAutoScroll(isNearBottom);
  };

  const copyText = async (
    text: string,
    id: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch {
      console.error("Copy failed");
    }
  };

  const renderedMessages = useMemo(() => {
    if (!mounted) return null;

    return messages.map((msg, i) => {
      const id = `${i}-${msg.role}`;

      const isLast =
        i === messages.length - 1;

      if (
        isStreaming &&
        msg.role === "ai" &&
        isLast
      ) {
        return null;
      }

      const isUser =
        msg.role === "user";

      return (
        <motion.div
          key={id}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className={`flex ${
            isUser
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <div className="flex gap-3 w-full max-w-5xl">

            {!isUser && (
              <div
                className="
                w-10
                h-10
                rounded-full
                bg-gradient-to-br
                from-emerald-500
                to-green-600
                flex
                items-center
                justify-center
                shadow-lg
                shrink-0
              "
              >
                <Bot size={18} />
              </div>
            )}

            <div
              className={`
                relative
                group
                rounded-3xl
                px-5
                py-4
                shadow-xl
                max-w-full
                ${
                  isUser
                    ? `
                      ml-auto
                      bg-gradient-to-r
                      from-blue-600
                      to-blue-500
                      text-white
                    `
                    : `
                      bg-gradient-to-br
                      from-zinc-900
                      to-zinc-800
                      border
                      border-white/10
                      text-zinc-100
                    `
                }
              `}
            >
              {!isUser && (
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} />

                  <span
                    className="
                    text-xs
                    font-medium
                    text-zinc-400
                  "
                  >
                    AI Research Engine
                  </span>
                </div>
              )}

              <div
                className="
                prose
                prose-invert
                max-w-none
                text-sm
                leading-7
              "
              >
                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                  ]}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              {!isUser && (
                <button
                  onClick={() =>
                    copyText(
                      msg.content,
                      id
                    )
                  }
                  className="
                    absolute
                    top-3
                    right-3
                    opacity-0
                    group-hover:opacity-100
                    transition
                    p-2
                    rounded-lg
                    bg-black/30
                    hover:bg-black/50
                  "
                >
                  {copiedId === id ? (
                    <Check
                      size={14}
                    />
                  ) : (
                    <Copy
                      size={14}
                    />
                  )}
                </button>
              )}
            </div>

            {isUser && (
              <div
                className="
                w-10
                h-10
                rounded-full
                bg-gradient-to-br
                from-blue-500
                to-blue-700
                flex
                items-center
                justify-center
                shadow-lg
                shrink-0
              "
              >
                <User size={18} />
              </div>
            )}
          </div>
        </motion.div>
      );
    });
  }, [
    messages,
    copiedId,
    mounted,
    isStreaming,
  ]);

  if (!mounted) {
    return (
      <div
        className="
        flex
        items-center
        justify-center
        h-full
        text-zinc-500
      "
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          flex-1
          overflow-y-auto
          space-y-8
          px-6
          py-8
        "
      >
        {error && (
          <div
            className="
            bg-red-500/10
            border
            border-red-500/30
            text-red-300
            rounded-xl
            px-4
            py-3
          "
          >
            ⚠️ {error}
          </div>
        )}

        {messages.length === 0 &&
          !isStreaming && (
            <div
              className="
              flex
              items-center
              justify-center
              h-full
              text-zinc-500
            "
            >
             <div className="text-center">
              <Sparkles
               size={32}
               className="mx-auto mb-3 text-emerald-400"
              />

              <h2 className="text-lg font-semibold">
                Cognitive Research Engine
              </h2>

               <p className="text-zinc-500 mt-2">
                  Ask a question to begin research.
  </p>
</div>
            </div>
          )}

        {renderedMessages}

        {isStreaming && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-5xl">

              <div
                className="
                w-10
                h-10
                rounded-full
                bg-gradient-to-br
                from-emerald-500
                to-green-600
                flex
                items-center
                justify-center
                shadow-lg
              "
              >
                <Bot size={18} />
              </div>

              <div
                className="
                rounded-3xl
                px-5
                py-4
                bg-gradient-to-br
                from-zinc-900
                to-zinc-800
                border
                border-emerald-500/20
                shadow-xl
                text-zinc-100
              "
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles
                    size={14}
                    className="animate-pulse"
                  />

                  <span className="text-xs text-zinc-400">
                    {thinking || "Researching..."}
                  </span>
                </div>

                <div
                  className="
                  prose
                  prose-invert
                  max-w-none
                  text-sm
                  leading-7
                "
                >
                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                  ]}
                >
                  {stream
                    ? `${stream} ▌`
                    : "🔍 Initializing research..."}
                </ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}