export {};
const dotenv = require('dotenv');
const path = require('path');

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runGranularVerification() {
  console.log('🎲 Verifying Granular RAG & Manual Search...');

  // 2. Initialize Strapi
  const { createStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi({ distDir: 'dist' }).load();

  try {
    // 3. Import Service AFTER Strapi is loaded
    const { unifiedSearchService } = require('../services/unified-search-service');

    // Test 1: Manual Search (Legacy 'origin' check)
    // This previously failed with 'column ks.knowledge_source_link does not exist'
    console.log('\n--- Test 1: Manual Knowledge Search ---');
    // We search for "test" or something likely to be in manual or at least not crash
    const manualResults = await unifiedSearchService.search('test', {
      targets: ['manual'],
      limit: 1,
    });
    console.log('✅ Manual Search executed without crash.');
    console.log(`   Found: ${manualResults.length} manual entries.`);

    // Test 2: Granular Targets
    console.log('\n--- Test 2: Granular Targets (Spell) ---');
    // Using a known spell query "heal" or "fire"
    const spellResults = await unifiedSearchService.search('heal', {
      targets: ['spell'],
      limit: 3,
    });

    if (spellResults.length > 0) {
      const nonSpells = spellResults.filter((r: any) => !r.tags.includes('spell'));
      if (nonSpells.length > 0) {
        console.error('❌ FAILED: Granular search returned non-spells:', nonSpells);
        process.exit(1);
      }
      console.log('✅ Granular Search returned ONLY spells.');
      console.log(`   Top Result: ${spellResults[0].title} (${spellResults[0].score.toFixed(2)})`);
    } else {
      console.warn('⚠️ No spells found for "heal" (DB might be empty?), but query succeeded.');
    }

    // Test 3: Mixed Targets (Spell + Monster)
    console.log('\n--- Test 3: Mixed Targets (Spell + Monster) ---');
    const mixedResults = await unifiedSearchService.search('fire', {
      targets: ['spell', 'monster'],
      limit: 5,
    });
    console.log(`✅ Mixed Search executed. Found ${mixedResults.length} items.`);
  } catch (err: any) {
    console.error('❌ FATAL ERROR:', err);
    process.exit(1);
  } finally {
    // 4. Shutdown
    await strapi.destroy();
  }

  console.log('\n✨ Verification Complete!');
  process.exit(0);
}

runGranularVerification();
