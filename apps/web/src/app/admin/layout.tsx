import * as React from "react";
import { requireAdmin } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import AdminShell from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Secure server-side check. If the user is not an admin, they are redirected to "/"
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
