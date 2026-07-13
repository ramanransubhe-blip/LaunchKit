"use client";

import { cn } from "../utils/cn";
import { useState, HTMLAttributes } from "react";
import { Badge, Table, MetricCards, Progress } from "./data-display";
import { Shield, ShieldAlert, ShieldCheck, UserCheck, ShieldAlert as GuestIcon, Terminal, Activity, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { Checkbox } from "./forms";

// RoleBadge
export type UserRole = "admin" | "member" | "guest" | "owner";

export function RoleBadge({ role }: { role: UserRole }) {
  const configs = {
    owner: { label: "Owner", icon: <ShieldAlert className="w-3 h-3" />, className: "bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30" },
    admin: { label: "Admin", icon: <Shield className="w-3 h-3" />, className: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-550 border border-indigo-100 dark:border-indigo-900/30" },
    member: { label: "Member", icon: <UserCheck className="w-3 h-3" />, className: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-550 border border-emerald-100 dark:border-emerald-900/30" },
    guest: { label: "Guest", icon: <GuestIcon className="w-3 h-3" />, className: "bg-slate-100 dark:bg-slate-900 text-slate-550 border border-slate-200 dark:border-slate-800" },
  };

  const conf = configs[role] || configs.guest;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold leading-normal", conf.className)}>
      {conf.icon}
      {conf.label}
    </span>
  );
}

// UserTable
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended" | "pending";
}

export function UserTable({ users, onEditRole, onSuspend }: { users: AdminUser[]; onEditRole?: (id: string, role: UserRole) => void; onSuspend?: (id: string) => void }) {
  return (
    <Table headers={["Name", "Email", "Role", "Status", "Actions"]}>
      {users.map((u) => (
        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
          <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
          <td className="px-6 py-4">
            <RoleBadge role={u.role} />
          </td>
          <td className="px-6 py-4">
            <Badge variant={u.status === "active" ? "success" : u.status === "suspended" ? "danger" : "warning"}>
              {u.status}
            </Badge>
          </td>
          <td className="px-6 py-4 flex gap-2">
            <Button variant="outline" size="sm" className="h-8 py-0 px-2.5 font-semibold text-xs" onClick={() => onEditRole?.(u.id, "admin")}>
              Make Admin
            </Button>
            <Button variant="secondary" size="sm" className="h-8 py-0 px-2.5 text-red-500 font-semibold text-xs" onClick={() => onSuspend?.(u.id)}>
              Suspend
            </Button>
          </td>
        </tr>
      ))}
    </Table>
  );
}

// PermissionTable
export interface PermissionRow {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export function PermissionTable({ permissions, onChange }: { permissions: PermissionRow[]; onChange?: (idx: number, field: "read" | "write" | "delete", val: boolean) => void }) {
  return (
    <Table headers={["Module", "Read Access", "Write Access", "Delete Access"]}>
      {permissions.map((p, idx) => (
        <tr key={p.module} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
          <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{p.module}</td>
          <td className="px-6 py-4">
            <div className="flex justify-center">
              <Checkbox id={`${p.module}-read`} checked={p.read} onCheckedChange={(val) => onChange?.(idx, "read", val)} />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center">
              <Checkbox id={`${p.module}-write`} checked={p.write} onCheckedChange={(val) => onChange?.(idx, "write", val)} />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center">
              <Checkbox id={`${p.module}-delete`} checked={p.delete} onCheckedChange={(val) => onChange?.(idx, "delete", val)} />
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

// AuditLogViewer
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
}

export function AuditLogViewer({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden text-left text-sm">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 font-bold text-slate-650 dark:text-slate-300">
        <Terminal className="w-4 h-4" /> System Audit Logs
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-900 font-mono text-xs">
        {logs.map((log) => (
          <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30 text-[10px]">
                  {log.action}
                </span>
                <span className="text-slate-400 font-semibold">{log.timestamp}</span>
              </div>
              <p className="text-slate-550 dark:text-slate-400">
                User <span className="font-bold text-slate-700 dark:text-slate-200">{log.user}</span> updated resource <span className="underline">{log.resource}</span>.
              </p>
            </div>
            <span className="text-slate-400 font-bold shrink-0">{log.ip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// AnalyticsCards & RevenueCards wrapper grids
export function AnalyticsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
      <MetricCards title="New Signups" value="2,482" unit="+12% w/w" />
      <MetricCards title="Active Sessions" value="482" unit="live" />
      <MetricCards title="Page Views" value="45.2k" unit="24h" />
      <MetricCards title="Avg. Load Time" value="142" unit="ms" />
    </div>
  );
}

export function RevenueCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      <MetricCards title="Monthly Recurring Revenue" value="$42,920" unit="MRR" />
      <MetricCards title="Gross Volume" value="$512,400" unit="all-time" />
      <MetricCards title="Average Order Value" value="$49.00" unit="AOV" />
    </div>
  );
}

// SystemStatus
export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
  latency?: string;
}

export function SystemStatus({ services }: { services: ServiceStatus[] }) {
  return (
    <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 text-left space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">System Monitor</h4>
        </div>
        <Badge variant="success">All Operational</Badge>
      </div>

      <div className="space-y-3.5">
        {services.map((s) => {
          const indicators = {
            operational: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
            degraded: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
            outage: <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />,
          };

          return (
            <div key={s.name} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-900/50 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                {indicators[s.status]}
                <span className="font-bold text-slate-700 dark:text-slate-350">{s.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {s.latency && <span className="font-mono text-xs text-slate-400">{s.latency}</span>}
                <span
                  className={cn(
                    "text-xs font-bold capitalize",
                    s.status === "operational" && "text-emerald-500",
                    s.status === "degraded" && "text-amber-500",
                    s.status === "outage" && "text-red-500"
                  )}
                >
                  {s.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-900 pt-4 mt-2 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>CPU Utilisation</span>
            <span>24%</span>
          </div>
          <Progress value={24} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Memory Utilisation</span>
            <span>52%</span>
          </div>
          <Progress value={52} />
        </div>
      </div>
    </div>
  );
}
