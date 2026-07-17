import type { AuthEmailPayload, AuthEmailTemplate } from "../types/index.js";

/** Branding used when rendering auth emails. */
export interface AuthEmailBranding {
  /** Human-readable application name. */
  appName: string;
  /** Application base URL. */
  appUrl: string;
  /** Optional support address. */
  supportEmail?: string | null;
  /** Optional logo URL. */
  logoUrl?: string | null;
}

/** Rendered email message. */
export interface AuthEmailMessage {
  /** Recipient address. */
  to: string;
  /** Email subject. */
  subject: string;
  /** HTML body. */
  html: string;
  /** Plain-text body. */
  text: string;
  /** Template identifier. */
  template: AuthEmailTemplate;
}

/** Transport used to send rendered auth emails. */
export interface AuthEmailRenderer {
  /** Renders an auth email message. */
  render(payload: AuthEmailPayload): AuthEmailMessage;
}

/**
 * Creates a reusable auth email renderer.
 *
 * @param branding - Application branding.
 * @returns Renderer for auth email templates.
 *
 * @example
 * ```ts
 * const renderer = createAuthEmailRenderer({
 *   appName: "DevLaunchKit",
 *   appUrl: "https://app.example.com",
 * });
 * const email = renderer.render({
 *   to: "user@example.com",
 *   subject: "Verify your email",
 *   template: "verification",
 *   data: { verificationUrl },
 * });
 * ```
 */
export function createAuthEmailRenderer(branding: AuthEmailBranding): AuthEmailRenderer {
  return {
    render(payload) {
      return renderAuthEmail(payload, branding);
    },
  };
}

/**
 * Renders an auth email payload into HTML and text bodies.
 *
 * @param payload - Auth email payload.
 * @param branding - Application branding.
 * @returns Rendered email message.
 */
export function renderAuthEmail(
  payload: AuthEmailPayload,
  branding: AuthEmailBranding
): AuthEmailMessage {
  switch (payload.template) {
    case "verification":
      return renderActionEmail(payload, branding, {
        heading: "Verify your email",
        ctaLabel: "Verify email",
        body: "Confirm this email address to finish setting up your account.",
        ctaUrl: readString(payload.data.verificationUrl) ?? branding.appUrl,
      });
    case "magic-link":
      return renderActionEmail(payload, branding, {
        heading: "Sign in with a magic link",
        ctaLabel: "Sign in",
        body: "Use the link below to finish signing in.",
        ctaUrl: readString(payload.data.magicLinkUrl) ?? branding.appUrl,
      });
    case "password-reset":
      return renderActionEmail(payload, branding, {
        heading: "Reset your password",
        ctaLabel: "Reset password",
        body: "Use the link below to choose a new password.",
        ctaUrl: readString(payload.data.resetPasswordUrl) ?? branding.appUrl,
      });
    case "welcome":
      return renderActionEmail(payload, branding, {
        heading: "Welcome to the platform",
        ctaLabel: "Open app",
        body: "Your account is ready. Use the link below to continue.",
        ctaUrl: branding.appUrl,
      });
    case "organization-invitation":
      return renderActionEmail(payload, branding, {
        heading: "You're invited",
        ctaLabel: "Accept invitation",
        body: "You have been invited to join an organization.",
        ctaUrl: readString(payload.data.invitationUrl) ?? branding.appUrl,
      });
    default:
      return renderActionEmail(payload, branding, {
        heading: "Notification",
        ctaLabel: "Open app",
        body: "You have a new account notification.",
        ctaUrl: branding.appUrl,
      });
  }
}

/**
 * Builds a verification email payload.
 *
 * @param to - Recipient address.
 * @param verificationUrl - Verification URL.
 * @returns Email payload.
 */
export function buildVerificationEmail(to: string, verificationUrl: string): AuthEmailPayload {
  return {
    to,
    subject: "Verify your email",
    template: "verification",
    data: { verificationUrl },
  };
}

/**
 * Builds a magic-link email payload.
 *
 * @param to - Recipient address.
 * @param magicLinkUrl - Magic link URL.
 * @returns Email payload.
 */
export function buildMagicLinkEmail(to: string, magicLinkUrl: string): AuthEmailPayload {
  return {
    to,
    subject: "Sign in to your account",
    template: "magic-link",
    data: { magicLinkUrl },
  };
}

/**
 * Builds a password-reset email payload.
 *
 * @param to - Recipient address.
 * @param resetPasswordUrl - Reset URL.
 * @returns Email payload.
 */
export function buildPasswordResetEmail(to: string, resetPasswordUrl: string): AuthEmailPayload {
  return {
    to,
    subject: "Reset your password",
    template: "password-reset",
    data: { resetPasswordUrl },
  };
}

/**
 * Builds a welcome email payload.
 *
 * @param to - Recipient address.
 * @returns Email payload.
 */
export function buildWelcomeEmail(to: string): AuthEmailPayload {
  return {
    to,
    subject: "Welcome to DevLaunchKit",
    template: "welcome",
    data: {},
  };
}

/**
 * Builds an organization invitation email payload.
 *
 * @param to - Recipient address.
 * @param invitationUrl - Invitation acceptance URL.
 * @returns Email payload.
 */
export function buildOrganizationInvitationEmail(
  to: string,
  invitationUrl: string
): AuthEmailPayload {
  return {
    to,
    subject: "You have been invited to an organization",
    template: "organization-invitation",
    data: { invitationUrl },
  };
}

function renderActionEmail(
  payload: AuthEmailPayload,
  branding: AuthEmailBranding,
  options: {
    heading: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
  }
): AuthEmailMessage {
  const subject = payload.subject;
  const html = [
    "<!doctype html>",
    '<html><body style="font-family:Inter,system-ui,sans-serif;background:#0b1220;color:#e5eef8;padding:24px;">',
    `<div style="max-width:600px;margin:0 auto;background:#10192d;border:1px solid #24324d;border-radius:20px;padding:32px;">`,
    branding.logoUrl
      ? `<img src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(branding.appName)}" style="max-height:40px;margin-bottom:24px;" />`
      : "",
    `<p style="margin:0 0 12px;color:#8ea6c9;text-transform:uppercase;letter-spacing:0.08em;font-size:12px;">${escapeHtml(branding.appName)}</p>`,
    `<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${escapeHtml(options.heading)}</h1>`,
    `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#c4d3e7;">${escapeHtml(options.body)}</p>`,
    `<a href="${escapeHtml(options.ctaUrl)}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:600;">${escapeHtml(options.ctaLabel)}</a>`,
    branding.supportEmail
      ? `<p style="margin:24px 0 0;font-size:13px;color:#8ea6c9;">Need help? Contact <a href="mailto:${escapeHtml(branding.supportEmail)}" style="color:#a78bfa;">${escapeHtml(branding.supportEmail)}</a></p>`
      : "",
    "</div></body></html>",
  ]
    .filter(Boolean)
    .join("");

  const text = [
    branding.appName,
    options.heading,
    options.body,
    `Open: ${options.ctaUrl}`,
    branding.supportEmail ? `Support: ${branding.supportEmail}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    to: payload.to,
    subject,
    html,
    text,
    template: payload.template,
  };
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
