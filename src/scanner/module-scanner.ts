import { SourceFile, ClassDeclaration, Decorator } from 'ts-morph';

export interface ModuleInfo {
  name: string;
  filePath: string;
  controllers: string[]; // Controller class names
  imports: string[];
}

export class ModuleScanner {
  /**
   * Find the module that contains a specific controller
   */
  findModuleForController(
    controllerName: string,
    sourceFiles: SourceFile[]
  ): string | null {
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

  /**
   * Extract all modules from a source file
   */
  private extractModulesFromFile(sourceFile: SourceFile): ModuleInfo[] {
    const modules: ModuleInfo[] = [];
    const classes = sourceFile.getClasses();

    for (const classDeclaration of classes) {
      const moduleDecorator = this.findModuleDecorator(classDeclaration);

      if (moduleDecorator) {
        const moduleInfo = this.extractModuleInfo(classDeclaration, moduleDecorator, sourceFile);
        if (moduleInfo) {
          modules.push(moduleInfo);
        }
      }
    }

    return modules;
  }

  /**
   * Find @Module decorator on a class
   */
  private findModuleDecorator(classDeclaration: ClassDeclaration): Decorator | undefined {
    const decorators = classDeclaration.getDecorators();
    return decorators.find(dec => dec.getName() === 'Module');
  }

  /**
   * Extract module information from decorator
   */
  private extractModuleInfo(
    classDeclaration: ClassDeclaration,
    moduleDecorator: Decorator,
    sourceFile: SourceFile
  ): ModuleInfo | null {
    try {
      const moduleName = classDeclaration.getName() || 'UnknownModule';
      const controllers = this.extractControllers(moduleDecorator);
      const imports = this.extractImports(moduleDecorator);

      return {
        name: moduleName,
        filePath: sourceFile.getFilePath(),
        controllers,
        imports,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract controller names from @Module decorator
   */
  private extractControllers(decorator: Decorator): string[] {
    const args = decorator.getArguments();
    if (args.length === 0) return [];

    const configObject = args[0];
    const text = configObject.getText();

    // Parse controllers array from the decorator
    const controllersMatch = text.match(/controllers:\s*\[(.*?)\]/s);
    if (!controllersMatch) return [];

    const controllersText = controllersMatch[1];

    // Extract controller names (remove whitespace, comments, etc.)
    const controllers = controllersText
      .split(',')
      .map(c => c.trim())
      .filter(c => c && !c.startsWith('//'))
      .map(c => c.replace(/\/\*.*?\*\//g, '').trim());

    return controllers;
  }

  /**
   * Extract imported module names from @Module decorator
   */
  private extractImports(decorator: Decorator): string[] {
    const args = decorator.getArguments();
    if (args.length === 0) return [];

    const configObject = args[0];
    const text = configObject.getText();

    // Parse imports array from the decorator
    const importsMatch = text.match(/imports:\s*\[(.*?)\]/s);
    if (!importsMatch) return [];

    const importsText = importsMatch[1];

    // Extract module names
    const imports = importsText
      .split(',')
      .map(i => i.trim())
      .filter(i => i && !i.startsWith('//'))
      .map(i => i.replace(/\/\*.*?\*\//g, '').trim())
      .map(i => {
        // Handle forRoot/forRootAsync calls
        const forRootMatch = i.match(/(\w+)\.forRoot/);
        if (forRootMatch) return forRootMatch[1];
        return i;
      });

    return imports;
  }

  /**
   * Format module name to category name
   * Examples:
   * - AdminModule -> Admin
   * - AdminAuthModule -> Admin Auth
   * - MessagingModule -> Messaging
   * - UserProfileModule -> User Profile
   */
  private formatModuleName(moduleName: string): string {
    // Remove "Module" suffix
    let name = moduleName.replace(/Module$/, '');

    // Split by capital letters
    const parts = name.split(/(?=[A-Z])/).filter(Boolean);

    // Join with space
    return parts.join(' ');
  }

  /**
   * Build module hierarchy tree
   */
  buildModuleTree(sourceFiles: SourceFile[]): Map<string, ModuleInfo> {
    const moduleMap = new Map<string, ModuleInfo>();

    for (const sourceFile of sourceFiles) {
      const modules = this.extractModulesFromFile(sourceFile);

      for (const module of modules) {
        moduleMap.set(module.name, module);
      }
    }

    return moduleMap;
  }
}
