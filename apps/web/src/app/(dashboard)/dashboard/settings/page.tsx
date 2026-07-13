"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageContainer, ContentWrapper, PageHeader, SettingsLayout, SettingsCard } from "@devlaunchkit/ui";
import { User, Settings, ShieldAlert, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const settingsTabs = [
    { id: "settings", label: "General Settings", icon: Settings },
    { id: "account", label: "Account Parameters", icon: User },
    { id: "profile", label: "User Profile", icon: User },
    { id: "security", label: "Security & Keys", icon: ShieldAlert },
    { id: "billing", label: "Subscription Billing", icon: CreditCard },
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader title="General Preferences" description="Configure default dashboard themes, sound presets, and regional time zones." />

        <SettingsLayout
          sidebarItems={settingsTabs}
          activeId="settings"
          onSectionSelect={(id) => router.push(`/dashboard/${id}`)}
        >
          <SettingsCard title="Appearance & Preferences" description="Customize sidebar styles, theme parameters, and active animations.">
            <div className="space-y-4 max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">Hardened Animations</h4>
                  <p className="text-[10px] text-neutral-500">Reduce Motion overrides for accessibility.</p>
                </div>
                <input type="checkbox" className="rounded border-neutral-300" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">Desktop Notifications</h4>
                  <p className="text-[10px] text-neutral-500">Enable system push alerts for critical security events.</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-neutral-300" />
              </div>
            </div>
          </SettingsCard>
        </SettingsLayout>
      </ContentWrapper>
    </PageContainer>
  );
}
