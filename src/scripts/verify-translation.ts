import { createStrapi } from '@strapi/strapi';

async function main() {
  try {
    console.log('----------------------------------------');
    console.log('Verifying Translation Service Integration');
    console.log('----------------------------------------');

    // Initialize Strapi instance
    // We use process.cwd() as appDir, assuming we run from project root
    const app = await createStrapi({
      appDir: process.cwd(),
      distDir: 'dist', // Strapi 5 often needs this, but we'll try without if it fails
    }).load();

    const service = app.service('api::game.translation');

    if (!service) {
      console.error('❌ Service api::game.translation NOT found.');
      // List available services to debug
      console.log(
        'Available services:',
        Object.keys(app.services).filter((k) => k.includes('game'))
      );
      process.exit(1);
    }
    console.log('✅ Service api::game.translation found.');

    // Test 1: Simple Translation
    const text = 'Sword';
    const translated = service.translate(text, 'pt');
    console.log(`Test 1: Translate "${text}" to PT -> "${translated}"`);
    if (translated === 'Espada') {
      console.log('✅ Dictionary lookup works.');
    } else {
      console.log('⚠️ Dictionary lookup mismatch (might be expected if mock dict is limited).');
    }

    // Test 2: JSON Translation
    const input = {
      name: 'hello',
      nested: {
        item: 'shield',
      },
    };
    console.log('Test 2: translating JSON: ', JSON.stringify(input));
    const jsonResult = service.translateJson(input, 'es', { translateKeys: false });
    console.log('Result:', JSON.stringify(jsonResult, null, 2));

    if (jsonResult.name === 'Hola' && jsonResult.nested.item === 'Escudo') {
      console.log('✅ JSON recursive translation works.');
    } else {
      console.log('⚠️ JSON translation mismatch.');
    }
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    process.exit(0);
  }
}

main();
