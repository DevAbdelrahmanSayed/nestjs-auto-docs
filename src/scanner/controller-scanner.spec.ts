import { ControllerScanner } from './controller-scanner';

describe('ControllerScanner', () => {
  describe('detectVersionFromPath', () => {
    let scanner: ControllerScanner;

    beforeEach(() => {
      scanner = new ControllerScanner('src');
    });

    it('should detect v1 from file path', () => {
      const path = 'src/api/v1/admin/admin.controller.ts';
      expect(scanner.detectVersionFromPath(path)).toBe('v1');
    });

    it('should detect v2 from file path', () => {
      const path = 'src/api/v2/user/user.controller.ts';
      expect(scanner.detectVersionFromPath(path)).toBe('v2');
    });

    it('should detect v3 from file path', () => {
      const path = 'src/api/v3/messaging/messages.controller.ts';
      expect(scanner.detectVersionFromPath(path)).toBe('v3');
    });

    it('should detect version with different separators', () => {
      const windowsPath = 'src\\api\\v1\\admin\\admin.controller.ts';
      expect(scanner.detectVersionFromPath(windowsPath)).toBe('v1');
    });

    it('should return undefined when no version in path', () => {
      const path = 'src/admin/admin.controller.ts';
      expect(scanner.detectVersionFromPath(path)).toBeUndefined();
    });

    it('should return undefined for root level controllers', () => {
      const path = 'admin.controller.ts';
      expect(scanner.detectVersionFromPath(path)).toBeUndefined();
    });

    it('should handle version with multiple digits', () => {
      const path = 'src/api/v10/admin/admin.controller.ts';
      expect(scanner.detectVersionFromPath(path)).toBe('v10');
    });

    it('should detect first version when multiple versions in path', () => {
      const path = 'src/api/v1/nested/v2/admin.controller.ts';
      expect(scanner.detectVersionFromPath(path)).toBe('v1');
    });
  });

  describe('detectCategoryFromPath', () => {
    let scanner: ControllerScanner;

    beforeEach(() => {
      scanner = new ControllerScanner('src');
    });

    it('should detect category from simple path', () => {
      const path = 'src/api/v1/admin/admin.controller.ts';
      expect(scanner.detectCategoryFromPath(path)).toBe('Admin');
    });

    it('should detect category from nested path', () => {
      const path = 'src/api/v1/admin/auth/auth.controller.ts';
      expect(scanner.detectCategoryFromPath(path)).toBe('Admin - Auth');
    });

    it('should ignore controllers folder but include filename', () => {
      const path = 'src/api/v1/messaging/controllers/messages.controller.ts';
      // 'controllers' folder is filtered, but filename is included
      expect(scanner.detectCategoryFromPath(path)).toBe('Messaging - Messages');
    });

    it('should handle kebab-case folders', () => {
      const path = 'src/api/v1/admin-auth/admin-auth.controller.ts';
      expect(scanner.detectCategoryFromPath(path)).toBe('Admin Auth');
    });

    it('should deduplicate consecutive category parts', () => {
      const path = 'src/api/v1/admin/admin/admin.controller.ts';
      expect(scanner.detectCategoryFromPath(path)).toBe('Admin');
    });

    it('should extract category from filename when no directory structure', () => {
      const path = 'admin.controller.ts';
      // When no directory structure, uses filename as category
      expect(scanner.detectCategoryFromPath(path)).toBe('Admin');
    });

    it('should handle deep nesting', () => {
      const path = 'src/api/v1/admin/auth/oauth/oauth.controller.ts';
      expect(scanner.detectCategoryFromPath(path)).toBe('Admin - Auth - Oauth');
    });
  });
});
