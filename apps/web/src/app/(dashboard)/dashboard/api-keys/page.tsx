"use client";

import * as React from "react";
import { PageContainer, ContentWrapper, PageHeader, SettingsCard } from "@devlaunchkit/ui";
import { Key, Copy, Check, Eye, EyeOff, Plus, Trash } from "lucide-react";

export default function ApiKeysPage() {
  const [keys, setKeys] = React.useState([
    { id: "1", name: "Production Gateway Key", token: "dlk_live_51P0...d8f2", created: new Date() },
    {
      id: "2",
      name: "Staging Test Webhook",
      token: "dlk_test_51P0...a871",
      created: new Date(Date.now() - 86400000),
    },
  ]);

  const [visibleKeys, setVisibleKeys] = React.useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    alert("Token copied to clipboard!");
  };

  const handleDelete = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader
          title="API Configuration Keys"
          description="Generate and manage secure authentication tokens for programmatic API access."
          actions={
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors">
              <Plus className="h-4 w-4" />
              Generate API Key
            </button>
          }
        />

        <SettingsCard
          title="Programmatic Access Credentials"
          description="Do not share these credentials. Use webhook tokens only in secure server backends."
        >
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Name</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Token</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Created</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {keys.map((key) => {
                  const isVisible = visibleKeys[key.id];
                  return (
                    <tr key={key.id} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3 text-xs font-semibold text-neutral-950 dark:text-white">
                        {key.name}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-neutral-500">
                        {isVisible ? key.token : "••••••••••••••••••••••••••••"}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400">
                        {new Date(key.created).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-right space-x-1">
                        <button
                          onClick={() => toggleVisibility(key.id)}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          {isVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(key.token)}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="p-1 rounded hover:bg-red-50 text-red-500 dark:hover:bg-red-950/20"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </ContentWrapper>
    </PageContainer>
  );
}
