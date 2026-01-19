# Publishing Guide for @corteksa/nestjs-auto-docs

## Pre-Publish Checklist

### ✅ **Completed:**
- [x] All tests passing (63/63 tests)
- [x] Package built successfully
- [x] LICENSE file created (MIT)
- [x] README.md exists
- [x] .npmignore configured
- [x] Version updated to 1.0.0
- [x] Keywords optimized for discoverability
- [x] Package.json configured correctly

### 📋 **Files Included in Package:**
- `dist/` - Compiled JavaScript + TypeScript definitions
- `README.md` - Documentation
- `LICENSE` - MIT License

### 🚫 **Files Excluded:**
- Source files (`src/`)
- Tests (`*.spec.ts`)
- Coverage reports
- Dev dependencies
- IDE files

---

## Publishing Steps

### **Step 1: Login to npm**
```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- 2FA code (if enabled)

### **Step 2: Verify Package Contents**
```bash
# See what will be published
npm pack --dry-run

# OR create a tarball to inspect
npm pack
tar -tzf corteksa-nestjs-auto-docs-1.0.0.tgz
```

### **Step 3: Test Publish (Optional)**
```bash
# Publish to test registry first (npm 8+)
npm publish --dry-run

# Check for any warnings or errors
```

### **Step 4: Publish to npm**
```bash
# Publish as a scoped public package
npm publish --access public
```

The `--access public` flag is required for scoped packages (@corteksa).

### **Step 5: Verify Publication**
```bash
# Check on npm registry
npm view @corteksa/nestjs-auto-docs

# Or visit:
# https://www.npmjs.com/package/@corteksa/nestjs-auto-docs
```

---

## Post-Publish

### **Test Installation**
```bash
# In a test project
npm install @corteksa/nestjs-auto-docs

# Verify it works
npm list @corteksa/nestjs-auto-docs
```

### **Update README Badge** (Optional)
Add npm version badge to README:
```markdown
[![npm version](https://badge.fury.io/js/@corteksa%2Fnestjs-auto-docs.svg)](https://www.npmjs.com/package/@corteksa/nestjs-auto-docs)
```

### **GitHub Release**
Create a GitHub release:
1. Go to: https://github.com/corteksa/nestjs-auto-docs/releases
2. Click "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Add release notes (see template below)

---

## Release Notes Template (v1.0.0)

```markdown
# v1.0.0 - Initial Release 🎉

First stable release of @corteksa/nestjs-auto-docs!

## ✨ Features

### Core Functionality
- 🔍 **Automatic Controller Scanning** - Zero decorators required
- 📊 **OpenAPI 3.0 Generation** - Full spec generation
- 🎨 **Beautiful Scalar UI** - Modern, interactive documentation
- 🏷️ **Module-Based Categorization** - Auto-detects from @Module decorators
- 📦 **DTO Analysis** - Request/response type extraction
- ✅ **Class-Validator Integration** - Validation rules in docs

### Versioning Support (NEW)
- 🔄 **Auto-Version Detection** - Detects v1, v2, v3 from file paths
- 🌐 **Multi-Version APIs** - Support multiple versions in same codebase
- ⚙️ **Configurable Prefix** - Custom version prefixes
- 🔙 **Fallback Support** - Handles non-versioned controllers

### Developer Experience
- ⚡ **Zero Configuration** - Works out of the box
- 🎯 **TypeScript First** - Full type safety
- 📝 **JSDoc Support** - Extracts descriptions from comments
- 🔒 **Security Schemes** - JWT authentication support
- 🎨 **Customizable Theme** - Colors, dark mode, logo

## 📦 Installation

\`\`\`bash
npm install @corteksa/nestjs-auto-docs
\`\`\`

## 🚀 Quick Start

\`\`\`typescript
import { AutoDocsModule } from '@corteksa/nestjs-auto-docs';

@Module({
  imports: [
    AutoDocsModule.forRoot({
      title: 'My API',
      version: '1.0',
      sourcePath: 'src',
      globalPrefix: '/api/v1',
    }),
  ],
})
export class AppModule {}
\`\`\`

Visit: `http://localhost:3000/docs`

## 📊 Stats

- 63 tests, all passing ✅
- 5 test suites
- MIT Licensed
- TypeScript 5.0+ compatible
- NestJS 10-11 compatible

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/@corteksa/nestjs-auto-docs)
- [GitHub Repository](https://github.com/corteksa/nestjs-auto-docs)
- [Documentation](https://github.com/corteksa/nestjs-auto-docs#readme)

## 🙏 Credits

Built with:
- [ts-morph](https://github.com/dsherret/ts-morph) - TypeScript AST parsing
- [Scalar](https://github.com/scalar/scalar) - Beautiful API documentation UI
- [NestJS](https://nestjs.com) - Progressive Node.js framework
```

---

## Troubleshooting

### **Error: "You do not have permission to publish"**
Make sure you're logged in and have access to the @corteksa scope:
```bash
npm whoami
npm access ls-packages
```

### **Error: "Package already exists"**
The package name is taken. Either:
- Choose a different name
- Request access if you own the scope

### **Error: "prepublishOnly script failed"**
The build or tests failed. Fix issues and try again:
```bash
npm test
npm run build
```

---

## Version Management

### **Semantic Versioning**
- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features, backwards compatible
- **PATCH** (x.x.1): Bug fixes

### **Update Version**
```bash
# Patch (1.0.0 → 1.0.1)
npm version patch

# Minor (1.0.0 → 1.1.0)
npm version minor

# Major (1.0.0 → 2.0.0)
npm version major
```

### **Publish New Version**
```bash
# Update version
npm version patch -m "Fix: bug description"

# Build and test automatically via prepublishOnly
npm publish --access public

# Push to git
git push && git push --tags
```

---

## npm Scripts

```bash
# Build
npm run build

# Test
npm test
npm run test:coverage

# Lint
npm run lint

# Format
npm run format

# Pre-publish (runs automatically)
npm run prepublishOnly  # build + test
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/corteksa/nestjs-auto-docs/issues
- npm: https://www.npmjs.com/package/@corteksa/nestjs-auto-docs

---

## License

MIT © Corteksa
