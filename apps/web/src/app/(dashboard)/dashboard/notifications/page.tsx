"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { Bell, Info, Shield, Check } from "lucide-react";

export default function NotificationsPage() {
  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader title="Alert Stream Logs" description="Review all historic security notifications, billing, and team announcements." />

        <SettingsCard title="Inbox Alerts" description="Your system-wide notification history logs.">
          <div className="space-y-3">
            {[
              { id: 1, title: "Successful Auto-Renewal", type: "Billing", msg: "Monthly charge was successfully processed.", date: "Today" },
              { id: 2, title: "Password Change Verified", type: "Security", msg: "Your profile password credential keys were updated.", date: "Yesterday" },
            ].map((alertItem) => (
              <div key={alertItem.id} className="flex gap-3 items-start p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                  {alertItem.type === "Security" ? <Shield className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">{alertItem.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{alertItem.msg}</p>
                </div>
                <span className="text-[10px] text-neutral-400 shrink-0">{alertItem.date}</span>
              </div>
            ))}
          </div>
        </SettingsCard>
      </ContentWrapper>
    </PageContainer>
  );
}
