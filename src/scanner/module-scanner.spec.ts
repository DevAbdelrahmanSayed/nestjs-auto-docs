import { ModuleScanner } from './module-scanner';
import { Project } from 'ts-morph';

describe('ModuleScanner', () => {
  let scanner: ModuleScanner;
  let project: Project;

  beforeEach(() => {
    scanner = new ModuleScanner();
    project = new Project();
  });

  describe('formatModuleName', () => {
    it('should remove Module suffix', () => {
      // Using any to access private method for testing
      const formatted = (scanner as any).formatModuleName('AdminModule');
      expect(formatted).toBe('Admin');
    });

    it('should split CamelCase and join with spaces', () => {
      const formatted = (scanner as any).formatModuleName('AdminAuthModule');
      expect(formatted).toBe('Admin Auth');
    });

    it('should handle single word modules', () => {
      const formatted = (scanner as any).formatModuleName('MessagingModule');
      expect(formatted).toBe('Messaging');
    });

    it('should handle multiple words', () => {
      const formatted = (scanner as any).formatModuleName('UserProfileSettingsModule');
      expect(formatted).toBe('User Profile Settings');
    });

    it('should handle already formatted names', () => {
      const formatted = (scanner as any).formatModuleName('Admin');
      expect(formatted).toBe('Admin');
    });
  });

  describe('findModuleForController', () => {
    it('should find module containing controller', () => {
      const sourceFile = project.createSourceFile(
        'test.module.ts',
        `
        import { Module } from '@nestjs/common';
        import { AdminController } from './admin.controller';

        @Module({
          controllers: [AdminController],
          providers: [],
        })
        export class AdminModule {}
        `,
        { overwrite: true },
      );

      const result = scanner.findModuleForController('AdminController', [sourceFile]);
      expect(result).toBe('Admin');
    });

    it('should return null when controller not found', () => {
      const sourceFile = project.createSourceFile(
        'test.module.ts',
        `
        import { Module } from '@nestjs/common';
        import { UserController } from './user.controller';

        @Module({
          controllers: [UserController],
          providers: [],
        })
        export class UserModule {}
        `,
        { overwrite: true },
      );

      const result = scanner.findModuleForController('AdminController', [sourceFile]);
      expect(result).toBeNull();
    });

    it('should handle multiple controllers in module', () => {
      const sourceFile = project.createSourceFile(
        'test.module.ts',
        `
        import { Module } from '@nestjs/common';
        import { MessagesController } from './messages.controller';
        import { ChatsController } from './chats.controller';
        import { SessionsController } from './sessions.controller';

        @Module({
          controllers: [MessagesController, ChatsController, SessionsController],
          providers: [],
        })
        export class MessagingModule {}
        `,
        { overwrite: true },
      );

      expect(scanner.findModuleForController('MessagesController', [sourceFile])).toBe('Messaging');
      expect(scanner.findModuleForController('ChatsController', [sourceFile])).toBe('Messaging');
      expect(scanner.findModuleForController('SessionsController', [sourceFile])).toBe('Messaging');
    });

    it('should handle empty controllers array', () => {
      const sourceFile = project.createSourceFile(
        'test.module.ts',
        `
        import { Module } from '@nestjs/common';

        @Module({
          controllers: [],
          providers: [],
        })
        export class EmptyModule {}
        `,
        { overwrite: true },
      );

      const result = scanner.findModuleForController('AnyController', [sourceFile]);
      expect(result).toBeNull();
    });

    it('should handle module without controllers property', () => {
      const sourceFile = project.createSourceFile(
        'test.module.ts',
        `
        import { Module } from '@nestjs/common';

        @Module({
          providers: [],
        })
        export class NoControllersModule {}
        `,
        { overwrite: true },
      );

      const result = scanner.findModuleForController('AnyController', [sourceFile]);
      expect(result).toBeNull();
    });

    it('should find controller in first matching module', () => {
      const sourceFile1 = project.createSourceFile(
        'admin.module.ts',
        `
        import { Module } from '@nestjs/common';
        import { AdminController } from './admin.controller';

        @Module({
          controllers: [AdminController],
          providers: [],
        })
        export class AdminModule {}
        `,
        { overwrite: true },
      );

      const sourceFile2 = project.createSourceFile(
        'other.module.ts',
        `
        import { Module } from '@nestjs/common';
        import { AdminController } from './admin.controller';

        @Module({
          controllers: [AdminController],
          providers: [],
        })
        export class OtherModule {}
        `,
        { overwrite: true },
      );

      // Should return first match
      const result = scanner.findModuleForController('AdminController', [sourceFile1, sourceFile2]);
      expect(result).toBe('Admin');
    });
  });
});
