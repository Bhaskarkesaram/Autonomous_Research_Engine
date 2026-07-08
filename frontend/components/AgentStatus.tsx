"use client";

import { useStore } from "../store/useStore";

import {
  Brain,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function AgentStatus() {
  const { thinking } = useStore();

  if (!thinking) return null;

  const steps = [
    {
      icon: <Brain size={16} />,
      label: "Planning",
    },
    {
      icon: <Search size={16} />,
      label: "Researching",
    },
    {
      icon: <CheckCircle2 size={16} />,
      label: "Generating",
    },
  ];

  return (
    <div
      className="
      mb-4
      rounded-2xl
      border
      border-emerald-500/20
      bg-emerald-500/5
      p-4
      shadow-xl
    "
    >

      {/* HEADER */}
      <div
        className="
        flex
        items-center
        gap-2
        mb-3
      "
      >

        <Loader2
          size={18}
          className="
          animate-spin
          text-emerald-400
          "
        />

        <span
          className="
          text-sm
          font-semibold
          text-white
          "
        >
          Nexora Agent Working
        </span>

      </div>


      {/* CURRENT STATUS */}
      <div
        className="
        text-sm
        text-emerald-300
        mb-4
        "
      >
        {thinking}
      </div>


      {/* STEPS */}
      <div
        className="
        flex
        gap-3
        flex-wrap
      "
      >

        {steps.map((step) => (

          <div
            key={step.label}

            className="
            flex
            items-center
            gap-2

            px-3
            py-2

            rounded-full

            bg-white/5
            border
            border-white/10

            text-xs
            text-zinc-300
            "
          >

            <span
              className="
              text-emerald-400
              "
            >
              {step.icon}
            </span>

            {step.label}

          </div>

        ))}

      </div>


    </div>
  );
}