/**
 * Error handling middleware
 * Based on backend-patterns skill - centralized error handling
 */

import { Request, Response, NextFunction } from "express";
import { ApiError, ErrorCode } from "../utils/errors";

/**
 * Centralized error handling middleware
 * Catch all errors and return standardized error response
 */
export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  // Log error (in production, use proper logging service)
  console.error("[Error]", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unknown errors
  const errorResponse = {
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    },
  };

  return res.status(500).json(errorResponse);
}

/**
 * Async route handler wrapper to catch errors
 * Prevents unhandled promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found middleware
 * Catch all undefined routes
 */
export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({
    error: {
      code: ErrorCode.NOT_FOUND,
      message: "Route not found",
    },
  });
}
