import { Globe, MapPin, Monitor, Shield, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActiveSession } from "@/lib/sessions";

interface SessionCardProps {
  session: ActiveSession;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diff < 0) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const location = session.city !== "Unknown" && session.country !== "Unknown"
    ? `${session.city}, ${session.country}`
    : session.country !== "Unknown"
    ? session.country
    : "Location unavailable";

  return (
    <div className={`p-4 rounded-xl border space-y-4 transition-colors ${
      session.isCurrent
        ? "border-primary/30 bg-primary/5"
        : "border-border bg-muted/20"
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {session.isCurrent ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Current Session</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Session</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground">{formatRelativeTime(session.lastSeenAt)}</Badge>
          {!session.isCurrent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRevoke(session.id)}
              disabled={isRevoking}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
            >
              <LogOut className="w-3 h-3" />
              Revoke
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "IP Address", value: session.ip, icon: Globe, mono: true },
          { label: "Location", value: location, icon: MapPin },
          { label: "Browser", value: session.browser, icon: Monitor },
          { label: "OS", value: session.os, icon: Shield },
        ].map(({ label, value, icon: Icon, mono }) => (
          <div key={label} className="flex items-center gap-2.5 p-2.5 bg-background/50 border border-border/40">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
              <Icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-none">{label}</p>
              <p className={`text-xs text-foreground font-medium truncate mt-1 ${mono ? "font-mono" : ""}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground px-0.5">
        Signed in{" "}
        {new Date(session.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};