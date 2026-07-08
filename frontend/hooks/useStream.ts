"use client";

import { useRef } from "react";
import { useStore } from "../store/useStore";

export const useStream = () => {
  const {
  appendStream,
  addLog,
  incrementQueries,
} = useStore();

  const eventRef = useRef<EventSource | null>(null);
  const bufferRef = useRef<string>("");
  const fullResponse = useRef<string>("");

  const flushInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /* =========================
     FLUSH BUFFER
  ========================= */
  const startFlush = () => {
    if (flushInterval.current) return;

    flushInterval.current = setInterval(() => {
      if (!bufferRef.current) return;

      appendStream(bufferRef.current);
      bufferRef.current = "";
    }, 40); // ⚡ slightly faster
  };

  const stopFlush = () => {
    if (flushInterval.current) {
      clearInterval(flushInterval.current);
      flushInterval.current = null;
    }
  };

  /* =========================
     CONNECT SSE
  ========================= */
  const connect = () => {
    if (eventRef.current) return;

    addLog("🔌 Connecting SSE...");

    const es = new EventSource("http://localhost:8000/stream");
    eventRef.current = es;

    startFlush();

    es.onopen = () => {
  addLog(
    "✅ Research session started",
    "success"
  );

  useStore
    .getState()
    .setThinking(
      "🔍 Researching..."
    );
 };

    es.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // 🧠 THINKING
        if (data.type === "thinking") {
          useStore.getState().setThinking(data.content);
        }

        // ⚡ STREAM TOKENS
        if (data.token) {

          const current =
          fullResponse.current.length;

          if (current > 200) {
            useStore
               .getState()
               .setThinking(
                  "🧠 Analyzing..."
               );
          }

          if (current > 800) {
            useStore
              .getState()
              .setThinking(
                "📝 Summarizing..."
              );
          }  

          bufferRef.current += data.token;
          fullResponse.current += data.token;
        }

        // ✅ DONE
        if (data.done) {
          if (bufferRef.current) {
            appendStream(bufferRef.current);
            bufferRef.current = "";
          }

          const finalText = fullResponse.current.trim();

          if (finalText) {
            useStore.getState().replaceLastMessage(finalText);
          }

          useStore
            .getState()
            .setThinking("");

          addLog(
            "✅ Research Complete",
            "success"
         );

          fullResponse.current = "";

          es.close();
          eventRef.current = null;
          stopFlush();
        }

      } catch (error) {
  addLog(
    error instanceof Error
      ? `❌ ${error.message}`
      : "❌ Parse error",
    "error"
  );
}
    };

    es.onerror = () => {

      useStore
       .getState()
       .setThinking("");

      addLog(
        "❌ Stream Error",
        "error"
      );

    es.close();
      eventRef.current = null;
      stopFlush();
    };
  };


    /* =========================
      SEND QUERY
    ========================= */
    const sendQuery = async (query: string, files: File[] = []) => {
    try {
      addLog("📤 Sending query...");

      incrementQueries();

      addLog(
       "📤 Query submitted",
       "info"
     );
 
      // 🧠 RESET
      useStore.getState().setThinking("");
      useStore.getState().clearStream();

      // 🔥 SHOW INSTANT FEEDBACK (IMPORTANT)
      useStore.getState().addMessageToCurrent({
        id: crypto.randomUUID(),
        role: "ai",
        content: "🧠 Thinking...",
      });

      useStore
  .getState()
  .setThinking(
    "🔍 Researching..."
  );

  const formData = new FormData();

formData.append(
  "query",
  query
);

files.forEach((file) => {
  formData.append(
    "files",
    file
  );
});

const response = await fetch(
  "http://localhost:8000/query",
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  throw new Error(
    "Backend rejected request"
  );
}

      connect();

    } catch (error) {
  useStore
    .getState()
    .setThinking("");

  addLog(
    error instanceof Error
      ? `❌ ${error.message}`
      : "❌ Failed to send query",
    "error"
  );
}
  };

  return { sendQuery };
};