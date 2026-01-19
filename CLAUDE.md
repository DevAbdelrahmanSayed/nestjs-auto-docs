# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **nestjs-smart-docs**, a zero-configuration automatic API documentation generator for NestJS applications. It uses TypeScript AST parsing (ts-morph) to scan controllers and generate OpenAPI specifications with a beautiful Scalar UI, without requiring manual decorators.

## Common Commands

### Build and Development
- `npm run build` - Compile TypeScript to dist/
- `npm run build:watch` - Watch mode compilation

### Testing
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Code Quality
- `npm run lint` - Lint TypeScript files with ESLint
- `npm run format` - Format code with Prettier

### Publishing
- `npm run prepublishOnly` - Runs build and tests before publishing

## Architecture

### Core Data Flow

The package follows a scanner → metadata → generator → spec → UI pipeline:

1. **Scanning Phase** (scanner/)
   - `ControllerScanner` - Scans source files for NestJS controllers using ts-morph
   - `RouteScanner` - Extracts HTTP routes from decorators (@Get, @Post, etc.)
   - `DtoAnalyzer` - Analyzes DTOs and their TypeScript types
   - `ValidatorExtractor` - Extracts class-validator decorators and constraints

2. **Metadata Phase** (interfaces/metadata.interface.ts)
   - Transforms AST nodes into structured metadata objects
   - Key types: `ControllerMetadata`, `RouteMetadata`, `DtoMetadata`, `PropertyMetadata`
   - Metadata includes: paths, HTTP methods, parameters, types, validators, guards

3. **Generation Phase** (generators/)
   - `OpenApiGenerator` - Converts metadata to OpenAPI 3.0 specification
   - `CategoryGenerator` - Auto-detects categories from folder structure
   - `ExampleGenerator` - Creates example values for schemas

4. **Serving Phase** (ui/)
   - `ScalarController` - NestJS controller that serves Scalar UI and OpenAPI JSON

### Module Structure

- **module/** - NestJS module and service orchestration
  - `AutoDocsModule` - Dynamic module with `forRoot()` and `forRootAsync()`
  - `AutoDocsService` - Orchestrates scanning, metadata generation, and caching

- **scanner/** - TypeScript AST analysis
  - Uses `ts-morph` Project to parse source files
  - Extracts decorators, JSDoc comments, type information
  - Handles complex types: arrays, unions, enums, nested objects

- **generators/** - OpenAPI spec generation
  - Transforms metadata into OpenAPI 3.0 JSON
  - Handles schemas, paths, parameters, responses
  - Applies versioning, categorization, security schemes

- **interfaces/** - TypeScript type definitions
  - `options.interface.ts` - User configuration options
  - `metadata.interface.ts` - Internal metadata structures
  - `openapi.interface.ts` - OpenAPI spec structure

- **ui/** - Documentation UI
  - Scalar API reference integration
  - Serves both HTML UI and JSON spec

### Key Features

**Zero-Config AST Scanning**: Uses ts-morph to parse TypeScript source instead of requiring decorator metadata. Scans for NestJS decorators (@Controller, @Get, etc.) and extracts route information.

**Auto-Version Detection**: Detects API versions from file paths (e.g., `src/api/v1/` → `/api/v1`). When `versioning.enabled = true`, generates separate server URLs for each version.

**Category Auto-Detection**: Creates categories from folder hierarchy:
- `src/api/v1/admin/users.controller.ts` → Category: "Admin"
- `src/api/v1/admin/auth/auth.controller.ts` → Category: "Admin - Auth"

**Validator Integration**: Extracts class-validator decorators and maps them to OpenAPI constraints:
- `@IsEmail()` → `format: 'email'`
- `@Min(18)` → `minimum: 18`
- `@MaxLength(50)` → `maxLength: 50`

**Type Analysis**: Recursively analyzes TypeScript types including primitives, arrays, enums, unions, and nested objects.

## Project Configuration

### TypeScript Config
- Target: ES2021
- Decorators: Enabled (emitDecoratorMetadata, experimentalDecorators)
- Output: dist/ with declarations
- Excludes: spec files from build

### Jest Config
- Test files: `*.spec.ts` in src/
- Transform: ts-jest
- Coverage: Output to coverage/

### Package Structure
- Main entry: dist/index.js
- Types: dist/index.d.ts
- Published files: dist/, README.md, LICENSE

## Development Guidelines

### When Adding Scanners
- Use ts-morph API to navigate AST nodes
- Extract decorator arguments using `getArguments()` and `getText()`
- Handle edge cases: optional parameters, complex types, missing JSDoc
- Add unit tests with mock TypeScript files

### When Modifying Generators
- Follow OpenAPI 3.0 specification strictly
- Ensure generated spec is valid (test with validators)
- Preserve existing categorization logic
- Update interfaces if schema structure changes

### When Adding Features
- Consider zero-config principle - avoid requiring new decorators
- Update AutoDocsOptions interface for new config options
- Add tests in integration/ for end-to-end scenarios
- Document in README.md with examples

### Testing Strategy
- Unit tests for scanners (mock ts-morph Project)
- Unit tests for generators (mock metadata inputs)
- Integration tests for full scanning pipeline
- Test edge cases: optional params, complex types, versioning

## Important Notes

- The package scans source files at startup (onModuleInit)
- Scanning is one-time unless watchMode is enabled
- ts-morph Project is created for the configured sourcePath
- Controllers must use standard NestJS decorators to be detected
- DTOs should use class-validator decorators for full metadata extraction
