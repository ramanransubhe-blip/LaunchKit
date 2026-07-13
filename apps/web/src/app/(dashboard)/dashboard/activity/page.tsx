"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { Shield, Settings, Key, User } from "lucide-react";

export default function ActivityPage() {
  const auditLogs = [
    { action: "API Key Generated", user: "alex@saas.com", ip: "192.168.1.1", time: new Date(), icon: Key },
    { action: "Settings Changed: Reduced Motion", user: "alex@saas.com", ip: "192.168.1.1", time: new Date(Date.now() - 3600000), icon: Settings },
    { action: "MFA Authentication Disabled", user: "blake@saas.com", ip: "182.16.8.44", time: new Date(Date.now() - 86400000), icon: Shield },
    { action: "Profile Avatar Updated", user: "alex@saas.com", ip: "192.168.1.1", time: new Date(Date.now() - 172800000), icon: User },
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader title="Activity Audit Logs" description="Review security actions, setting shifts, and API credentials manipulations." />

        <SettingsCard title="Workspace Change History" description="Trace actions across all workspace developers.">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {auditLogs.map((log, idx) => {
                const Icon = log.icon;
                return (
                  <li key={idx}>
                    <div className="relative pb-8">
                      {idx !== auditLogs.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200 dark:bg-neutral-850" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                              {log.action} <span className="font-normal text-neutral-500">by {log.user}</span>
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Originating IP: {log.ip}</p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-neutral-400">
                            {new Date(log.time).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </SettingsCard>
      </ContentWrapper>
    </PageContainer>
  );
}
