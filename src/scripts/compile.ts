/**
 * Daicer Compilation CLI
 * Usage:
 *   yarn ts-node src/scripts/compile.ts --phase=Atom
 *   yarn ts-node src/scripts/compile.ts --target=api::spell.spell --id=fireball
 */
import type { Core } from '@strapi/strapi';
import { CompilationOrchestrator } from '../api/game/src/engine/compilation/CompilationOrchestrator';

// Bootstrap interface
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare let strapi: Core.Strapi;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createStrapi } = require('@strapi/strapi');

async function main() {
  const args = process.argv.slice(2);
  const phaseArg = args.find((a) => a.startsWith('--phase='))?.split('=')[1];
  const targetUid = args.find((a) => a.startsWith('--target='))?.split('=')[1];
  const targetId = args.find((a) => a.startsWith('--id='))?.split('=')[1];

  console.log('🚀 Starting Daicer Compilation CLI...');

  // Bootstrap Strapi
  const _app = await createStrapi({ distDir: './dist' }).load();

  try {
    const orchestrator = new CompilationOrchestrator();

    if (phaseArg) {
      console.log(`📦 Running Compilation Phase: ${phaseArg}`);
      // @ts-expect-error: Phase enum is string compatible
      await orchestrator.runPhase(phaseArg);
    } else if (targetUid && targetId) {
      console.log(`🎯 Compiling Target: ${targetUid} : ${targetId}`);
      await orchestrator.compileEntity(targetUid, targetId);
    } else {
      console.log('⚠️  No action specified.');
      console.log('   Use --phase=[Atom|Molecule|Compound|Blueprint]');
      console.log('   Or  --target=[uid] --id=[id]');
    }
  } catch (err) {
    console.error('❌ Fatal Error:', err);
  } finally {
    // app.destroy(); // Keep alive if async ops pending? No, should destroy.
    process.exit(0);
  }
}

main();
