# Test Coverage Documentation

## Overview

This document describes the test coverage for `@corteksa/nestjs-auto-docs` package.

## Test Structure

```
src/
├── scanner/
│   ├── controller-scanner.spec.ts    # Controller scanning and version detection
│   └── module-scanner.spec.ts        # Module-based categorization
├── generators/
│   └── openapi-generator.spec.ts     # OpenAPI spec generation with versioning
├── utils/
│   └── path-utils.spec.ts            # Path manipulation utilities
└── integration/
    └── versioning.spec.ts             # End-to-end versioning workflows
```

## Test Categories

### 1. Controller Scanner Tests
**File:** `src/scanner/controller-scanner.spec.ts`

#### Version Detection
- ✅ Detect v1, v2, v3 from file paths
- ✅ Handle different path separators (Unix/Windows)
- ✅ Return undefined when no version present
- ✅ Handle multiple digits (v10, v20)
- ✅ Handle multiple versions in path (use first)

#### Category Detection
- ✅ Detect simple categories (admin, user)
- ✅ Detect nested categories (admin/auth → Admin - Auth)
- ✅ Ignore 'controllers' folder
- ✅ Handle kebab-case folders
- ✅ Deduplicate consecutive parts
- ✅ Handle deep nesting
- ✅ Return 'Uncategorized' for empty paths

**Coverage:** ~80% of controller-scanner.ts

---

### 2. Module Scanner Tests
**File:** `src/scanner/module-scanner.spec.ts`

#### Module Name Formatting
- ✅ Remove 'Module' suffix
- ✅ Split CamelCase and join with spaces
- ✅ Handle single-word modules
- ✅ Handle multi-word modules

#### Controller-Module Matching
- ✅ Find module containing specific controller
- ✅ Return null when controller not found
- ✅ Handle multiple controllers in module
- ✅ Handle empty controllers array
- ✅ Handle module without controllers property
- ✅ Return first match when multiple modules contain controller

**Coverage:** ~75% of module-scanner.ts

---

### 3. OpenAPI Generator Tests
**File:** `src/generators/openapi-generator.spec.ts`

#### Versioning Disabled (Backwards Compatible)
- ✅ Use globalPrefix for all paths
- ✅ Generate standard server URLs

#### Versioning Enabled
- ✅ Use detected version from controller
- ✅ Handle multiple versions (v1, v2)
- ✅ Use fallback when version not detected
- ✅ Handle custom version prefix
- ✅ Generate servers for each version

#### Tags and Categories
- ✅ Generate tags from categories
- ✅ Deduplicate tags from same category

#### Security Schemes
- ✅ Include bearerAuth by default
- ✅ Exclude security when disabled

#### Route Parameters
- ✅ Convert :param to {param}
- ✅ Handle multiple path parameters

**Coverage:** ~70% of openapi-generator.ts

---

### 4. Path Utilities Tests
**File:** `src/utils/path-utils.spec.ts`

#### Version Pattern Matching
- ✅ Match v1, v2, vN patterns
- ✅ Handle double-digit versions
- ✅ Reject invalid patterns
- ✅ Match first version when multiple exist

#### Path Parameter Conversion
- ✅ Convert single parameter
- ✅ Convert multiple parameters
- ✅ Don't affect paths without parameters
- ✅ Handle parameters at start/end

#### Path Combining
- ✅ Combine simple paths
- ✅ Remove leading/trailing slashes
- ✅ Handle empty segments
- ✅ Handle single segment
- ✅ Handle complex paths

#### Category Name Humanization
- ✅ Capitalize single word
- ✅ Handle kebab-case
- ✅ Handle multiple words
- ✅ Preserve already capitalized
- ✅ Handle empty string

**Coverage:** 100% of tested utilities

---

### 5. Integration Tests
**File:** `src/integration/versioning.spec.ts`

#### End-to-End Versioning Flow
- ✅ Detect version and generate correct paths
- ✅ Handle mixed versioned and non-versioned controllers
- ✅ Generate separate paths for multiple versions
- ✅ Generate servers for each unique version

#### Backwards Compatibility
- ✅ Work without versioning config
- ✅ Ignore version when versioning disabled
- ✅ Use globalPrefix as fallback

**Coverage:** Integration of all components

---

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- controller-scanner.spec.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="version"
```

## Coverage Goals

| Component | Current | Target |
|-----------|---------|--------|
| Controller Scanner | ~80% | 90% |
| Route Scanner | ~40% | 85% |
| Module Scanner | ~75% | 85% |
| DTO Analyzer | ~30% | 80% |
| OpenAPI Generator | ~70% | 85% |
| **Overall** | **~60%** | **85%** |

## Test Scenarios Covered

### ✅ Version Detection
- File paths with v1, v2, v3, v10, etc.
- Paths without version
- Multiple versions in path
- Windows/Unix path separators

### ✅ Path Building
- Versioned paths: `/api/v1/admin/profile`
- Non-versioned paths: `/admin/profile`
- Mixed: versioned + fallback
- Multiple versions: v1 and v2 coexist

### ✅ Backwards Compatibility
- GlobalPrefix without versioning
- Existing apps continue working
- Gradual migration path

### ✅ Edge Cases
- Empty paths
- Null/undefined values
- Multiple controllers in module
- Controllers without module
- Deep nesting
- Special characters

## Future Test Additions

### Route Scanner (Needs More Coverage)
- [ ] Request body DTO extraction
- [ ] Response type extraction
- [ ] Import path parsing
- [ ] Nested DTO analysis
- [ ] Validator extraction

### DTO Analyzer (Needs More Coverage)
- [ ] Type analysis (primitives, objects, arrays)
- [ ] Enum handling
- [ ] Union types
- [ ] Circular reference detection
- [ ] Class-validator integration

### Integration Tests
- [ ] Real NestJS app integration
- [ ] Multiple file scanning
- [ ] Performance tests
- [ ] Error handling scenarios

## Test Data

### Sample Controller Paths
```
✅ src/api/v1/admin/admin.controller.ts
✅ src/api/v2/admin/admin.controller.ts
✅ src/api/v1/admin/auth/auth.controller.ts
✅ src/admin/admin.controller.ts
✅ src/api/v10/user/user.controller.ts
```

### Sample Module Structures
```typescript
✅ AdminModule { controllers: [AdminController] }
✅ MessagingModule { controllers: [MessagesController, ChatsController] }
✅ AdminAuthModule { controllers: [AdminAuthController] }
✅ EmptyModule { controllers: [] }
```

## Contributing Tests

When adding new features, please:

1. Add unit tests for new functions
2. Add integration tests for new workflows
3. Update this documentation
4. Aim for >80% coverage on new code
5. Test edge cases and error scenarios

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Before npm publish
- Daily scheduled runs
