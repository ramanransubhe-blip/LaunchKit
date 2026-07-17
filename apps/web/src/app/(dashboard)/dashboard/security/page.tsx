"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  SettingsLayout,
  SettingsCard,
  DangerZone,
} from "@devlaunchkit/ui";
import { User, Settings, ShieldAlert, CreditCard } from "lucide-react";

export default function SecurityPage() {
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
          title="Security Controls"
          description="Configure multi-factor credentials, security keys, and active user sessions."
        />

        <SettingsLayout
          sidebarItems={settingsTabs}
          activeId="security"
          onSectionSelect={(id) => router.push(`/dashboard/${id}`)}
        >
          <SettingsCard
            title="Password and Credential Keys"
            description="Change your account sign-in password below."
          >
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3.5 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3.5 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                onClick={(e) => e.preventDefault()}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
              >
                Change Password
              </button>
            </form>
          </SettingsCard>

          {/* Danger Zone Panel */}
          <DangerZone
            title="Permanently Deactivate Account"
            description="Deactivating your account will purge user settings, revoke authorization credentials, and delete workspace database rows."
            actionLabel="Deactivate Account"
            onAction={() => alert("Action triggered!")}
          />
        </SettingsLayout>
      </ContentWrapper>
    </PageContainer>
  );
}
