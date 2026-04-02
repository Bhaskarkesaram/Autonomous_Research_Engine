"use client";

import { User, Bot, Copy } from "lucide-react";
import { useState } from "react";
import { useStore } from "../../store/useStore";

type Props = {
  role: "user" | "ai";
  content: string;
};

export default function MessageBubble({ role, content }: Props) {
  const [copied, setCopied] = useState(false);

  const {
    currentChatId,
    conversations,
    pinMessage,
    unpinMessage,
    toggleSelectMessage,
    selectedMessages,
  } = useStore();

  const currentChat = conversations.find(
    (c) => c.id === currentChatId
  );

  const isPinned = (currentChat?.pinnedMessages || []).some(
    (m) => m.content === content
  );

  const isSelected = selectedMessages.some(
    (m) => m.content === content
  );

  /* COPY */
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`flex items-center gap-2 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {/* ☑ SELECT */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() =>
          toggleSelectMessage({ role, content })
        }
      />

      {/* 🤖 AI AVATAR */}
      {role === "ai" && (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
          <Bot size={16} />
        </div>
      )}

      {/* 💬 MESSAGE */}
      <div
        className={`
          relative group px-4 py-3 rounded-2xl max-w-[70%] text-sm leading-relaxed shadow-md
          ${
            role === "user"
              ? "bg-blue-600 text-white"
              : "bg-white/5 backdrop-blur-md border border-white/10 text-gray-100"
          }
          ${isPinned ? "ring-2 ring-yellow-400/70" : ""}
        `}
      >
        {/* TEXT */}
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>

        {/* 📋 COPY (AI ONLY) */}
        {role === "ai" && (
          <button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 
            bg-black/50 p-1 rounded transition"
          >
            <Copy size={14} />
          </button>
        )}

        {/* 📌 PIN / UNPIN */}
        <button
          onClick={() =>
            isPinned
              ? unpinMessage(currentChatId, { role, content })
              : pinMessage(currentChatId, { role, content })
          }
          className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 
          bg-black/50 px-2 py-0.5 rounded text-xs hover:bg-yellow-500/50 transition"
        >
          {isPinned ? "Unpin" : "Pin"}
        </button>

        {/* ⭐ PIN INDICATOR */}
        {isPinned && (
          <div className="absolute -left-2 top-2 text-yellow-400 text-xs">
            📌
          </div>
        )}

        {/* ✅ COPY FEEDBACK */}
        {copied && (
          <div className="absolute -top-6 right-0 text-xs text-green-400">
            Copied!
          </div>
        )}
      </div>

      {/* 👤 USER AVATAR */}
      {role === "user" && (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600">
          <User size={16} />
        </div>
      )}
    </div>
  );
}