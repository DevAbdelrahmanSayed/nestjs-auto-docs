# Auto-Categorization System

## 🎯 How It Works (Automatic, No Configuration Needed!)

The package **automatically** detects categories from your NestJS modules. No manual configuration required!

### Module-Based Detection (Primary Method)

Categories are extracted directly from `@Module` decorators by finding which module contains each controller. This aligns perfectly with NestJS architecture.

### Module → Category Examples

```typescript
// Example 1: Simple module
@Module({ controllers: [AdminController] })
export class AdminModule {}
// Category: "Admin" ✅

// Example 2: Multi-word module
@Module({ controllers: [AdminAuthController] })
export class AdminAuthModule {}
// Category: "Admin Auth" ✅

// Example 3: Single word module
@Module({ controllers: [MessagesController, ChatsController] })
export class MessagingModule {}
// Category: "Messaging" ✅

// Example 4: CamelCase module
@Module({ controllers: [ObjectController, FieldController] })
export class ObjectModule {}
// Category: "Object" ✅
```

## 🔍 Detection Algorithm

### Step 1: Scan All Modules
```typescript
// Scanner finds all @Module decorators in your codebase
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
```

### Step 2: Match Controllers to Modules
```typescript
// For each controller, find which module contains it
AdminController → Found in AdminModule.controllers[]
MessagesController → Found in MessagingModule.controllers[]
ObjectController → Found in ObjectModule.controllers[]
```

### Step 3: Format Module Name to Category
```typescript
AdminModule → "Admin"
AdminAuthModule → "Admin Auth"
MessagingModule → "Messaging"
UserProfileModule → "User Profile"
```

**Algorithm:**
1. Remove "Module" suffix
2. Split by capital letters (AdminAuth → Admin Auth)
3. Join with spaces

### Fallback: File Path Detection
If no module is found (rare case), the system falls back to file path detection:
```typescript
src/api/v1/admin/admin.controller.ts → "Admin"
src/api/v1/messaging/messages.controller.ts → "Messaging"
```

## ⚙️ Zero Configuration Example

```typescript
// This is all you need!
AutoDocsModule.forRoot({
  title: 'My API',
  version: '1.0.0',
  sourcePath: 'src',
  globalPrefix: '/api/v1',
})

// Categories are detected automatically from your file structure!
```

## 🎨 Optional: Custom Category Names

Only use `categoryMapping` if you want to **rename** auto-detected categories:

```typescript
AutoDocsModule.forRoot({
  title: 'My API',
  version: '1.0.0',
  sourcePath: 'src',
  globalPrefix: '/api/v1',

  // OPTIONAL: Customize auto-detected category names
  categoryMapping: {
    'Admin': 'Administration',           // Rename
    'Admin - Auth': 'Admin Authentication', // Rename nested
    'Messaging': 'Messaging Platform',   // Add branding
  },
})
```

## 📁 Recommended File Structure

For best auto-categorization, organize your controllers like this:

```
src/
└── api/
    └── v1/
        ├── admin/                    → Category: "Admin"
        │   ├── admin.controller.ts
        │   └── auth/                 → Category: "Admin - Auth"
        │       └── auth.controller.ts
        ├── user/                     → Category: "User"
        │   ├── user.controller.ts
        │   └── profile/              → Category: "User - Profile"
        │       └── profile.controller.ts
        ├── messaging/                → Category: "Messaging"
        │   └── messages.controller.ts
        └── object/                   → Category: "Object"
            ├── field/                → Category: "Object - Field"
            └── data/                 → Category: "Object - Data"
```

## 🚫 What to Avoid

### ❌ Don't Put Controllers in 'controllers' Folder
```
Bad:  src/api/v1/admin/controllers/admin.controller.ts
Good: src/api/v1/admin/admin.controller.ts
```

The scanner filters out 'controllers' folders to avoid redundant category names.

### ❌ Don't Use Deep Nesting (>3 levels)
```
Too deep: src/api/v1/admin/auth/oauth/providers/google/google.controller.ts
Result:   "Admin - Auth - Oauth - Providers - Google" (too long!)

Better:   src/api/v1/admin/oauth-google/google.controller.ts
Result:   "Admin - Oauth Google" ✅
```

