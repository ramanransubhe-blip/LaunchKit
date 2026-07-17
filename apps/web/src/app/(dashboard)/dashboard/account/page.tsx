"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  SettingsLayout,
  SettingsCard,
} from "@devlaunchkit/ui";
import { User, Settings, ShieldAlert, CreditCard } from "lucide-react";

export default function AccountPage() {
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
        <PageHeader
          title="Account Parameters"
          description="Manage primary user credentials, sign-in aliases, and regional preferences."
        />

        <SettingsLayout
          sidebarItems={settingsTabs}
          activeId="account"
          onSectionSelect={(id) => router.push(`/dashboard/${id}`)}
        >
          <SettingsCard
            title="User Credentials"
            description="Primary email address used for notifications and sign-in verification."
          >
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase">
                  Primary Email Address
                </label>
                <input
                  type="email"
                  disabled
                  defaultValue="developer@devlaunchkit.com"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 px-3.5 py-2 text-xs text-neutral-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase">
                  Preferred Language
                </label>
                <select className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3.5 py-2 text-xs outline-none">
                  <option>English (US)</option>
                  <option>Deutsch</option>
                  <option>Français</option>
                </select>
              </div>
            </div>
          </SettingsCard>
        </SettingsLayout>
      </ContentWrapper>
    </PageContainer>
  );
}
