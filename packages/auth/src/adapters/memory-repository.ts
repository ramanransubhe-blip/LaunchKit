import { randomUUID } from "node:crypto";
import type {
  AuthAccountLock,
  AuthAuditRecord,
  AuthLoginAttempt,
  AuthRepository,
} from "../core/contracts.js";
import type { AuthDevice } from "../types/index.js";

/** Snapshot returned by the in-memory repository for testing. */
export interface MemoryAuthRepositorySnapshot {
  /** Login attempts captured so far. */
  readonly loginAttempts: readonly AuthLoginAttempt[];
  /** Account locks captured so far. */
  readonly accountLocks: readonly AuthAccountLock[];
  /** Device records captured so far. */
  readonly devices: readonly AuthDevice[];
  /** Audit records captured so far. */
  readonly auditRecords: readonly AuthAuditRecord[];
}

/**
 * In-memory implementation of the auth repository contract.
 *
 * @example
 * ```ts
 * const repository = createMemoryAuthRepository();
 * await repository.recordLoginAttempt({...});
 * ```
 */
export class MemoryAuthRepository implements AuthRepository {
  private readonly loginAttempts: AuthLoginAttempt[] = [];
  private readonly accountLocks = new Map<string, AuthAccountLock>();
  private readonly devicesById = new Map<string, AuthDevice>();
  private readonly devicesByFingerprint = new Map<string, string>();
  private readonly auditRecords: AuthAuditRecord[] = [];

  async recordLoginAttempt(attempt: AuthLoginAttempt): Promise<void> {
    this.loginAttempts.push(attempt);
  }

  async countFailedLoginAttempts(email: string, since: Date): Promise<number> {
    return this.loginAttempts.filter(
      (attempt) =>
        attempt.email === email &&
        !attempt.success &&
        attempt.createdAt.getTime() >= since.getTime(),
    ).length;
  }

  async getAccountLock(email: string): Promise<AuthAccountLock | null> {
    return this.accountLocks.get(email) ?? null;
  }

  async setAccountLock(lock: AuthAccountLock): Promise<void> {
    this.accountLocks.set(lock.email, lock);
  }

  async clearAccountLock(email: string): Promise<void> {
    this.accountLocks.delete(email);
  }

  async upsertDevice(device: AuthDevice): Promise<AuthDevice> {
    const existingId = this.devicesByFingerprint.get(device.fingerprint);
    const resolvedId = existingId ?? device.id ?? randomUUID();
    const stored: AuthDevice = {
      ...device,
      id: resolvedId,
      lastSeenAt: device.lastSeenAt,
    };
    this.devicesById.set(stored.id, stored);
    this.devicesByFingerprint.set(stored.fingerprint, stored.id);
    return stored;
  }

  async listDevices(userId: string): Promise<readonly AuthDevice[]> {
    return Array.from(this.devicesById.values()).filter(
      (device) => device.userId === userId,
    );
  }

  async recordAuditEvent(record: AuthAuditRecord): Promise<void> {
    this.auditRecords.push(record);
  }

  async listAuditEvents(userId: string): Promise<readonly AuthAuditRecord[]> {
    return this.auditRecords.filter((record) => record.userId === userId);
  }

  /**
   * Returns a read-only snapshot of the current repository state.
   *
   * @returns Repository snapshot.
   */
  snapshot(): MemoryAuthRepositorySnapshot {
    return {
      loginAttempts: [...this.loginAttempts],
      accountLocks: [...this.accountLocks.values()],
      devices: [...this.devicesById.values()],
      auditRecords: [...this.auditRecords],
    };
  }
}

/**
 * Creates a fresh in-memory auth repository.
 *
 * @returns Memory auth repository instance.
 */
export function createMemoryAuthRepository(): MemoryAuthRepository {
  return new MemoryAuthRepository();
}

