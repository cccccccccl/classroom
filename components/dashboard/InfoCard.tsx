import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InfoCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  mono?: boolean;
};

export default function InfoCard({ label, value, icon: Icon, mono = false }: InfoCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            <p className={`text-sm text-foreground font-medium truncate mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};