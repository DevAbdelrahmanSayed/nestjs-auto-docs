import { ControllerScanner } from '../scanner/controller-scanner';
import { OpenApiGenerator } from '../generators/openapi-generator';
import { AutoDocsOptions } from '../interfaces/options.interface';
import { ControllerMetadata, RouteMetadata } from '../interfaces';

/**
 * Integration tests for versioning feature
 * Tests the complete flow from scanning to OpenAPI generation
 */
describe('Versioning Integration', () => {
  describe('End-to-end versioning flow', () => {
    let scanner: ControllerScanner;
    let generator: OpenApiGenerator;

    beforeEach(() => {
      scanner = new ControllerScanner('src');
      generator = new OpenApiGenerator();
    });

    it('should detect version and generate correct paths', () => {
      // Simulate scanned controller with version
      const controllers: ControllerMetadata[] = [
        {
          name: 'AdminController',
          path: 'admin',
          filePath: 'src/api/v1/admin/admin.controller.ts',
          category: 'Admin',
          version: scanner.detectVersionFromPath('src/api/v1/admin/admin.controller.ts'),
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/admin/profile',
              isPublic: false,
            } as RouteMetadata,
          ],
        },
      ];

      const options: AutoDocsOptions = {
        title: 'Test API',
        version: '1.0',
        versioning: {
          enabled: true,
          prefix: '/api',
        },
      };

      const spec = generator.generate(controllers, options);

      // Verify version was detected
      expect(controllers[0].version).toBe('v1');

      // Verify path includes version
      expect(spec.paths).toHaveProperty('api/v1/admin/profile');

      // Verify server URLs
      expect(spec.servers).toContainEqual({
        url: '/api/v1',
        description: 'API V1',
      });
    });

    it('should handle mixed versioned and non-versioned controllers', () => {
      const controllers: ControllerMetadata[] = [
        // Versioned controller
        {
          name: 'AdminControllerV1',
          path: 'admin',
          filePath: 'src/api/v1/admin/admin.controller.ts',
          category: 'Admin',
          version: scanner.detectVersionFromPath('src/api/v1/admin/admin.controller.ts'),
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/admin/profile',
              isPublic: false,
            } as RouteMetadata,
          ],
        },
        // Non-versioned controller
        {
          name: 'HealthController',
          path: 'health',
          filePath: 'src/health/health.controller.ts',
          category: 'Health',
          version: scanner.detectVersionFromPath('src/health/health.controller.ts'),
          routes: [
            {
              name: 'check',
              httpMethod: 'GET',
              path: '',
              fullPath: '/health',
              isPublic: true,
            } as RouteMetadata,
          ],
        },
      ];

      const options: AutoDocsOptions = {
        title: 'Test API',
        version: '1.0',
        versioning: {
          enabled: true,
          prefix: '/api',
          fallback: '/api/v1',
        },
      };

      const spec = generator.generate(controllers, options);

      // Versioned endpoint
      expect(spec.paths).toHaveProperty('api/v1/admin/profile');

      // Non-versioned endpoint uses fallback
      expect(spec.paths).toHaveProperty('api/v1/health');
    });

    it('should generate separate paths for multiple versions', () => {
      const controllers: ControllerMetadata[] = [
        {
          name: 'AdminControllerV1',
          path: 'admin',
          filePath: 'src/api/v1/admin/admin.controller.ts',
          category: 'Admin',
          version: 'v1',
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/admin/profile',
              isPublic: false,
            } as RouteMetadata,
          ],
        },
        {
          name: 'AdminControllerV2',
          path: 'admin',
          filePath: 'src/api/v2/admin/admin.controller.ts',
          category: 'Admin',
          version: 'v2',
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/admin/profile',
              description: 'Get user profile with enhanced data',
            } as RouteMetadata,
          ],
        },
        {
          name: 'UserControllerV2',
          path: 'user',
          filePath: 'src/api/v2/user/user.controller.ts',
          category: 'User',
          version: 'v2',
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/user/profile',
              isPublic: false,
            } as RouteMetadata,
          ],
        },
      ];

      const options: AutoDocsOptions = {
        title: 'Multi-Version API',
        version: '2.0',
        versioning: {
          enabled: true,
          prefix: '/api',
        },
      };

      const spec = generator.generate(controllers, options);

      // Should have separate paths for each version
      expect(spec.paths).toHaveProperty('api/v1/admin/profile');
      expect(spec.paths).toHaveProperty('api/v2/admin/profile');
      expect(spec.paths).toHaveProperty('api/v2/user/profile');

      // Should have 2 servers (1 for v1, 1 for v2)
      expect(spec.servers).toHaveLength(2);

      // Verify v1 servers
      expect(spec.servers).toContainEqual({
        url: '/api/v1',
        description: 'API V1',
      });

      // Verify v2 servers
      expect(spec.servers).toContainEqual({
        url: '/api/v2',
        description: 'API V2',
      });
    });
  });

  describe('Backwards compatibility', () => {
    let generator: OpenApiGenerator;

    beforeEach(() => {
      generator = new OpenApiGenerator();
    });

    it('should work without versioning config', () => {
      const controllers: ControllerMetadata[] = [
        {
          name: 'AdminController',
          path: 'admin',
          filePath: 'src/api/v1/admin/admin.controller.ts',
          category: 'Admin',
          version: 'v1', // Version detected but not used
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/admin/profile',
              isPublic: false,
            } as RouteMetadata,
          ],
        },
      ];

      const options: AutoDocsOptions = {
        title: 'Test API',
        version: '1.0',
        globalPrefix: '/api/v1', // Old style
      };

      const spec = generator.generate(controllers, options);

      // Should use globalPrefix, not detected version
      expect(spec.paths).toHaveProperty('api/v1/admin/profile');
      expect(spec.servers[0].url).toBe('/api/v1');
    });

    it('should ignore version when versioning disabled', () => {
      const controllers: ControllerMetadata[] = [
        {
          name: 'AdminControllerV1',
          path: 'admin',
          filePath: 'src/api/v1/admin/admin.controller.ts',
          category: 'Admin',
          version: 'v1',
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/admin/profile',
              isPublic: false,
            } as RouteMetadata,
          ],
        },
        {
          name: 'AdminControllerV2',
          path: 'admin',
          filePath: 'src/api/v2/admin/admin.controller.ts',
          category: 'Admin',
          version: 'v2',
          routes: [
            {
              name: 'getProfile',
              httpMethod: 'GET',
              path: 'profile',
              fullPath: '/admin/profile',
              isPublic: false,
            } as RouteMetadata,
          ],
        },
      ];

      const options: AutoDocsOptions = {
        title: 'Test API',
        version: '1.0',
        globalPrefix: '/api/v1',
        // versioning not configured = disabled
      };

      const spec = generator.generate(controllers, options);

      // Both should use same global prefix (will conflict in real scenario)
      // This demonstrates backwards compatibility
      expect(spec.paths).toHaveProperty('api/v1/admin/profile');

      // Should have standard 1 server (no versioning, just globalPrefix)
      expect(spec.servers).toHaveLength(1);
      expect(spec.servers[0].url).toBe('/api/v1');
    });
  });
});
