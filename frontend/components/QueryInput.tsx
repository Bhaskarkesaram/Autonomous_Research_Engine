"use client";

import { useState, useRef } from "react";
import { useStore } from "../store/useStore";
import { useStream } from "../hooks/useStream";

import {
  Send,
  Mic,
  Upload,
  X,
  Sparkles,
  Paperclip,
} from "lucide-react";

export default function QueryInput() {
  const {
    query,
    setQuery,
    addMessageToCurrent,
    setError,
  } = useStore();

  const { sendQuery } = useStream();

  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const recognitionRef = useRef<any>(null);

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice not supported");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current =
        new SpeechRecognition();

      recognitionRef.current.lang =
        "en-US";

      recognitionRef.current.onresult =
        (e: any) => {
          setQuery(
            e.results[0][0].transcript
          );
        };

      recognitionRef.current.onerror =
        () => {
          setError(
            "Voice recognition error"
          );
          setListening(false);
        };

      recognitionRef.current.onend =
        () => setListening(false);
    }

    listening
      ? recognitionRef.current.stop()
      : recognitionRef.current.start();

    setListening(!listening);
  };

  const handleDrop = (
    e: React.DragEvent
  ) => {
    e.preventDefault();

    setDragActive(false);

    const droppedFiles =
      Array.from(
        e.dataTransfer.files
      );

    const uniqueFiles =
      droppedFiles.filter(
        (f) =>
          !files.some(
            (existing) =>
              existing.name === f.name
          )
      );

    setFiles((prev) => [
      ...prev,
      ...uniqueFiles,
    ]);
  };

  const removeFile = (
    name: string
  ) => {
    setFiles((prev) =>
      prev.filter(
        (f) => f.name !== name
      )
    );
  };

  const handleSubmit =
    async () => {
      if (
        !query.trim() ||
        loading
      )
        return;

      const trimmed =
        query.trim();

      addMessageToCurrent({
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      });

      setLoading(true);
      setError(null);

      try {
        await sendQuery(trimmed, files);
      } catch {
        console.error(
          "Error sending query"
        );
      } finally {
        setLoading(false);
        setQuery("");
        setFiles([]);
      }
    };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`
      rounded-3xl
      border
      backdrop-blur-xl
      transition-all
      shadow-2xl
      ${
        dragActive
          ? `
            border-blue-500
            bg-blue-500/10
            scale-[1.01]
          `
          : `
            border-white/10
            bg-zinc-900/70
          `
      }
    `}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() =>
        setDragActive(false)
      }
      onDrop={handleDrop}
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-b border-white/10">
          {files.map((file) => (
            <div
              key={file.name}
              className="
              flex
              items-center
              gap-2
              px-3
              py-1
              rounded-full
              bg-emerald-500/10
              text-xs
              border
              border-emerald-500/20
            "
            >
              <Paperclip size={12} />
              {file.name}

              <button
                onClick={() =>
                  removeFile(
                    file.name
                  )
                }
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3">

        <div className="flex items-center gap-3">

          <label
            className="
            p-2
            rounded-xl
            bg-white/5
            hover:bg-white/10
            cursor-pointer
            transition
          "
          >
            <Upload size={18} />

            <input
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const selected =
                  e.target.files
                    ? Array.from(
                        e.target.files
                      )
                    : [];

                setFiles((prev) => [
                  ...prev,
                  ...selected,
                ]);
              }}
            />
          </label>

          <input
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Ask anything, upload files, or start research..."
            className="
            flex-1
            bg-transparent
            outline-none
            text-sm
            placeholder:text-zinc-500
          "
          />

          <button
            onClick={
              handleVoice
            }
            className={`
            p-2
            rounded-xl
            transition
            ${
              listening
                ? "bg-red-500"
                : "bg-white/5 hover:bg-white/10"
            }
          `}
          >
            <Mic size={18} />
          </button>

          <button
            onClick={
              handleSubmit
            }
            disabled={loading}
            className={`
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            transition
            ${
              loading
                ? `
                  bg-blue-500/40
                  cursor-not-allowed
                `
                : `
                  bg-gradient-to-r
                  from-blue-600
                  to-blue-500
                  hover:from-blue-500
                  hover:to-blue-400
                `
            }
          `}
          >
            {loading ? (
              <>
                <Sparkles
                  size={16}
                  className="animate-spin"
                />
              </>
            ) : (
              <>
                <Send size={16} />
              </>
            )}
          </button>
        </div>

        <div
          className="
          mt-3
          text-xs
          text-zinc-500
          flex
          gap-4
        "
        >
          <span>
            ↵ Enter to send
          </span>

          <span>
            🎤 Voice input
          </span>

          <span>
            📎 File upload
          </span>
        </div>

      </div>
    </div>
  );
}