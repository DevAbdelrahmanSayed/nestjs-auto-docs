/**
 * Manual test script to verify ControllerScanner works
 *
 * Usage:
 * 1. Install dependencies: npm install
 * 2. Build: npm run build
 * 3. Run: npx ts-node tests/manual-test.ts
 */

import { ControllerScanner } from '../src/scanner/controller-scanner';
import * as path from 'path';

async function main() {
  console.log('🔍 Starting Controller Scanner Test\n');

  // Path to CRM backend source
  const crmBackendPath = path.join(__dirname, '../../crm-backend/src');

  console.log(`📂 Scanning: ${crmBackendPath}\n`);

  const scanner = new ControllerScanner(crmBackendPath);

  try {
    const controllers = await scanner.scanControllers();

    console.log(`✅ Found ${controllers.length} controllers\n`);

    // Group by category
    const byCategory = controllers.reduce((acc, ctrl) => {
      if (!acc[ctrl.category]) {
        acc[ctrl.category] = [];
      }
      acc[ctrl.category].push(ctrl);
      return acc;
    }, {} as Record<string, typeof controllers>);

    // Display summary
    console.log('📊 Controllers by Category:\n');
    for (const [category, ctrls] of Object.entries(byCategory)) {
      console.log(`  ${category}: ${ctrls.length} controller(s)`);
      ctrls.forEach(ctrl => {
        console.log(`    - ${ctrl.name} (${ctrl.path})`);
      });
      console.log('');
    }

    // Show first controller details
    if (controllers.length > 0) {
      console.log('📝 Sample Controller Details:\n');
      const sample = controllers[0];
      console.log(JSON.stringify(sample, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
