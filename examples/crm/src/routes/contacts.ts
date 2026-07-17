/**
 * @module routes/contacts
 * @description Contact management and outreach routes.
 *
 * Provides full CRUD operations for CRM contacts with role-based access
 * control, full-text search, activity logging, and email outreach.
 */

import { Hono } from "hono";

import { sendSuccess, sendFailure, sendPagination } from "@devlaunchkit/api";
import { PermissionsManager } from "@devlaunchkit/permissions";

import { crmPermissions, type CrmEnv } from "../index.js";
import { indexContact, searchIndex, type SearchResult } from "../services/search.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Contact record stored in the CRM. */
interface Contact {
  readonly id: string;
  readonly orgId: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  title: string | null;
  status: "lead" | "prospect" | "customer" | "churned";
  source: string | null;
  tags: string[];
  notes: string;
  assignedTo: string | null;
  readonly createdBy: string;
  readonly createdAt: Date;
  updatedAt: Date;
}

/** Activity log entry for audit trail. */
interface Activity {
  readonly id: string;
  readonly contactId: string;
  readonly userId: string;
  readonly action: string;
  readonly details: string;
  readonly createdAt: Date;
}

/** Request body for creating or updating a contact. */
interface ContactInput {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly company?: string;
  readonly title?: string;
  readonly status?: Contact["status"];
  readonly source?: string;
  readonly tags?: string[];
  readonly notes?: string;
  readonly assignedTo?: string;
}

// ---------------------------------------------------------------------------
// In-Memory Stores
// ---------------------------------------------------------------------------

const contacts = new Map<string, Contact>();
const activities: Activity[] = [];

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Records an activity event for the contact audit trail.
 */
function logActivity(contactId: string, userId: string, action: string, details: string): void {
  activities.push({
    id: generateId("act"),
    contactId,
    userId,
    action,
    details,
    createdAt: new Date(),
  });
}

// ---------------------------------------------------------------------------
// Permission Guard Helper
// ---------------------------------------------------------------------------

/**
 * Checks whether a user's role has the required permission.
 *
 * @param role - The user's assigned role.
 * @param permission - The required permission string.
 * @returns True if the user is authorized.
 */
function hasPermission(role: string, permission: string): boolean {
  return crmPermissions.hasPermission(role, permission);
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const contactsRouter = new Hono<CrmEnv>();

/**
 * GET /
 *
 * Lists contacts for the authenticated organization with pagination
 * and optional filtering by status, tag, or assigned user.
 */
contactsRouter.get("/", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!hasPermission(role, "read:contacts")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = Math.min(parseInt(c.req.query("pageSize") ?? "25", 10), 100);
  const statusFilter = c.req.query("status");
  const tagFilter = c.req.query("tag");
  const assignedFilter = c.req.query("assignedTo");

  let orgContacts = Array.from(contacts.values()).filter((ct) => ct.orgId === orgId);

  // Apply filters
  if (statusFilter) {
    orgContacts = orgContacts.filter((ct) => ct.status === statusFilter);
  }
  if (tagFilter) {
    orgContacts = orgContacts.filter((ct) => ct.tags.includes(tagFilter));
  }
  if (assignedFilter) {
    orgContacts = orgContacts.filter((ct) => ct.assignedTo === assignedFilter);
  }

  // Sort by most recently updated
  orgContacts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const totalItems = orgContacts.length;
  const start = (page - 1) * pageSize;
  const paginated = orgContacts.slice(start, start + pageSize);

  return c.json(sendPagination(paginated, page, pageSize, totalItems));
});

/**
 * GET /search
 *
 * Performs full-text search across contacts in the organization.
 */
contactsRouter.get("/search", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!hasPermission(role, "read:contacts")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const query = c.req.query("q") ?? "";
  const limit = Math.min(parseInt(c.req.query("limit") ?? "20", 10), 100);
  const offset = parseInt(c.req.query("offset") ?? "0", 10);

  if (!query.trim()) {
    return c.json(sendFailure("Search query 'q' is required", "VALIDATION_ERROR"), 400);
  }

  const results: SearchResult[] = searchIndex.search(query, orgId, {
    entityType: "contact",
    limit,
    offset,
  });

  const totalCount = searchIndex.count(query, orgId, "contact");

  return c.json(
    sendSuccess({
      query,
      results: results.map((r) => ({
        id: r.document.id,
        score: r.score,
        highlights: r.highlights,
        data: r.document.data,
      })),
      total: totalCount,
    })
  );
});

/**
 * POST /
 *
 * Creates a new contact in the organization and indexes it for search.
 */
contactsRouter.post("/", async (c) => {
  const { userId, orgId, role } = c.get("crmUser");

  if (!hasPermission(role, "write:contacts")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const body = await c.req.json<ContactInput>();

  // Validate required fields
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return c.json(sendFailure("Contact name is required", "VALIDATION_ERROR"), 400);
  }
  if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
    return c.json(sendFailure("Valid email address is required", "VALIDATION_ERROR"), 400);
  }

  // Check for duplicate email within organization
  const existingContact = Array.from(contacts.values()).find(
    (ct) => ct.orgId === orgId && ct.email.toLowerCase() === body.email.toLowerCase()
  );
  if (existingContact) {
    return c.json(sendFailure("A contact with this email already exists", "CONFLICT"), 409);
  }

  const contact: Contact = {
    id: generateId("ct"),
    orgId,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone?.trim() ?? null,
    company: body.company?.trim() ?? null,
    title: body.title?.trim() ?? null,
    status: body.status ?? "lead",
    source: body.source?.trim() ?? null,
    tags: body.tags ?? [],
    notes: body.notes ?? "",
    assignedTo: body.assignedTo ?? null,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  contacts.set(contact.id, contact);

  // Index for full-text search
  indexContact(
    {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      company: contact.company ?? undefined,
      notes: contact.notes,
    },
    orgId
  );

  logActivity(contact.id, userId, "created", `Contact "${contact.name}" created`);

  return c.json(sendSuccess(contact), 201);
});

