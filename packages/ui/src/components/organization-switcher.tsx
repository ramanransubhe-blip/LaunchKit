"use client";

import * as React from "react";
import { Plus, Check, Users, Sparkles, Building, Mail, ArrowRight, UserPlus, Trash } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  role: string;
}

export interface InvitationItem {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
}

export function OrgSwitcherPopover({
  organizations,
  activeId,
  onSwitch,
  onCreateNew,
}: {
  organizations: OrganizationItem[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreateNew?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const activeOrg = organizations.find((o) => o.id === activeId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-850 p-2 rounded-lg transition-colors border border-neutral-200/40 dark:border-neutral-800"
      >
        <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
          {activeOrg?.name.charAt(0) || "O"}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
            {activeOrg?.name || "Select Org"}
          </p>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 z-50">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Workspaces
            </div>
            <ul className="space-y-0.5 mt-1">
              {organizations.map((org) => {
                const isActive = org.id === activeId;
                return (
                  <li key={org.id}>
                    <button
                      onClick={() => {
                        onSwitch(org.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/40"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{org.name}</span>
                      </div>
                      {isActive && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {onCreateNew && (
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1">
                <button
                  onClick={() => {
                    onCreateNew();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
                >
                  <Plus className="h-4 w-4 text-neutral-400" />
                  Create New Org
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgMembersList({
  members,
  onRemoveMember,
}: {
  members: MemberItem[];
  onRemoveMember?: (id: string) => void;
}) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800">
            <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Name</th>
            <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Email</th>
            <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Role</th>
            <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500">Joined</th>
            {onRemoveMember && <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-neutral-50/55 dark:hover:bg-neutral-800/10">
              <td className="px-4 py-3 text-xs font-semibold text-neutral-900 dark:text-white">
                {member.name}
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">{member.email}</td>
              <td className="px-4 py-3 text-xs">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400">
                  {member.role}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-400">
                {new Date(member.joinedAt).toLocaleDateString()}
              </td>
              {onRemoveMember && (
                <td className="px-4 py-3 text-xs text-right">
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                    aria-label="Remove member"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrgInvitationsList({
  invitations,
  onRevokeInvite,
}: {
  invitations: InvitationItem[];
  onRevokeInvite?: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {invitations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-6 text-center text-xs text-neutral-400">
          No pending invitations.
        </div>
      ) : (
        invitations.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">{invite.email}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Role: {invite.role}</p>
              </div>
            </div>

            {onRevokeInvite && (
              <button
                onClick={() => onRevokeInvite(invite.id)}
                className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-white hover:bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                Revoke Invite
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
