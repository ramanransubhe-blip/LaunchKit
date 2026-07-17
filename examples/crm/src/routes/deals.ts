/**
 * @module routes/deals
 * @description Deal management routes with pipeline stage transitions.
 *
 * Provides endpoints for creating, updating, and managing sales deals
 * through customizable pipeline stages with value tracking and forecasting.
 */

import { Hono } from "hono";

import { sendSuccess, sendFailure, sendPagination } from "@devlaunchkit/api";

import { crmPermissions, type CrmEnv } from "../index.js";
import { indexDeal, searchIndex } from "../services/search.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Pipeline stage definition. */
export interface PipelineStage {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  /** Expected win probability at this stage (0–100). */
  readonly probability: number;
  readonly color: string;
}

/** Deal record in the CRM. */
interface Deal {
  readonly id: string;
  readonly orgId: string;
  title: string;
  value: number;
  currency: string;
  contactId: string | null;
  contactName: string | null;
  company: string | null;
  stageId: string;
  priority: "low" | "medium" | "high" | "critical";
  expectedCloseDate: string | null;
  notes: string;
  assignedTo: string | null;
  readonly createdBy: string;
  readonly createdAt: Date;
  updatedAt: Date;
}

/** Stage transition history entry. */
interface StageTransition {
  readonly dealId: string;
  readonly fromStage: string;
  readonly toStage: string;
  readonly userId: string;
  readonly timestamp: Date;
}

/** Request body for creating or updating a deal. */
interface DealInput {
  readonly title: string;
  readonly value: number;
  readonly currency?: string;
  readonly contactId?: string;
  readonly contactName?: string;
  readonly company?: string;
  readonly stageId?: string;
  readonly priority?: Deal["priority"];
  readonly expectedCloseDate?: string;
  readonly notes?: string;
  readonly assignedTo?: string;
}

// ---------------------------------------------------------------------------
// In-Memory Stores
// ---------------------------------------------------------------------------

const deals = new Map<string, Deal>();
const stageHistory: StageTransition[] = [];

/** Default pipeline stages for new organizations. */
const DEFAULT_STAGES: PipelineStage[] = [
  { id: "stage_lead", name: "Lead", order: 1, probability: 10, color: "#6B7280" },
  { id: "stage_qualified", name: "Qualified", order: 2, probability: 25, color: "#3B82F6" },
  { id: "stage_proposal", name: "Proposal", order: 3, probability: 50, color: "#F59E0B" },
  { id: "stage_negotiation", name: "Negotiation", order: 4, probability: 75, color: "#8B5CF6" },
  { id: "stage_closed_won", name: "Closed Won", order: 5, probability: 100, color: "#10B981" },
  { id: "stage_closed_lost", name: "Closed Lost", order: 6, probability: 0, color: "#EF4444" },
];

/** Pipeline configurations per organization. */
const orgPipelines = new Map<string, PipelineStage[]>();

/**
 * Returns the pipeline stages for an organization, creating defaults if needed.
 */
function getStages(orgId: string): PipelineStage[] {
  if (!orgPipelines.has(orgId)) {
    orgPipelines.set(orgId, [...DEFAULT_STAGES]);
  }
  return orgPipelines.get(orgId)!;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const dealsRouter = new Hono<CrmEnv>();

/**
 * GET /
 *
 * Lists deals for the organization with pagination and filtering.
 */
dealsRouter.get("/", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "read:deals")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const page = parseInt(c.req.query("page") ?? "1", 10);
  const pageSize = Math.min(parseInt(c.req.query("pageSize") ?? "25", 10), 100);
  const stageFilter = c.req.query("stageId");
  const priorityFilter = c.req.query("priority");
  const assignedFilter = c.req.query("assignedTo");

  let orgDeals = Array.from(deals.values()).filter((d) => d.orgId === orgId);

  if (stageFilter) orgDeals = orgDeals.filter((d) => d.stageId === stageFilter);
  if (priorityFilter) orgDeals = orgDeals.filter((d) => d.priority === priorityFilter);
  if (assignedFilter) orgDeals = orgDeals.filter((d) => d.assignedTo === assignedFilter);

  orgDeals.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const totalItems = orgDeals.length;
  const start = (page - 1) * pageSize;
  const stages = getStages(orgId);

  const paginated = orgDeals.slice(start, start + pageSize).map((deal) => {
    const stage = stages.find((s) => s.id === deal.stageId);
    return {
      ...deal,
      stageName: stage?.name ?? "Unknown",
      stageProbability: stage?.probability ?? 0,
      weightedValue: deal.value * ((stage?.probability ?? 0) / 100),
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    };
  });

  return c.json(sendPagination(paginated, page, pageSize, totalItems));
});

/**
 * POST /
 *
 * Creates a new deal and indexes it for search.
 */
dealsRouter.post("/", async (c) => {
  const { userId, orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "write:deals")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const body = await c.req.json<DealInput>();

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    return c.json(sendFailure("Deal title is required", "VALIDATION_ERROR"), 400);
  }
  if (typeof body.value !== "number" || body.value < 0) {
    return c.json(sendFailure("Deal value must be a non-negative number", "VALIDATION_ERROR"), 400);
  }

  const stages = getStages(orgId);
  const initialStageId = body.stageId ?? stages[0]!.id;
  const validStage = stages.find((s) => s.id === initialStageId);

  if (!validStage) {
    return c.json(sendFailure("Invalid stage ID", "VALIDATION_ERROR"), 400);
  }

  const deal: Deal = {
    id: generateId("deal"),
    orgId,
    title: body.title.trim(),
    value: body.value,
    currency: body.currency ?? "USD",
    contactId: body.contactId ?? null,
    contactName: body.contactName ?? null,
    company: body.company ?? null,
    stageId: initialStageId,
    priority: body.priority ?? "medium",
    expectedCloseDate: body.expectedCloseDate ?? null,
    notes: body.notes ?? "",
    assignedTo: body.assignedTo ?? null,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  deals.set(deal.id, deal);

  // Index for search
  indexDeal(
    {
      id: deal.id,
      title: deal.title,
      contactName: deal.contactName ?? undefined,
      company: deal.company ?? undefined,
      notes: deal.notes,
    },
    orgId
  );

  return c.json(
    sendSuccess({
      ...deal,
      stageName: validStage.name,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    }),
    201
  );
});

