import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import AdminClient from "@/components/admin/AdminClient"

export default async function AdminPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");

  return <AdminClient currentUserId={session.userId} />
};