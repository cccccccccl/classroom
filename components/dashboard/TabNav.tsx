"use client";

import { User, Settings, Monitor } from "lucide-react";
import { Tab } from "@/lib/types";

interface TabNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "sessions", label: "Sessions", icon: Monitor },
];

export default function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border w-fit">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === key
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="w-4 h-4" /> {label}
        </button>
      ))}
    </div>
  );
};