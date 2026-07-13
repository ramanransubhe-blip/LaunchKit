"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DashboardProviders,
  DashboardSidebar,
  Topbar,
  CommandPalette,
  NotificationCenter,
  useSidebar,
  useBreadcrumbs,
  CommandItem,
  NotificationItem,
  NavGroup,
} from "@devlaunchkit/ui";
import {
  Home,
  BarChart3,
  FolderKanban,
  User,
  Settings,
  ShieldAlert,
  CreditCard,
  Building2,
  KeyRound,
  History,
  Bell,
  HelpCircle,
  BookOpen,
  UserCheck,
} from "lucide-react";

// Sidebar structure definitions
const navigationGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Organizations", href: "/dashboard/organizations", icon: Building2 },
      { title: "API Credentials", href: "/dashboard/api-keys", icon: KeyRound },
      { title: "Activity Audit", href: "/dashboard/activity", icon: History },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "System Settings",
    items: [
      {
        title: "Preferences",
        href: "/dashboard/settings",
        icon: Settings,
        items: [
          { title: "General", href: "/dashboard/settings" },
          { title: "Account", href: "/dashboard/account" },
          { title: "Profile", href: "/dashboard/profile" },
          { title: "Security Settings", href: "/dashboard/security" },
          { title: "Billing & Plans", href: "/dashboard/billing" },
        ],
      },
      { title: "Admin Center", href: "/dashboard/admin", icon: UserCheck },
    ],
  },
  {
    label: "Resources",
    items: [
      { title: "Documentation", href: "/dashboard/docs", icon: BookOpen },
      { title: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
    ],
  },
];

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { isCollapsed } = useSidebar();

  // Control palette and notifications states
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  // Set breadcrumbs dynamically based on path segment
  React.useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const title = seg.charAt(0).toUpperCase() + seg.slice(1).replace("-", " ");
      return { title, href: idx === segments.length - 1 ? undefined : href };
    });
    setBreadcrumbs(crumbs.length > 0 ? crumbs : [{ title: "Dashboard" }]);
  }, [pathname, setBreadcrumbs]);

  // Handle global keydown events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mock notifications array
  const [notificationsList, setNotificationsList] = React.useState<NotificationItem[]>([
    {
      id: "1",
      title: "Security Alert",
      message: "A new session was authenticated from IP 192.168.1.100.",
      category: "security",
      read: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Invoicing Successful",
      message: "Your monthly premium subscription renewal succeeded.",
      category: "billing",
      read: false,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: "3",
      title: "Team invitation",
      message: "You have been invited to join the DevLaunchKit organization.",
      category: "team",
      read: true,
      createdAt: new Date(Date.now() - 7200000),
    },
  ]);

  const handleMarkRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Commands definition lists
  const globalCommands: CommandItem[] = [
    { id: "go-dash", title: "Go to Dashboard", category: "Navigation", action: () => router.push("/dashboard"), icon: Home },
    { id: "go-anal", title: "Go to Analytics", category: "Navigation", action: () => router.push("/dashboard/analytics"), icon: BarChart3 },
    { id: "go-proj", title: "Go to Projects", category: "Navigation", action: () => router.push("/dashboard/projects"), icon: FolderKanban },
    { id: "go-orgs", title: "Go to Organizations", category: "Navigation", action: () => router.push("/dashboard/organizations"), icon: Building2 },
    { id: "go-billing", title: "Go to Billing", category: "Navigation", action: () => router.push("/dashboard/billing"), icon: CreditCard },
    { id: "go-settings", title: "Go to Settings", category: "Navigation", action: () => router.push("/dashboard/settings"), icon: Settings },
    { id: "action-logout", title: "Logout from session", category: "Actions", action: () => alert("Logged out!"), icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Collapsible Sidebar */}
      <DashboardSidebar
        groups={navigationGroups}
        activeHref={pathname}
        onNavigate={(href) => router.push(href)}
        organizationName="SaaS Enterprise Workspace"
      />

      {/* Primary Layout offset */}
      <div className={React.useMemo(() => (isCollapsed ? "md:pl-16" : "md:pl-64"), [isCollapsed]) + " flex flex-col min-h-screen transition-all duration-300"}>
        <Topbar
          onSearchClick={() => setCommandPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
          unreadNotifications={notificationsList.filter((n) => !n.read).length}
          onNavigate={(href) => router.push(href)}
        />

        {children}
      </div>

      {/* Global Interactive overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={globalCommands}
      />

      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notificationsList}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardShellInner>{children}</DashboardShellInner>
    </DashboardProviders>
  );
}
