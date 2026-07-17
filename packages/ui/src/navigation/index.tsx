"use client";

import { cn } from "../utils/cn";
import { ReactNode, useState, useEffect } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight, Home, Search, ChevronLeft, Menu, X, Sparkles, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "../components/modals";

// Breadcrumbs
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold select-none text-left"
    >
      <a href="/" className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center">
        <Home className="w-3.5 h-3.5" />
      </a>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          {item.href ? (
            <a href={item.href} className="hover:text-slate-700 dark:hover:text-slate-300">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-800 dark:text-slate-200 font-bold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// SearchBar with shortcut trigger placeholder
export function SearchBar({
  value,
  onChange,
  onFocus,
}: {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Quick search..."
        className="w-full h-9 pl-10 pr-12 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
      />
      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 h-5 px-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-black text-slate-450 flex items-center gap-0.5 select-none pointer-events-none">
        <Command className="w-2.5 h-2.5" />K
      </kbd>
    </div>
  );
}

// CommandMenu
export function CommandMenu({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: { label: string; action: () => void }[];
}) {
  const [filter, setFilter] = useState("");

  const filtered = items.filter((item) => item.label.toLowerCase().includes(filter.toLowerCase()));

  // Listen to command shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Command Menu">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full h-11 pl-11 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <div className="max-h-60 overflow-y-auto space-y-1 p-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No commands found.</p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.action();
                  onOpenChange(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>{item.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}

// Tabs
export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, defaultValue }: { items: TabItem[]; defaultValue: string }) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue} className="w-full">
      <TabsPrimitive.List className="flex border-b border-slate-200 dark:border-slate-850 gap-6">
        {items.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className="pb-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-205 transition relative focus:outline-none cursor-pointer data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-400"
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className="py-4 focus:outline-none"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

// Pagination
export function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 justify-center select-none py-4">
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center disabled:opacity-50 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-xs font-bold text-slate-500 px-3">
        Page {current} of {total}
      </span>
      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center disabled:opacity-50 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// DropdownMenu (Radix wrapper)
export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

export function DropdownMenu({ trigger, items }: { trigger: ReactNode; items: DropdownItem[] }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          className="z-50 w-48 p-1 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg focus:outline-none"
        >
          {items.map((item, idx) => (
            <DropdownMenuPrimitive.Item
              key={idx}
              onClick={item.onClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-none cursor-pointer select-none"
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

// ContextMenu alias (Simplified custom click listener wrapper)
export function ContextMenu({ children, items }: { children: ReactNode; items: DropdownItem[] }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleContext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCoords({ x: e.clientX, y: e.clientY });
    setShow(true);
  };

  useEffect(() => {
    const clickOut = () => setShow(false);
    window.addEventListener("click", clickOut);
    return () => window.removeEventListener("click", clickOut);
  }, []);

  return (
    <div onContextMenu={handleContext} className="relative">
      {children}
      {show && (
        <div
          style={{ top: coords.y, left: coords.x }}
          className="fixed z-50 w-48 p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-lg"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Navbar Layout
export function Navbar({
  logo,
  links,
  actions,
}: {
  logo: ReactNode;
  links: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <nav className="w-full border-b border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>{logo}</div>
          <div className="hidden md:flex items-center gap-6">{links}</div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </nav>
  );
}

// Sidebar Layout
export function Sidebar({
  title,
  links,
  footer,
}: {
  title: ReactNode;
  links: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 bg-slate-50 dark:bg-slate-950 border-r border-slate-100 dark:border-slate-900 text-left">
      <div className="space-y-6">
        <div className="px-2 py-1.5 font-black text-lg">{title}</div>
        <div className="space-y-1">{links}</div>
      </div>
      {footer && (
        <div className="border-t border-slate-100 dark:border-slate-900 pt-3">{footer}</div>
      )}
    </div>
  );
}

// MobileNavigation
export function MobileNavigation({ logo, links }: { logo: ReactNode; links: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden w-full border-b border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 h-14 flex items-center justify-between sticky top-0 z-40">
      <div>{logo}</div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 p-6 z-50 flex flex-col gap-4 text-left shadow-lg"
          >
            {links}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export function NavigationMenu({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>;
}
export function NavigationMenuItem({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
    >
      {label}
    </a>
  );
}
