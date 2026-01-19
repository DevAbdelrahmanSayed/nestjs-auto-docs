import { PropertyDeclaration, Decorator } from 'ts-morph';
import { ValidatorMetadata } from '../interfaces';

export class ValidatorExtractor {
  /**
   * Extract validation decorators from a property
   */
  extractValidators(property: PropertyDeclaration): ValidatorMetadata[] {
    const validators: ValidatorMetadata[] = [];
    const decorators = property.getDecorators();

    for (const decorator of decorators) {
      const validator = this.mapValidatorDecorator(decorator);
      if (validator) {
        validators.push(validator);
      }
    }

    return validators;
  }

  /**
   * Map class-validator decorator to ValidatorMetadata
   */
  private mapValidatorDecorator(decorator: Decorator): ValidatorMetadata | null {
    const name = decorator.getName();
    const args = decorator.getArguments();

    switch (name) {
      // String validators
      case 'IsString':
        return { name, constraints: { type: 'string' } };

      case 'IsEmail':
        return { name, constraints: { format: 'email' } };

      case 'IsUrl':
      case 'IsURL':
        return { name, constraints: { format: 'uri' } };

      case 'IsUUID':
        return { name, constraints: { format: 'uuid' } };

      case 'MinLength':
        return {
          name,
          args: [this.parseArgument(args[0])],
          constraints: { minLength: this.parseArgument(args[0]) },
        };

      case 'MaxLength':
        return {
          name,
          args: [this.parseArgument(args[0])],
          constraints: { maxLength: this.parseArgument(args[0]) },
        };

      case 'Length':
        return {
          name,
          args: [this.parseArgument(args[0]), this.parseArgument(args[1])],
          constraints: {
            minLength: this.parseArgument(args[0]),
            maxLength: this.parseArgument(args[1]),
          },
        };

      case 'Matches':
        return {
          name,
          args: [args[0]?.getText()],
          constraints: { pattern: args[0]?.getText().replace(/^\/|\/$/g, '') },
        };

      // Number validators
      case 'IsNumber':
      case 'IsInt':
      case 'IsDecimal':
        return { name, constraints: { type: 'number' } };

      case 'Min':
        return {
          name,
          args: [this.parseArgument(args[0])],
          constraints: { minimum: this.parseArgument(args[0]) },
        };

      case 'Max':
        return {
          name,
          args: [this.parseArgument(args[0])],
          constraints: { maximum: this.parseArgument(args[0]) },
        };

      // Boolean validators
      case 'IsBoolean':
        return { name, constraints: { type: 'boolean' } };

      // Date validators
      case 'IsDate':
      case 'IsDateString':
        return { name, constraints: { format: 'date-time' } };

      // Enum validators
      case 'IsEnum':
        const enumArg = args[0];
        if (enumArg) {
          const enumValues = this.extractEnumValues(enumArg);
          return {
            name,
            args: [enumArg.getText()],
            constraints: { enum: enumValues },
          };
        }
        return { name, constraints: {} };

      // Array validators
      case 'IsArray':
        return { name, constraints: { type: 'array' } };

      case 'ArrayMinSize':
        return {
          name,
          args: [this.parseArgument(args[0])],
          constraints: { minItems: this.parseArgument(args[0]) },
        };

      case 'ArrayMaxSize':
        return {
          name,
          args: [this.parseArgument(args[0])],
          constraints: { maxItems: this.parseArgument(args[0]) },
        };

      // Optional/Required
      case 'IsOptional':
        return { name, constraints: { required: false } };

      case 'IsNotEmpty':
        return { name, constraints: { required: true } };

      // Object validators
      case 'IsObject':
        return { name, constraints: { type: 'object' } };

      // Default case - capture unknown validators
      default:
        if (name.startsWith('Is') || name.startsWith('Validate')) {
          return { name, constraints: {} };
        }
        return null;
    }
  }

  /**
   * Parse argument to number or keep as string
   */
  private parseArgument(arg: any): any {
    if (!arg) return undefined;

    const text = arg.getText();
    const num = parseInt(text);

    return isNaN(num) ? text : num;
  }

  /**
   * Extract enum values from enum argument
   */
  private extractEnumValues(enumArg: any): any[] {
    try {
      const enumText = enumArg.getText();
      // This is a simplified extraction - in reality, you'd need to
      // evaluate the enum type, but that requires more complex AST traversal
      return [enumText];
    } catch (error) {
      return [];
    }
  }
}
