"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Eye,
  EyeOff,
  Globe,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Pencil,
  RefreshCw,
  Save,
  Settings,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials, formatDate } from "@/lib/utils";
import type { Tab, Toast, UserData } from "@/lib/types";
import type { ActiveSession } from "@/lib/sessions";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProfileClientProps {
  user: UserData;
}

// ─── PasswordStrength ──────────────────────────────────────────────────────────

interface StrengthLevel {
  label: string;
  color: string;
  width: string;
}

function getStrength(password: string): StrengthLevel | null {
  if (!password) return null;
  if (password.length < 4) return { label: "Weak",   color: "bg-destructive",  width: "w-1/4"  };
  if (password.length < 6) return { label: "Fair",   color: "bg-yellow-500",   width: "w-1/2"  };
  if (password.length < 8) return { label: "Good",   color: "bg-primary",      width: "w-3/4"  };
  return                           { label: "Strong", color: "bg-emerald-500",  width: "w-full" };
}

function PasswordStrength({ password }: { password: string }) {
  const strength = getStrength(password);
  if (!strength) return null;

  return (
    <div className="space-y-1">
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="text-foreground">{strength.label}</span>
      </p>
    </div>
  );
}

// ─── InfoCard ──────────────────────────────────────────────────────────────────

interface InfoCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  mono?: boolean;
}

function InfoCard({ label, value, icon: Icon, mono = false }: InfoCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {label}
            </p>
            <p
              className={`text-sm text-foreground font-medium truncate mt-0.5 ${
                mono ? "font-mono" : ""
              }`}
            >
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── PasswordInput (shared sub-component for UpdatePasswordForm) ───────────────

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  show: boolean;
  placeholder: string;
  autoComplete: string;
  onChange: (v: string) => void;
  onToggleShow: () => void;
}

function PasswordInput({
  id,
  label,
  value,
  show,
  placeholder,
  autoComplete,
  onChange,
  onToggleShow,
}: PasswordInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── TabNav ────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "profile",  label: "Profile",  icon: User    },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "sessions", label: "Sessions", icon: Monitor  },
];

interface TabNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

