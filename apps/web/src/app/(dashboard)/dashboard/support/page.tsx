"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { HelpCircle, Mail, MessageSquare } from "lucide-react";

export default function SupportPage() {
  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader
          title="Support Desk"
          description="Search documentation resources, ask questions, or open technical assistance tickets."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 space-y-3">
            <HelpCircle className="h-6 w-6 text-indigo-600" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Knowledgebase Docs
            </h3>
            <p className="text-[11px] text-neutral-500">
              Read setup guidelines, provider comparative tables, and RBAC instructions.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 space-y-3">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Developer Chat</h3>
            <p className="text-[11px] text-neutral-500">
              Talk directly with our integration engineers in the Slack workspace community.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900 space-y-3">
            <Mail className="h-6 w-6 text-purple-600" />
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">Email Assistance</h3>
            <p className="text-[11px] text-neutral-500">
              Create a support ticket. Typical response times are within 12 hours.
            </p>
          </div>
        </div>

        <SettingsCard
          title="Open Support Ticket"
          description="Provide details about your technical inquiry."
        >
          <form className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase">
                Subject
              </label>
              <input
                type="text"
                placeholder="Database configuration help"
                className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3.5 py-2 text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase">
                Message
              </label>
              <textarea
                placeholder="Explain the error message details..."
                className="mt-1.5 w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-3.5 py-2 text-xs outline-none focus:border-indigo-500 h-28"
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                alert("Ticket submitted!");
              }}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              Submit Ticket
            </button>
          </form>
        </SettingsCard>
      </ContentWrapper>
    </PageContainer>
  );
}
