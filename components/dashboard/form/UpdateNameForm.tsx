"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Toast } from "@/lib/types";
import { User, Save } from "lucide-react";

interface UpdateNameFormProps {
  initialName: string;
  onToast: (t: Toast) => void;
}

export default function UpdateNameForm({ initialName, onToast }: UpdateNameFormProps) {
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      onToast({ type: "error", message: "Name cannot be empty" });
      return;
    };

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
      onToast({ type: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setIsLoading(false);
    };
  };

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
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
        <Button onClick={handleSave} variant="glow" size="sm" isLoading={isLoading} className="gap-2">
          <Save className="w-3.5 h-3.5" />
          {isLoading ? "Saving..." : "Save Name"}
        </Button>
      </CardContent>
    </Card>
  );
};