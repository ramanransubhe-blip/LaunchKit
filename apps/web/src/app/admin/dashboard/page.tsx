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
import {
  TrendingUp,
  Users,
  Activity,
  Server,
  Database,
  Mail,
  Zap,
} from "lucide-react";

export default function AdminDashboardPage() {
  const metrics = [
    { title: "Monthly Recurring Revenue", value: "$45,231.89", desc: "+12.4% from last month", icon: TrendingUp },
    { title: "Active Users", value: "12,492", desc: "+4.3% since last week", icon: Users },
    { title: "Storage Allocated", value: "1.2 TB", desc: "45.2% of capacity limits", icon: Server },
  ];

  const systemHealth = [
    { name: "Database Cluster", status: "Operational", detail: "Latency: 2ms", icon: Database, color: "text-green-500" },
    { name: "AI Gateway API", status: "Operational", detail: "Uptime: 99.98%", icon: Zap, color: "text-green-500" },
    { name: "Resend Gateway", status: "Operational", detail: "Uptime: 100.00%", icon: Mail, color: "text-green-500" },
  ];

  const recentAuditLogs = [
    { id: "1", action: "User Suspended", target: "john.doe@gmail.com", actor: "admin@devlaunch.com", time: "5 mins ago" },
    { id: "2", action: "Feature Flag Created", target: "ai-summarize-v2", actor: "dev@devlaunch.com", time: "15 mins ago" },
    { id: "3", action: "Refund Issued", target: "$149.00 — inv_9901", actor: "billing@devlaunch.com", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Control Panel</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Admin dashboard panel monitoring revenue, health statuses, and developer logs.
        </p>
      </div>

      {/* Grid of Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{m.title}</CardTitle>
                <Icon className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.value}</div>
                <p className="text-xs text-neutral-400 mt-1">{m.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Status check metrics for database, storage, and billing clusters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((sh, idx) => {
              const Icon = sh.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${sh.color}`} />
                    <div>
                      <div className="font-semibold text-sm">{sh.name}</div>
                      <div className="text-xs text-neutral-400">{sh.detail}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {sh.status}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Audit Trail</CardTitle>
            <CardDescription>Activity logs tracking administrator modifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <div>
                  <span className="font-semibold">{log.action}</span> on <span className="text-neutral-500">{log.target}</span>
                  <div className="text-xs text-neutral-400 mt-0.5">By {log.actor}</div>
                </div>
                <span className="text-xs text-neutral-400 font-medium">{log.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
