import { cookies } from "next/headers";
import { db, checkDatabaseHealth, profiles, sessions } from "@devlaunchkit/database";
import { eq } from "drizzle-orm";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatarUrl: string | null;
}

export interface AdminSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface AuthContext {
  isAuthenticated: boolean;
  user: AdminUser | null;
  session: AdminSession | null;
}

// Check if we are in mock mode (development without database configured)
export async function isDatabaseMockMode(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("your_key") || url.includes("localhost:5432/launchkit")) {
    // If DATABASE_URL is default, check database health to be absolutely sure
    try {
      const health = await checkDatabaseHealth();
      return health.status !== "healthy";
    } catch {
      return true;
    }
  }
  return false;
}

// Get standard mock admin user
export const MOCK_ADMIN_USER: AdminUser = {
  id: "u_admin",
  email: "admin@devlaunchkit.com",
  name: "Super Administrator",
  role: "admin",
  status: "active",
  avatarUrl: "https://avatar.vercel.sh/admin",
};

// Get the current session context
export async function getSessionContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("auth_session")?.value;
  const mockRole = cookieStore.get("mock_role")?.value;

  // 1. Check if mock mode is active
  if (await isDatabaseMockMode()) {
    if (sessionToken === "tok_mock_admin" || mockRole === "admin") {
      return {
        isAuthenticated: true,
        user: MOCK_ADMIN_USER,
        session: {
          id: "sess_mock_admin",
          token: "tok_mock_admin",
          userId: MOCK_ADMIN_USER.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      };
    }

    // Default user session if token is present but not admin
    if (sessionToken) {
      return {
        isAuthenticated: true,
        user: {
          id: "u_dev",
          email: "user@devlaunchkit.com",
          name: "Test Developer",
          role: "user",
          status: "active",
          avatarUrl: "https://avatar.vercel.sh/test-user",
        },
        session: {
          id: "sess_mock_dev",
          token: sessionToken,
          userId: "u_dev",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      };
    }

    return { isAuthenticated: false, user: null, session: null };
  }

  // 2. Database Mode
  if (!sessionToken) {
    return { isAuthenticated: false, user: null, session: null };
  }

  try {
    const results = await db
      .select({
        session: sessions,
        profile: profiles,
      })
      .from(sessions)
      .innerJoin(profiles, eq(sessions.profileId, profiles.id))
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    const match = results[0];
    if (!match) {
      return { isAuthenticated: false, user: null, session: null };
    }

    // Check expiry
    if (new Date() > new Date(match.session.expiresAt)) {
      // Clean up expired session asynchronously
      db.delete(sessions)
        .where(eq(sessions.id, match.session.id))
        .catch(() => {});
      return { isAuthenticated: false, user: null, session: null };
    }

    return {
      isAuthenticated: true,
      user: {
        id: match.profile.id,
        email: match.profile.email,
        name: match.profile.name || "User",
        role: match.profile.role,
        status: match.profile.status,
        avatarUrl: match.profile.avatarUrl,
      },
      session: {
        id: match.session.id,
        token: match.session.token,
        userId: match.session.profileId,
        expiresAt: match.session.expiresAt,
      },
    };
  } catch (error) {
    console.error("Failed to fetch session context:", error);
    return { isAuthenticated: false, user: null, session: null };
  }
}

// Middleware or route guard requiring admin access
export async function requireAdmin(): Promise<AdminUser> {
  const context = await getSessionContext();

  if (!context.isAuthenticated || !context.user) {
    throw new Error("UNAUTHORIZED");
  }

  if (
    context.user.role !== "admin" &&
    context.user.role !== "super_admin" &&
    context.user.role !== "owner"
  ) {
    throw new Error("FORBIDDEN");
  }

  if (context.user.status === "suspended" || context.user.status === "banned") {
    throw new Error("SUSPENDED");
  }

  return context.user;
}
