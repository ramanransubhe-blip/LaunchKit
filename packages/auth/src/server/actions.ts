"use server";

import { getGlobalAuthService } from "./index.js";
import {
  signInCredentialsSchema,
  signUpDataSchema,
  updateUserDataSchema,
  createOrganizationDataSchema,
  updateOrganizationDataSchema,
  validateAuthSchema,
} from "../validators/index.js";
import { serializeAuthError } from "../core/errors.js";
import type { AuthResult, AuthUser, AuthOrganization, AuthInvitation } from "../types/index.js";

export interface ServerActionResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

async function handleActionError<T>(error: unknown): Promise<ServerActionResponse<T>> {
  const serialized = serializeAuthError(error);
  return {
    success: false,
    data: null,
    error: {
      code: serialized.error.code,
      message: serialized.error.message,
      details: serialized.error.details as Record<string, string[]>,
    },
  };
}

/** Server Action: Authenticate user using email/password. */
export async function loginAction(payload: unknown): Promise<ServerActionResponse<AuthResult>> {
  try {
    const credentials = validateAuthSchema(signInCredentialsSchema, payload);
    const authService = getGlobalAuthService();
    const result = await authService.signIn(credentials);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Register new user account. */
export async function signupAction(payload: unknown): Promise<ServerActionResponse<AuthResult>> {
  try {
    const data = validateAuthSchema(signUpDataSchema, payload);
    const authService = getGlobalAuthService();
    const result = await authService.signUp(data);
    return { success: true, data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: End user session. */
export async function logoutAction(sessionId?: string): Promise<ServerActionResponse<void>> {
  try {
    const authService = getGlobalAuthService();
    await authService.signOut(sessionId);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Initiate forgot-password workflow. */
export async function forgotPasswordAction(email: string): Promise<ServerActionResponse<void>> {
  try {
    const authService = getGlobalAuthService();
    await authService.forgotPassword(email);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Complete password reset using verification token. */
export async function resetPasswordAction(
  token: string,
  newPassword: unknown
): Promise<ServerActionResponse<void>> {
  try {
    const authService = getGlobalAuthService();
    await authService.resetPassword(token, String(newPassword));
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Change password for active user. */
export async function changePasswordAction(
  userId: string,
  currentPassword: unknown,
  newPassword: unknown
): Promise<ServerActionResponse<void>> {
  try {
    const authService = getGlobalAuthService();
    await authService.changePassword(userId, String(currentPassword), String(newPassword));
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Verify user email. */
export async function verifyEmailAction(token: string): Promise<ServerActionResponse<void>> {
  try {
    const authService = getGlobalAuthService();
    await authService.verifyEmail(token);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Update user profile fields. */
export async function updateProfileAction(
  userId: string,
  payload: unknown
): Promise<ServerActionResponse<AuthUser>> {
  try {
    const data = validateAuthSchema(updateUserDataSchema, payload);
    const authService = getGlobalAuthService();
    const user = await authService.updateProfile(userId, data);
    return { success: true, data: user };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Create new organization context. */
export async function createOrganizationAction(
  userId: string,
  payload: unknown
): Promise<ServerActionResponse<AuthOrganization>> {
  try {
    const data = validateAuthSchema(createOrganizationDataSchema, payload);
    const authService = getGlobalAuthService();
    const organization = await authService.createOrganization(userId, data);
    return { success: true, data: organization };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Update organization details. */
export async function updateOrganizationAction(
  orgId: string,
  payload: unknown
): Promise<ServerActionResponse<AuthOrganization>> {
  try {
    const data = validateAuthSchema(updateOrganizationDataSchema, payload);
    const authService = getGlobalAuthService();
    const organization = await authService.updateOrganization(orgId, data);
    return { success: true, data: organization };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Invite member to organization. */
export async function inviteUserAction(
  orgId: string,
  email: string,
  role: unknown
): Promise<ServerActionResponse<AuthInvitation>> {
  try {
    const authService = getGlobalAuthService();
    const invitation = await authService.inviteToOrganization(orgId, email, role as any);
    return { success: true, data: invitation };
  } catch (error) {
    return handleActionError(error);
  }
}

/** Server Action: Switch organization membership context. */
export async function switchOrganizationAction(
  userId: string,
  orgId: string
): Promise<ServerActionResponse<void>> {
  try {
    const authService = getGlobalAuthService();
    await authService.switchOrganization(userId, orgId);
    return { success: true, data: null };
  } catch (error) {
    return handleActionError(error);
  }
}
