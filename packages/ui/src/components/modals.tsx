"use client";

import { cn } from "../utils/cn";
import { ReactNode, useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, HelpCircle } from "lucide-react";

// Dialog Component
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children, footer }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xl text-left focus:outline-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <DialogPrimitive.Title className="text-xl font-bold text-slate-900 dark:text-white">
                      {title}
                    </DialogPrimitive.Title>
                    {description && (
                      <DialogPrimitive.Description className="text-xs text-slate-500 dark:text-slate-400">
                        {description}
                      </DialogPrimitive.Description>
                    )}
                  </div>
                  <DialogPrimitive.Close className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650 cursor-pointer">
                    <X className="w-4.5 h-4.5" />
                  </DialogPrimitive.Close>
                </div>

                <div className="text-sm text-slate-700 dark:text-slate-300 my-4 leading-relaxed">
                  {children}
                </div>

                {footer && (
                  <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-900 pt-4 mt-6">
                    {footer}
                  </div>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

// Drawer / Bottom Sheet
export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: "right" | "bottom";
}

export function Drawer({ open, onOpenChange, title, children, side = "right" }: DrawerProps) {
  const isBottom = side === "bottom";

  const containerVariants = isBottom
    ? {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
      }
    : {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
      };

  const layoutClass = isBottom
    ? "bottom-0 left-0 right-0 max-h-[80vh] w-full rounded-t-3xl border-t"
    : "top-0 right-0 bottom-0 w-80 h-full border-l";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className={cn(
                  "fixed z-50 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-xl text-left focus:outline-none flex flex-col justify-between",
                  layoutClass
                )}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3 mb-4">
                    <DialogPrimitive.Title className="text-lg font-bold">{title}</DialogPrimitive.Title>
                    <DialogPrimitive.Close className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-650 cursor-pointer">
                      <X className="w-4 h-4" />
                    </DialogPrimitive.Close>
                  </div>
                  <div className="overflow-y-auto text-sm text-slate-700 dark:text-slate-350">{children}</div>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

// BottomSheet alias
export function BottomSheet(props: DrawerProps) {
  return <Drawer {...props} side="bottom" />;
}

// ConfirmationDialog
export interface ConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "info" | "danger";
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "info",
}: ConfirmationProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200 cursor-pointer text-slate-700 dark:text-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={cn(
              "px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 cursor-pointer",
              type === "danger" ? "bg-red-655" : "bg-indigo-650"
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3 items-start">
        <div
          className={cn(
            "p-2.5 rounded-xl shrink-0",
            type === "danger" ? "bg-red-50 dark:bg-red-950/20 text-red-500" : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500"
          )}
        >
          {type === "danger" ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
      </div>
    </Dialog>
  );
}

// DeleteDialog (Strict deletion confirmation)
export interface DeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
}

export function DeleteDialog({ open, onOpenChange, onConfirm, itemName }: DeleteProps) {
  const [confirmVal, setConfirmVal] = useState("");

  useEffect(() => {
    if (!open) setConfirmVal("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Item"
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={confirmVal !== itemName}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl cursor-pointer"
          >
            Permanently Delete
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3 items-start bg-red-50/25 dark:bg-red-950/5 border border-red-100 dark:border-red-900/30 p-4 rounded-xl text-red-650 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs leading-normal">
            This action is irreversible. It will immediately and permanently erase the item and delete its data.
          </p>
        </div>
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-slate-550 dark:text-slate-405">
            Type <span className="font-mono font-black text-red-500">{itemName}</span> to confirm deletion:
          </label>
          <input
            type="text"
            value={confirmVal}
            onChange={(e) => setConfirmVal(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
      </div>
    </Dialog>
  );
}

// Image Viewer (Lightbox)
export function ImageViewer({ src, open, onOpenChange }: { src: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
              >
                <DialogPrimitive.Close className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white cursor-pointer z-50 border border-slate-850">
                  <X className="w-5 h-5" />
                </DialogPrimitive.Close>
                <DialogPrimitive.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl flex items-center justify-center focus:outline-none"
                  >
                    <img src={src} alt="Enlarged view" className="max-w-full max-h-[80vh] object-contain rounded-xl border border-slate-800" />
                  </motion.div>
                </DialogPrimitive.Content>
              </motion.div>
            </DialogPrimitive.Overlay>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
