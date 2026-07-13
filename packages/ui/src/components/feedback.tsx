"use client";

import { cn } from "../utils/cn";
import { createContext, useContext, useState, ReactNode, HTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertOctagon, Info, AlertTriangle, Loader2, X, Hammer } from "lucide-react";

// Spinner Component
export function LoadingSpinner({ className, size = 5 }: { className?: string; size?: number }) {
  const sizeClasses = {
    4: "w-4 h-4",
    5: "w-5 h-5",
    8: "w-8 h-8",
    12: "w-12 h-12",
  }[size] || "w-5 h-5";

  return <Loader2 className={cn("animate-spin text-indigo-500", sizeClasses, className)} />;
}

// LoadingScreen
export function LoadingScreen({ label = "Loading application..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white">
      <div className="space-y-4 text-center">
        <LoadingSpinner size={12} className="mx-auto text-indigo-400" />
        <p className="text-sm font-bold tracking-wide animate-pulse">{label}</p>
      </div>
    </div>
  );
}

// SuccessAnimation
export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/10"
    >
      <CheckCircle2 className="w-8 h-8" />
    </motion.div>
  );
}

// ErrorState
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="p-8 border border-red-200/50 dark:border-red-950/30 rounded-2xl bg-red-50/10 dark:bg-red-950/5 text-center max-w-md mx-auto space-y-4 text-left">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <div className="text-center space-y-1">
        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <div className="text-center pt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-950 rounded-xl hover:bg-opacity-90 transition cursor-pointer"
          >
            Retry Action
          </button>
        </div>
      )}
    </div>
  );
}

// EmptyState
export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/10 text-center max-w-sm mx-auto space-y-4">
      <div className="text-slate-400 flex justify-center">
        {icon || <Info className="w-8 h-8" />}
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-base text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

// 404 Component
export function NotFoundComponent() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h1 className="text-8xl font-black bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent leading-none">
        404
      </h1>
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Page not found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        The link you followed may be broken, or the page may have been removed. Please check the URL.
      </p>
      <div className="pt-2">
        <a
          href="/"
          className="px-5 py-2.5 text-sm font-bold bg-indigo-650 hover:bg-indigo-650/90 text-white rounded-xl shadow-md transition"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

// Maintenance Component
export function MaintenanceComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <div className="w-full max-w-md p-8 border border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-slate-950/80 backdrop-blur-md shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
          <Hammer className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight">Under Maintenance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We are performing updates to improve your experience. Please check back in a few minutes.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
          Estimated downtime: Less than 10 minutes
        </div>
      </div>
    </div>
  );
}

// Notification Banner
export function Notification({ title, description, onClose }: { title: string; description: string; onClose?: () => void }) {
  return (
    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-md flex justify-between gap-4 text-left max-w-md">
      <div className="space-y-1">
        <h5 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h5>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 h-fit rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Toast Context & Hooks
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
              error: <AlertOctagon className="w-4 h-4 text-red-500" />,
              info: <Info className="w-4 h-4 text-indigo-500" />,
              warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
            };
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="p-3.5 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg flex items-center gap-2.5 pointer-events-auto w-72 justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="shrink-0">{icons[t.type]}</div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-left line-clamp-2 leading-snug">
                    {t.message}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-0.5 rounded text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
