
"use client";

import { useState, useRef } from "react";
import { useStore, Message } from "../store/useStore";
import axios from "axios";
import { Send, Mic, Upload, X } from "lucide-react";

export default function QueryInput() {
  const {
    query,
    setQuery,
    addConversation,
    addMessageToCurrent,
    replaceLastMessage, // 🔥 IMPORTANT
    conversations,
    setError,
    clearStream,
    addLog,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* =========================
     🎤 VOICE INPUT
  ========================= */
  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice not supported");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (e: any) => {
        setQuery(e.results[0][0].transcript);
      };

      recognitionRef.current.onerror = () => {
        setError("Voice recognition error");
        setListening(false);
      };

      recognitionRef.current.onend = () => setListening(false);
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }

    setListening(!listening);
  };

  /* =========================
     📂 FILE HANDLING
  ========================= */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);

    const uniqueFiles = droppedFiles.filter(
      (f) => !files.some((existing) => existing.name === f.name)
    );

    setFiles((prev) => [...prev, ...uniqueFiles]);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  /* =========================
     🚀 SEND QUERY (OPTIMIZED)
  ========================= */
  const handleSubmit = async () => {
    if (!query.trim() || loading) return;

    const trimmed = query.trim();

    const newMessage: Message = {
      role: "user",
      content: trimmed,
    };

    /* 🧠 ADD USER MESSAGE */
    if (conversations.length === 0) {
      addConversation({
        id: crypto.randomUUID(),
        title: trimmed,
        messages: [newMessage],
      });
    } else {
      addMessageToCurrent(newMessage);
    }

    /* 🔥 RESET STREAM */
    clearStream();

    /* ⚡ INSTANT AI PLACEHOLDER */
    addMessageToCurrent({
      role: "ai",
      content: "Thinking...",
    });

    setLoading(true);
    setError(null);
    addLog("🚀 Sending query");

    /* CANCEL PREVIOUS */
    if (abortRef.current) {
      abortRef.current.abort();
    }

    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("query", trimmed);

      files.forEach((file) => {
        formData.append("files", file);
      });

      /* ⚡ FIRE REQUEST */
      const res = await axios.post(
        "http://127.0.0.1:8000/query",
        formData,
        {
          signal: abortRef.current.signal,
        }
      );

      /* ⚡ REPLACE WITH FAST PREVIEW */
      if (res.data?.response) {
        replaceLastMessage(res.data.response);
      }

      addLog("✅ Query sent");

    } catch (err: any) {
      if (axios.isCancel(err)) {
        addLog("⚠ Request cancelled");
      } else {
        console.error(err);
        setError("Server error. Try again.");
        addLog("❌ Query failed");
      }
    } finally {
      setLoading(false);
      setQuery("");
      setFiles([]);
    }
  };

  /* =========================
     ⌨️ ENTER SUPPORT
  ========================= */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all
      ${
        dragActive
          ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
          : "border-white/10 bg-white/5"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded"
            >
              📎 {file.name}
              <button onClick={() => removeFile(file.name)}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* INPUT ROW */}
      <div className="flex items-center gap-2">

        {/* UPLOAD */}
        <label className="p-2 bg-white/10 rounded-lg cursor-pointer">
          <Upload size={16} />
          <input
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const selected = e.target.files
                ? Array.from(e.target.files)
                : [];
              setFiles((prev) => [...prev, ...selected]);
            }}
          />
        </label>

        {/* INPUT */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="Ask anything..."
        />

        {/* MIC */}
        <button
          onClick={handleVoice}
          className={`p-2 rounded-lg ${
            listening ? "bg-red-500" : "bg-white/10"
          }`}
        >
          <Mic size={16} />
        </button>

        {/* SEND */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-3 py-1 rounded-lg ${
            loading
              ? "bg-blue-600/50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "..." : <Send size={16} />}
        </button>

      </div>
    </div>
  );
}
