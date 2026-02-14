"use client";

import { useState } from "react";
import { Mail, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Toast } from "@/lib/types";

interface UpdateEmailFormProps {
  initialEmail: string;
  onToast: (t: Toast) => void;
};

export default function UpdateEmailForm({ initialEmail, onToast }: UpdateEmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (!email.trim()) {
      onToast({ type: "error", message: "Email cannot be empty" });
      return;
    };

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
      onToast({ type: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setIsLoading(false);
    };
  };

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
        <Button onClick={handleSave} variant="glow" size="sm" isLoading={isLoading} className="gap-2">
          <Save className="w-3.5 h-3.5" />
          {isLoading ? "Saving..." : "Save Email"}
        </Button>
      </CardContent>
    </Card>
  );
};