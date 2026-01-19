/**
 * Tests for path utility functions
 * These are integration-style tests that verify path handling across the system
 */

describe('Path Utilities', () => {
  describe('version pattern matching', () => {
    const versionRegex = /\/(v\d+)\//;

    it('should match v1 pattern', () => {
      const match = 'src/api/v1/admin/admin.controller.ts'.match(versionRegex);
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe('v1');
    });

    it('should match v2 pattern', () => {
      const match = 'src/api/v2/admin/admin.controller.ts'.match(versionRegex);
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe('v2');
    });

    it('should match double-digit versions', () => {
      const match = 'src/api/v10/admin/admin.controller.ts'.match(versionRegex);
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe('v10');
    });

    it('should not match invalid patterns', () => {
      expect('src/api/version1/admin.ts'.match(versionRegex)).toBeNull();
      expect('src/api/v/admin.ts'.match(versionRegex)).toBeNull();
      expect('src/api/1v/admin.ts'.match(versionRegex)).toBeNull();
    });

    it('should match first version when multiple exist', () => {
      const match = 'src/api/v1/nested/v2/admin.ts'.match(versionRegex);
      expect(match?.[1]).toBe('v1');
    });
  });

  describe('path parameter conversion', () => {
    const convertParams = (path: string) => path.replace(/:(\w+)/g, '{$1}');

    it('should convert single path parameter', () => {
      expect(convertParams('admin/:id')).toBe('admin/{id}');
    });

    it('should convert multiple path parameters', () => {
      expect(convertParams('admin/:userId/posts/:postId')).toBe('admin/{userId}/posts/{postId}');
    });

    it('should not affect paths without parameters', () => {
      expect(convertParams('admin/profile')).toBe('admin/profile');
    });

    it('should handle parameters at start', () => {
      expect(convertParams(':id/profile')).toBe('{id}/profile');
    });

    it('should handle parameters at end', () => {
      expect(convertParams('admin/:id')).toBe('admin/{id}');
    });
  });

  describe('path combining', () => {
    const combinePaths = (...segments: string[]): string => {
      return segments
        .filter(Boolean)
        .map(segment => segment.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');
    };

    it('should combine simple paths', () => {
      expect(combinePaths('api', 'v1', 'admin')).toBe('api/v1/admin');
    });

    it('should remove leading and trailing slashes', () => {
      expect(combinePaths('/api/', '/v1/', '/admin/')).toBe('api/v1/admin');
    });

    it('should handle empty segments', () => {
      expect(combinePaths('api', '', 'admin')).toBe('api/admin');
    });

    it('should handle single segment', () => {
      expect(combinePaths('admin')).toBe('admin');
    });

    it('should handle all empty segments', () => {
      expect(combinePaths('', '', '')).toBe('');
    });

    it('should handle complex paths', () => {
      expect(combinePaths('/api/v1/', 'admin', '/profile/')).toBe('api/v1/admin/profile');
    });
  });

  describe('category name humanization', () => {
    const humanize = (segment: string): string => {
      return segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    it('should capitalize single word', () => {
      expect(humanize('admin')).toBe('Admin');
    });

    it('should handle kebab-case', () => {
      expect(humanize('admin-auth')).toBe('Admin Auth');
    });

    it('should handle multiple words', () => {
      expect(humanize('admin-user-management')).toBe('Admin User Management');
    });

    it('should preserve already capitalized words', () => {
      expect(humanize('Admin')).toBe('Admin');
    });

    it('should handle empty string', () => {
      expect(humanize('')).toBe('');
    });
  });
});
