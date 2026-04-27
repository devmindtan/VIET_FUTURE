/**
 * Standardized API response format
 * Based on api-design skill - consistent response envelope
 */

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  links?: Record<string, string>;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
}

/**
 * Format success response
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  links?: Record<string, string>,
): ApiResponse<T> {
  return {
    data,
    ...(meta && { meta }),
    ...(links && { links }),
  };
}

/**
 * Format paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    total: number;
    limit: number;
    offset: number;
  },
): ApiResponse<T[]> {
  const { total, limit, offset } = pagination;
  const has_next = offset + limit < total;

  return {
    data,
    meta: {
      total,
      limit,
      offset,
      has_next,
      total_pages: Math.ceil(total / limit),
      current_page: Math.floor(offset / limit) + 1,
    },
  };
}
