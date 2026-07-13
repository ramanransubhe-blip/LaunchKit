"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Bell, Shield, Info, AlertTriangle, CheckCircle, Mail } from "lucide-react";
import { cn } from "../utils/cn.js";

export type NotificationCategory = "all" | "security" | "billing" | "system" | "team";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: Date;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll?: () => void;
}) {
  const [filter, setFilter] = React.useState<NotificationCategory>("all");

  const filteredNotifications = React.useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "security":
        return <Shield className="h-4 w-4 text-amber-500" />;
      case "billing":
        return <AlertTriangle className="h-4 w-4 text-emerald-500" />;
      case "team":
        return <Mail className="h-4 w-4 text-indigo-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 flex flex-col"
            role="dialog"
            aria-label="Notification center panel"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-neutral-500" />
                <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600 dark:bg-red-950 dark:text-red-400">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 p-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/10">
              {(["all", "security", "billing", "system", "team"] as NotificationCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                    filter === cat
                      ? "bg-white text-indigo-600 shadow-sm border border-neutral-200/50 dark:bg-neutral-800 dark:text-indigo-400 dark:border-neutral-700/50"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
                  <p className="mt-2.5 text-xs text-neutral-500">You are all caught up!</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex gap-3 rounded-lg border p-3 text-left transition-all relative group",
                      notif.read
                        ? "border-neutral-100 bg-white dark:border-neutral-800/60 dark:bg-neutral-900/40"
                        : "border-indigo-100 bg-indigo-50/10 dark:border-indigo-950/20 dark:bg-indigo-950/5"
                    )}
                  >
                    <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                      {getCategoryIcon(notif.category)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className={cn("text-xs truncate", notif.read ? "text-neutral-700 dark:text-neutral-300" : "font-semibold text-neutral-950 dark:text-white")}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-neutral-400 block mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Actions on hover */}
                    {!notif.read && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="absolute top-2 right-2 p-1 rounded-md bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity dark:bg-neutral-800 dark:border-neutral-750"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Actions Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-900/40">
                <button
                  onClick={onMarkAllRead}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Mark all as read
                </button>
                {onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
