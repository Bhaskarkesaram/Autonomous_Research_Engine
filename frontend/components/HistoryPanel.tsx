"use client";

import { useStore } from "../store/useStore";
import {
  History,
  Clock3,
  Sparkles,
} from "lucide-react";

export default function HistoryPanel() {
  const { history } = useStore();

  return (
    <div
      className="
      rounded-2xl
      border
      border-white/10
      bg-zinc-900/70
      backdrop-blur-xl
      overflow-hidden
    "
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <History
            size={18}
            className="text-blue-400"
          />

          <h3 className="font-semibold">
            Research History
          </h3>
        </div>

        <p className="text-xs text-zinc-500 mt-1">
          Previous AI activities
        </p>
      </div>

      {/* History List */}
      <div className="max-h-[400px] overflow-y-auto p-3 space-y-3">
        {history.length === 0 ? (
          <div
            className="
            flex
            flex-col
            items-center
            justify-center
            py-10
            text-zinc-500
          "
          >
            <Sparkles size={24} />

            <p className="mt-2 text-sm">
              No research history yet
            </p>
          </div>
        ) : (
          history.map((item, i) => (
            <div
              key={i}
              className="
              p-3
              rounded-xl
              bg-white/5
              border
              border-white/5
              hover:bg-white/10
              transition
            "
            >
              <div className="flex items-start gap-2">
                <Clock3
                  size={14}
                  className="
                  mt-1
                  text-zinc-500
                  shrink-0
                "
                />

                <div className="text-sm text-zinc-200 break-words">
                  {item}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}