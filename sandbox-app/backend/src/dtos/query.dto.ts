/**
 * Data Transfer Objects (DTOs) for query parameters
 * Based on api-design skill - input validation
 */

import { parseQueryNumber, parseQueryString } from "../utils/validation";

/**
 * Query parameters for list endpoints
 */
export interface ListQueryDto {
  limit?: number;
  offset?: number;
}

/**
 * Parse and validate list query parameters
 */
export function parseListQuery(query: Record<string, unknown>): ListQueryDto {
  const limit = parseQueryNumber(query.limit, {
    min: 1,
    max: 1000,
    default: 20,
  });
  const offset = parseQueryNumber(query.offset, {
    min: 0,
    default: 0,
  });

  return {
    limit: limit || 20,
    offset: offset || 0,
  };
}

/**
 * Query parameters for ID-based lookups
 */
export interface IdQueryDto {
  id: string;
}

/**
 * Parse and validate ID query parameter
 */
export function parseIdQuery(query: Record<string, unknown>): string | null {
  return parseQueryString(query.id, { min: 1, max: 500 });
}

/**
 * Query parameters for transaction lookups
 */
export interface TxHashQueryDto {
  txHash: string;
}

/**
 * Parse transaction hash query parameter
 */
export function parseTxHashQuery(
  query: Record<string, unknown>,
): string | null {
  return parseQueryString(query.txHash, { min: 1, max: 70 });
}

/**
 * Query parameters for general filtering
 */
export interface FilterQueryDto extends ListQueryDto {
  status?: string;
  sort?: string;
  search?: string;
}

/**
 * Parse and validate filter query parameters
 */
export function parseFilterQuery(
  query: Record<string, unknown>,
): FilterQueryDto {
  const { limit, offset } = parseListQuery(query);
  const status = parseQueryString(query.status, { max: 50 });
  const sort = parseQueryString(query.sort, { max: 100 });
  const search = parseQueryString(query.search, { max: 500 });

  return {
    limit,
    offset,
    ...(status && { status }),
    ...(sort && { sort }),
    ...(search && { search }),
  };
}
