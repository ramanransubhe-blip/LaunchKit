"use client";

import * as React from "react";
import {
  AlertTriangle,
  Key,
  Shield,
  User,
  Bell,
  Palette,
  Globe,
  Layers,
  Link2,
} from "lucide-react";
import { cn } from "../utils/cn.js";

export function SettingsLayout({
  sidebarItems,
  activeId,
  onSectionSelect,
  children,
}: {
  sidebarItems: { id: string; label: string; icon?: React.ComponentType<any> }[];
  activeId: string;
  onSectionSelect: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-56 shrink-0">
        <nav
          className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0"
          aria-label="Settings navigation"
        >
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => onSectionSelect(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shrink-0 transition-colors",
                  isActive
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/40 dark:hover:text-white"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main settings body */}
      <div className="flex-1 space-y-8">{children}</div>
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="pt-2">{children}</div>
      </div>
      {footer && (
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-900/40">
          {footer}
        </div>
      )}
    </div>
  );
}

export function DangerZone({
  title = "Danger Zone",
  description = "Permanently delete or destroy critical organization and user workspaces. This cannot be undone.",
  actionLabel = "Delete Account",
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50/5 dark:bg-red-950/5 overflow-hidden">
      <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-950 dark:text-red-400">{title}</h3>
            <p className="mt-1 text-xs text-red-600/80 leading-relaxed">{description}</p>
          </div>
        </div>
        <button
          onClick={onAction}
          className="rounded-lg bg-red-600 hover:bg-red-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors shrink-0"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
