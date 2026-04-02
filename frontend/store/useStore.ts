
"use client";

import { create } from "zustand";

/* =========================
   TYPES
========================= */
export type Message = {
  id?: string;
  role: "user" | "ai";
  content: string;
};

type Folder = {
  id: string;
  name: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  folderId?: string;

  pinned?: boolean;
  createdAt?: number;
};

type Log = {
  id: string;
  message: string;
  type: "info" | "error" | "warn";
  time: number;
};

type State = {
  query: string;

  stream: string;
  streamBuffer: string[];

  logs: Log[];
  history: string[];

  conversations: Conversation[];
  currentChatId: string;

  folders: Folder[];
  search: string;

  selectedMessages: Message[];
  error: string | null;

  /* 🔥 SIDEBAR */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;

  setQuery: (q: string) => void;

  appendStream: (chunk: string) => void;
  flushStream: () => void;
  clearStream: () => void;

  addLog: (msg: string, type?: Log["type"]) => void;

  saveHistory: (entry: string) => void;

  setCurrentChat: (id: string) => void;
  addConversation: (conv: Conversation) => void;
  createNewChat: () => void;

  addMessageToCurrent: (msg: Message) => void;
  replaceLastMessage: (text: string) => void;

  clearMessages: () => void;

  setError: (err: string | null) => void;

  setSearch: (s: string) => void;

  addFolder: (name: string) => void;
  assignFolder: (chatId: string, folderId: string) => void;

  togglePin: (chatId: string) => void;
  deleteChat: (chatId: string) => void;

  fetchChats: () => Promise<void>;
  saveChatsToBackend: () => Promise<void>;
};

/* =========================
   LOCAL STORAGE
========================= */
const load = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("chat-storage") || "null");
  } catch {
    return null;
  }
};

const getSidebarState = () => {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("sidebar-open");
  return saved === null ? true : saved === "true";
};

const saved = load();

/* =========================
   STORE
========================= */
export const useStore = create<State>((set, get) => ({
  query: "",

  stream: "",
  streamBuffer: [],

  logs: [],
  history: [],

  conversations: saved?.conversations || [],
  currentChatId: saved?.currentChatId || "",

  folders: saved?.folders || [],
  search: "",

  selectedMessages: [],
  error: null,

  /* =========================
     🔥 SIDEBAR
  ========================= */
  sidebarOpen: getSidebarState(),

  toggleSidebar: () => {
    const next = !get().sidebarOpen;

    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-open", String(next));
    }

    set({ sidebarOpen: next });
  },

  setSidebar: (v) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-open", String(v));
    }

    set({ sidebarOpen: v });
  },

  /* =========================
     STREAM
  ========================= */
  appendStream: (chunk) =>
    set((s) => ({
      streamBuffer: [...s.streamBuffer, chunk],
    })),

  flushStream: () =>
    set((s) => {
      if (!s.streamBuffer.length) return s;

      return {
        stream: s.stream + s.streamBuffer.join(""),
        streamBuffer: [],
      };
    }),

  clearStream: () =>
    set({
      stream: "",
      streamBuffer: [],
    }),

  /* =========================
     LOGS
  ========================= */
  addLog: (message, type = "info") =>
    set((s) => ({
      logs: [
        ...s.logs,
        {
          id: crypto.randomUUID(),
          message,
          type,
          time: Date.now(),
        },
      ],
    })),

  /* =========================
     BASIC
  ========================= */
  setQuery: (q) => set({ query: q }),

  saveHistory: (entry) =>
    set((s) => ({ history: [entry, ...s.history] })),

  setCurrentChat: (id) => set({ currentChatId: id, stream: "" }),

  /* =========================
     CREATE CHAT
  ========================= */
  createNewChat: () => {
    const id = crypto.randomUUID();

    const newChat: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      pinned: false,
    };

    set((s) => ({
      conversations: [newChat, ...s.conversations],
      currentChatId: id,
    }));
  },

  addConversation: (conv) =>
    set((s) => ({
      conversations: [
        {
          ...conv,
          title: conv.title || "New Chat",
          createdAt: conv.createdAt || Date.now(),
          pinned: conv.pinned || false,
        },
        ...s.conversations,
      ],
      currentChatId: conv.id,
    })),

  /* =========================
     ADD MESSAGE
  ========================= */
  addMessageToCurrent: (msg) =>
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== s.currentChatId) return c;

        const newMessages = [...c.messages, msg];

        let title = c.title;

        if (c.messages.length === 0 && msg.role === "user") {
          title =
            msg.content.length > 40
              ? msg.content.slice(0, 40) + "..."
              : msg.content;
        }

        return {
          ...c,
          messages: newMessages,
          title,
        };
      }),
      stream: "",
      streamBuffer: [],
    })),

  replaceLastMessage: (text) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === s.currentChatId
          ? {
              ...c,
              messages:
                c.messages.length > 0
                  ? [
                      ...c.messages.slice(0, -1),
                      { role: "ai", content: text },
                    ]
                  : c.messages,
            }
          : c
      ),
    })),

  clearMessages: () =>
    set({
      conversations: [],
      currentChatId: "",
      stream: "",
      streamBuffer: [],
    }),

  setError: (err) => set({ error: err }),

  setSearch: (s) => set({ search: s }),

  addFolder: (name) =>
    set((s) => ({
      folders: [...s.folders, { id: crypto.randomUUID(), name }],
    })),

  assignFolder: (chatId, folderId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === chatId ? { ...c, folderId } : c
      ),
    })),

  togglePin: (chatId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === chatId ? { ...c, pinned: !c.pinned } : c
      ),
    })),

  deleteChat: (chatId) =>
    set((s) => {
      const updated = s.conversations.filter((c) => c.id !== chatId);

      return {
        conversations: updated,
        currentChatId: updated[0]?.id || "",
      };
    }),

  fetchChats: async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/get-chats");
      const data = await res.json();

      set({
        conversations: data.conversations || [],
        currentChatId: data.conversations?.[0]?.id || "",
      });
    } catch {
      set({ error: "Failed to load chats" });
    }
  },

  saveChatsToBackend: async () => {
    try {
      const state = get();

      await fetch("http://127.0.0.1:8000/save-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversations: state.conversations,
        }),
      });

      get().addLog("Saved chats");
    } catch {
      get().addLog("Save failed", "error");
    }
  },
}));

/* =========================
   AUTO SAVE
========================= */
let timer: ReturnType<typeof setTimeout>;

useStore.subscribe((state) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    "chat-storage",
    JSON.stringify({
      conversations: state.conversations,
      currentChatId: state.currentChatId,
      folders: state.folders,
    })
  );

  clearTimeout(timer);

  timer = setTimeout(() => {
    useStore.getState().saveChatsToBackend();
  }, 700);
});

/* =========================
   ⌨️ Ctrl + B Shortcut
========================= */
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      useStore.getState().toggleSidebar();
    }
  });
}