/**
 * GET /:id
 *
 * Returns a single contact with its recent activity timeline.
 */
contactsRouter.get("/:id", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!hasPermission(role, "read:contacts")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const contactId = c.req.param("id");
  const contact = contacts.get(contactId);

  if (!contact || contact.orgId !== orgId) {
    return c.json(sendFailure("Contact not found", "NOT_FOUND"), 404);
  }

  const contactActivities = activities
    .filter((a) => a.contactId === contactId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50);

  return c.json(sendSuccess({ ...contact, activities: contactActivities }));
});

/**
 * PUT /:id
 *
 * Updates an existing contact's fields and re-indexes for search.
 */
contactsRouter.put("/:id", async (c) => {
  const { userId, orgId, role } = c.get("crmUser");

  if (!hasPermission(role, "write:contacts")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const contactId = c.req.param("id");
  const contact = contacts.get(contactId);

  if (!contact || contact.orgId !== orgId) {
    return c.json(sendFailure("Contact not found", "NOT_FOUND"), 404);
  }

  const body = await c.req.json<Partial<ContactInput>>();
  const changes: string[] = [];

  if (body.name !== undefined && body.name !== contact.name) {
    changes.push(`name: "${contact.name}" → "${body.name}"`);
    contact.name = body.name.trim();
  }
  if (body.email !== undefined && body.email !== contact.email) {
    changes.push(`email: "${contact.email}" → "${body.email}"`);
    contact.email = body.email.trim().toLowerCase();
  }
  if (body.phone !== undefined) contact.phone = body.phone?.trim() ?? null;
  if (body.company !== undefined) contact.company = body.company?.trim() ?? null;
  if (body.title !== undefined) contact.title = body.title?.trim() ?? null;
  if (body.status !== undefined && body.status !== contact.status) {
    changes.push(`status: "${contact.status}" → "${body.status}"`);
    contact.status = body.status;
  }
  if (body.source !== undefined) contact.source = body.source?.trim() ?? null;
  if (body.tags !== undefined) contact.tags = body.tags;
  if (body.notes !== undefined) contact.notes = body.notes;
  if (body.assignedTo !== undefined) contact.assignedTo = body.assignedTo ?? null;

  contact.updatedAt = new Date();
  contacts.set(contact.id, contact);

  // Re-index for search
  indexContact(
    {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      company: contact.company ?? undefined,
      notes: contact.notes,
    },
    orgId
  );

  if (changes.length > 0) {
    logActivity(contact.id, userId, "updated", `Updated: ${changes.join(", ")}`);
  }

  return c.json(sendSuccess(contact));
});

/**
 * DELETE /:id
 *
 * Permanently deletes a contact. Requires admin-level permissions.
 */
contactsRouter.delete("/:id", async (c) => {
  const { userId, orgId, role } = c.get("crmUser");

  if (!hasPermission(role, "delete:contacts")) {
    return c.json(sendFailure("Admin permissions required to delete contacts", "FORBIDDEN"), 403);
  }

  const contactId = c.req.param("id");
  const contact = contacts.get(contactId);

  if (!contact || contact.orgId !== orgId) {
    return c.json(sendFailure("Contact not found", "NOT_FOUND"), 404);
  }

  contacts.delete(contactId);
  searchIndex.remove("contact", contactId);
  logActivity(contactId, userId, "deleted", `Contact "${contact.name}" deleted`);

  return c.json(sendSuccess({ deleted: true }));
});

/**
 * POST /:id/email
 *
 * Sends an outreach email to a contact. Logs the outreach activity.
 */
contactsRouter.post("/:id/email", async (c) => {
  const { userId, orgId, role } = c.get("crmUser");

  if (!hasPermission(role, "send:emails")) {
    return c.json(sendFailure("Insufficient permissions to send emails", "FORBIDDEN"), 403);
  }

  const contactId = c.req.param("id");
  const contact = contacts.get(contactId);

  if (!contact || contact.orgId !== orgId) {
    return c.json(sendFailure("Contact not found", "NOT_FOUND"), 404);
  }

  const body = await c.req.json<{
    subject: string;
    template: string;
    variables?: Record<string, unknown>;
  }>();

  if (!body.subject || !body.template) {
    return c.json(sendFailure("Subject and template are required", "VALIDATION_ERROR"), 400);
  }

  // In production, use @devlaunchkit/communication to send the email:
  // const comms = getGlobalCommunicationService();
  // const result = await comms.sendEmail(contact.email, body.subject, body.template, body.variables);

  const messageId = `msg_${Date.now().toString(36)}`;

  logActivity(
    contactId,
    userId,
    "email_sent",
    `Email "${body.subject}" sent to ${contact.email} (template: ${body.template})`
  );

  return c.json(
    sendSuccess({
      messageId,
      to: contact.email,
      subject: body.subject,
      status: "queued",
    }),
    201
  );
});
