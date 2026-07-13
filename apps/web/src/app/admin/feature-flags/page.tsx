"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@devlaunchkit/ui";
import { Flag, Shield, ToggleLeft, ToggleRight } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  status: boolean;
  rolloutPercentage: number;
  environment: string;
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = React.useState<FeatureFlag[]>([
    { id: "f_1", key: "ai-summarize-v2", name: "Premium AI Summarization", status: true, rolloutPercentage: 50, environment: "production" },
    { id: "f_2", key: "billing-v3-checkout", name: "Stripe Checkout Overlay", status: false, rolloutPercentage: 0, environment: "production" },
    { id: "f_3", key: "org-multiple-owners", name: "Multi-Owner Org Role Support", status: true, rolloutPercentage: 100, environment: "all" },
  ]);

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: !f.status } : f))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature Flags Console</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Control feature flag toggles, progressive rollouts, and environments keys.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {flags.map((flag) => (
          <Card key={flag.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-neutral-400" />
                <CardTitle className="text-sm font-semibold">{flag.name}</CardTitle>
              </div>
              <button onClick={() => toggleFlag(flag.id)} className="text-neutral-600 dark:text-neutral-300">
                {flag.status ? (
                  <ToggleRight className="h-7 w-7 text-green-500" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-neutral-400" />
                )}
              </button>
            </CardHeader>
            <CardContent className="space-y-2 mt-2">
              <div className="text-xs font-mono bg-neutral-50 dark:bg-neutral-950 p-2 rounded border border-neutral-100 dark:border-neutral-850">
                {flag.key}
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mt-4">
                <span>Rollout: {flag.rolloutPercentage}%</span>
                <span className="uppercase tracking-wider font-semibold">{flag.environment}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
