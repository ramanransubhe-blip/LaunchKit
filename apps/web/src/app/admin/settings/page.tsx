import * as React from "react";
import { requireAdmin, isDatabaseMockMode } from "@/lib/auth-server";
import { db, systemSettings } from "@devlaunchkit/database";
import { redirect } from "next/navigation";
import SettingsForm from "./settings-form";
import { cookies } from "next/headers";

interface SettingsData {
  appName: string;
  logoUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowedDomains: string;
}

async function getSystemSettings(): Promise<SettingsData> {
  const isMock = await isDatabaseMockMode();

  if (isMock) {
    // Read from cookies in mock mode if available
    const cookieStore = await cookies();
    const cookieSettingsStr = cookieStore.get("mock_settings")?.value;
    if (cookieSettingsStr) {
      try {
        return JSON.parse(cookieSettingsStr);
      } catch {
        // ignore parsing errors
      }
    }

    return {
      appName: "DevLaunchKit Sandbox",
      logoUrl: "https://logo.vercel.sh/launchkit",
      supportEmail: "support@devlaunchkit.com",
      maintenanceMode: false,
      allowedDomains: "*.devlaunchkit.com, localhost:3000",
    };
  }

  try {
    const dbSettings = await db.select().from(systemSettings);
    const lookup = (key: string, defVal: string) => {
      const row = dbSettings.find((s) => s.key === key);
      return row ? String(row.value) : defVal;
    };

    return {
      appName: lookup("app_name", "DevLaunchKit"),
      logoUrl: lookup("logo_url", "https://logo.vercel.sh/launchkit"),
      supportEmail: lookup("support_email", "support@devlaunchkit.com"),
      maintenanceMode: lookup("maintenance_mode", "false") === "true",
      allowedDomains: lookup("allowed_domains", "*.devlaunchkit.com, localhost:3000"),
    };
  } catch (error) {
    console.error("Drizzle settings fetch failed, using fallback:", error);
    return {
      appName: "DevLaunchKit Sandbox",
      logoUrl: "https://logo.vercel.sh/launchkit",
      supportEmail: "support@devlaunchkit.com",
      maintenanceMode: false,
      allowedDomains: "*.devlaunchkit.com, localhost:3000",
    };
  }
}

export default async function AdminSettingsPage() {
  // Authorize admin
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const initialSettings = await getSystemSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
          Platform Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Configure branding settings and configure maintenance parameters.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
