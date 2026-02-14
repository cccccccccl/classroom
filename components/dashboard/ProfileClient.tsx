"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import TabNav from "@/components/dashboard/TabNav";
import ProfileTab from "@/components/dashboard/ProfileTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import SessionsTab from "@/components/dashboard/SessionsTab";
import ToastAlert from "@/components/ToastAlert";
import type { Tab, Toast, UserData } from "@/lib/types";

interface ProfileClientProps {
  user: UserData;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [toast, setToast] = useState<Toast | null>(null);

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your profile, preferences, and sessions</p>
        </div>
      </div>
      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "profile" && <ProfileTab user={user} />}
      {activeTab === "settings" && <SettingsTab user={user} onToast={setToast} />}
      {activeTab === "sessions" && <SessionsTab onToast={setToast} />}

      {toast && <ToastAlert toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};