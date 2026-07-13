import { BaseRepository } from "./base";
import { Profile, InsertProfile, Session, InsertSession } from "../types";
import { profiles, sessions, loginHistory, userRoles, roles } from "../schema";
import { eq, and } from "drizzle-orm";

export class UserRepository extends BaseRepository<Profile, InsertProfile, typeof profiles> {
  constructor() {
    super(profiles);
  }

  // Find user profile by email
  async findByEmail(email: string): Promise<Profile | null> {
    const results = await this.db
      .select()
      .from(profiles)
      .where(and(eq(profiles.email, email.toLowerCase())))
      .limit(1);
    return results[0] || null;
  }

  // Get active roles assigned to a user profile
  async findUserRoles(profileId: string): Promise<string[]> {
    const results = await this.db
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.profileId, profileId));
    return results.map((r) => r.name);
  }

  // Assign a platform role to a user profile
  async assignRoleToUser(profileId: string, roleName: string): Promise<void> {
    const roleResults = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, roleName))
      .limit(1);

    const role = roleResults[0];
    if (!role) throw new Error(`Role ${roleName} does not exist.`);

    await this.db.insert(userRoles).values({
      profileId,
      roleId: role.id,
    });
  }

  // Create a user authentication session
  async createSession(profileId: string, token: string, expiresAt: Date): Promise<Session> {
    const results = await this.db
      .insert(sessions)
      .values({
        profileId,
        token,
        expiresAt,
      })
      .returning();
    return results[0];
  }

  // Verify and find active session
  async verifySession(token: string): Promise<{ session: Session; profile: Profile } | null> {
    const results = await this.db
      .select({
        session: sessions,
        profile: profiles,
      })
      .from(sessions)
      .innerJoin(profiles, eq(sessions.profileId, profiles.id))
      .where(eq(sessions.token, token))
      .limit(1);

    const match = results[0];
    if (!match) return null;

    // Check expiry
    if (new Date() > new Date(match.session.expiresAt)) {
      await this.db.delete(sessions).where(eq(sessions.id, match.session.id));
      return null;
    }

    return match;
  }

  // Log login attempt
  async logLoginAttempt(data: {
    profileId?: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
    status: "success" | "failed";
    failureReason?: string;
  }): Promise<void> {
    await this.db.insert(loginHistory).values(data);
  }
}
