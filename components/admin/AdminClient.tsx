"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  Zap,
} from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { getInitials, formatDate } from "@/lib/utils";
import type { UserData, Toast, UserFormPayload } from "@/lib/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AdminClientProps {
  currentUserId: string;
}

// ─── StatsBar ──────────────────────────────────────────────────────────────────

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatsBar({ users }: { users: UserData[] }) {
  const stats: StatItem[] = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Active",
      value: users.filter((u) => u.isActive).length,
      icon: UserCheck,
      color: "text-emerald-400 bg-emerald-400/10",
    },
    {
      label: "Inactive",
      value: users.filter((u) => !u.isActive).length,
      icon: UserX,
      color: "text-destructive bg-destructive/10",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "admin").length,
      icon: Shield,
      color: "text-yellow-400 bg-yellow-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="border-border bg-card">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-xl font-bold text-foreground leading-none mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── UserTableSkeleton ─────────────────────────────────────────────────────────

function UserTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-2.5 w-40 rounded bg-muted" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3.5 hidden sm:table-cell">
            <div className="h-5 w-14 rounded-full bg-muted" />
          </td>
          <td className="px-4 py-3.5 hidden md:table-cell">
            <div className="h-5 w-14 rounded-full bg-muted" />
          </td>
          <td className="px-4 py-3.5 hidden lg:table-cell">
            <div className="h-3 w-20 rounded bg-muted" />
          </td>
          <td className="px-4 py-3.5">
            <div className="h-8 w-8 rounded-md bg-muted" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── RowActions ────────────────────────────────────────────────────────────────

