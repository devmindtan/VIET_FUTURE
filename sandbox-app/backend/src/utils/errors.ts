/**
 * Custom error classes for API error handling
 * Based on backend-patterns skill - standardized error responses
 */

export enum ErrorCode {
  // Client errors
  BAD_REQUEST = "bad_request",
  VALIDATION_ERROR = "validation_error",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  UNPROCESSABLE_ENTITY = "unprocessable_entity",
  RATE_LIMIT = "rate_limit",

  // Server errors
  INTERNAL_ERROR = "internal_error",
  SERVICE_UNAVAILABLE = "service_unavailable",
  EXTERNAL_SERVICE_ERROR = "external_service_error",
}

export interface FieldError {
  field: string;
  message: string;
  code: string;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: FieldError[],
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Common error factory methods
export const ApiErrors = {
  badRequest: (message: string, details?: FieldError[]) =>
    new ApiError(400, ErrorCode.BAD_REQUEST, message, details),

  validationError: (message: string, details?: FieldError[]) =>
    new ApiError(422, ErrorCode.VALIDATION_ERROR, message, details),

  unauthorized: (message: string = "Unauthorized") =>
    new ApiError(401, ErrorCode.UNAUTHORIZED, message),

  forbidden: (message: string = "Forbidden") =>
    new ApiError(403, ErrorCode.FORBIDDEN, message),

  notFound: (resource: string) =>
    new ApiError(404, ErrorCode.NOT_FOUND, `${resource} not found`),

  conflict: (message: string) => new ApiError(409, ErrorCode.CONFLICT, message),

  unprocessable: (message: string, details?: FieldError[]) =>
    new ApiError(422, ErrorCode.UNPROCESSABLE_ENTITY, message, details),

  rateLimit: () => new ApiError(429, ErrorCode.RATE_LIMIT, "Too many requests"),

  internalError: (message: string = "Internal server error") =>
    new ApiError(500, ErrorCode.INTERNAL_ERROR, message),

  serviceUnavailable: () =>
    new ApiError(503, ErrorCode.SERVICE_UNAVAILABLE, "Service unavailable"),

  externalServiceError: (service: string) =>
    new ApiError(
      502,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `${service} service error`,
    ),
};
