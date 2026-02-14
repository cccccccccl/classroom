"use client";

import { useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { Toast } from "@/lib/types";

interface ToastAlertProps {
  toast: Toast;
  onClose: () => void;
};

export default function ToastAlert({ toast, onClose }: ToastAlertProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-fade-in transition-all ${
      toast.type === "success"
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald"
        : "bg-destructive/10 border-destructive/30 text-destructive"
    }`}>
      {toast.type === "success" ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {toast.message}
    </div>
  );
};