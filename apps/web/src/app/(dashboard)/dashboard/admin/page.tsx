"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { ShieldCheck, ArrowRight, Activity, Terminal, ExternalLink } from "lucide-react";
import { toggleAdminCookieAction } from "@/app/admin/actions";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [activating, setActivating] = React.useState(false);

  const handleActivate = async () => {
    setActivating(true);
    try {
      await toggleAdminCookieAction(true);
      router.push("/admin/dashboard");
    } catch (e) {
      console.error("Failed to activate admin session:", e);
    } finally {
      setActivating(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader
          title="Admin Command Center"
          description="Access platform-level configuration parameters, user directories, and audit logs."
        />

        <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Launch the Admin Console
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              DevLaunchKit v1.1 Admin Console is protected by role-based access control. Click below
              to activate simulated admin credentials and enter the console.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleActivate}
              disabled={activating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-xs font-bold text-white transition-all shadow hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {activating ? "Activating Credentials..." : "Enter Admin Console"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-neutral-200/50 dark:border-neutral-800 text-left max-w-xl mx-auto">
            <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-850 dark:text-white">
                <Activity className="h-4 w-4 text-indigo-500" />
                Real-Time Telemetry
              </div>
              <p className="text-[10px] text-neutral-450 leading-normal">
                Monitor server logs, CPU, latency and overall system metrics.
              </p>
            </div>

            <div className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-neutral-850 dark:text-white">
                <Terminal className="h-4 w-4 text-indigo-500" />
                Database Integrations
              </div>
              <p className="text-[10px] text-neutral-450 leading-normal">
                Execute admin level queries for users, feedback and billing.
              </p>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </PageContainer>
  );
}
