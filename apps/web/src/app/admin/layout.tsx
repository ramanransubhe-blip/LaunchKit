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
  Users,
  Building2,
  Settings,
  CreditCard,
  Flag,
  Server,
  Activity,
  Terminal,
  LogOut,
  Bell,
} from "lucide-react";

const adminNavigationGroups: NavGroup[] = [
  {
    label: "Admin Overview",
    items: [
      { title: "Control Panel", href: "/admin/dashboard", icon: Home },
      { title: "Users Directory", href: "/admin/users", icon: Users },
      { title: "Organizations", href: "/admin/organizations", icon: Building2 },
    ],
  },
  {
    label: "Platform Systems",
    items: [
      { title: "Billing & Plans", href: "/admin/billing", icon: CreditCard },
      { title: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
      { title: "System Health", href: "/admin/system", icon: Server },
    ],
  },
  {
    label: "Logs & Security",
    items: [
      { title: "Audit Timeline", href: "/admin/audit", icon: Activity },
      { title: "Terminal Logs", href: "/admin/logs", icon: Terminal },
    ],
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
    { id: "go-admin", title: "Go to Admin Dashboard", category: "Admin", action: () => router.push("/admin/dashboard"), icon: Home },
    { id: "go-users", title: "Go to Users Directory", category: "Admin", action: () => router.push("/admin/users"), icon: Users },
  ];

  return (
    <div className="min-h-screen text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-950 font-sans">
      <DashboardSidebar
        groups={adminNavigationGroups}
        activeHref={pathname}
        onNavigate={(href) => router.push(href)}
        organizationName="LaunchKit Admin Ops"
      />

      <div className={(isCollapsed ? "md:pl-16" : "md:pl-64") + " flex flex-col min-h-screen transition-all duration-300"}>
        <Topbar
          onSearchClick={() => setCommandPaletteOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
          unreadNotifications={0}
          onNavigate={(href) => router.push(href)}
        />
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <AdminShellInner>{children}</AdminShellInner>
    </DashboardProviders>
  );
}
