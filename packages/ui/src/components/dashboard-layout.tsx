"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Sparkles,
  Command,
  Star,
  Pin,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "../utils/cn.js";

// Types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  shortcut?: string;
  items?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Context for Breadcrumbs
interface BreadcrumbContextType {
  breadcrumbs: { title: string; href?: string }[];
  setBreadcrumbs: (crumbs: { title: string; href?: string }[]) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType | undefined>(undefined);

export function useBreadcrumbs() {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
}

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = React.useState<{ title: string; href?: string }[]>([]);
  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// Context for Dashboard Sidebar States
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  favorites: string[];
  toggleFavorite: (href: string) => void;
  pinned: string[];
  togglePin: (href: string) => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [pinned, setPinned] = React.useState<string[]>([]);

  const toggleFavorite = (href: string) => {
    setFavorites((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const togglePin = (href: string) => {
    setPinned((prev) => (prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]));
  };

  return (
    <BreadcrumbProvider>
      <SidebarContext.Provider
        value={{
          isOpen,
          setIsOpen,
          isCollapsed,
          setIsCollapsed,
          favorites,
          toggleFavorite,
          pinned,
          togglePin,
        }}
      >
        {children}
      </SidebarContext.Provider>
    </BreadcrumbProvider>
  );
}

// Side Navigation Component
export function DashboardSidebar({
  groups,
  activeHref,
  onNavigate,
  organizationName = "Personal Workspace",
  onOrgSwitch,
}: {
  groups: NavGroup[];
  activeHref: string;
  onNavigate: (href: string) => void;
  organizationName?: string;
  onOrgSwitch?: () => void;
}) {
  const {
    isCollapsed,
    setIsCollapsed,
    favorites,
    toggleFavorite,
    pinned,
    togglePin,
    isOpen,
    setIsOpen,
  } = useSidebar();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      aria-label="Sidebar Navigation"
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800">
        {!isCollapsed && (
          <button
            onClick={onOrgSwitch}
            className="flex items-center gap-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 p-1.5 rounded-lg w-full max-w-[180px] transition-colors"
          >
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold font-mono">
              L
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-neutral-950 dark:text-white truncate">
                {organizationName}
              </p>
              <p className="text-[10px] text-neutral-400">Active Workspace</p>
            </div>
            <ChevronDown className="h-3 w-3 text-neutral-400" />
          </button>
        )}
        {isCollapsed && (
          <div className="h-8 w-8 mx-auto rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono text-sm font-bold">
            L
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h2 className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {group.label}
              </h2>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = activeHref === item.href;
                const isFavorite = favorites.includes(item.href);
                const isPinned = pinned.includes(item.href);

                return (
                  <li key={itemIdx}>
                    <div
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                        isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/40 dark:hover:text-white"
                      )}
                      onClick={() => {
                        if (item.items) {
                          toggleExpand(item.title);
                        } else {
                          onNavigate(item.href);
                          setIsOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.href);
                            }}
                            className={cn(
                              "p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800",
                              isFavorite ? "text-amber-500" : "text-neutral-300"
                            )}
                          >
                            <Star className="h-3 w-3 fill-current" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(item.href);
                            }}
                            className={cn(
                              "p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800",
                              isPinned ? "text-indigo-600" : "text-neutral-300"
                            )}
                          >
                            <Pin className="h-3 w-3" />
                          </button>
                          {item.badge && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sub navigation items */}
                    {item.items && expandedItems[item.title] && !isCollapsed && (
                      <ul className="mt-1 pl-6 space-y-0.5">
                        {item.items.map((sub, subIdx) => (
                          <li key={subIdx}>
                            <button
                              onClick={() => {
                                onNavigate(sub.href);
                                setIsOpen(false);
                              }}
                              className={cn(
                                "w-full text-left rounded-md px-3 py-1.5 text-xs transition-colors",
                                activeHref === sub.href
                                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                              )}
                            >
                              {sub.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
        {!isCollapsed ? (
          <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/40 p-3 text-center">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Need assistance?
            </h4>
            <p className="mt-1 text-[11px] text-neutral-500">
              View documentation templates or guides.
            </p>
            <button
              onClick={() => onNavigate("/dashboard/docs")}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-white border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
            >
              <HelpCircle className="h-3 w-3" />
              Developer Docs
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate("/dashboard/docs")}
            className="flex h-9 w-9 mx-auto items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

// Topbar Header Component
export function Topbar({
  onSearchClick,
  onNotificationsClick,
  unreadNotifications = 0,
  userEmail = "user@devlaunchkit.com",
  onLogout,
  onNavigate,
}: {
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  unreadNotifications?: number;
  userEmail?: string;
  onLogout?: () => void;
  onNavigate: (href: string) => void;
}) {
  const { setIsOpen } = useSidebar();
  const { breadcrumbs } = useBreadcrumbs();
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/80 backdrop-blur-md px-4">
      {/* Left items: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-9 w-9 md:hidden items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav
          className="hidden sm:flex items-center text-xs font-medium text-neutral-500 space-x-1"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
              {crumb.href ? (
                <button
                  onClick={() => onNavigate(crumb.href!)}
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {crumb.title}
                </button>
              ) : (
                <span className="text-neutral-900 dark:text-white font-semibold">
                  {crumb.title}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right items: Search, Actions, Profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="flex h-9 w-9 sm:w-44 items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 px-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          title="Search console (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline text-xs">Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-1 text-[10px] font-mono font-medium text-neutral-400 shadow-sm">
            <Command className="h-2 w-2" />K
          </kbd>
        </button>

        <button
          onClick={onNotificationsClick}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4 text-neutral-500" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-neutral-900" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 rounded-full hover:bg-neutral-100 p-0.5 transition-colors"
            aria-label="User menu"
            aria-expanded={profileOpen}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5">
              <div className="h-full w-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                U
              </div>
            </div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 z-50"
                >
                  <div className="px-3 py-2 text-xs border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-semibold text-neutral-950 dark:text-white">Active Account</p>
                    <p className="text-neutral-500 truncate mt-0.5">{userEmail}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate("/dashboard/profile");
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
                    >
                      <User className="h-4 w-4 text-neutral-400" />
                      Your Profile
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("/dashboard/settings");
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
                    >
                      <Settings className="h-4 w-4 text-neutral-400" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        onNavigate("/dashboard/billing");
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
                    >
                      <CreditCard className="h-4 w-4 text-neutral-400" />
                      Billing & Plans
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1">
                    <button
                      onClick={() => {
                        onLogout?.();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// Container wrappers
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-neutral-50 dark:bg-neutral-950">{children}</div>
  );
}

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  return <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">{children}</main>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
