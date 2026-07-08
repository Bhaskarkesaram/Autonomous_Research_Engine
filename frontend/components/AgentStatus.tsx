"use client";

import { useStore } from "../store/useStore";

export default function AgentStatus() {
  const { thinking } = useStore();

  if (!thinking) return null;

  return (
    <div
      className="
      mb-4
      px-4
      py-3
      rounded-xl
      bg-blue-500/10
      border
      border-blue-500/20
      text-blue-300
      text-sm
      animate-pulse
    "
    >
      {thinking}
    </div>
  );
}