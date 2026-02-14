export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: Date;
};

export interface SessionInfo {
  ip: string;
  city: string;
  country: string;
  region: string;
  userAgent: string;
  browser: string;
  os: string;
  isCurrent: boolean;
  lastSeen: string;
};

export interface Toast {
  type: "success" | "error";
  message: string;
};

export type Tab = "profile" | "settings" | "sessions";