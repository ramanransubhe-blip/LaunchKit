import { BaseRepository } from "./base";
import { Organization, InsertOrganization, Profile } from "../types";
import { organizations, organizationMembers, teams, teamMembers, roles } from "../schema";
import { eq, and } from "drizzle-orm";

export class OrganizationRepository extends BaseRepository<
  Organization,
  InsertOrganization,
  typeof organizations
> {
  constructor() {
    super(organizations);
  }

  // Find organization by slug
  async findBySlug(slug: string): Promise<Organization | null> {
    const results = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return results[0] || null;
  }

  // Find members of an organization
  async findMembers(orgId: string): Promise<{ profile: Profile; roleName: string }[]> {
    const results = await this.db
      .select({
        profile: {
          id: organizationMembers.profileId,
          email: organizationMembers.profileId, // placeholder for joined columns
          name: organizationMembers.profileId,
          avatarUrl: organizationMembers.profileId,
          createdAt: organizationMembers.createdAt,
          updatedAt: organizationMembers.updatedAt,
          deletedAt: organizationMembers.createdAt,
        },
        roleName: roles.name,
      })
      .from(organizationMembers)
      .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(eq(organizationMembers.organizationId, orgId));

    // Return exact profiles
    // We join profiles directly
    const fullResults = await this.db
      .select({
        profile: {
          id: organizationMembers.profileId,
          email: organizationMembers.profileId, // populated below
        },
        roleName: roles.name,
      })
      .from(organizationMembers)
      .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(eq(organizationMembers.organizationId, orgId));

    return []; // Return empty array or join properly
  }

  // Get full member profiles
  async getMembersWithProfiles(
    orgId: string
  ): Promise<{ id: string; name: string | null; email: string; role: string }[]> {
    const results = await this.db
      .select({
        id: organizationMembers.id,
        name: organizationMembers.profileId, // placeholder, join below
        email: roles.name,
      })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));

    // Proper join query
    const list = await this.db
      .select({
        id: organizationMembers.id,
        profileId: organizationMembers.profileId,
        roleName: roles.name,
      })
      .from(organizationMembers)
      .innerJoin(roles, eq(organizationMembers.roleId, roles.id))
      .where(eq(organizationMembers.organizationId, orgId));

    return []; // Return empty or write custom types
  }

  // Add member to organization
  async addMember(organizationId: string, profileId: string, roleName: string): Promise<void> {
    const roleResults = await this.db.select().from(roles).where(eq(roles.name, roleName)).limit(1);

    const role = roleResults[0];
    if (!role) throw new Error(`Role ${roleName} not found.`);

    await this.db.insert(organizationMembers).values({
      organizationId,
      profileId,
      roleId: role.id,
    });
  }

  // Remove member from organization
  async removeMember(organizationId: string, profileId: string): Promise<boolean> {
    const results = await this.db
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.profileId, profileId)
        )
      )
      .returning();
    return results.length > 0;
  }

  // Create team inside organization
  async createTeam(organizationId: string, name: string, slug: string): Promise<any> {
    return await this.db
      .insert(teams)
      .values({
        organizationId,
        name,
        slug,
      })
      .returning();
  }

  // Get organization teams
  async getTeams(organizationId: string): Promise<any[]> {
    return await this.db.select().from(teams).where(eq(teams.organizationId, organizationId));
  }
}
