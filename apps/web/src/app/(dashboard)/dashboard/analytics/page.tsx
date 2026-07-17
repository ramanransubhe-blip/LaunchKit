"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { Activity, Server, Clock, HardDrive } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader
          title="System Telemetry & Analytics"
          description="Monitor real-time engine operations, worker queue status, and database transaction queries."
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Request Success Rate",
              value: "99.98%",
              sub: "1.2M reqs past 24h",
              icon: Activity,
            },
            {
              label: "Database Read Latency",
              value: "14ms",
              sub: "p95 average latency",
              icon: Clock,
            },
            {
              label: "Memory Usage",
              value: "48.2%",
              sub: "Node.js cluster heap size",
              icon: Server,
            },
            {
              label: "Redis Cache Hit Rate",
              value: "94.6%",
              sub: "2.4M items in memory",
              icon: HardDrive,
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-semibold">{stat.label}</span>
                  <Icon className="h-4 w-4 text-neutral-400" />
                </div>
                <p className="text-xl font-bold mt-2 text-neutral-950 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        <SettingsCard
          title="Transaction Latency Logs"
          description="Real-time audit records showing request pathways and roundtrip latency times."
        >
          <div className="space-y-2 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between p-2 rounded bg-neutral-100/50 dark:bg-neutral-800/40">
              <span>GET /api/v1/auth/session</span>
              <span className="text-emerald-500">200 OK — 12ms</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-neutral-100/50 dark:bg-neutral-800/40">
              <span>POST /api/v1/organizations/invite</span>
              <span className="text-emerald-500">201 Created — 42ms</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-neutral-100/50 dark:bg-neutral-800/40">
              <span>GET /api/v1/billing/subscriptions</span>
              <span className="text-amber-500">304 Cached — 2ms</span>
            </div>
          </div>
        </SettingsCard>
      </ContentWrapper>
    </PageContainer>
  );
}
