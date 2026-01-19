# Development Guide for @corteksa/nestjs-auto-docs

## 🎉 Current Progress

### ✅ What's Been Completed (Week 1 - ~12 hours)

1. **Package Structure** ✓
   - Complete directory structure created
   - TypeScript configuration setup
   - package.json with all dependencies
   - .gitignore file

2. **TypeScript Interfaces** ✓
   - `options.interface.ts` - Configuration options
   - `metadata.interface.ts` - Controller/route/DTO metadata
   - `openapi.interface.ts` - OpenAPI 3.0 spec types

3. **Controller Scanner** ✓
   - Successfully scans TypeScript files using ts-morph
   - Finds all @Controller decorators
   - Extracts controller paths
   - **Auto-categorizes** from file paths
   - Extracts JSDoc comments
   - Detects class-level guards
   - **Tested with CRM backend: Found 33/33 controllers!**

### 📊 Test Results

```
✅ Found 33 controllers from CRM backend

Categories detected:
- App (1)
- Admin - Admin, Auth, Permission, Role, etc. (5)
- Messaging - Calls, Chats, Messages, Sessions (6)
- Object - Comment, Data, Field, Relation, etc. (9)
- User - Auth, Otp (3)
- And more...
```

## 🚀 Next Steps

### Immediate Priority: Milestone 1 Completion (Week 1-2, ~20-30 hours remaining)

#### 1. Route Scanner (High Priority)
**File**: `src/scanner/route-scanner.ts`

**Purpose**: Extract HTTP routes from controller methods

**Implementation Guide**:
```typescript
import { ClassDeclaration, MethodDeclaration } from 'ts-morph';
import { RouteMetadata, HttpMethod } from '../interfaces';

export class RouteScanner {
  /**
   * Scan all routes in a controller class
   */
  scanRoutes(classDeclaration: ClassDeclaration, controllerPath: string): RouteMetadata[] {
    const routes: RouteMetadata[] = [];
    const methods = classDeclaration.getMethods();

    for (const method of methods) {
      const route = this.extractRoute(method, controllerPath);
      if (route) {
        routes.push(route);
      }
    }

    return routes;
  }

  /**
   * Extract route metadata from a method
   */
  private extractRoute(method: MethodDeclaration, controllerPath: string): RouteMetadata | null {
    const decorators = method.getDecorators();

    // Find HTTP method decorator (@Get, @Post, @Put, @Patch, @Delete)
    const httpDecorator = decorators.find(dec => {
      const name = dec.getName();
      return ['Get', 'Post', 'Put', 'Patch', 'Delete'].includes(name);
    });

    if (!httpDecorator) {
      return null;
    }

    const httpMethod = httpDecorator.getName().toUpperCase() as HttpMethod;
    const routePath = this.extractRoutePath(httpDecorator);
    const fullPath = this.combinePathsthis(controllerPath, routePath);

    // TODO: Extract parameters (@Param, @Query, @Body)
    // TODO: Extract guards (@UseGuards)
    // TODO: Extract return type
    // TODO: Extract JSDoc

    return {
      name: method.getName(),
      httpMethod,
      path: routePath,
      fullPath,
    };
  }

  private combinePaths(base: string, path: string): string {
    // Implement path combination logic
    const parts = [base, path].filter(p => p && p !== '/');
    return '/' + parts.join('/').replace(/\/+/g, '/');
  }
}
```

**Test**:
```bash
# Add to manual-test.ts
const routeScanner = new RouteScanner();
controllers.forEach(ctrl => {
  ctrl.routes = routeScanner.scanRoutes(classDeclaration, ctrl.path);
  console.log(`Routes in ${ctrl.name}:`, ctrl.routes.length);
});
```

**Estimated Time**: 6-8 hours

---

#### 2. DTO Analyzer (High Priority)
**File**: `src/scanner/dto-analyzer.ts`

**Purpose**: Analyze TypeScript types for request/response schemas

