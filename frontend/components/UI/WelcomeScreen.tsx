"use client";

import { useStore } from "../../store/useStore";

export default function WelcomeScreen() {
  const { setQuery } = useStore();

  const prompts = [
    "Explain Edge Computing",
    "LangGraph vs CrewAI",
    "Build ATS Friendly Resume",
    "Create DSA Roadmap",
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center">

      <h1 className="text-6xl font-bold mb-4">
        Research Faster.
      </h1>

      <h2 className="text-6xl font-bold mb-6">
        Think Smarter.
      </h2>

      <p className="text-zinc-400 max-w-2xl mb-10">
        Multi-Agent AI Workspace for Research,
        Learning, Resume Building and
        Technical Analysis.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setQuery(prompt)}
            className="
              px-4
              py-2
              rounded-full
              bg-white/5
              border
              border-white/10
              hover:bg-white/10
              transition
            "
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}