interface RowActionsProps {
  user: UserData;
  isSelf: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function RowActions({
  user,
  isSelf,
  onEdit,
  onDelete,
  onToggleActive,
}: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handle(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Row actions"
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 z-20 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          <button
            onClick={() => handle(onEdit)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-primary" />
            Edit user
          </button>

          <button
            onClick={() => handle(onToggleActive)}
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
              user.isActive
                ? "text-foreground hover:bg-muted/50"
                : "text-emerald-400 hover:bg-emerald-400/10"
            }`}
          >
            {user.isActive ? (
              <UserX className="w-3.5 h-3.5 text-destructive" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {user.isActive ? "Deactivate" : "Activate"}
          </button>

          {!isSelf && (
            <>
              <div className="border-t border-border mx-2" />
              <button
                onClick={() => handle(onDelete)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete user
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── UserTableRow ──────────────────────────────────────────────────────────────

interface UserTableRowProps {
  user: UserData;
  isSelf: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function UserTableRow({
  user,
  isSelf,
  onEdit,
  onDelete,
  onToggleActive,
}: UserTableRowProps) {
  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              {isSelf && (
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground py-0 px-1.5 h-4 shrink-0"
                >
                  you
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3.5 hidden sm:table-cell">
        <Badge
          variant={user.role === "admin" ? "destructive" : "secondary"}
          className="capitalize"
        >
          {user.role}
        </Badge>
      </td>

      {/* Fix: was "hidden sm:table-cell" — mismatched with the "md" header breakpoint */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <Badge
          variant={user.isActive ? "success" : "outline"}
          className={!user.isActive ? "text-muted-foreground" : ""}
        >
          {/* Fix: was lowercase "active" — inconsistent with "Inactive" */}
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>

      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</span>
      </td>

      <td className="px-4 py-3.5 text-right">
        <RowActions
          user={user}
          isSelf={isSelf}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      </td>
    </tr>
  );
}

// ─── UserTable ─────────────────────────────────────────────────────────────────

interface UserTableProps {
  users: UserData[];
  isLoading: boolean;
  search: string;
  currentUserId: string;
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onToggleActive: (user: UserData) => void;
}

const COLUMNS = ["User", "Role", "Status", "Joined"] as const;

function UserTable({
  users,
  isLoading,
  search,
  currentUserId,
  onEdit,
  onDelete,
  onToggleActive,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-t border-border bg-muted/20">
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {COLUMNS[0]}
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
              {COLUMNS[1]}
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
              {COLUMNS[2]}
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
              {COLUMNS[3]}
            </th>
            <th className="px-4 py-3 w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {isLoading ? (
            <UserTableSkeleton />
          ) : users.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-12 text-center text-muted-foreground text-sm"
              >
                {/* Fix: was "No search matching" — grammatically wrong */}
                {search ? `No results matching "${search}"` : "No users found."}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelf={user.id === currentUserId}
                onEdit={() => onEdit(user)}
                onDelete={() => onDelete(user)}
                onToggleActive={() => onToggleActive(user)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── UserFormModal ─────────────────────────────────────────────────────────────

interface UserFormModalProps {
  mode: "create" | "edit";
  user?: UserData | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormPayload) => Promise<boolean>;
}

function UserFormModal({
  mode,
  user,
  isSaving,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">(user?.role ?? "user");

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit() {
    const payload: UserFormPayload = { name: name.trim(), email: email.trim(), role };
    if (password) payload.password = password;
    const ok = await onSubmit(payload);
    if (ok) onClose();
  }

  const isValid = name.trim().length > 0 && email.trim().length > 0;

  return (
    // Backdrop click also closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {mode === "create" ? "Create new user" : "Edit user"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="modal-name" className="text-xs font-medium text-muted-foreground">
              Full name
            </Label>
            <Input
              id="modal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="h-9 text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modal-email" className="text-xs font-medium text-muted-foreground">
              Email address
            </Label>
            <Input
              id="modal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="modal-password"
              className="text-xs font-medium text-muted-foreground"
            >
              {mode === "create"
                ? "Password"
                : "New password (leave blank to keep current)"}
            </Label>
            <Input
              id="modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modal-role" className="text-xs font-medium text-muted-foreground">
              Role
            </Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "user" | "admin")}
            >
              <SelectTrigger id="modal-role" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="glow"
            onClick={handleSubmit}
            disabled={isSaving || !isValid}
            className="h-9 min-w-[100px]"
          >
            {isSaving
              ? "Saving…"
              : mode === "create"
              ? "Create user"
              : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── DeleteConfirmModal ────────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  // Fix: was "user: UserData[]" (array type) — must be a single UserData object
  user: UserData;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteConfirmModal({
  user,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  // Close on Escape key (only when not mid-delete)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, isDeleting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 shrink-0">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Delete user</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{user.name}</span>?{" "}
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-9 min-w-[90px]"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── ToastNotification ─────────────────────────────────────────────────────────

function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

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
        onClick={onDismiss}
        aria-label="Dismiss"
        className="opacity-60 hover:opacity-100 transition-opacity ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── AdminClient (default export) ─────────────────────────────────────────────

export default function AdminClient({ currentUserId }: AdminClientProps) {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);

  // Fix: wrap in useCallback so reference is stable — prevents the search
  // useEffect from re-running on every render and causing an infinite loop
  const onToast = useCallback((t: Toast) => setToast(t), []);

  const {
    userList,
    isLoading,
    isSaving,
    isDeleting,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser: doDelete,
    toggleActive,
  } = useUsers(onToast);

  // Initial fetch + debounced search re-fetch
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchUsers("");
      return;
    }
    const t = setTimeout(() => fetchUsers(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  async function handleDelete() {
    if (!deleteUser) return;
    const ok = await doDelete(deleteUser);
    if (ok) setDeleteUser(null);
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage all accounts in your system
            </p>
          </div>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1 gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Admin
        </Badge>
      </div>

      {/* ── Stats ── */}
      <StatsBar users={userList} />

      {/* ── Table card ── */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">All Users</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading…"
                  : `${userList.length} user${userList.length !== 1 ? "s" : ""} found`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 w-52 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => fetchUsers(search)}
                disabled={isLoading}
                aria-label="Refresh"
                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>

              <Button
                size="sm"
                variant="glow"
                onClick={() => setShowCreateModal(true)}
                className="h-9 gap-1.5"
              >
                <Plus className="w-4 h-4" />
                New user
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <UserTable
            users={userList}
            isLoading={isLoading}
            search={search}
            currentUserId={currentUserId}
            onEdit={setEditUser}
            onDelete={setDeleteUser}
            onToggleActive={toggleActive}
          />
        </CardContent>
      </Card>

      {/* ── Modals ── */}
      {showCreateModal && (
        <UserFormModal
          mode="create"
          isSaving={isSaving}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createUser}
        />
      )}

      {editUser && (
        <UserFormModal
          mode="edit"
          user={editUser}
          isSaving={isSaving}
          onClose={() => setEditUser(null)}
          onSubmit={(data) => updateUser(editUser.id, data)}
        />
      )}

      {deleteUser && (
        <DeleteConfirmModal
          user={deleteUser}
          isDeleting={isDeleting}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}