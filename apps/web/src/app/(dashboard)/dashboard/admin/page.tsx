"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { Users, Server, Shield, ToggleLeft } from "lucide-react";

export default function AdminPage() {
  const users = [
    { name: "Alex Admin", email: "alex@saas.com", role: "super_admin" },
    { name: "Blake Member", email: "blake@saas.com", role: "user" },
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader title="Admin Command Center" description="Platform configurations, global system toggle variables, and active user metrics." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 space-y-3">
            <Users className="h-6 w-6 text-indigo-600" />
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Platform Users</h4>
            <p className="text-xl font-bold text-neutral-950 dark:text-white">1,248 users</p>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 space-y-3">
            <Server className="h-6 w-6 text-emerald-600" />
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Container Deployments</h4>
            <p className="text-xl font-bold text-neutral-950 dark:text-white">12 microservices</p>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 space-y-3">
            <Shield className="h-6 w-6 text-amber-600" />
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Compliancy Audits</h4>
            <p className="text-xl font-bold text-neutral-950 dark:text-white">Passed 100%</p>
          </div>
        </div>

        <SettingsCard title="Platform Level Users" description="System-wide users across all workspaces.">
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Name</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Email</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Global Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map((user, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 text-xs font-semibold text-neutral-950 dark:text-white">{user.name}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">{user.email}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400">
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </ContentWrapper>
    </PageContainer>
  );
}
