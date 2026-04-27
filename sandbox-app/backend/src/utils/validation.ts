/**
 * Input validation utilities
 * Based on api-design skill - validation best practices
 */

import { FieldError } from "./errors";

export interface ValidationRule {
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validate object against schema
 * Returns array of field errors if validation fails
 */
export function validateObject(
  obj: Record<string, unknown>,
  schema: ValidationSchema,
): FieldError[] {
  const errors: FieldError[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];

    // Required check
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({
        field,
        message: `${field} is required`,
        code: "required",
      });
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    // Type check
    if (rules.type) {
      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (actualType !== rules.type) {
        errors.push({
          field,
          message: `${field} must be of type ${rules.type}`,
          code: "type_error",
        });
        continue;
      }
    }

    // Number checks
    if (typeof value === "number") {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rules.min}`,
          code: "min_value",
        });
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push({
          field,
          message: `${field} must be at most ${rules.max}`,
          code: "max_value",
        });
      }
    }

    // String/Array length checks
    if (
      (typeof value === "string" || Array.isArray(value)) &&
      "length" in value
    ) {
      if (rules.min !== undefined && value.length < rules.min) {
        errors.push({
          field,
          message: `${field} must have at least ${rules.min} characters`,
          code: "min_length",
        });
      }
      if (rules.max !== undefined && value.length > rules.max) {
        errors.push({
          field,
          message: `${field} must have at most ${rules.max} characters`,
          code: "max_length",
        });
      }
    }

    // Pattern check
    if (
      rules.pattern &&
      typeof value === "string" &&
      !rules.pattern.test(value)
    ) {
      errors.push({
        field,
        message: `${field} format is invalid`,
        code: "format_error",
      });
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      errors.push({
        field,
        message: `${field} validation failed`,
        code: "custom_error",
      });
    }
  }

  return errors;
}

/**
 * Parse and validate query parameter as number
 */
export function parseQueryNumber(
  value: unknown,
  options?: { min?: number; max?: number; default?: number },
): number | null {
  if (value === undefined || value === null) {
    return options?.default ?? null;
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return null;
  }

  if (options?.min !== undefined && num < options.min) {
    return options.min;
  }
  if (options?.max !== undefined && num > options.max) {
    return options.max;
  }

  return num;
}

/**
 * Parse and validate query parameter as string with length constraints
 */
export function parseQueryString(
  value: unknown,
  options?: { min?: number; max?: number },
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const str = String(value).trim();
  if (str.length === 0) {
    return null;
  }

  if (options?.min !== undefined && str.length < options.min) {
    return null;
  }
  if (options?.max !== undefined && str.length > options.max) {
    return null;
  }

  return str;
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  address: /^0x[a-fA-F0-9]{40}$/,
  txHash: /^0x[a-fA-F0-9]{64}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};
