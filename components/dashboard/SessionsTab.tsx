"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SessionCard from "@/components/dashboard/SessionCard";
import { ParseBrowser, ParseOS } from "@/lib/utils";
import type { SessionInfo, Toast } from "@/lib/types";

interface SessionsTabProps {
  onToast: (t: Toast) => void;
}

export default function SessionsTab({ onToast }: SessionsTabProps) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/user/session-info");
        const data = await res.json();
        if (res.ok) {
          const ua = navigator.userAgent;
          setSession({
            ...data,
            browser: ParseBrowser(ua),
            os: ParseOS(ua),
            userAgent: ua,
            isCurrent: true,
            lastSeen: "Now",
          });
        }
      } catch {
        onToast({ type: "error", message: "Could not load session info" });
      } finally {
        setIsLoading(false);
      };
    };
    fetchSession();
  }, [onToast]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      onToast({ type: "error", message: "Logout failed. Please try again." });
    };
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
          </div>
          <CardDescription>Devices and locations currently signed in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : session ? (
            <SessionCard session={session} />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Could not load session information.
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-destructive">Sign Out</CardTitle>
          <CardDescription>End your current session on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="destructive" size="sm" className="gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};