"use client";

import { useState, type ReactNode } from "react";

export type PrepareTabId = "general" | "face" | "harmony" | "trivia" | "teams";

type Tab = {
  id: PrepareTabId;
  label: string;
};

const TABS: Tab[] = [
  { id: "general", label: "Ogólne" },
  { id: "face", label: "Czyj to ryj?" },
  { id: "harmony", label: "Jaka to harmonia?" },
  { id: "trivia", label: "Taki jesteś mądry?" },
  { id: "teams", label: "Zespoły" },
];

type PrepareTabsProps = {
  children: (activeTab: PrepareTabId) => ReactNode;
};

export function PrepareTabs({ children }: PrepareTabsProps) {
  const [activeTab, setActiveTab] = useState<PrepareTabId>("general");

  return (
    <div>
      <div
        className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px"
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? "border-gold text-gold"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6" role="tabpanel">
        {children(activeTab)}
      </div>
    </div>
  );
}
