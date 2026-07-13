"use client";

import { useState, useEffect, useCallback } from "react";

// 1. useEnvironment: Access public environment configuration details
export function useEnvironment() {
  const [env, setEnv] = useState<{ isProduction: boolean; appUrl: string }>({
    isProduction: process.env.NODE_ENV === "production",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });

  return env;
}

// 2. useFeatureFlag: Hook to query feature flag status
export function useFeatureFlag(key: string, defaultVal = false): { isEnabled: boolean; isLoading: boolean } {
  const [isEnabled, setIsEnabled] = useState(defaultVal);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFlag() {
      try {
        // Query server api endpoint or evaluate local client mock rules
        const res = await fetch(`/api/feature-flags?key=${key}`);
        if (res.ok) {
          const data = await res.json();
          setIsEnabled(!!data.enabled);
        }
      } catch (err) {
        console.error(`Error loading feature flag "${key}":`, err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFlag();
  }, [key]);

  return { isEnabled, isLoading };
}

// 3. usePermission: Verifies role access
export function usePermission(permission: string, userRole?: string): boolean {
  if (!userRole) return false;
  if (userRole === "owner") return true;

  const permissionsMap: Record<string, string[]> = {
    guest: ["read:settings", "read:billing"],
    member: ["read:settings", "read:billing", "write:settings"],
    admin: ["read:settings", "read:billing", "write:settings", "write:billing", "manage:users", "manage:teams"],
  };

  const userPerms = permissionsMap[userRole] || [];
  return userPerms.includes(permission);
}

// 4. useDebounce: Standard value debounce utility
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 5. useCopy: Copy text to clipboard with feedback state
export function useCopy(resetDuration = 2000): { copied: boolean; copy: (text: string) => Promise<boolean> } {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (typeof window === "undefined" || !navigator.clipboard) {
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDuration);
        return true;
      } catch (err) {
        console.error("Failed to copy text:", err);
        return false;
      }
    },
    [resetDuration]
  );

  return { copied, copy };
}

// 6. usePagination: Pagination metrics helper
export function usePagination(totalItems: number, initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);
  const offset = (currentPage - 1) * pageSize;

  const nextPage = () => setCurrentPage((p: number) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p: number) => Math.max(p - 1, 1));
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return {
    currentPage,
    pageSize,
    totalPages,
    offset,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

// 7. useLocalStorage: Stateful synchronization with LocalStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 8. useMediaQuery: Match responsive CSS media query breakpoints
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