function TabNav({ activeTab, onChange }: TabNavProps) {
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
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── ProfileTab ────────────────────────────────────────────────────────────────

function ProfileTab({ user }: { user: UserData }) {
  return (
    <div className="space-y-6">
      <Card className="border-border bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Your Profile</CardTitle>
          <CardDescription>Your public identity and account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-20 h-20 ring-2 ring-primary/30 ring-offset-2 ring-offset-card shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="success">Active</Badge>
                <Badge variant={user.role === "admin" ? "destructive" : "user"}>
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  Free Plan
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard label="Full Name"     value={user.name}                                          icon={User}   />
        <InfoCard label="Email Address" value={user.email}                                         icon={Mail}   />
        <InfoCard label="Account Role"  value={user.role === "admin" ? "Administrator" : "Standard User"} icon={Shield} />
        <InfoCard label="Member Since"  value={formatDate(user.createdAt)}                         icon={Clock}  />
      </div>
    </div>
  );
}

// ─── UpdateNameForm ────────────────────────────────────────────────────────────

function UpdateNameForm({
  initialName,
  onToast,
}: {
  initialName: string;
  onToast: (t: Toast) => void;
}) {
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      onToast({ type: "error", message: "Name cannot be empty" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/update-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update name");
      onToast({ type: "success", message: "Name updated successfully" });
    } catch (err: unknown) {
      onToast({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-semibold">Display Name</CardTitle>
        </div>
        <CardDescription>Update the name shown across your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Full Name</Label>
          <div className="relative">
            <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              placeholder="Your Name"
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          variant="glow"
          size="sm"
          isLoading={isLoading}
          className="gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          {isLoading ? "Saving…" : "Save Name"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── UpdateEmailForm ───────────────────────────────────────────────────────────

function UpdateEmailForm({
  initialEmail,
  onToast,
}: {
  initialEmail: string;
  onToast: (t: Toast) => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (!email.trim()) {
      onToast({ type: "error", message: "Email cannot be empty" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/update-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update email");
      onToast({ type: "success", message: "Email updated successfully" });
    } catch (err: unknown) {
      onToast({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-semibold">Email Address</CardTitle>
        </div>
        <CardDescription>Change the email associated with your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          variant="glow"
          size="sm"
          isLoading={isLoading}
          className="gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          {isLoading ? "Saving…" : "Save Email"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── UpdatePasswordForm ────────────────────────────────────────────────────────

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrent: boolean;
  showNew: boolean;
  showConfirm: boolean;
}

const INITIAL_PASSWORD_STATE: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  showCurrent: false,
  showNew: false,
  showConfirm: false,
};

function UpdatePasswordForm({ onToast }: { onToast: (t: Toast) => void }) {
  const [form, setForm] = useState<PasswordFormState>(INITIAL_PASSWORD_STATE);
  const [isLoading, setIsLoading] = useState(false);

  function setField<K extends keyof PasswordFormState>(key: K, value: PasswordFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      onToast({ type: "error", message: "All password fields are required" });
      return;
    }
    if (form.newPassword.length < 6) {
      onToast({ type: "error", message: "New password must be at least 6 characters" });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      onToast({ type: "error", message: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      onToast({ type: "success", message: "Password updated successfully" });
      setForm(INITIAL_PASSWORD_STATE);
    } catch (err: unknown) {
      onToast({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <CardTitle className="text-base font-semibold">Password</CardTitle>
        </div>
        <CardDescription>Keep your account secure with a strong password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PasswordInput
          id="current-password"
          label="Current Password"
          value={form.currentPassword}
          show={form.showCurrent}
          placeholder="••••••"
          autoComplete="current-password"
          onChange={(v) => setField("currentPassword", v)}
          onToggleShow={() => setField("showCurrent", !form.showCurrent)}
        />
        <div className="space-y-1">
          <PasswordInput
            id="new-password"
            label="New Password"
            value={form.newPassword}
            show={form.showNew}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            onChange={(v) => setField("newPassword", v)}
            onToggleShow={() => setField("showNew", !form.showNew)}
          />
          <PasswordStrength password={form.newPassword} />
        </div>
        <PasswordInput
          id="confirm-password"
          label="Confirm New Password"
          value={form.confirmPassword}
          show={form.showConfirm}
          placeholder="••••••"
          autoComplete="new-password"
          onChange={(v) => setField("confirmPassword", v)}
          onToggleShow={() => setField("showConfirm", !form.showConfirm)}
        />
        <Button
          onClick={handleSave}
          variant="glow"
          size="sm"
          isLoading={isLoading}
          className="gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          {isLoading ? "Updating…" : "Update Password"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── SettingsTab ───────────────────────────────────────────────────────────────

function SettingsTab({
  user,
  onToast,
}: {
  user: UserData;
  onToast: (t: Toast) => void;
}) {
  return (
    <div className="space-y-6">
      <UpdateNameForm     initialName={user.name}   onToast={onToast} />
      <UpdateEmailForm    initialEmail={user.email}  onToast={onToast} />
      <UpdatePasswordForm                            onToast={onToast} />
    </div>
  );
}

// ─── SessionCard ───────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 0)       return "Just now";
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface SessionCardProps {
  session: ActiveSession;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const location =
    session.city !== "Unknown" && session.country !== "Unknown"
      ? `${session.city}, ${session.country}`
      : session.country !== "Unknown"
      ? session.country
      : "Location unavailable";

  const details = [
    { label: "IP Address", value: session.ip,      icon: Globe,    mono: true  },
    { label: "Location",   value: location,         icon: MapPin,   mono: false },
    { label: "Browser",    value: session.browser,  icon: Monitor,  mono: false },
    { label: "OS",         value: session.os,       icon: Shield,   mono: false },
  ] as const;

  return (
    <div
      className={`p-4 rounded-xl border space-y-4 transition-colors ${
        session.isCurrent
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/20"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {session.isCurrent ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Current Session
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Session
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {formatRelativeTime(session.lastSeenAt)}
          </Badge>
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

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-2">
        {details.map(({ label, value, icon: Icon, mono }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 p-2.5 bg-background/50 border border-border/40 rounded-lg"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 shrink-0">
              <Icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-none">
                {label}
              </p>
              <p
                className={`text-xs text-foreground font-medium truncate mt-1 ${
                  mono ? "font-mono" : ""
                }`}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-[11px] text-muted-foreground">
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
}

// ─── SessionSkeleton ───────────────────────────────────────────────────────────

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
}

// ─── SessionsTab ───────────────────────────────────────────────────────────────

function SessionsTab({ onToast }: { onToast: (t: Toast) => void }) {
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
    }
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
      onToast({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setRevokingId(null);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      onToast({ type: "error", message: "Logout failed. Please try again." });
    }
  }

  const currentSession = activeSessions.find((s) => s.isCurrent);
  const otherSessions  = activeSessions.filter((s) => !s.isCurrent);

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
              aria-label="Refresh sessions"
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
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-0.5 pt-1">
                    Other devices
                  </p>
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

      {/* Sign out */}
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
}

// ─── ToastNotification ─────────────────────────────────────────────────────────

function ToastNotification({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium animate-fade-in ${
        toast.type === "success"
          ? "bg-emerald-950 border-emerald-800 text-emerald-300"
          : "bg-destructive/10 border-destructive/30 text-destructive"
      }`}
    >
      {toast.message}
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="opacity-60 hover:opacity-100 transition-opacity ml-1"
      >
        ✕
      </button>
    </div>
  );
}

// ─── ProfileClient (default export) ───────────────────────────────────────────

export default function ProfileClient({ user }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [toast, setToast] = useState<Toast | null>(null);

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your profile, preferences, and sessions
          </p>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Tab content ── */}
      {activeTab === "profile"  && <ProfileTab  user={user} />}
      {activeTab === "settings" && <SettingsTab user={user} onToast={setToast} />}
      {activeTab === "sessions" && <SessionsTab  onToast={setToast} />}

      {/* ── Toast ── */}
      {toast && <ToastNotification toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}