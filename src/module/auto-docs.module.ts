import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { AutoDocsService } from './auto-docs.service';
import { ScalarController } from '../ui/scalar-controller';
import { AutoDocsOptions } from '../interfaces/options.interface';

@Module({})
export class AutoDocsModule implements OnModuleInit {
  constructor(private readonly autoDocsService: AutoDocsService) {}

  async onModuleInit() {
    if (this.autoDocsService) {
      await this.autoDocsService.initialize();
    }
  }

  /**
   * Register AutoDocs module with configuration
   */
  static forRoot(options: AutoDocsOptions): DynamicModule {
    // Apply defaults
    const mergedOptions: AutoDocsOptions = {
      sourcePath: 'src',
      docsPath: '/docs',
      specPath: '/docs-json',
      scanOnStart: true,
      watchMode: false,
      includeSecurity: true,
      ...options,
    };

    return {
      module: AutoDocsModule,
      controllers: [ScalarController],
      providers: [
        {
          provide: 'AUTO_DOCS_OPTIONS',
          useValue: mergedOptions,
        },
        {
          provide: AutoDocsService,
          useFactory: () => {
            return new AutoDocsService(mergedOptions);
          },
        },
      ],
      exports: [AutoDocsService],
    };
  }

  /**
   * Register AutoDocs module asynchronously
   */
  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<AutoDocsOptions> | AutoDocsOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: AutoDocsModule,
      controllers: [ScalarController],
      providers: [
        {
          provide: 'AUTO_DOCS_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: AutoDocsService,
          useFactory: (opts: AutoDocsOptions) => {
            return new AutoDocsService(opts);
          },
          inject: ['AUTO_DOCS_OPTIONS'],
        },
      ],
      exports: [AutoDocsService],
    };
  }
}
