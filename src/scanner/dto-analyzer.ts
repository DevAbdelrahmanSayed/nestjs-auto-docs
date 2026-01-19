import { Type, ClassDeclaration, PropertyDeclaration } from 'ts-morph';
import { DtoMetadata, PropertyMetadata, TypeMetadata } from '../interfaces';

export class DtoAnalyzer {
  private visitedTypes = new Set<string>();
  private maxDepth = 5;

  /**
   * Analyze a DTO class
   */
  analyzeDto(classDeclaration: ClassDeclaration): DtoMetadata {
    const className = classDeclaration.getName() || 'UnknownDto';
    const properties = classDeclaration.getProperties();

    // Extract JSDoc description
    const jsDocs = classDeclaration.getJsDocs();
    const description = jsDocs.length > 0
      ? jsDocs[0].getDescription().trim()
      : undefined;

    // Reset visited types for each DTO
    this.visitedTypes.clear();

    return {
      name: className,
      properties: properties.map(prop => this.analyzeProperty(prop)),
      description,
    };
  }

  /**
   * Analyze a property
   */
  private analyzeProperty(property: PropertyDeclaration): PropertyMetadata {
    const name = property.getName();
    const type = property.getType();
    const required = !property.hasQuestionToken() && !property.hasInitializer();

    // Extract JSDoc description
    const jsDocs = property.getJsDocs();
    const description = jsDocs.length > 0
      ? jsDocs[0].getDescription().trim()
      : undefined;

    return {
      name,
      type: this.analyzeType(type, 0),
      required,
      description,
    };
  }

  /**
   * Analyze a TypeScript type
   */
  analyzeType(type: Type, depth: number = 0): TypeMetadata {
    // Prevent infinite recursion
    if (depth > this.maxDepth) {
      return {
        type: 'unknown',
        isPrimitive: false,
        isArray: false,
        isEnum: false,
        isOptional: false,
      };
    }

    const typeName = type.getText();

    // Check if already visited (circular reference)
    if (this.visitedTypes.has(typeName)) {
      return {
        type: typeName,
        isPrimitive: false,
        isArray: false,
        isEnum: false,
        isOptional: false,
      };
    }

    // Check if array
    const isArray = type.isArray();
    const baseType = isArray ? type.getArrayElementTypeOrThrow() : type;

    // Get element type for arrays
    const elementType = isArray ? this.analyzeType(baseType, depth + 1) : undefined;

    // Handle primitive types
    if (baseType.isString()) {
      return {
        type: 'string',
        isPrimitive: true,
        isArray,
        isEnum: false,
        isOptional: false,
        elementType,
        format: this.detectStringFormat(typeName),
      };
    }

    if (baseType.isNumber()) {
      return {
        type: 'number',
        isPrimitive: true,
        isArray,
        isEnum: false,
        isOptional: false,
        elementType,
      };
    }

    if (baseType.isBoolean()) {
      return {
        type: 'boolean',
        isPrimitive: true,
        isArray,
        isEnum: false,
        isOptional: false,
        elementType,
      };
    }

    // Handle Date
    if (typeName.includes('Date')) {
      return {
        type: 'string',
        isPrimitive: true,
        isArray,
        isEnum: false,
        isOptional: false,
        elementType,
        format: 'date-time',
      };
    }

    // Handle enum types
    if (baseType.isEnum()) {
      const enumType = baseType.compilerType as any;
      const enumValues = enumType.types?.map((t: any) => t.value) || [];
      return {
        type: 'string',
        isPrimitive: false,
        isArray,
        isEnum: true,
        isOptional: false,
        elementType,
        enumValues,
      };
    }

    // Handle union types
    if (baseType.isUnion()) {
      const unionTypes = baseType.getUnionTypes();
      return {
        type: typeName,
        isPrimitive: false,
        isArray,
        isEnum: false,
        isOptional: false,
        elementType,
        unionTypes: unionTypes.map(t => t.getText()),
      };
    }

    // Handle object/class types
    if (baseType.isObject()) {
      this.visitedTypes.add(typeName);

      const symbol = baseType.getSymbol();
      if (symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations.length > 0) {
          const declaration = declarations[0];

          if (declaration.getKind() === 256) { // ClassDeclaration
            const classDecl = declaration as ClassDeclaration;
            const properties = classDecl.getProperties();

            return {
              type: baseType.getText(),
              isPrimitive: false,
              isArray,
              isEnum: false,
              isOptional: false,
              elementType,
              properties: properties.map(prop => this.analyzeProperty(prop)),
            };
          }
        }
      }
    }

    // Default fallback
    return {
      type: typeName,
      isPrimitive: false,
      isArray,
      isEnum: false,
      isOptional: false,
      elementType,
    };
  }

  /**
   * Detect string format from type name
   */
  private detectStringFormat(typeName: string): string | undefined {
    const lowerType = typeName.toLowerCase();

    if (lowerType.includes('email')) return 'email';
    if (lowerType.includes('url') || lowerType.includes('uri')) return 'uri';
    if (lowerType.includes('uuid')) return 'uuid';
    if (lowerType.includes('date')) return 'date-time';

    return undefined;
  }

  /**
   * Find DTO class by name in source files
   */
  findDtoByName(name: string, sourceFiles: any[]): ClassDeclaration | undefined {
    for (const sourceFile of sourceFiles) {
      const classes = sourceFile.getClasses();
      const found = classes.find((cls: ClassDeclaration) => cls.getName() === name);
      if (found) return found;
    }
    return undefined;
  }
}