/**
 * GET /:id
 *
 * Returns a single deal with its stage transition history.
 */
dealsRouter.get("/:id", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "read:deals")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const dealId = c.req.param("id");
  const deal = deals.get(dealId);

  if (!deal || deal.orgId !== orgId) {
    return c.json(sendFailure("Deal not found", "NOT_FOUND"), 404);
  }

  const stages = getStages(orgId);
  const stage = stages.find((s) => s.id === deal.stageId);
  const history = stageHistory
    .filter((h) => h.dealId === dealId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return c.json(
    sendSuccess({
      ...deal,
      stageName: stage?.name ?? "Unknown",
      stageProbability: stage?.probability ?? 0,
      weightedValue: deal.value * ((stage?.probability ?? 0) / 100),
      stageHistory: history.map((h) => ({
        fromStage: stages.find((s) => s.id === h.fromStage)?.name ?? h.fromStage,
        toStage: stages.find((s) => s.id === h.toStage)?.name ?? h.toStage,
        userId: h.userId,
        timestamp: h.timestamp.toISOString(),
      })),
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    })
  );
});

/**
 * PUT /:id
 *
 * Updates an existing deal's fields.
 */
dealsRouter.put("/:id", async (c) => {
  const { userId, orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "write:deals")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const dealId = c.req.param("id");
  const deal = deals.get(dealId);

  if (!deal || deal.orgId !== orgId) {
    return c.json(sendFailure("Deal not found", "NOT_FOUND"), 404);
  }

  const body = await c.req.json<Partial<DealInput>>();

  if (body.title !== undefined) deal.title = body.title.trim();
  if (body.value !== undefined) deal.value = body.value;
  if (body.currency !== undefined) deal.currency = body.currency;
  if (body.contactId !== undefined) deal.contactId = body.contactId ?? null;
  if (body.contactName !== undefined) deal.contactName = body.contactName ?? null;
  if (body.company !== undefined) deal.company = body.company ?? null;
  if (body.priority !== undefined) deal.priority = body.priority;
  if (body.expectedCloseDate !== undefined) deal.expectedCloseDate = body.expectedCloseDate ?? null;
  if (body.notes !== undefined) deal.notes = body.notes;
  if (body.assignedTo !== undefined) deal.assignedTo = body.assignedTo ?? null;

  deal.updatedAt = new Date();
  deals.set(deal.id, deal);

  // Re-index for search
  indexDeal(
    {
      id: deal.id,
      title: deal.title,
      contactName: deal.contactName ?? undefined,
      company: deal.company ?? undefined,
      notes: deal.notes,
    },
    orgId
  );

  return c.json(sendSuccess(deal));
});

/**
 * PATCH /:id/stage
 *
 * Moves a deal to a different pipeline stage. Records the transition
 * in the stage history for audit and analytics.
 */
dealsRouter.patch("/:id/stage", async (c) => {
  const { userId, orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "write:deals")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const dealId = c.req.param("id");
  const deal = deals.get(dealId);

  if (!deal || deal.orgId !== orgId) {
    return c.json(sendFailure("Deal not found", "NOT_FOUND"), 404);
  }

  const body = await c.req.json<{ stageId: string }>();

  if (!body.stageId) {
    return c.json(sendFailure("stageId is required", "VALIDATION_ERROR"), 400);
  }

  const stages = getStages(orgId);
  const newStage = stages.find((s) => s.id === body.stageId);

  if (!newStage) {
    return c.json(sendFailure("Invalid stage ID", "VALIDATION_ERROR"), 400);
  }

  if (deal.stageId === body.stageId) {
    return c.json(sendFailure("Deal is already in this stage", "CONFLICT"), 409);
  }

  // Record the transition
  const previousStageId = deal.stageId;
  stageHistory.push({
    dealId,
    fromStage: previousStageId,
    toStage: body.stageId,
    userId,
    timestamp: new Date(),
  });

  deal.stageId = body.stageId;
  deal.updatedAt = new Date();
  deals.set(deal.id, deal);

  const previousStage = stages.find((s) => s.id === previousStageId);

  return c.json(
    sendSuccess({
      dealId: deal.id,
      previousStage: { id: previousStageId, name: previousStage?.name ?? "Unknown" },
      currentStage: { id: newStage.id, name: newStage.name },
      weightedValue: deal.value * (newStage.probability / 100),
      updatedAt: deal.updatedAt.toISOString(),
    })
  );
});

/**
 * DELETE /:id
 *
 * Permanently deletes a deal. Requires admin permissions.
 */
dealsRouter.delete("/:id", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "delete:deals")) {
    return c.json(sendFailure("Admin permissions required", "FORBIDDEN"), 403);
  }

  const dealId = c.req.param("id");
  const deal = deals.get(dealId);

  if (!deal || deal.orgId !== orgId) {
    return c.json(sendFailure("Deal not found", "NOT_FOUND"), 404);
  }

  deals.delete(dealId);
  searchIndex.remove("deal", dealId);

  return c.json(sendSuccess({ deleted: true }));
});