## 🎯 Real-World Example (Your CRM)

Your actual NestJS modules and auto-detected categories:

```typescript
// AdminModule → "Admin"
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

// AdminAuthModule → "Admin Auth"
@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}

// MessagingModule → "Messaging"
@Module({
  controllers: [
    SessionsController,
    ChatsController,
    MessagesController,
  ],
  providers: [MessagingService],
})
export class MessagingModule {}

// ObjectModule → "Object"
@Module({
  controllers: [
    ObjectController,
    FieldController,
    RelationController,
    DataController,
  ],
  providers: [ObjectService],
})
export class ObjectModule {}

// UserModule → "User"
@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

// UserAuthModule → "User Auth"
@Module({
  controllers: [UserAuthController],
  providers: [UserAuthService],
})
export class UserAuthModule {}

// WebhookModule → "Webhook"
@Module({
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
```

**Result**: 20+ categories automatically detected from modules with ZERO configuration! 🎉

**Categories generated:**
- Admin
- Admin Auth
- App
- Backup
- Docs
- Integrations
- Messaging
- Notification
- Object
- Permission
- Pricing
- Role
- Tenant
- User
- User Auth
- User Permissions
- Waitlist
- Webhook

## 🔧 Technical Details

### Source Code

The detection logic uses two classes:

#### 1. ModuleScanner (Primary)

Scans all `@Module` decorators to find which module owns each controller:

```typescript
// Find which module contains a specific controller
findModuleForController(controllerName: string, sourceFiles: SourceFile[]): string | null {
  for (const sourceFile of sourceFiles) {
    const modules = this.extractModulesFromFile(sourceFile);

    for (const module of modules) {
      if (module.controllers.includes(controllerName)) {
        return this.formatModuleName(module.name);
      }
    }
  }

  return null;
}

// Format module name to category name
private formatModuleName(moduleName: string): string {
  // Remove "Module" suffix
  let name = moduleName.replace(/Module$/, '');

  // Split by capital letters (AdminAuth → Admin Auth)
  const parts = name.split(/(?=[A-Z])/).filter(Boolean);

  // Join with spaces
  return parts.join(' ');
}
```

#### 2. ControllerScanner (Integration)

Uses ModuleScanner to detect categories:

```typescript
private detectCategoryFromModule(controllerName: string): string {
  const sourceFiles = this.project.getSourceFiles();
  const category = this.moduleScanner.findModuleForController(controllerName, sourceFiles);

  // Fallback to file path detection if module not found
  if (!category) {
    console.warn(`Module not found for controller ${controllerName}, falling back to file path detection`);
    const sourceFile = sourceFiles.find(sf => {
      const classes = sf.getClasses();
      return classes.some(c => c.getName() === controllerName);
    });

    if (sourceFile) {
      return this.detectCategoryFromPath(sourceFile.getFilePath());
    }

    return 'Uncategorized';
  }

  return category;
}
```

## 💡 Pro Tips

1. **Keep it simple** - Let auto-detection do its job
2. **Use categoryMapping** only for branding/renaming
3. **Structure matters** - Organize folders by domain/feature
4. **Avoid deep nesting** - Keep categories readable
5. **Consistent naming** - Use kebab-case for folders

## ❓ FAQ

**Q: Do I need to configure categoryMapping?**
A: No! It's completely optional. Categories are auto-detected.

**Q: Can I disable auto-detection?**
A: No, but you can override any category using categoryMapping.

**Q: What if I want custom descriptions?**
A: Descriptions are auto-generated from category names. You can add JSDoc comments to controllers for custom descriptions.

**Q: Will this work with my existing project?**
A: Yes! Just install and configure the module. Categories will be detected automatically.

## ✅ Summary

- ✨ **Zero configuration** - Categories detected automatically
- 📁 **File structure driven** - No decorators needed
- 🎨 **Optional customization** - Use categoryMapping to rename
- 🚀 **Works out of the box** - Just install and go!
