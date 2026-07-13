"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { BookOpen, FileText, ArrowRight } from "lucide-react";

export default function DocsPage() {
  const guides = [
    { title: "Unified Auth Setup", path: "/docs/AUTH.md", desc: "Decoupled auth interfaces backing Clerk & Better Auth." },
    { title: "Hierarchical RBAC System", path: "/docs/RBAC.md", desc: "Configure role inheritance chains and custom keys." },
    { title: "Multi-Tenant Workspaces", path: "/docs/ORGANIZATIONS.md", desc: "Organization context and membership switcher flows." },
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader title="Developer Documentation" description="LaunchKit platform system setups and setup guides." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((guide, idx) => (
            <div key={idx} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xs font-bold text-neutral-950 dark:text-white">{guide.title}</h3>
                <p className="text-[11px] text-neutral-500 leading-relaxed">{guide.desc}</p>
              </div>
              <a
                href={guide.path}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 group"
              >
                Read Guide
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </ContentWrapper>
    </PageContainer>
  );
}
