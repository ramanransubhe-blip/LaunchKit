"use client";

import * as React from "react";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  OrgSwitcherPopover,
  OrgMembersList,
  OrgInvitationsList,
  SettingsCard,
} from "@devlaunchkit/ui";
import { UserPlus, Sparkles } from "lucide-react";

export default function OrganizationsPage() {
  const [activeOrgId, setActiveOrgId] = React.useState("org_1");

  const orgs = [
    { id: "org_1", name: "SaaS Dev Group", slug: "saas-dev", role: "admin" },
    { id: "org_2", name: "LaunchKit Workspace", slug: "launchkit", role: "owner" },
  ];

  const initialMembers = [
    { id: "mem_1", name: "Alex Admin", email: "alex@saas.com", role: "admin", joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { id: "mem_2", name: "Blake Engineer", email: "blake@saas.com", role: "member", joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  ];

  const [members, setMembers] = React.useState(initialMembers);
  const [invitations, setInvitations] = React.useState([
    { id: "inv_1", email: "charlie@saas.com", role: "member", createdAt: new Date() },
  ]);

  const handleSwitchOrg = (id: string) => {
    setActiveOrgId(id);
    alert(`Switched active organization to ${id}!`);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRevokeInvite = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader
          title="Organization Workspaces"
          description="Manage workspace organization switchers, member invites, and roles rosters."
          actions={
            <div className="flex items-center gap-2">
              <OrgSwitcherPopover
                organizations={orgs}
                activeId={activeOrgId}
                onSwitch={handleSwitchOrg}
                onCreateNew={() => alert("Create organization modal!")}
              />
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </button>
            </div>
          }
        />

        <div className="space-y-8">
          <SettingsCard
            title="Workspace Members Roster"
            description="Manage users permitted to configure build targets and deploy containers."
          >
            <OrgMembersList members={members} onRemoveMember={handleRemoveMember} />
          </SettingsCard>

          <SettingsCard
            title="Pending Member Invitations"
            description="View organization invitations sent by email that are waiting to be accepted."
          >
            <OrgInvitationsList invitations={invitations} onRevokeInvite={handleRevokeInvite} />
          </SettingsCard>
        </div>
      </ContentWrapper>
    </PageContainer>
  );
}
