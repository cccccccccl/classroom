"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff, Lock, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SuccessToast({ name }: { name: string }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg animate-fade-in">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 shrink-0">
        <CheckCircle className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-emerald-400">Welcome back, {name}!</p>
        <p className="text-xs text-emerald-400/70 mt-0.5">Redirecting you now...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      };

      setSuccessName(data.user.name.split(" ")[0]);

      setTimeout(() => {
        router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
        router.refresh();
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {successName && <SuccessToast name={successName} />}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 border border-primary/40 glow-primary">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">DarkMatter</span>
        </div>
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center text-muted-foreground">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/130 text-destructive text-sm">
                  <span className="shrink-0">⚠</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium transition-colors">Create one</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};