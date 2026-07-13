// Test Mocks & Fixtures Infrastructure

export interface MockDatabaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockUserRecord extends MockDatabaseRecord {
  email: string;
  name: string;
  role: "admin" | "user" | "developer";
  status: "active" | "suspended" | "banned";
}

export interface MockOrgRecord extends MockDatabaseRecord {
  name: string;
  plan: "trial" | "pro" | "enterprise";
  storageUsedBytes: number;
}

export const mockUserRecordFixture: MockUserRecord = {
  id: "usr_mock_111",
  email: "admin@devlaunchkit.io",
  name: "Acme Admin User",
  role: "admin",
  status: "active",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export const mockOrgRecordFixture: MockOrgRecord = {
  id: "org_mock_222",
  name: "Acme Enterprises LLC",
  plan: "pro",
  storageUsedBytes: 1024 * 1024 * 500, // 500 MB
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

export function createMockRecordFactory<T extends MockDatabaseRecord>(
  baseRecord: T
): (overrides?: Partial<T>) => T {
  return (overrides?: Partial<T>): T => {
    return {
      ...baseRecord,
      ...overrides,
      id: overrides?.id || `${baseRecord.id}_${Math.random().toString(36).substring(7)}`,
      updatedAt: new Date(),
    };
  };
}

export const userRecordFactory = createMockRecordFactory(mockUserRecordFixture);
export const orgRecordFactory = createMockRecordFactory(mockOrgRecordFixture);
