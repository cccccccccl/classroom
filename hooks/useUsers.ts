"use client";

import { useState, useCallback } from "react";
import type { Toast, UserData, UserFormPayload } from "@/lib/types";

interface UseUsersReturn {
  userList: UserData[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  fetchUsers: (query?: string) => Promise<void>;
  createUser: (data: UserFormPayload) => Promise<boolean>;
  updateUser: (id: string, data: UserFormPayload) => Promise<boolean>;
  deleteUser: (user: UserData) => Promise<boolean>;
  toggleActive: (user: UserData) => Promise<void>;
}

export function useUsers(onToast: (t: Toast) => void): UseUsersReturn {
  const [userList, setUserList] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(
    async (query = "") => {
      setIsLoading(true);

      try {
        const params = query ? `?search=${encodeURIComponent(query)}` : "";
        const res = await fetch(`/api/admin/users${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUserList(data.users);
      } catch {
        onToast({ type: "error", message: "Failed to load users" });
      } finally {
        setIsLoading(false);
      };
    },
    [onToast],
  );

  async function createUser(data: UserFormPayload): Promise<boolean> {
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUserList((prev) => [json.user, ...prev]);
      onToast({ type: "success", message: `${json.user.name} created successfully` });
      return true;
    } catch (err: unknown) {
      onToast({ type: "error", message: err instanceof Error ? err.message : "Failed to create user" });
      return false;
    } finally {
      setIsSaving(false);
    };
  };

  async function updateUser(id: string, data: UserFormPayload): Promise<boolean> {
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if(!res.ok) throw new Error(json.error);
      setUserList((prev) => prev.map((u) => (u.id === id ? json.user : u)));
      onToast({ type: "success", message: "User updated successfully" });
      return true;
    } catch (err: unknown) {
      onToast({ type: "error", message: err instanceof Error ? err.message : "Failed to update user" });
      return false;
    } finally {
      setIsSaving(false);
    };
  };

  async function toggleActive(user: UserData): Promise<void> {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUserList((prev) => prev.map((u) => (u.id === user.id ? json.user : u)));
      onToast({
        type: "success",
        message: `${user.name} ${!user.isActive ? "activated" : "deactivated"}`,
      });
    } catch (err: unknown) {
      onToast({ type: "error", message: err instanceof Error ? err.message : "Failed to update status" });
    };
  };

  async function deleteUser(user: UserData): Promise<boolean> {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUserList((prev) => prev.filter((u) => u.id !== user.id));
      onToast({ type: "success", message: `${user.name} deleted` });
      return true;
    } catch (err: unknown) {
      onToast({ type: "error", message: err instanceof Error ? err.message : "Failed to delete user" });
      return false;
    } finally {
      setIsDeleting(false);
    };
  };

  return {
    userList,
    isLoading,
    isSaving,
    isDeleting,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleActive,
  };
};