"use client";

import { useStore } from "../../store/useStore";
import ChatItem from "./ChatItem";

import {
  PlusCircle,
  MessageSquare,
  Folder,
  Search,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

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
    sidebarOpen,
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setLocalSearch(search);
    }
  }, [mounted, search]);

  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, mounted, setSearch]);

  const toggleFolder = (id: string) => {
    setCollapsedFolders((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    if (!mounted) return [];

    return conversations
      .filter((c: ChatType) =>
        (c.title || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          (b.createdAt || 0) -
          (a.createdAt || 0)
      );
  }, [conversations, search, mounted]);

  const grouped = useMemo(() => {
    if (!mounted) return {};

    const map: Record<string, ChatType[]> = {};

    filtered.forEach((c: ChatType) => {
      const key = c.folderId || "ungrouped";

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(c);
    });

    return map;
  }, [filtered, mounted]);

  if (!mounted) {
    return (
      <div className="w-[300px] p-4 text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{
        width: sidebarOpen ? 300 : 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
      h-full
      bg-gradient-to-b
      from-zinc-950
      to-black
      border-r
      border-white/10
      overflow-hidden
      flex
      flex-col
      backdrop-blur-xl
    "
    >
      <div
        className={`
        ${sidebarOpen ? "p-4" : "p-0"}
        flex
        flex-col
        h-full
      `}
      >
        {/* Logo */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-emerald-400"
            />

            <span className="font-semibold">
              AI Workspace
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-1">
            Cognitive Research Engine
          </p>
        </div>

        {/* New Chat */}
        <button
          onClick={createNewChat}
          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-blue-600
          to-blue-500
          hover:from-blue-500
          hover:to-blue-400
          transition
          p-3
          mb-4
          shadow-lg
        "
        >
          <PlusCircle size={18} />
          New Chat
        </button>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-zinc-500
          "
          />

          <input
            value={localSearch}
            onChange={(e) =>
              setLocalSearch(
                e.target.value
              )
            }
            placeholder="Search chats..."
            className="
            w-full
            pl-10
            pr-4
            py-2.5
            rounded-xl
            bg-white/5
            border
            border-white/10
            text-sm
            outline-none
          "
          />
        </div>

        {/* Pinned */}
        {filtered.some((c) => c.pinned) && (
          <div className="mb-5">
            <div
              className="
              text-xs
              uppercase
              tracking-wide
              text-yellow-400
              mb-2
            "
            >
              ⭐ Pinned
            </div>

            {filtered
              .filter((c) => c.pinned)
              .map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                />
              ))}
          </div>
        )}

        {/* Folders */}
        <div className="mb-5">
          <div
            className="
            flex
            items-center
            gap-2
            text-xs
            uppercase
            tracking-wide
            text-zinc-500
            mb-3
          "
          >
            <Folder size={14} />
            Folders
          </div>

          <div className="space-y-2">
            {folders.map(
              (f: FolderType) => {
                const collapsed =
                  collapsedFolders.includes(
                    f.id
                  );

                return (
                  <div key={f.id}>
                    <div
                      onClick={() =>
                        toggleFolder(
                          f.id
                        )
                      }
                      className="
                      flex
                      items-center
                      justify-between
                      px-3
                      py-2
                      rounded-lg
                      cursor-pointer
                      hover:bg-white/5
                    "
                    >
                      <div className="flex items-center gap-2">
                        <Folder
                          size={15}
                        />
                        {f.name}
                      </div>

                      {collapsed ? (
                        <ChevronRight
                          size={14}
                        />
                      ) : (
                        <ChevronDown
                          size={14}
                        />
                      )}
                    </div>

                    {!collapsed &&
                      (
                        grouped[
                          f.id
                        ] || []
                      ).map(
                        (
                          chat: ChatType
                        ) => (
                          <ChatItem
                            key={
                              chat.id
                            }
                            chat={chat}
                          />
                        )
                      )}
                  </div>
                );
              }
            )}
          </div>

          <button
            onClick={() => {
              const name =
                prompt(
                  "Folder name"
                );

              if (name) {
                addFolder(name);
              }
            }}
            className="
            mt-3
            text-sm
            text-blue-400
            hover:text-blue-300
          "
          >
            + New Folder
          </button>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto">
          {(grouped["ungrouped"] || [])
            .length > 0 && (
            <div
              className="
              text-xs
              uppercase
              tracking-wide
              text-zinc-500
              mb-3
            "
            >
              Recent Chats
            </div>
          )}

          <div className="space-y-2">
            {(grouped[
              "ungrouped"
            ] || []).map(
              (chat: ChatType) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                />
              )
            )}
          </div>

          {filtered.length === 0 && (
            <div
              className="
              text-zinc-500
              text-sm
              mt-12
              flex
              flex-col
              items-center
              gap-3
            "
            >
              <MessageSquare
                size={28}
              />
              No chats found
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="
          pt-4
          mt-4
          border-t
          border-white/10
          text-xs
          text-zinc-500
        "
        >
          AI Research Workspace v1.0
        </div>
      </div>
    </motion.div>
  );
}