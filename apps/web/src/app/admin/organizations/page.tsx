"use client";

import * as React from "react";
import { Card } from "@devlaunchkit/ui";
import { Building2, ArrowUpRight } from "lucide-react";

export default function AdminOrganizationsPage() {
  const orgs = [
    {
      id: "org_1",
      name: "Acme Corp",
      plan: "Enterprise",
      members: 142,
      storage: "420 GB",
      created: "2026-02-14",
    },
    {
      id: "org_2",
      name: "Clerk Inc",
      plan: "Startup Pro",
      members: 28,
      storage: "85 GB",
      created: "2026-04-12",
    },
    {
      id: "org_3",
      name: "LaunchKit Labs",
      plan: "Trial",
      members: 3,
      storage: "1.2 GB",
      created: "2026-05-01",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations Portal</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Monitor organizations metrics, active memberships, storage usage, and billing
            subscriptions.
          </p>
        </div>
      </div>

      <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">
                  Organization Name
                </th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">
                  Plan Tier
                </th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">
                  Active Members
                </th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">
                  Storage Used
                </th>
                <th className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">
                  Date Created
                </th>
                <th className="p-4 text-right font-semibold text-neutral-600 dark:text-neutral-300">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20"
                >
                  <td className="p-4 font-medium inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-neutral-400" />
                    {org.name}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 rounded">
                      {org.plan}
                    </span>
                  </td>
                  <td className="p-4">{org.members} members</td>
                  <td className="p-4 text-neutral-500">{org.storage}</td>
                  <td className="p-4 text-neutral-400">{org.created}</td>
                  <td className="p-4 text-right">
                    <button className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                      Details <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
