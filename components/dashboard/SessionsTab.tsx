"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SessionCard from "@/components/dashboard/SessionCard";
import type { ActiveSession } from "@/lib/sessions";
import type { Toast } from "@/lib/types";

interface SessionsTabProps {
  onToast: (t: Toast) => void;
}

function SessionSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
  );
};

export default function SessionsTab({ onToast }: SessionsTabProps) {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/sessions");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sessions");
      setActiveSessions(data.sessions);
    } catch {
      onToast({ type: "error", message: "Could not load sessions" });
    } finally {
      setIsLoading(false);
    };
  }, [onToast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);

    try {
      const res = await fetch("/api/user/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke session");

      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      onToast({ type: "success", message: "Session revoked" });
    } catch (err: unknown) {
      onToast({ type: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setRevokingId(null);
    };
  };

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      onToast({ type: "error", message: "Logout failed. Please try again." });
    };
  };

  const currentSession = activeSessions.find((s) => s.isCurrent);
  const otherSessions = activeSessions.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchSessions}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <CardDescription>
            {activeSessions.length > 0
              ? `${activeSessions.length} device${activeSessions.length > 1 ? "s" : ""} currently signed in`
              : "Devices and locations currently signed in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <>
              <SessionSkeleton />
              <SessionSkeleton />
            </>
          ) : activeSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active sessions found.
            </div>
          ) : (
            <>
              {currentSession && (
                <SessionCard
                  session={currentSession}
                  onRevoke={handleRevoke}
                  isRevoking={revokingId === currentSession.id}
                />
              )}
              {otherSessions.length > 0 && (
                <div className="space-y-3">
                  {otherSessions.length > 0 && (
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-0.5 pt-1">Other devices</p>
                  )}
                  {otherSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onRevoke={handleRevoke}
                      isRevoking={revokingId === session.id}
                    />
                  ))}
                </div>
              )}
            </>
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
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};