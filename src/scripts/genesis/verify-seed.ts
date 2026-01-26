export {};
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  console.log('🔍 \x1b[1mVerifying Seeding Results...\x1b[0m');

  const backendRoot = path.resolve(__dirname, '../../..');
  process.chdir(backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({ appDir: backendRoot, distDir: 'dist' }).load();

  try {
    const checks = [
        { uid: 'api::language.language', name: 'Languages' },
        { uid: 'api::prompt.prompt', name: 'Prompts' },
        { uid: 'api::queue-configuration.queue-configuration', name: 'Queue Configs' },
        { uid: 'api::rule-set.rule-set', name: 'Rule Set', type: 'single' },
        { uid: 'api::damage-type.damage-type', name: 'Damage Types' },
        { uid: 'api::entity.entity', name: 'Monsters (Entities)' }
    ];

    let failures = 0;

    for (const check of checks) {
        let count = 0;
        if (check.type === 'single') {
            const item = await strapi.documents(check.uid as any).findFirst();
            count = item ? 1 : 0;
        } else {
           const items = await strapi.documents(check.uid as any).findMany({ limit: 5 });
           count = items.length;
        }

        if (count > 0) {
            console.log(`✅ ${check.name}: Found entries.`);
        } else {
            console.error(`❌ ${check.name}: NO ENTRIES FOUND!`);
            failures++;
        }
    }

    if (failures > 0) {
        console.error(`\n🚨 Verification FAILED with ${failures} errors.`);
        process.exit(1);
    } else {
        console.log('\n✨ All Seeding Verification Passed!');
        process.exit(0);
    }

  } catch (error) {
    console.error('Verification Error:', error);
    process.exit(1);
  } finally {
    try { await strapi.destroy(); } catch { /* ignore */ }
  }
}

main();
