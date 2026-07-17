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
  NavGroup,
} from "@devlaunchkit/ui";
import {
  Home,
  Users,
  Building2,
  Settings,
  CreditCard,
  Flag,
  Server,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { toggleAdminCookieAction } from "./actions";

const adminNavigationGroups: NavGroup[] = [
  {
    label: "Admin Overview",
    items: [
      { title: "Control Panel", href: "/admin/dashboard", icon: Home },
      { title: "Users Directory", href: "/admin/users", icon: Users },
      { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
      { title: "User Feedback", href: "/admin/feedback", icon: MessageSquare },
    ],
  },
  {
    label: "Platform Systems",
    items: [
      { title: "Organizations", href: "/admin/organizations", icon: Building2 },
      { title: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
      { title: "System Health", href: "/admin/dashboard", icon: Server },
    ],
  },
  {
    label: "Configuration",
    items: [{ title: "System Settings", href: "/admin/settings", icon: Settings }],
  },
];

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { isCollapsed } = useSidebar();

  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const title = seg.charAt(0).toUpperCase() + seg.slice(1).replace("-", " ");
      return { title, href: idx === segments.length - 1 ? undefined : href };
    });
    setBreadcrumbs(crumbs.length > 0 ? crumbs : [{ title: "Admin Console" }]);
  }, [pathname, setBreadcrumbs]);

  const handleMarkRead = () => {};
  const handleMarkAllRead = () => {};

  const globalCommands: CommandItem[] = [
    {
      id: "go-admin",
      title: "Go to Admin Dashboard",
      category: "Admin",
      action: () => router.push("/admin/dashboard"),
      icon: Home,
    },
    {
      id: "go-users",
      title: "Go to Users Directory",
      category: "Admin",
      action: () => router.push("/admin/users"),
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-950 font-sans">
      <DashboardSidebar
        groups={adminNavigationGroups}
        activeHref={pathname}
        onNavigate={(href) => router.push(href)}
        organizationName="LaunchKit Admin Ops"
      />

      <div
        className={
          (isCollapsed ? "md:pl-16" : "md:pl-64") +
          " flex flex-col min-h-screen transition-all duration-300"
        }
      >
        <Topbar
          onSearchClick={() => setCommandPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
          unreadNotifications={0}
          userEmail="admin@devlaunchkit.com"
          onLogout={async () => {
            await toggleAdminCookieAction(false);
            router.push("/");
          }}
          onNavigate={(href) => router.push(href)}
        />

        {/* Sandbox Role Switcher Banner */}
        <div className="bg-indigo-600 dark:bg-indigo-950 text-white dark:text-indigo-200 px-4 py-2 text-xs flex justify-between items-center shadow-inner border-b border-indigo-500/30">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-indigo-200" />
            <span>
              <strong>Sandbox Admin Mode</strong>: Enforcing client and middleware RBAC rules.
            </span>
          </div>
          <button
            onClick={async () => {
              await toggleAdminCookieAction(false);
              router.push("/");
            }}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold px-2.5 py-1 rounded transition-colors text-[10px] uppercase tracking-wider"
          >
            Deactivate Admin
          </button>
        </div>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={globalCommands}
      />

      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={[]}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <AdminShellInner>{children}</AdminShellInner>
    </DashboardProviders>
  );
}
