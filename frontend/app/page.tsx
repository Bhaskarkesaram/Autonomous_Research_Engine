"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { useStream } from "../hooks/useStream";
import { useStore } from "../store/useStore";

import QueryInput from "../components/QueryInput";
import ChatContainer from "../components/Chat/ChatContainer";
import WelcomeScreen from "../components/UI/WelcomeScreen";

import Header from "../components/UI/Header";
import Navbar from "../components/UI/Navbar";
import AgentStatus from "../components/AgentStatus";
const Sidebar = dynamic(
  () => import("../components/Sidebar/Sidebar"),
  {
    ssr: false,
  }
);

export default function Home() {
  const { setError, conversations } = useStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      console.log("🚀 AI Engine Initialized");
    } catch (err) {
      console.error("Init error:", err);
      setError("Failed to load chats");
    }
  }, [setError]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useStream();

  // ✅ Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0b0b0b] text-white overflow-hidden">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AgentStatus />
            
            {conversations.length === 0 ? (
              <WelcomeScreen />
            ) : (
              <ChatContainer />
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 bg-white/[0.03] backdrop-blur-xl px-4 py-4">
            <QueryInput />
          </div>
        </div>
      </div>
    </div>
  );
}