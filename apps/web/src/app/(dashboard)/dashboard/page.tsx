"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import {
  TrendingUp,
  Users,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function DashboardIndexPage() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      label: "Active Subscriptions",
      value: "$12,480.00",
      change: "+12.3%",
      trendingUp: true,
      description: "MRR increase from last week",
      icon: TrendingUp,
    },
    {
      label: "Total Users",
      value: "1,248",
      change: "+4.1%",
      trendingUp: true,
      description: "Active logins past 24h",
      icon: Users,
    },
    {
      label: "API Operations",
      value: "284.2k",
      change: "-2.4%",
      trendingUp: false,
      description: "Gateway usage metrics",
      icon: Zap,
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
              <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
              <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>
            <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          </div>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader
          title="Dashboard Overview"
          description="Real-time operations, team workspace overview, and subscription parameters."
          actions={
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              New Deployment
            </button>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm overflow-hidden group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-neutral-50 dark:bg-neutral-850 flex items-center justify-center text-neutral-500">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span
                    className={`inline-flex items-center text-xs font-bold gap-0.5 ${
                      stat.trendingUp
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {stat.change}
                    {stat.trendingUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Console Workspace Overview */}
        <SettingsCard
          title="Active Integrations & Security Checklist"
          description="Ensure security compliance, connected databases, and active gateway keys remain correctly structured."
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/10 rounded-xl">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-950 dark:text-white">
                    Workspace Security Hardening
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Two-factor credentials and key rotation checks completed.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                100% Compliant
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-neutral-200/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/10 rounded-xl">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-950 dark:text-white">
                    Supabase Endpoint Status
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Postgres database connection pools are responsive.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400">
                Online
              </span>
            </div>
          </div>
        </SettingsCard>
      </ContentWrapper>
    </PageContainer>
  );
}
