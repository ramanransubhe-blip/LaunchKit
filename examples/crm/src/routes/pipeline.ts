/**
 * @module routes/pipeline
 * @description Pipeline configuration and analytics routes.
 *
 * Provides endpoints for managing pipeline stage definitions and generating
 * aggregate analytics including deal distribution, conversion rates, and
 * revenue forecasting.
 */

import { Hono } from "hono";

import { sendSuccess, sendFailure } from "@devlaunchkit/api";

import { crmPermissions, type CrmEnv } from "../index.js";

// ---------------------------------------------------------------------------
// Types (shared with deals module)
// ---------------------------------------------------------------------------

/** Pipeline stage definition. */
interface PipelineStage {
  readonly id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
}

/** Aggregate statistics for a single pipeline stage. */
interface StageMetrics {
  readonly stageId: string;
  readonly stageName: string;
  readonly dealCount: number;
  readonly totalValue: number;
  readonly weightedValue: number;
  readonly averageDealSize: number;
  readonly probability: number;
}

/** Revenue forecast for a given time period. */
interface ForecastPeriod {
  readonly period: string;
  readonly dealCount: number;
  readonly totalValue: number;
  readonly weightedValue: number;
  readonly expectedRevenue: number;
}

// ---------------------------------------------------------------------------
// In-Memory Stores (shared state simulation)
// ---------------------------------------------------------------------------

/** Default pipeline stages. */
const DEFAULT_STAGES: PipelineStage[] = [
  { id: "stage_lead", name: "Lead", order: 1, probability: 10, color: "#6B7280" },
  { id: "stage_qualified", name: "Qualified", order: 2, probability: 25, color: "#3B82F6" },
  { id: "stage_proposal", name: "Proposal", order: 3, probability: 50, color: "#F59E0B" },
  { id: "stage_negotiation", name: "Negotiation", order: 4, probability: 75, color: "#8B5CF6" },
  { id: "stage_closed_won", name: "Closed Won", order: 5, probability: 100, color: "#10B981" },
  { id: "stage_closed_lost", name: "Closed Lost", order: 6, probability: 0, color: "#EF4444" },
];

const orgPipelines = new Map<string, PipelineStage[]>();

function getStages(orgId: string): PipelineStage[] {
  if (!orgPipelines.has(orgId)) {
    orgPipelines.set(orgId, DEFAULT_STAGES.map((s) => ({ ...s })));
  }
  return orgPipelines.get(orgId)!;
}

/** Simulated deal data for analytics (in production, query the database). */
interface DealRecord {
  readonly id: string;
  readonly orgId: string;
  readonly value: number;
  readonly stageId: string;
  readonly expectedCloseDate: string | null;
}

const dealsStore = new Map<string, DealRecord>();

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const pipelineRouter = new Hono<CrmEnv>();

/**
 * GET /
 *
 * Returns the pipeline configuration for the organization, including
 * all stage definitions ordered by their position.
 */
pipelineRouter.get("/", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "read:pipeline")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const stages = getStages(orgId);
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return c.json(sendSuccess({
    orgId,
    stages: sortedStages,
    totalStages: sortedStages.length,
    activeStages: sortedStages.filter((s) => s.probability > 0 && s.probability < 100).length,
  }));
});

/**
 * GET /summary
 *
 * Returns aggregate analytics for the deal pipeline including per-stage
 * metrics, total pipeline value, and conversion funnel data.
 */
pipelineRouter.get("/summary", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "read:pipeline")) {
    return c.json(sendFailure("Insufficient permissions", "FORBIDDEN"), 403);
  }

  const stages = getStages(orgId);
  const orgDeals = Array.from(dealsStore.values()).filter((d) => d.orgId === orgId);

  // Calculate per-stage metrics
  const stageMetrics: StageMetrics[] = stages
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const stageDeals = orgDeals.filter((d) => d.stageId === stage.id);
      const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
      const weightedValue = totalValue * (stage.probability / 100);
      const averageDealSize = stageDeals.length > 0 ? totalValue / stageDeals.length : 0;

      return {
        stageId: stage.id,
        stageName: stage.name,
        dealCount: stageDeals.length,
        totalValue,
        weightedValue,
        averageDealSize: Math.round(averageDealSize * 100) / 100,
        probability: stage.probability,
      };
    });

  // Aggregate totals
  const totalDeals = orgDeals.length;
  const totalPipelineValue = orgDeals.reduce((sum, d) => sum + d.value, 0);
  const totalWeightedValue = stageMetrics.reduce((sum, s) => sum + s.weightedValue, 0);
  const wonDeals = orgDeals.filter((d) => d.stageId === "stage_closed_won").length;
  const lostDeals = orgDeals.filter((d) => d.stageId === "stage_closed_lost").length;
  const closedDeals = wonDeals + lostDeals;
  const winRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0;

  return c.json(sendSuccess({
    overview: {
      totalDeals,
      totalPipelineValue,
      totalWeightedValue: Math.round(totalWeightedValue * 100) / 100,
      averageDealSize: totalDeals > 0 ? Math.round((totalPipelineValue / totalDeals) * 100) / 100 : 0,
      winRate: Math.round(winRate * 10) / 10,
      wonDeals,
      lostDeals,
      openDeals: totalDeals - closedDeals,
    },
    stages: stageMetrics,
    generatedAt: new Date().toISOString(),
  }));
});

