import { Injectable, Inject } from '@nestjs/common';
import { AutoDocsOptions } from '../../interfaces/options.interface';
import { AUTO_DOCS_CONFIG } from '../../shared/constants/tokens';

@Injectable()
export class ConfigService {
  private readonly config: Required<Pick<AutoDocsOptions, 'sourcePath' | 'docsPath' | 'specPath' | 'scanOnStart' | 'watchMode' | 'includeSecurity'>> & AutoDocsOptions;

  constructor(@Inject(AUTO_DOCS_CONFIG) options: AutoDocsOptions) {
    this.validateRequiredFields(options);
    this.config = this.mergeWithDefaults(options);
  }

  get<K extends keyof AutoDocsOptions>(key: K): AutoDocsOptions[K] {
    return this.config[key];
  }

  getAll(): AutoDocsOptions {
    return { ...this.config };
  }

  private validateRequiredFields(options: AutoDocsOptions): void {
    if (!options.title || options.title.trim() === '') {
      throw new Error('AutoDocs configuration error: "title" is required and cannot be empty');
    }

    if (!options.version || options.version.trim() === '') {
      throw new Error('AutoDocs configuration error: "version" is required and cannot be empty');
    }
  }

  private mergeWithDefaults(options: AutoDocsOptions): Required<Pick<AutoDocsOptions, 'sourcePath' | 'docsPath' | 'specPath' | 'scanOnStart' | 'watchMode' | 'includeSecurity'>> & AutoDocsOptions {
    return {
      sourcePath: options.sourcePath || 'src',
      docsPath: options.docsPath || '/docs',
      specPath: options.specPath || '/docs-json',
      scanOnStart: options.scanOnStart ?? true,
      watchMode: options.watchMode ?? false,
      includeSecurity: options.includeSecurity ?? true,
      ...options,
    };
  }
}
