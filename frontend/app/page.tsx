
"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

import { useStream } from "../hooks/useStream";
import { useStore } from "../store/useStore";

import QueryInput from "../components/QueryInput";
import ChatContainer from "../components/Chat/ChatContainer";
// ❗ Sidebar as client-only (fix hydration)
const Sidebar = dynamic(() => import("../components/Sidebar/Sidebar"), {
  ssr: false,
});

import Header from "../components/UI/Header";
import LogsPanel from "../components/LogsPanel";
import AgentSelector from "../components/UI/AgentSelector";
import FileUpload from "../components/UI/FileUpload";
import Navbar from "../components/UI/Navbar";

export default function Home() {
  const { fetchChats, setError } = useStore();

  useEffect(() => {
    const init = async () => {
      try {
        await fetchChats();
      } catch (err) {
        console.error("Init error:", err);
        setError("Failed to load chats");
      }
    };
    init();
  }, []);

  useStream();

  return (
    <div className="h-screen flex flex-col bg-[#0b0b0b] text-white">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Header />

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <ChatContainer />
          </div>

          <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
            <QueryInput />
          </div>
        </div>
      </div>
    </div>
  );
}

