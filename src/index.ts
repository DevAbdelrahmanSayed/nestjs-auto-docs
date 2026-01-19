// Main module
export { AutoDocsModule } from './module/auto-docs.module';
export { AutoDocsService } from './module/auto-docs.service';

// Interfaces
export { AutoDocsOptions, ThemeConfig, SecuritySchemeConfig } from './interfaces/options.interface';
export {
  ControllerMetadata,
  RouteMetadata,
  ParamMetadata,
  DtoMetadata,
  PropertyMetadata,
  TypeMetadata,
  ValidatorMetadata,
  CategoryMetadata,
  GuardMetadata,
} from './interfaces/metadata.interface';
export { OpenApiSpec } from './interfaces/openapi.interface';

// Scanners (for advanced usage)
export { ControllerScanner } from './scanner/controller-scanner';
export { RouteScanner } from './scanner/route-scanner';
export { DtoAnalyzer } from './scanner/dto-analyzer';
export { ValidatorExtractor } from './scanner/validator-extractor';

// Generators (for advanced usage)
export { OpenApiGenerator } from './generators/openapi-generator';
export { CategoryGenerator } from './generators/category-generator';
export { ExampleGenerator } from './generators/example-generator';
