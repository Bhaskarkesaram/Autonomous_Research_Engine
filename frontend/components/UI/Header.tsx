"use client";

import ExportPDF from "../ExportPDF";
import {
  Sparkles,
  Cpu,
  Activity,
  Database,
} from "lucide-react";

export default function Header() {
  return (
    <div
      className="
      px-6
      py-4
      border-b
      border-white/10
      bg-white/[0.02]
      backdrop-blur-xl
      flex
      items-center
      justify-between
    "
    >
      {/* Left Side */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles
            size={18}
            className="text-emerald-400"
          />

          <h1 className="font-semibold text-lg">
            AI Research Workspace
          </h1>
        </div>

        <p className="text-xs text-zinc-500 mt-1">
          Multi-Agent Cognitive Engine
        </p>
      </div>

      {/* Center Stats */}
      <div className="hidden lg:flex items-center gap-6">

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Cpu size={15} />
          <span>Llama 3.3</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Activity size={15} />
          <span>Online</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Database size={15} />
          <span>MongoDB</span>
        </div>

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <ExportPDF />
      </div>
    </div>
  );
}