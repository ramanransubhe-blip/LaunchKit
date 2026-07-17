"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@devlaunchkit/ui";
import { useToast } from "@devlaunchkit/ui";
import { updateSystemSettingsAction } from "../actions";
import { Save } from "lucide-react";

interface SettingsData {
  appName: string;
  logoUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowedDomains: string;
}

export default function SettingsForm({ initialSettings }: { initialSettings: SettingsData }) {
  const { showToast } = useToast();
  const [formData, setFormData] = React.useState<SettingsData>(initialSettings);
  const [saving, setSaving] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await updateSystemSettingsAction(formData);
      if (response.success) {
        showToast("System settings updated successfully.", "success");
      } else {
        showToast(response.error || "Failed to update settings.", "error");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to submit settings form.";
      showToast(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Settings */}
      <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
            General Brand Settings
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Configure application metadata, naming and logos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-2">
            <label
              className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              htmlFor="appName"
            >
              App Name
            </label>
            <input
              id="appName"
              type="text"
              name="appName"
              value={formData.appName}
              onChange={handleChange}
              placeholder="e.g. LaunchKit App"
              required
              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid gap-2">
            <label
              className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              htmlFor="logoUrl"
            >
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="text"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="e.g. https://logo.vercel.sh/app"
              required
              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid gap-2">
            <label
              className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              htmlFor="supportEmail"
            >
              Support Contact Email
            </label>
            <input
              id="supportEmail"
              type="email"
              name="supportEmail"
              value={formData.supportEmail}
              onChange={handleChange}
              placeholder="e.g. support@domain.com"
              required
              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none text-neutral-900 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Configurations */}
      <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
            System Parameters
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Configure security boundaries and gateway modes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Maintenance mode toggle */}
          <div className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 rounded-xl">
            <div className="space-y-0.5">
              <div className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                Maintenance Mode
              </div>
              <div className="text-[11px] text-neutral-400">
                Lock the main app with a scheduled maintenance block.
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.maintenanceMode ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="grid gap-2">
            <label
              className="text-xs font-semibold text-neutral-500 uppercase tracking-wider"
              htmlFor="allowedDomains"
            >
              Allowed CORS Domains
            </label>
            <input
              id="allowedDomains"
              type="text"
              name="allowedDomains"
              value={formData.allowedDomains}
              onChange={handleChange}
              placeholder="e.g. *.domain.com, localhost:3000"
              required
              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none text-neutral-900 dark:text-white"
            />
            <p className="text-[10px] text-neutral-400">
              Comma-separated list of hosts permitted to invoke key REST gateways.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
