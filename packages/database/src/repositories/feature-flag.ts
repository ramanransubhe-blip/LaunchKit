import { BaseRepository } from "./base";
import { FeatureFlag, InsertFeatureFlag } from "../types";
import { featureFlags, featureFlagAssignments } from "../schema";
import { eq, and } from "drizzle-orm";

export class FeatureFlagRepository extends BaseRepository<
  FeatureFlag,
  InsertFeatureFlag,
  typeof featureFlags
> {
  constructor() {
    super(featureFlags);
  }

  // Find flag by key
  async findByKey(key: string): Promise<FeatureFlag | null> {
    const results = await this.db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, key))
      .limit(1);
    return results[0] || null;
  }

  // Evaluate a feature flag for a user or organization
  async evaluate(
    key: string,
    target?: { type: "user" | "organization"; id: string }
  ): Promise<boolean> {
    const flag = await this.findByKey(key);
    if (!flag || !flag.active) return false;

    if (!target) return flag.defaultValue;

    // Check custom overrides
    const assignmentResults = await this.db
      .select()
      .from(featureFlagAssignments)
      .where(
        and(
          eq(featureFlagAssignments.flagId, flag.id),
          eq(featureFlagAssignments.targetType, target.type),
          eq(featureFlagAssignments.targetId, target.id)
        )
      )
      .limit(1);

    const assignment = assignmentResults[0];
    if (assignment) return assignment.value;

    return flag.defaultValue;
  }

  // Assign custom flag override value
  async assignOverride(
    flagId: string,
    targetType: "user" | "organization",
    targetId: string,
    value: boolean
  ): Promise<void> {
    await this.db
      .insert(featureFlagAssignments)
      .values({
        flagId,
        targetType,
        targetId,
        value,
      })
      .onConflictDoUpdate({
        target: [
          featureFlagAssignments.flagId,
          featureFlagAssignments.targetType,
          featureFlagAssignments.targetId,
        ],
        set: { value },
      });
  }
}
