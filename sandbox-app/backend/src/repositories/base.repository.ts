/**
 * Abstract Repository pattern
 * Based on backend-patterns skill - data access abstraction
 */

export interface RepositoryOptions {
  limit?: number;
  offset?: number;
}

/**
 * Base repository interface for all data sources
 */
export abstract class BaseRepository<T> {
  /**
   * Get all items
   */
  abstract findAll(options?: RepositoryOptions): Promise<T[]>;

  /**
   * Get item by ID
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Count total items
   */
  abstract count(): Promise<number>;

  /**
   * Error handling helper
   */
  protected handleError(error: unknown, operation: string): never {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Repository Error - ${operation}]:`, message);
    throw error;
  }
}
