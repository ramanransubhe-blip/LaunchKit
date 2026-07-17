"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  Settings,
  User,
  CreditCard,
} from "lucide-react";
import { cn } from "../utils/cn.js";

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  action: () => void;
  shortcut?: string[];
  icon?: React.ComponentType<any>;
}

export function CommandPalette({
  isOpen,
  onClose,
  commands,
}: {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}) {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Reset indices on query change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard events globally when palette is open
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, query, commands]);

  // Fuzzy-like query filter
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return commands;
    const cleanQuery = query.toLowerCase().trim();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(cleanQuery) ||
        cmd.category.toLowerCase().includes(cleanQuery)
    );
  }, [query, commands]);

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Track absolute index inside grouped lists for click/hover activation
  let absoluteCounter = 0;

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
            className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 pointer-events-auto flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette search console"
            >
              {/* Search input field */}
              <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
                <Search className="h-5 w-5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Type a command or search console..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white outline-none placeholder-neutral-400"
                  autoFocus
                />
                <kbd className="inline-flex h-5 items-center rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-1.5 text-[9px] font-mono text-neutral-400">
                  ESC
                </kbd>
              </div>

              {/* Scrollable commands list */}
              <div ref={listRef} className="max-h-[350px] overflow-y-auto p-2 space-y-4">
                {filteredCommands.length === 0 ? (
                  <div className="py-6 text-center text-sm text-neutral-500">
                    No results matching &quot;{query}&quot; found.
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="space-y-1">
                      <h3 className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {category}
                      </h3>
                      <ul className="space-y-0.5">
                        {items.map((cmd) => {
                          const itemIdx = absoluteCounter++;
                          const isSelected = selectedIndex === itemIdx;
                          const Icon = cmd.icon;

                          return (
                            <li key={cmd.id}>
                              <button
                                onClick={() => {
                                  cmd.action();
                                  onClose();
                                }}
                                onMouseEnter={() => setSelectedIndex(itemIdx)}
                                className={cn(
                                  "w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all",
                                  isSelected
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                                    : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/40"
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {Icon ? (
                                    <Icon className="h-4 w-4 text-neutral-400 shrink-0" />
                                  ) : (
                                    <Command className="h-4 w-4 text-neutral-400 shrink-0" />
                                  )}
                                  <span className="truncate">{cmd.title}</span>
                                </div>
                                {isSelected ? (
                                  <span className="flex items-center gap-0.5 text-[10px] text-indigo-500">
                                    <span>Execute</span>
                                    <CornerDownLeft className="h-3 w-3" />
                                  </span>
                                ) : (
                                  cmd.shortcut && (
                                    <div className="flex items-center gap-0.5">
                                      {cmd.shortcut.map((key, keyIdx) => (
                                        <kbd
                                          key={keyIdx}
                                          className="h-4 px-1 inline-flex items-center rounded bg-neutral-100 dark:bg-neutral-800 text-[9px] font-mono text-neutral-400"
                                        >
                                          {key}
                                        </kbd>
                                      ))}
                                    </div>
                                  )
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              {/* Console Footer */}
              <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 px-4 py-2 bg-neutral-50 dark:bg-neutral-800/20 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <span>Use arrows</span>
                  <kbd className="px-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                    ↓
                  </kbd>
                  <kbd className="px-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                    ↑
                  </kbd>
                  <span>to navigate</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <span>Confirm with</span>
                  <kbd className="px-0.5 rounded border border-neutral-200 dark:border-neutral-700 font-mono">
                    ↵
                  </kbd>
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
