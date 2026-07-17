import { z } from "zod";
import { AuthValidationError } from "../core/errors.js";
import {
  AuthProviderType,
  OAuthProvider,
  OrganizationRole,
  Permission,
  UserRole,
} from "../types/index.js";

/** Validates a payload with Zod and throws a typed auth error on failure. */
export function validateAuthSchema<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AuthValidationError("Request payload validation failed", {
      issues: result.error.flatten().fieldErrors,
    });
  }
  return result.data;
}

/** Email address schema. */
export const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email()
  .transform((value) => value.toLowerCase());

/** UUID schema. */
export const uuidSchema = z.string().uuid();

/** URL slug schema. */
export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

/** Password schema matching the default security policy. */
export const passwordSchema = z
  .string()
  .min(12)
  .max(100)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/);

/** Auth provider schema. */
export const authProviderTypeSchema = z.nativeEnum(AuthProviderType);

/** OAuth provider schema. */
export const oauthProviderSchema = z.nativeEnum(OAuthProvider);

/** Platform role schema. */
export const userRoleSchema = z.nativeEnum(UserRole);

/** Organization role schema. */
export const organizationRoleSchema = z.nativeEnum(OrganizationRole);

/** Permission schema. */
export const permissionSchema = z.nativeEnum(Permission);

/** Auth action metadata schema. */
export const authActionMetadataSchema = z.object({
  requestId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  organizationId: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

/** Sign-in schema. */
export const signInCredentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
  meta: authActionMetadataSchema.optional(),
});

/** Sign-up schema. */
export const signUpDataSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1).max(100),
  meta: authActionMetadataSchema.optional(),
});

/** User profile update schema. */
export const updateUserDataSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: emailSchema.optional(),
    image: z.string().url().optional().nullable(),
    role: userRoleSchema.optional(),
    organizationId: z.string().uuid().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

/** Organization creation schema. */
export const createOrganizationDataSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema.optional(),
  logo: z.string().url().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Organization update schema. */
export const updateOrganizationDataSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    slug: slugSchema.optional(),
    logo: z.string().url().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

/** Auth provider config schema. */
export const authProviderConfigSchema = z.object({
  provider: authProviderTypeSchema,
  baseUrl: z.string().url(),
  secret: z.string().min(32),
  oauth: z
    .object({
      google: z
        .object({
          clientId: z.string().min(1),
          clientSecret: z.string().min(1),
          scopes: z.array(z.string()).optional(),
          redirectUrl: z.string().url().optional(),
        })
        .optional(),
      github: z
        .object({
          clientId: z.string().min(1),
          clientSecret: z.string().min(1),
          scopes: z.array(z.string()).optional(),
          redirectUrl: z.string().url().optional(),
        })
        .optional(),
    })
    .partial()
    .optional(),
  session: z
    .object({
      maxAge: z.number().int().positive().optional(),
      updateAge: z.number().int().positive().optional(),
      cookieName: z.string().min(1).optional(),
      secureCookie: z.boolean().optional(),
      sameSite: z.enum(["strict", "lax", "none"]).optional(),
      rememberMe: z.boolean().optional(),
      rememberMeMaxAge: z.number().int().positive().optional(),
    })
    .optional(),
  email: z
    .object({
      from: z.string().email(),
      verificationUrl: z.string().url().optional(),
      resetPasswordUrl: z.string().url().optional(),
      magicLinkUrl: z.string().url().optional(),
    })
    .optional(),
  security: z
    .object({
      csrf: z.boolean().optional(),
      sessionRotation: z.boolean().optional(),
      maxLoginAttempts: z.number().int().positive().optional(),
      lockoutDuration: z.number().int().positive().optional(),
      suspiciousLoginDetection: z.boolean().optional(),
      minPasswordLength: z.number().int().positive().optional(),
      requirePasswordComplexity: z.boolean().optional(),
    })
    .optional(),
});

const AUTH_EMAIL_TEMPLATES = [
  "verification",
  "magic-link",
  "password-reset",
  "welcome",
  "organization-invitation",
] as const;

/** Auth email template schema. */
export const authEmailTemplateSchema = z.enum(AUTH_EMAIL_TEMPLATES);

/** Auth email payload schema. */
export const authEmailPayloadSchema = z.object({
  to: emailSchema,
  subject: z.string().trim().min(1).max(200),
  template: authEmailTemplateSchema,
  data: z.record(z.unknown()),
});
