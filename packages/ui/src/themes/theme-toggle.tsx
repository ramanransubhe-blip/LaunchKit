"use client";

import { useTheme } from "./theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Laptop } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-slate-900/50 border border-slate-800" />;
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label="Toggle color theme"
      className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" && (
          <motion.div
            key="light"
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Sun className="w-4 h-4 text-amber-500" />
          </motion.div>
        )}
        {theme === "dark" && (
          <motion.div
            key="dark"
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
          </motion.div>
        )}
        {theme === "system" && (
          <motion.div
            key="system"
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Laptop className="w-4 h-4 text-slate-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
