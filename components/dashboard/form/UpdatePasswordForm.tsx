"use client";

import { useState } from "react";
import { Lock, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordStrength from "@/components/dashboard/PasswordStrength";
import type { Toast } from "@/lib/types";

interface UpdatePasswordFormProps {
  onToast: (t: Toast) => void;
};

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrent: boolean;
  showNew: boolean;
  showConfirm: boolean;
};

const INITIAL_STATE: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  showCurrent: false,
  showNew: false,
  showConfirm: false,
};

function PasswordInput({
  id,
  label,
  value,
  show,
  placeholder,
  autoComplete,
  onChange,
  onToggleShow,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  placeholder: string;
  autoComplete: string;
  onChange: (v: string) => void;
  onToggleShow: () => void;
}) {
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default function UpdatePasswordForm({ onToast }: UpdatePasswordFormProps) {
  const [form, setForm] = useState<PasswordFormState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  function setField<K extends keyof PasswordFormState>(key: K, value: PasswordFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      onToast({ type: "error", message: "All password fields are required" });
      return;
    };
    if (form.newPassword.length < 6) {
      onToast({ type: "error", message: "New password must be at least 6 characters" });
      return;
    };
    if (form.newPassword !== form.confirmPassword) {
      onToast({ type: "error", message: "Passwords do not match" });
      return;
    };

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
      setForm(INITIAL_STATE);
    } catch (err: unknown) {
      onToast({ type: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setIsLoading(false);
    };
  };

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
        <Button onClick={handleSave} variant="glow" size="sm" isLoading={isLoading} className="gap-2">
          <Save className="w-3.5 h-3.5" />
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </CardContent>
    </Card>
  );
};