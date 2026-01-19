import { PropertyMetadata, TypeMetadata } from '../interfaces';

export class ExampleGenerator {
  /**
   * Generate example value based on property metadata
   */
  generateExample(property: PropertyMetadata): any {
    if (property.type) {
      return this.generateFromType(property.type, property.name);
    }

    return null;
  }

  /**
   * Generate example from TypeMetadata
   */
  private generateFromType(typeMetadata: TypeMetadata, fieldName?: string): any {
    // Handle primitives
    if (typeMetadata.isPrimitive) {
      return this.generatePrimitiveExample(typeMetadata, fieldName);
    }

    // Handle arrays
    if (typeMetadata.isArray && typeMetadata.elementType) {
      return [this.generateFromType(typeMetadata.elementType)];
    }

    // Handle enums
    if (typeMetadata.isEnum && typeMetadata.enumValues && typeMetadata.enumValues.length > 0) {
      return typeMetadata.enumValues[0];
    }

    // Handle objects
    if (typeMetadata.properties) {
      const example: Record<string, any> = {};

      for (const prop of typeMetadata.properties) {
        example[prop.name] = this.generateExample(prop);
      }

      return example;
    }

    return null;
  }

  /**
   * Generate example for primitive types
   */
  private generatePrimitiveExample(typeMetadata: TypeMetadata, fieldName?: string): any {
    const type = typeMetadata.type;
    const format = typeMetadata.format;

    // Handle format-specific examples
    if (format) {
      switch (format) {
        case 'email':
          return 'user@example.com';
        case 'uri':
        case 'url':
          return 'https://example.com';
        case 'uuid':
          return '123e4567-e89b-12d3-a456-426614174000';
        case 'date':
          return '2026-01-19';
        case 'date-time':
          return '2026-01-19T12:00:00Z';
        case 'password':
          return 'P@ssw0rd123';
      }
    }

    // Field name-based examples
    if (fieldName) {
      const lowerName = fieldName.toLowerCase();

      // Email patterns
      if (lowerName.includes('email')) {
        return 'user@example.com';
      }

      // Name patterns
      if (lowerName.includes('firstname') || lowerName === 'first_name') {
        return 'John';
      }
      if (lowerName.includes('lastname') || lowerName === 'last_name') {
        return 'Doe';
      }
      if (lowerName.includes('name') && !lowerName.includes('username')) {
        return 'Example Name';
      }
      if (lowerName.includes('username')) {
        return 'johndoe';
      }

      // Phone patterns
      if (lowerName.includes('phone') || lowerName.includes('mobile')) {
        return '+1234567890';
      }

      // Address patterns
      if (lowerName.includes('address')) {
        return '123 Main St';
      }
      if (lowerName.includes('city')) {
        return 'New York';
      }
      if (lowerName.includes('country')) {
        return 'USA';
      }
      if (lowerName.includes('zip') || lowerName.includes('postal')) {
        return '10001';
      }

      // URL patterns
      if (lowerName.includes('url') || lowerName.includes('website')) {
        return 'https://example.com';
      }

      // ID patterns
      if (lowerName.endsWith('id') || lowerName.includes('_id')) {
        return 1;
      }

      // Date patterns
      if (lowerName.includes('date') && !lowerName.includes('update')) {
        return '2026-01-19';
      }
      if (lowerName.includes('createdat')) {
        return '2026-01-19T12:00:00Z';
      }
      if (lowerName.includes('updatedat')) {
        return '2026-01-19T12:00:00Z';
      }

      // Status patterns
      if (lowerName.includes('status')) {
        return 'active';
      }

      // Role patterns
      if (lowerName.includes('role')) {
        return 'user';
      }

      // Description patterns
      if (lowerName.includes('description') || lowerName.includes('desc')) {
        return 'Example description';
      }

      // Title patterns
      if (lowerName.includes('title')) {
        return 'Example Title';
      }

      // Price/Amount patterns
      if (lowerName.includes('price') || lowerName.includes('amount')) {
        return 99.99;
      }

      // Quantity patterns
      if (lowerName.includes('quantity') || lowerName.includes('count')) {
        return 10;
      }

      // Boolean patterns
      if (lowerName.includes('is') || lowerName.includes('has') || lowerName.includes('can')) {
        return true;
      }
    }

    // Type-based examples
    switch (type) {
      case 'string':
        return 'example';
      case 'number':
        return 42;
      case 'integer':
        return 42;
      case 'boolean':
        return true;
      case 'null':
        return null;
      default:
        return null;
    }
  }

  /**
   * Generate complete object example
   */
  generateObjectExample(properties: PropertyMetadata[]): Record<string, any> {
    const example: Record<string, any> = {};

    for (const property of properties) {
      example[property.name] = this.generateExample(property);
    }

    return example;
  }
}
