"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

import {
  Brain,
  Search,
  BarChart3,
  FileText,
} from "lucide-react";

const nodes = [
  {
    id: "1",
    position: { x: 50, y: 120 },
    data: {
      label: (
        <div className="text-center">
          <Brain
            size={24}
            className="mx-auto mb-2 text-violet-400"
          />
          <div className="font-semibold">
            Supervisor
          </div>
          <div className="text-xs text-zinc-400">
            Task Planning
          </div>
        </div>
      ),
    },
    style: {
      background: "#18181b",
      color: "white",
      border: "1px solid #3f3f46",
      borderRadius: "16px",
      width: 180,
      padding: 12,
    },
  },

  {
    id: "2",
    position: { x: 320, y: 40 },
    data: {
      label: (
        <div className="text-center">
          <Search
            size={24}
            className="mx-auto mb-2 text-blue-400"
          />
          <div className="font-semibold">
            Research Agent
          </div>
          <div className="text-xs text-zinc-400">
            Gather Information
          </div>
        </div>
      ),
    },
    style: {
      background: "#18181b",
      color: "white",
      border: "1px solid #3f3f46",
      borderRadius: "16px",
      width: 180,
      padding: 12,
    },
  },

  {
    id: "3",
    position: { x: 320, y: 220 },
    data: {
      label: (
        <div className="text-center">
          <BarChart3
            size={24}
            className="mx-auto mb-2 text-emerald-400"
          />
          <div className="font-semibold">
            Analysis Agent
          </div>
          <div className="text-xs text-zinc-400">
            Deep Reasoning
          </div>
        </div>
      ),
    },
    style: {
      background: "#18181b",
      color: "white",
      border: "1px solid #3f3f46",
      borderRadius: "16px",
      width: 180,
      padding: 12,
    },
  },

  {
    id: "4",
    position: { x: 620, y: 120 },
    data: {
      label: (
        <div className="text-center">
          <FileText
            size={24}
            className="mx-auto mb-2 text-orange-400"
          />
          <div className="font-semibold">
            Summarizer
          </div>
          <div className="text-xs text-zinc-400">
            Final Output
          </div>
        </div>
      ),
    },
    style: {
      background: "#18181b",
      color: "white",
      border: "1px solid #3f3f46",
      borderRadius: "16px",
      width: 180,
      padding: 12,
    },
  },
];

const edges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    animated: true,
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
  },
];

export default function AgentFlow() {
  return (
    <div
      className="
      h-[450px]
      rounded-3xl
      overflow-hidden
      border
      border-white/10
      bg-zinc-950
      shadow-2xl
    "
    >
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="font-semibold text-white">
          Multi-Agent Workflow
        </h2>

        <p className="text-sm text-zinc-500">
          Real-time cognitive pipeline
        </p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}