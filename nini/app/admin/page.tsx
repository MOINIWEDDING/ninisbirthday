import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/Dashboard";
import { Login } from "@/components/admin/Login";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { storageConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · NINI'S Birthday", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <Login configured={adminConfigured()} />;
  return <Dashboard storageReady={storageConfigured} />;
}
