// Platform Wide Constant Definitions

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
} as const;

export const PERMISSIONS = {
  ALL: "all",
  READ_BILLING: "read:billing",
  WRITE_BILLING: "write:billing",
  READ_SETTINGS: "read:settings",
  WRITE_SETTINGS: "write:settings",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  BILLING: "/dashboard/billing",
  SETTINGS: "/dashboard/settings",
} as const;

export const PLANS = {
  STARTER: "starter",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const STORAGE_BUCKETS = {
  UPLOADS: "uploads",
  MEDIA: "media",
  AVATARS: "avatars",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;

export const LIMITS = {
  MAX_UPLOAD_SIZE_MB: 50,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
