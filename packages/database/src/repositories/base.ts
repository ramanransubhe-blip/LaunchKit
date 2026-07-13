import { db } from "../utils/connection";
import { SQL, eq } from "drizzle-orm";

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface QueryOptions extends PaginationOptions {
  orderBy?: any;
  where?: SQL;
}

export abstract class BaseRepository<TSelect, TInsert, TTable extends { id: any }> {
  constructor(protected table: any) {}

  protected get db() {
    return db;
  }

  // Find by primary ID key
  async findById(id: string): Promise<TSelect | null> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    return (results[0] as TSelect) || null;
  }

  // Find many with filters and pagination
  async findMany(options: QueryOptions = {}): Promise<TSelect[]> {
    let query = this.db.select().from(this.table);

    if (options.where) {
      query = query.where(options.where) as any;
    }

    if (options.orderBy) {
      query = query.orderBy(options.orderBy) as any;
    }

    if (options.limit !== undefined) {
      query = query.limit(options.limit) as any;
    }

    if (options.offset !== undefined) {
      query = query.offset(options.offset) as any;
    }

    return (await query) as TSelect[];
  }

  // Insert a single record
  async insert(data: TInsert): Promise<TSelect> {
    const results = await this.db
      .insert(this.table)
      .values(data as any)
      .returning();
    return results[0] as TSelect;
  }

  // Insert multiple records in bulk
  async insertBulk(data: TInsert[]): Promise<TSelect[]> {
    if (data.length === 0) return [];
    return (await this.db
      .insert(this.table)
      .values(data as any)
      .returning()) as TSelect[];
  }

  // Update record by ID
  async update(id: string, data: Partial<TInsert>): Promise<TSelect | null> {
    const results = await this.db
      .update(this.table)
      .set(data as any)
      .where(eq(this.table.id, id))
      .returning();
    return (results[0] as TSelect) || null;
  }

  // Delete record by ID
  async delete(id: string): Promise<boolean> {
    const results = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();
    return results.length > 0;
  }
}