**Implementation Guide**:
```typescript
import { Type, ClassDeclaration } from 'ts-morph';
import { DtoMetadata, TypeMetadata } from '../interfaces';

export class DtoAnalyzer {
  private visitedTypes = new Set<string>();

  /**
   * Analyze a DTO class
   */
  analyzeDto(classDeclaration: ClassDeclaration): DtoMetadata {
    const properties = classDeclaration.getProperties();

    return {
      name: classDeclaration.getName() || 'UnknownDto',
      properties: properties.map(prop => ({
        name: prop.getName(),
        type: this.analyzeType(prop.getType()),
        required: !prop.hasQuestionToken(),
      })),
    };
  }

  /**
   * Analyze a TypeScript type
   */
  analyzeType(type: Type): TypeMetadata {
    const typeName = type.getText();

    // Prevent infinite recursion
    if (this.visitedTypes.has(typeName)) {
      return { type: typeName, isArray: false, isOptional: false };
    }

    this.visitedTypes.add(typeName);

    // Check if array
    const isArray = type.isArray();

    // Get base type if array
    const baseType = isArray ? type.getArrayElementTypeOrThrow() : type;

    // Handle primitive types
    if (baseType.isString()) return { type: 'string', isArray, isOptional: false };
    if (baseType.isNumber()) return { type: 'number', isArray, isOptional: false };
    if (baseType.isBoolean()) return { type: 'boolean', isArray, isOptional: false };

    // TODO: Handle class types (nested DTOs)
    // TODO: Handle enums
    // TODO: Handle union types

    return { type: typeName, isArray, isOptional: false };
  }
}
```

**Test**:
```bash
# Test with a simple DTO
const dtoAnalyzer = new DtoAnalyzer();
// Find a DTO class and analyze it
```

**Estimated Time**: 8-12 hours

---

#### 3. Validator Extractor (Medium Priority)
**File**: `src/scanner/validator-extractor.ts`

**Purpose**: Extract class-validator decorators and convert to OpenAPI constraints

**Implementation**:
```typescript
import { PropertyDeclaration } from 'ts-morph';
import { ValidatorMetadata } from '../interfaces';

export class ValidatorExtractor {
  /**
   * Extract validation decorators from a property
   */
  extractValidators(property: PropertyDeclaration): ValidatorMetadata[] {
    const validators: ValidatorMetadata[] = [];
    const decorators = property.getDecorators();

    for (const decorator of decorators) {
      const name = decorator.getName();

      // Map common class-validator decorators
      if (name === 'IsEmail') {
        validators.push({
          name: 'IsEmail',
          constraints: { format: 'email' },
        });
      }

      if (name === 'Min') {
        const args = decorator.getArguments();
        const minValue = parseInt(args[0]?.getText());
        validators.push({
          name: 'Min',
          args: [minValue],
          constraints: { minimum: minValue },
        });
      }

      // TODO: Add more validators (Max, Length, IsString, IsNumber, etc.)
    }

    return validators;
  }
}
```

**Estimated Time**: 4-6 hours

---

### Milestone 2: OpenAPI Generation (Week 2-3, ~16-20 hours)

#### 1. OpenAPI Generator
**File**: `src/generators/openapi-generator.ts`

**Purpose**: Transform controller metadata into OpenAPI 3.0 spec

**Key Methods**:
- `generate()` - Main entry point
- `generatePaths()` - Create paths object
- `generateSchemas()` - Create component schemas
- `generateTags()` - Create category tags
- `applyGlobalPrefix()` - Add prefix to paths

#### 2. Category Generator
**File**: `src/generators/category-generator.ts`

**Purpose**: Generate OpenAPI tags from categories

#### 3. Example Generator
**File**: `src/generators/example-generator.ts`

**Purpose**: Generate smart examples based on field names and types

---

### Milestone 3: NestJS Integration (Week 3-4, ~12-16 hours)

#### 1. AutoDocsModule
**File**: `src/module/auto-docs.module.ts`

**Purpose**: Main NestJS dynamic module

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { AutoDocsOptions } from '../interfaces';

