export interface ControllerMetadata {
  /**
   * Controller class name
   */
  name: string;

  /**
   * Controller path from @Controller() decorator
   */
  path: string;

  /**
   * File path (for category detection)
   */
  filePath: string;

  /**
   * Module category (auto-detected from file path)
   */
  category: string;

  /**
   * API version (auto-detected from file path when versioning enabled)
   * Example: 'v1', 'v2', 'v3'
   */
  version?: string;

  /**
   * JSDoc comment description
   */
  description?: string;

  /**
   * Route methods in this controller
   */
  routes: RouteMetadata[];

  /**
   * Class-level guards
   */
  guards?: string[];
}

export interface RouteMetadata {
  /**
   * Method name
   */
  name: string;

  /**
   * HTTP method (GET, POST, PUT, PATCH, DELETE)
   */
  httpMethod: HttpMethod;

  /**
   * Route path from decorator
   */
  path: string;

  /**
   * Complete path (controller path + route path)
   */
  fullPath: string;

  /**
   * Route description from JSDoc
   */
  description?: string;

  /**
   * Request parameters
   */
  params?: ParamMetadata[];

  /**
   * Request body DTO
   */
  requestBody?: DtoMetadata;

  /**
   * Response DTO
   */
  responseType?: DtoMetadata;

  /**
   * Method-level guards
   */
  guards?: string[];

  /**
   * Is route public (no authentication required)
   */
  isPublic?: boolean;
}

export interface ParamMetadata {
  /**
   * Parameter name
   */
  name: string;

  /**
   * Parameter location (path, query, header, body)
   */
  in: 'path' | 'query' | 'header' | 'body';

  /**
   * Parameter type
   */
  type: TypeMetadata;

  /**
   * Is parameter required
   */
  required: boolean;

  /**
   * Parameter description
   */
  description?: string;
}

export interface DtoMetadata {
  /**
   * DTO class name
   */
  name: string;

  /**
   * DTO properties
   */
  properties: PropertyMetadata[];

  /**
   * DTO description from JSDoc
   */
  description?: string;
}

export interface PropertyMetadata {
  /**
   * Property name
   */
  name: string;

  /**
   * Property type information
   */
  type: TypeMetadata;

  /**
   * Is property required
   */
  required: boolean;

  /**
   * Property description
   */
  description?: string;

  /**
   * Validation rules from class-validator decorators
   */
  validators?: ValidatorMetadata[];

  /**
   * Example value
   */
  example?: any;
}

export interface TypeMetadata {
  /**
   * TypeScript type name
   */
  type: string;

  /**
   * Is primitive type (string, number, boolean, etc.)
   */
  isPrimitive: boolean;

  /**
   * Is array type
   */
  isArray: boolean;

  /**
   * Is enum type
   */
  isEnum: boolean;

  /**
   * Is optional
   */
  isOptional: boolean;

  /**
   * Element type for arrays
   */
  elementType?: TypeMetadata;

  /**
   * Nested properties (for object types)
   */
  properties?: PropertyMetadata[];

  /**
   * Union type alternatives
   */
  unionTypes?: string[];

  /**
   * Enum values (for enum types)
   */
  enumValues?: (string | number)[];

  /**
   * Format hint (email, url, date-time, etc.)
   */
  format?: string;
}

export interface ValidatorMetadata {
  /**
   * Validator decorator name (e.g., 'IsEmail', 'Min')
   */
  name: string;

  /**
   * Validator arguments/options
   */
  args?: any[];

  /**
   * OpenAPI constraints derived from validator
   */
  constraints?: {
    type?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    pattern?: string;
    format?: string;
    enum?: any[];
    required?: boolean;
  };
}

export interface CategoryMetadata {
  /**
   * Category name (display name)
   */
  name: string;

  /**
   * Category description
   */
  description?: string;

  /**
   * Number of endpoints in this category
   */
  endpointCount: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type GuardMetadata = string;
