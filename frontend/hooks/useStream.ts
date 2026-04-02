
"use client";

import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";

export const useStream = () => {
  const { appendStream, addLog, addMessageToCurrent } = useStore();

  /* =========================
     TYPED REFS (FIX)
  ========================= */
  const eventRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const bufferRef = useRef<string>("");
  const fullResponse = useRef<string>("");

  const retryCount = useRef<number>(0);
  const flushInterval = useRef<NodeJS.Timeout | null>(null);

  /* =========================
     FLUSH BUFFER
  ========================= */
  const startFlush = () => {
    if (flushInterval.current) return;

    flushInterval.current = setInterval(() => {
      if (!bufferRef.current) return;

      appendStream(bufferRef.current);
      bufferRef.current = "";
    }, 50);
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

    const es = new EventSource("http://127.0.0.1:8000/stream");
    eventRef.current = es;

    startFlush();

    es.onopen = () => {
      addLog("✅ SSE Connected");
      retryCount.current = 0;
    };

    es.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.token) {
          bufferRef.current += data.token;
          fullResponse.current += data.token;
        }

        if (data.log) {
          addLog(data.log);
        }

        if (data.done) {
          if (bufferRef.current) {
            appendStream(bufferRef.current);
            bufferRef.current = "";
          }

          const finalText = fullResponse.current.trim();

          if (finalText) {
            addMessageToCurrent({
              role: "ai",
              content: finalText,
            });
          }

          fullResponse.current = "";
        }

      } catch {
        addLog("❌ Parse error");
      }
    };

    es.onerror = () => {
      addLog("⚠ SSE error");

      if (eventRef.current) {
        eventRef.current.close();
        eventRef.current = null;
      }

      stopFlush();

      retryCount.current += 1;

      const delay = Math.min(1000 * 2 ** retryCount.current, 10000);

      addLog(`🔄 Reconnecting in ${delay}ms`);

      reconnectRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  };

  /* =========================
     EFFECT
  ========================= */
  useEffect(() => {
    connect();

    return () => {
      addLog("🔌 Cleanup SSE");

      stopFlush();

      if (eventRef.current) {
        eventRef.current.close();
        eventRef.current = null;
      }

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      bufferRef.current = "";
      fullResponse.current = "";
    };
  }, []);
};
