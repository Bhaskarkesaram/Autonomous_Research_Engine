
"use client";

import { useStore } from "../../store/useStore";
import ChatItem from "./ChatItem";
import { PlusCircle, MessageSquare, Folder, Star, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";

type FolderType = {
  id: string;
  name: string;
};

type ChatType = {
  id: string;
  title: string;
  folderId?: string;
  pinned?: boolean;
  createdAt?: number;
};

export default function Sidebar() {
  const {
    conversations,
    createNewChat,
    search,
    setSearch,
    folders,
    addFolder,
    assignFolder,
    togglePin,
    deleteChat,
    sidebarOpen,   // 🔥 NEW
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const toggleFolder = (id: string) => {
    setCollapsedFolders((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) setLocalSearch(search);
  }, [mounted, search]);

  useEffect(() => {
    if (!mounted) return;

    const t = setTimeout(() => {
      setSearch(localSearch);
    }, 300);

    return () => clearTimeout(t);
  }, [localSearch, mounted, setSearch]);

  const filtered = useMemo(() => {
    if (!mounted) return [];

    return conversations.filter((c: ChatType) =>
      (c.title || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [conversations, search, mounted]);

  const now = new Date();

  const today: ChatType[] = [];
  const yesterday: ChatType[] = [];
  const older: ChatType[] = [];

  filtered.forEach((chat: ChatType) => {
    const date = new Date(chat.createdAt || Date.now());

    const diff =
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diff < 1) today.push(chat);
    else if (diff < 2) yesterday.push(chat);
    else older.push(chat);
  });

  const grouped = useMemo(() => {
    if (!mounted) return {};

    const map: Record<string, ChatType[]> = {};

    filtered.forEach((c: ChatType) => {
      const key = c.folderId || "ungrouped";
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });

    return map;
  }, [filtered, mounted]);

  if (!mounted) {
    return <div className="w-[280px] p-4 text-gray-400">Loading...</div>;
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 0 }}
      transition={{ duration: 0.25 }}
      className="h-full bg-white/5 border-r border-white/10 overflow-hidden flex flex-col"
    >
      <div className={`${sidebarOpen ? "p-4" : "p-0"} flex flex-col h-full`}>

        {/* NEW CHAT */}
        <button
          onClick={createNewChat}
          className="flex items-center justify-center gap-2 bg-blue-600 p-2 rounded mb-4"
        >
          <PlusCircle size={16} />
          New Chat
        </button>

        {/* SEARCH */}
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search..."
          className="p-2 mb-3 bg-white/5 rounded text-sm"
        />

        {/* PINNED */}
        {filtered.some((c) => c.pinned) && (
          <div className="mb-3">
            <div className="text-xs text-yellow-400 mb-1">⭐ Pinned</div>
            {filtered.filter((c) => c.pinned).map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        )}

        {/* TODAY */}
        {today.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Today</div>
            {today.filter(c => !c.pinned).map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        )}

        {/* YESTERDAY */}
        {yesterday.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Yesterday</div>
            {yesterday.filter(c => !c.pinned).map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        )}

        {/* FOLDERS */}
        <div className="mb-4 space-y-2">
          <div className="text-xs text-gray-400 flex gap-1 items-center">
            <Folder size={14} /> Folders
          </div>

          {folders.map((f: FolderType) => {
            const collapsed = collapsedFolders.includes(f.id);

            return (
              <div key={f.id}>
                <div
                  onClick={() => toggleFolder(f.id)}
                  className="p-2 rounded cursor-pointer flex justify-between hover:bg-white/10"
                >
                  📁 {f.name}
                  <span>{collapsed ? "▶" : "▼"}</span>
                </div>

                {!collapsed &&
                  (grouped[f.id] || []).map((chat: ChatType) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))}
              </div>
            );
          })}

          <button
            onClick={() => {
              const name = prompt("Folder name");
              if (name) addFolder(name);
            }}
            className="text-xs text-blue-400"
          >
            + New Folder
          </button>
        </div>

        {/* UNGROUPED */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {(grouped["ungrouped"] || []).map((chat: ChatType) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}

          {filtered.length === 0 && (
            <div className="text-gray-400 text-sm mt-10 flex flex-col items-center">
              <MessageSquare size={24} />
              No chats
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}