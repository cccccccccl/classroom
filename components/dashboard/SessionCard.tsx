import { Globe, MapPin, Monitor, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SessionInfo } from "@/lib/types";

interface SessionCardProps {
  session: SessionInfo;
}

const SESSION_FIELDS = (session: SessionInfo) => [
  { label: "IP Address", value: session.ip || "Unknown", icon: Globe, mono: true },
  { label: "Location", value: session.city && session.country ? `${session.city}, ${session.country}` : "Location unavailable", icon: MapPin },
  { label: "Browser", value: session.browser, icon: Monitor },
  { label: "Operating System", value: session.os, icon: Shield },
];

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Current Session</span>
        </div>
        <Badge variant="outline" className="text-xs text-muted-foreground">{session.lastSeen}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SESSION_FIELDS(session).map(({ label, value, icon: Icon, mono }) => (
          <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
              <p className={`text-xs text-foreground font-medium truncate mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      {session.region && (
        <div className="flex items-center gap-2 px-1">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Region: <span className="text-foreground">{session.region}</span>
          </p>
        </div>
      )}
    </div>
  );
};