/**
 * PUT /stages
 *
 * Updates the pipeline stage definitions for the organization.
 * Requires admin-level permissions. Validates stage ordering and
 * probability ranges.
 */
pipelineRouter.put("/stages", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "write:pipeline")) {
    return c.json(sendFailure("Admin permissions required to modify pipeline", "FORBIDDEN"), 403);
  }

  const body = await c.req.json<{ stages: PipelineStage[] }>();

  if (!body.stages || !Array.isArray(body.stages) || body.stages.length < 2) {
    return c.json(sendFailure("At least 2 pipeline stages are required", "VALIDATION_ERROR"), 400);
  }

  // Validate each stage
  for (const stage of body.stages) {
    if (!stage.id || !stage.name || typeof stage.order !== "number") {
      return c.json(sendFailure("Each stage must have id, name, and order", "VALIDATION_ERROR"), 400);
    }
    if (typeof stage.probability !== "number" || stage.probability < 0 || stage.probability > 100) {
      return c.json(
        sendFailure(`Stage "${stage.name}" has invalid probability. Must be 0–100.`, "VALIDATION_ERROR"),
        400,
      );
    }
  }

  // Check for duplicate order values
  const orders = body.stages.map((s) => s.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    return c.json(sendFailure("Stage order values must be unique", "VALIDATION_ERROR"), 400);
  }

  // Persist the updated pipeline configuration
  const updatedStages = body.stages
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      id: s.id,
      name: s.name.trim(),
      order: s.order,
      probability: s.probability,
      color: s.color || "#6B7280",
    }));

  orgPipelines.set(orgId, updatedStages);

  return c.json(sendSuccess({
    stages: updatedStages,
    totalStages: updatedStages.length,
    updatedAt: new Date().toISOString(),
  }));
});

/**
 * GET /forecast
 *
 * Generates a revenue forecast based on deals with expected close dates,
 * weighted by their current pipeline stage probability.
 */
pipelineRouter.get("/forecast", async (c) => {
  const { orgId, role } = c.get("crmUser");

  if (!crmPermissions.hasPermission(role, "view:analytics")) {
    return c.json(sendFailure("Analytics permissions required", "FORBIDDEN"), 403);
  }

  const stages = getStages(orgId);
  const orgDeals = Array.from(dealsStore.values()).filter((d) => d.orgId === orgId);

  // Group deals by month based on expected close date
  const forecastMap = new Map<string, ForecastPeriod>();
  const now = new Date();

  for (const deal of orgDeals) {
    // Skip closed deals
    if (deal.stageId === "stage_closed_won" || deal.stageId === "stage_closed_lost") continue;

    const closeDate = deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null;
    if (!closeDate || closeDate < now) continue;

    const period = `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, "0")}`;
    const stage = stages.find((s) => s.id === deal.stageId);
    const probability = (stage?.probability ?? 0) / 100;

    const existing = forecastMap.get(period) ?? {
      period,
      dealCount: 0,
      totalValue: 0,
      weightedValue: 0,
      expectedRevenue: 0,
    };

    forecastMap.set(period, {
      period,
      dealCount: existing.dealCount + 1,
      totalValue: existing.totalValue + deal.value,
      weightedValue: existing.weightedValue + deal.value * probability,
      expectedRevenue: existing.expectedRevenue + deal.value * probability,
    });
  }

  // Sort by period chronologically
  const forecast = Array.from(forecastMap.values())
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((f) => ({
      ...f,
      totalValue: Math.round(f.totalValue * 100) / 100,
      weightedValue: Math.round(f.weightedValue * 100) / 100,
      expectedRevenue: Math.round(f.expectedRevenue * 100) / 100,
    }));

  const totalForecastedRevenue = forecast.reduce((sum, f) => sum + f.expectedRevenue, 0);

  return c.json(sendSuccess({
    periods: forecast,
    totalForecastedRevenue: Math.round(totalForecastedRevenue * 100) / 100,
    totalDealsInForecast: forecast.reduce((sum, f) => sum + f.dealCount, 0),
    generatedAt: new Date().toISOString(),
  }));
});
