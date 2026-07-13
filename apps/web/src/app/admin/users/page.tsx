"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@devlaunchkit/ui";
import { Search, ShieldAlert, CheckCircle, Ban } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "banned";
  registeredAt: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [users, setUsers] = React.useState<UserProfile[]>([
    { id: "u_1", name: "Alice Vance", email: "alice.vance@clerk.com", role: "Super Admin", status: "active", registeredAt: "2026-01-10" },
    { id: "u_2", name: "Bob Carter", email: "bob.carter@gmail.com", role: "Developer", status: "active", registeredAt: "2026-03-15" },
    { id: "u_3", name: "Charlie Ding", email: "charlie@stripe.dev", role: "Billing Manager", status: "suspended", registeredAt: "2026-04-20" },
  ]);

  const updateStatus = (id: string, newStatus: "active" | "suspended" | "banned") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Directory</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage user profiles, assignments, credentials, and state suspensions.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Name</th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Email</th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Role</th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Status</th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">Registered</th>
                <th className="p-4 text-right font-semibold text-neutral-600 dark:text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-neutral-500">{user.email}</td>
                  <td className="p-4 font-medium text-xs uppercase tracking-wider">{user.role}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : user.status === "suspended"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400">{user.registeredAt}</td>
                  <td className="p-4 text-right space-x-2">
                    {user.status === "active" ? (
                      <>
                        <button
                          onClick={() => updateStatus(user.id, "suspended")}
                          className="text-xs text-amber-600 hover:underline inline-flex items-center gap-1"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" /> Suspend
                        </button>
                        <button
                          onClick={() => updateStatus(user.id, "banned")}
                          className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Ban className="h-3.5 w-3.5" /> Ban
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateStatus(user.id, "active")}
                        className="text-xs text-green-600 hover:underline inline-flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
