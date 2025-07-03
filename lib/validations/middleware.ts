import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponseSchema } from './common';

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Validation result type
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// API error response type
export type ApiErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Validates data against a Zod schema and returns a structured result
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.input,
      }));

      return {
        success: false,
        errors,
      };
    }

    // Handle unexpected errors
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'An unexpected validation error occurred',
        },
      ],
    };
  }
}

/**
 * Creates a validation middleware for API routes
 */
export function createValidationMiddleware<T>(
  schema: z.ZodSchema<T>,
  options: {
    source?: 'body' | 'query' | 'params';
    onError?: (errors: ValidationError[]) => NextResponse;
  } = {}
) {
  const { source = 'body', onError } = options;

  return async (
    request: NextRequest,
    handler: (data: T, request: NextRequest) => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> => {
    try {
      let data: unknown;

      // Extract data based on source
      switch (source) {
        case 'body':
          try {
            data = await request.json();
          } catch {
            return createErrorResponse(
              'Invalid JSON in request body',
              400,
              [{ field: 'body', message: 'Request body must be valid JSON' }]
            );
          }
          break;

        case 'query':
          data = Object.fromEntries(new URL(request.url).searchParams.entries());
          break;

        case 'params':
          // Note: This would need to be implemented based on your routing system
          // For now, we'll extract from URL pathname
          data = extractParamsFromUrl(request.url);
          break;

        default:
          return createErrorResponse('Invalid validation source', 500);
      }

      // Validate the data
      const validation = validateData(schema, data);

      if (!validation.success) {
        if (onError) {
          return onError(validation.errors!);
        }
        return createErrorResponse(
          'Validation failed',
          400,
          validation.errors!
        );
      }

      // Call the handler with validated data
      return await handler(validation.data!, request);
    } catch (error) {
      console.error('Validation middleware error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  };
}

/**
 * Validates request body against a schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return createValidationMiddleware(schema, { source: 'body' });
}

/**
 * Validates query parameters against a schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return createValidationMiddleware(schema, { source: 'query' });
}

/**
 * Validates URL parameters against a schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return createValidationMiddleware(schema, { source: 'params' });
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  errors?: ValidationError[]
): NextResponse {
  const errorResponse: ApiErrorResponse = {
    error: getErrorTypeFromStatus(status),
    message,
    details: errors ? { validationErrors: errors } : undefined,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(errorResponse, { status });
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response = {
    success: true,
    data,
    message,
  };

  return NextResponse.json(response, { status });
}

/**
 * Higher-order function to wrap API handlers with validation
 */
export function withValidation<TBody = any, TQuery = any, TParams = any>(
  schemas: {
    body?: z.ZodSchema<TBody>;
    query?: z.ZodSchema<TQuery>;
    params?: z.ZodSchema<TParams>;
  },
  handler: (
    data: {
      body?: TBody;
      query?: TQuery;
      params?: TParams;
    },
    request: NextRequest
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const validatedData: {
        body?: TBody;
        query?: TQuery;
        params?: TParams;
      } = {};

      // Validate body if schema provided
      if (schemas.body) {
        try {
          const bodyData = await request.json();
          const validation = validateData(schemas.body, bodyData);
          
          if (!validation.success) {
            return createErrorResponse(
              'Request body validation failed',
              400,
              validation.errors!
            );
          }
          
          validatedData.body = validation.data;
        } catch {
          return createErrorResponse(
            'Invalid JSON in request body',
            400,
            [{ field: 'body', message: 'Request body must be valid JSON' }]
          );
        }
      }

      // Validate query if schema provided
      if (schemas.query) {
        const queryData = Object.fromEntries(new URL(request.url).searchParams.entries());
        const validation = validateData(schemas.query, queryData);
        
        if (!validation.success) {
          return createErrorResponse(
            'Query parameters validation failed',
            400,
            validation.errors!
          );
        }
        
        validatedData.query = validation.data;
      }

      // Validate params if schema provided
      if (schemas.params) {
        const paramsData = extractParamsFromUrl(request.url);
        const validation = validateData(schemas.params, paramsData);
        
        if (!validation.success) {
          return createErrorResponse(
            'URL parameters validation failed',
            400,
            validation.errors!
          );
        }
        
        validatedData.params = validation.data;
      }

      // Call the handler with validated data
      return await handler(validatedData, request);
    } catch (error) {
      console.error('Validation wrapper error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  };
}

/**
 * Validation decorator for class-based handlers
 */
export function Validate<T>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as NextRequest;
      
      let data: unknown;
      
      switch (source) {
        case 'body':
          try {
            data = await request.json();
          } catch {
            return createErrorResponse(
              'Invalid JSON in request body',
              400,
              [{ field: 'body', message: 'Request body must be valid JSON' }]
            );
          }
          break;
        case 'query':
          data = Object.fromEntries(new URL(request.url).searchParams.entries());
          break;
        case 'params':
          data = extractParamsFromUrl(request.url);
          break;
      }

      const validation = validateData(schema, data);

      if (!validation.success) {
        return createErrorResponse(
          'Validation failed',
          400,
          validation.errors!
        );
      }

      // Replace the raw data with validated data
      args[1] = validation.data;

      return method.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Transforms Zod error to a user-friendly format
 */
export function formatZodError(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => {
    let field = err.path.join('.');
    let message = err.message;

    // Custom formatting for specific error types
    switch (err.code) {
      case 'invalid_type':
        message = `Expected ${err.expected}, received ${err.received}`;
        break;
      case 'too_small':
        if (err.type === 'string') {
          message = `Must be at least ${err.minimum} characters`;
        } else if (err.type === 'number') {
          message = `Must be at least ${err.minimum}`;
        } else if (err.type === 'array') {
          message = `Must contain at least ${err.minimum} items`;
        }
        break;
      case 'too_big':
        if (err.type === 'string') {
          message = `Must be at most ${err.maximum} characters`;
        } else if (err.type === 'number') {
          message = `Must be at most ${err.maximum}`;
        } else if (err.type === 'array') {
          message = `Must contain at most ${err.maximum} items`;
        }
        break;
      case 'invalid_string':
        if (err.validation === 'email') {
          message = 'Must be a valid email address';
        } else if (err.validation === 'url') {
          message = 'Must be a valid URL';
        } else if (err.validation === 'uuid') {
          message = 'Must be a valid UUID';
        }
        break;
    }

    return {
      field: field || 'unknown',
      message,
      value: (err as any).received,
    };
  });
}

/**
 * Extract URL parameters based on a pattern
 * This is a simplified implementation - in a real app you'd use your router's param extraction
 */
function extractParamsFromUrl(url: string): Record<string, string> {
  // This is a placeholder implementation
  // In practice, you'd use your routing framework to extract params
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  
  // Simple implementation - extract dynamic segments
  // This would be more sophisticated in a real implementation
  return {
    // Add your parameter extraction logic here
  };
}

/**
 * Get error type based on HTTP status code
 */
function getErrorTypeFromStatus(status: number): string {
  switch (status) {
    case 400: return 'VALIDATION_ERROR';
    case 401: return 'AUTHENTICATION_ERROR';
    case 403: return 'AUTHORIZATION_ERROR';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 422: return 'UNPROCESSABLE_ENTITY';
    case 429: return 'RATE_LIMIT_EXCEEDED';
    case 500: return 'INTERNAL_SERVER_ERROR';
    default: return 'UNKNOWN_ERROR';
  }
}

// Pre-built common validation middleware
export const commonMiddleware = {
  // Pagination validation
  pagination: validateQuery(z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })),

  // UUID parameter validation
  uuid: validateParams(z.object({
    id: z.string().uuid('Invalid UUID format'),
  })),

  // Authentication header validation
  auth: validateQuery(z.object({
    authorization: z.string().min(1, 'Authorization header is required'),
  })),
};

// Type exports
export type ValidatedRequest<TBody = any, TQuery = any, TParams = any> = {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
};