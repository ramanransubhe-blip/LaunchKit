"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageContainer, ContentWrapper, PageHeader, SettingsLayout, SettingsCard } from "@devlaunchkit/ui";
import { User, Settings, ShieldAlert, CreditCard, Building2, KeyRound } from "lucide-react";

export default function ProfilePage() {
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
        <PageHeader title="Profile Settings" description="Update your user profile, avatar icon, and display name." />

        <SettingsLayout
          sidebarItems={settingsTabs}
          activeId="profile"
          onSectionSelect={(id) => router.push(`/dashboard/${id}`)}
        >
          <SettingsCard title="Public Profile Details" description="This information will be displayed on workspace assets.">
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase">Display Name</label>
                <input
                  type="text"
                  defaultValue="Alex Developer"
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3.5 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase">Biography</label>
                <textarea
                  defaultValue="Full-stack software architect engineering microservices."
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3.5 py-2 text-xs outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <button
                type="submit"
                onClick={(e) => e.preventDefault()}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
              >
                Save Profile
              </button>
            </form>
          </SettingsCard>
        </SettingsLayout>
      </ContentWrapper>
    </PageContainer>
  );
}