@Module({})
export class AutoDocsModule {
  static forRoot(options: AutoDocsOptions): DynamicModule {
    return {
      module: AutoDocsModule,
      providers: [
        {
          provide: 'AUTO_DOCS_OPTIONS',
          useValue: options,
        },
        AutoDocsService,
      ],
      controllers: [ScalarController],
      exports: [AutoDocsService],
    };
  }
}
```

#### 2. AutoDocsService
**File**: `src/module/auto-docs.service.ts`

**Purpose**: Core service that orchestrates scanning and generation

#### 3. Scalar Controller
**File**: `src/ui/scalar-controller.ts`

**Purpose**: Serve Scalar UI and OpenAPI spec

```typescript
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class ScalarController {
  constructor(private autoDocsService: AutoDocsService) {}

  @Get('docs')
  getScalarUI(@Res() res: Response) {
    const html = this.generateScalarHtml();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('docs-json')
  getOpenApiSpec() {
    return this.autoDocsService.getOpenApiSpec();
  }

  private generateScalarHtml(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script
    id="api-reference"
    data-url="/docs-json"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// tests/controller-scanner.spec.ts
import { ControllerScanner } from '../src/scanner/controller-scanner';

describe('ControllerScanner', () => {
  it('should find controllers', async () => {
    const scanner = new ControllerScanner('src');
    const controllers = await scanner.scanControllers();
    expect(controllers).toBeDefined();
  });

  it('should auto-categorize from paths', () => {
    const scanner = new ControllerScanner('src');
    const category = scanner.detectCategoryFromPath(
      'src/api/v1/admin/auth/admin-auth.controller.ts'
    );
    expect(category).toBe('Admin - Auth');
  });
});
```

### Integration Tests
```bash
# Test with actual CRM backend
npm link
cd ../crm-backend
npm link @corteksa/nestjs-auto-docs
# Add to app.module.ts and test
```

---

## 📦 Publishing to npm

Once all milestones are complete:

```bash
# 1. Update version
npm version 1.0.0

# 2. Build
npm run build

# 3. Run tests
npm test

# 4. Publish
npm publish --access public
```

---

## 🎯 Success Criteria

- [ ] Scans all 33 CRM backend controllers ✅ DONE
- [ ] Extracts all routes with HTTP methods
- [ ] Analyzes all DTOs and types
- [ ] Generates valid OpenAPI 3.0 spec
- [ ] Categories work correctly (8-10 categories)
- [ ] All paths include `/api/v1/` prefix
- [ ] Scalar UI displays documentation
- [ ] "Try it out" feature works
- [ ] 80%+ test coverage
- [ ] Published to npm

---

## 📝 Tips & Best Practices

1. **Incremental Development**: Complete one scanner at a time, test thoroughly before moving to next

2. **Use Manual Test Script**: Run `npx ts-node tests/manual-test.ts` frequently to verify changes

3. **Check CRM Backend**: The real test is whether it works with the actual CRM backend

4. **Reference nest-scramble**: Look at how they handle similar problems (in `node_modules/nest-scramble/dist/`)

5. **TypeScript AST Debugging**: Use `console.log(node.getText())` and `node.getKind()` to understand AST structure

6. **Test Edge Cases**:
   - Controllers with no routes
   - Routes with no parameters
   - Complex DTO nesting
   - Circular type references
   - Union types and enums

---

## 🔗 Useful Resources

- [ts-morph Documentation](https://ts-morph.com/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Scalar UI Documentation](https://github.com/scalar/scalar)
- [NestJS Dynamic Modules](https://docs.nestjs.com/fundamentals/dynamic-modules)
- [class-validator Decorators](https://github.com/typestack/class-validator)

---

## 💡 Current File Structure

```
/home/cipher/corteksa/nestjs-auto-docs/
├── src/
│   ├── scanner/
│   │   └── controller-scanner.ts ✅
│   ├── generators/ (empty)
│   ├── ui/ (empty)
│   ├── module/ (empty)
│   └── interfaces/ ✅
│       ├── options.interface.ts
│       ├── metadata.interface.ts
│       ├── openapi.interface.ts
│       └── index.ts
├── tests/
│   └── manual-test.ts ✅
├── package.json ✅
├── tsconfig.json ✅
├── README.md ✅
└── DEVELOPMENT_GUIDE.md ✅ (this file)
```

---

## 🚦 Quick Start for Continuing Development

```bash
# 1. Navigate to package
cd /home/cipher/corteksa/nestjs-auto-docs

# 2. Create route scanner
touch src/scanner/route-scanner.ts

# 3. Implement (see guide above)
# ... code ...

# 4. Build
npm run build

# 5. Test
npx ts-node tests/manual-test.ts

# 6. Repeat for DTO analyzer
touch src/scanner/dto-analyzer.ts
```

Good luck! 🚀
