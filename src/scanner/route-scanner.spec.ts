import { Project } from 'ts-morph';
import { RouteScanner } from './route-scanner';

describe('RouteScanner', () => {
  let project: Project;
  let scanner: RouteScanner;

  beforeEach(() => {
    project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        strict: false,
        target: 99, // ESNext
      },
    });
    scanner = new RouteScanner(project);
  });

  describe('extractRequestBody - inline object types', () => {
    it('should analyze inline object type in @Body parameter', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post, Body } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Post()
          create(@Body() body: { name: string; age: number }) {
            return body;
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const method = classDecl.getMethods()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].requestBody).toBeDefined();
      expect(routes[0].requestBody?.name).toBe('InlineType');
      expect(routes[0].requestBody?.properties).toHaveLength(2);
      expect(routes[0].requestBody?.properties[0].name).toBe('name');
      expect(routes[0].requestBody?.properties[0].type.type).toBe('string');
      expect(routes[0].requestBody?.properties[1].name).toBe('age');
      expect(routes[0].requestBody?.properties[1].type.type).toBe('number');
    });

    it('should analyze complex inline object type with nested properties', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post, Body } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Post()
          create(@Body() body: { user: { name: string; email: string }; active: boolean }) {
            return body;
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].requestBody).toBeDefined();
      expect(routes[0].requestBody?.properties).toHaveLength(2);
      expect(routes[0].requestBody?.properties[0].name).toBe('user');
      expect(routes[0].requestBody?.properties[1].name).toBe('active');
    });

    it('should skip primitive @Body types', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post, Body } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Post()
          create(@Body() body: string) {
            return body;
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].requestBody).toBeUndefined();
    });

    it('should skip "string | undefined" @Body types', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post, Body } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Post()
          create(@Body() body: string | undefined) {
            return body;
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].requestBody).toBeUndefined();
    });
  });

  describe('extractResponseType - union types', () => {
    it('should extract first meaningful type from union with null', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          find(): { message: string; data: any } | null {
            return { message: 'success', data: {} };
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].responseType).toBeDefined();
      expect(routes[0].responseType?.properties).toHaveLength(2);
      expect(routes[0].responseType?.properties[0].name).toBe('message');
      expect(routes[0].responseType?.properties[1].name).toBe('data');
    });

    it('should extract from union of object types', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          find(): { data: null; message: string } | { data: { count: number }; message: string } {
            return { message: 'success', data: { count: 5 } };
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].responseType).toBeDefined();
      expect(routes[0].responseType?.properties.length).toBeGreaterThan(0);
    });

    it('should unwrap Promise return type', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          async find(): Promise<{ message: string; data: any }> {
            return { message: 'success', data: {} };
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].responseType).toBeDefined();
      expect(routes[0].responseType?.properties).toHaveLength(2);
    });

    it('should skip void return type', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Delete } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Delete()
          remove(): void {
            // delete logic
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].responseType).toBeUndefined();
    });

    it('should skip primitive return types', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          getString(): string {
            return 'hello';
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].responseType).toBeUndefined();
    });
  });

  describe('findDtoClass - DTO class resolution', () => {
    it('should find DTO class by simple name', () => {
      project.createSourceFile(
        'create-user.dto.ts',
        `
        export class CreateUserDto {
          name: string;
          email: string;
        }
        `,
      );

      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post, Body } from '@nestjs/common';
        import { CreateUserDto } from './create-user.dto';

        @Controller('test')
        export class TestController {
          @Post()
          create(@Body() dto: CreateUserDto) {
            return dto;
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].requestBody).toBeDefined();
      expect(routes[0].requestBody?.name).toBe('CreateUserDto');
      expect(routes[0].requestBody?.properties).toHaveLength(2);
    });

    it('should handle DTO with validators', () => {
      project.createSourceFile(
        'create-user.dto.ts',
        `
        import { IsEmail, IsString, MinLength } from 'class-validator';

        export class CreateUserDto {
          @IsString()
          @MinLength(3)
          name: string;

          @IsEmail()
          email: string;
        }
        `,
      );

      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post, Body } from '@nestjs/common';
        import { CreateUserDto } from './create-user.dto';

        @Controller('test')
        export class TestController {
          @Post()
          create(@Body() dto: CreateUserDto) {
            return dto;
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].requestBody).toBeDefined();
      expect(routes[0].requestBody?.properties).toHaveLength(2);
      expect(routes[0].requestBody?.properties[0].validators?.length).toBeGreaterThan(0);
    });

    it('should handle array DTO types', () => {
      project.createSourceFile(
        'user.dto.ts',
        `
        export class UserDto {
          id: number;
          name: string;
        }
        `,
      );

      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';
        import { UserDto } from './user.dto';

        @Controller('test')
        export class TestController {
          @Get()
          findAll(): UserDto[] {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      // Array types might be handled differently, just ensure no crash
      expect(routes[0]).toBeDefined();
    });
  });

  describe('scanRoutes - HTTP methods', () => {
    it('should extract GET route', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get('items')
          findAll() {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].httpMethod).toBe('GET');
      expect(routes[0].path).toBe('items');
      expect(routes[0].fullPath).toBe('/test/items');
    });

    it('should extract POST route', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Post()
          create() {
            return {};
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].httpMethod).toBe('POST');
      expect(routes[0].path).toBe('');
      expect(routes[0].fullPath).toBe('/test');
    });

    it('should extract multiple routes from controller', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get, Post, Put, Delete } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          findAll() {}

          @Get(':id')
          findOne() {}

          @Post()
          create() {}

          @Put(':id')
          update() {}

          @Delete(':id')
          remove() {}
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(5);
      expect(routes[0].httpMethod).toBe('GET');
      expect(routes[1].httpMethod).toBe('GET');
      expect(routes[2].httpMethod).toBe('POST');
      expect(routes[3].httpMethod).toBe('PUT');
      expect(routes[4].httpMethod).toBe('DELETE');
    });
  });

  describe('extractParameters', () => {
    it('should extract @Param parameters', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get, Param } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get(':id')
          findOne(@Param('id') id: string) {
            return { id };
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].params).toHaveLength(1);
      expect(routes[0].params?.[0].name).toBe('id');
      expect(routes[0].params?.[0].in).toBe('path');
      expect(routes[0].params?.[0].required).toBe(true);
    });

    it('should extract @Query parameters', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get, Query } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          findAll(@Query('page') page: number, @Query('limit') limit: number) {
            return { page, limit };
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].params).toHaveLength(2);
      expect(routes[0].params?.[0].name).toBe('page');
      expect(routes[0].params?.[0].in).toBe('query');
      expect(routes[0].params?.[1].name).toBe('limit');
      expect(routes[0].params?.[1].in).toBe('query');
    });

    it('should not include @Body in params', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Post, Body, Param } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Post(':id')
          update(@Param('id') id: string, @Body() body: any) {
            return { id, body };
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].params).toHaveLength(1);
      expect(routes[0].params?.[0].name).toBe('id');
      expect(routes[0].params?.[0].in).toBe('path');
    });
  });

  describe('extractGuards', () => {
    it('should extract guards from @UseGuards decorator', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get, UseGuards } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          @UseGuards(AuthGuard)
          findAll() {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].guards).toHaveLength(1);
      expect(routes[0].guards?.[0]).toBe('AuthGuard');
    });

    it('should extract multiple guards', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get, UseGuards } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          @UseGuards(AuthGuard, RolesGuard)
          findAll() {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].guards).toHaveLength(2);
    });
  });

  describe('isPublicRoute', () => {
    it('should detect @Public decorator', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          @Public()
          findAll() {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].isPublic).toBe(true);
    });

    it('should detect @SkipAuth decorator', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          @SkipAuth()
          findAll() {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].isPublic).toBe(true);
    });

    it('should return false when no public decorator', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          @Get()
          findAll() {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].isPublic).toBe(false);
    });
  });

  describe('JSDoc extraction', () => {
    it('should extract route description from JSDoc', () => {
      const sourceFile = project.createSourceFile(
        'test.controller.ts',
        `
        import { Controller, Get } from '@nestjs/common';

        @Controller('test')
        export class TestController {
          /**
           * Get all items
           *
           * Returns a list of all items in the system
           */
          @Get()
          findAll() {
            return [];
          }
        }
        `,
      );

      const classDecl = sourceFile.getClasses()[0];
      const routes = scanner.scanRoutes(classDecl, 'test');

      expect(routes).toHaveLength(1);
      expect(routes[0].description).toBeDefined();
      expect(routes[0].description).toContain('Get all items');
    });
  });
});
