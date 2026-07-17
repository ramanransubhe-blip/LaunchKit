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
import { User, Settings, ShieldAlert, CreditCard, Sparkles, Check } from "lucide-react";

export default function BillingPage() {
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
          title="Subscription Plans & Billing"
          description="Manage user subscription plans, payment tokens, and monthly invoice catalogs."
        />

        <SettingsLayout
          sidebarItems={settingsTabs}
          activeId="billing"
          onSectionSelect={(id) => router.push(`/dashboard/${id}`)}
        >
          {/* Active tier card */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/5 dark:border-indigo-950/40 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Active Plan: Pro Workspace
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Renews automatically on October 12, 2026 ($29.00/month).
                </p>
              </div>
            </div>
            <button className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors">
              Manage Billing Portal
            </button>
          </div>

          <SettingsCard
            title="Plan Matrix Comparison"
            description="Compare and choose from subscription packages."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Free Package
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Basic personal dev workflow sandbox.
                  </p>
                </div>
                <div className="text-xl font-bold">
                  $0 <span className="text-xs font-medium text-neutral-400">/mo</span>
                </div>
                <ul className="text-xs text-neutral-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> 1 Active Project
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Basic Mocks mode
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border-2 border-indigo-500 p-4 space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                  Current Plan
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Pro Package
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Production-ready team workspaces.
                  </p>
                </div>
                <div className="text-xl font-bold">
                  $29 <span className="text-xs font-medium text-neutral-400">/mo</span>
                </div>
                <ul className="text-xs text-neutral-500 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Unlimited Projects
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Organization switcher support
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Direct Slack alerts channel
                  </li>
                </ul>
              </div>
            </div>
          </SettingsCard>
        </SettingsLayout>
      </ContentWrapper>
    </PageContainer>
  );
}
