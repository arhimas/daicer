
import { createStrapi } from '@strapi/strapi';

async function main() {
  try {
    console.log('----------------------------------------');
    console.log('Verifying Locale Generation (Manual Trigger)');
    console.log('----------------------------------------');

    // 1. Initialize Strapi
    const app = await createStrapi({
      appDir: process.cwd(),
      distDir: 'dist', 
    }).load();

    console.log('Available Controllers:', Object.keys(app.controllers).filter(k => k.includes('api::game')));

    // 2. Mock Context
    // Strapi 5 filename-based controller loading: api::api-name.filename
    const controller = app.controllers['api::game.locales'];
    
    if (!controller) {
        console.error('❌ Controller api::game.locale-generator NOT found.');
        process.exit(1);
    }
    console.log('✅ Controller found.');

    // 3. Find a target entity (e.g. Spell)
    // We assume there is at least one spell in the DB
    const spell = await app.documents('api::spell.spell').findFirst();

    if (!spell) {
        console.warn('⚠️ No spell found to test. Skipping real generation.');
        process.exit(0);
    }
    console.log(`Testing with Spell: ${spell.name} (${spell.documentId})`);

    // 4. Invoke Controller Action
    const ctx = {
        request: {
            body: {
                contentType: 'api::spell.spell',
                documentIds: [spell.documentId],
                locales: ['pt', 'es']
            }
        },
        badRequest: (msg) => { throw new Error(`BadRequest: ${msg}`); },
        send: (data) => data
    };

    // Call the function
    const result: any = await controller.generateLocales(ctx as any, undefined);
    console.log('Controller Result:', JSON.stringify(result, null, 2));

    if (result.report.failed > 0) {
        // We can't see the controller's console.error unless we intercept it or it was logged to stdout above.
        // But the controller caught it and returned a report.
        // We should improve the controller to return error details in the report for debugging.
    }

    // 5. Verify Results
    // Check if locales were created
    // 5. Verify Enqueue
    if (result.report.enqueued > 0) {
        console.log('✅ Job associated with queue successfully.');
        
        // Wait for worker (if Redis is active locally)
        console.log('⏳ Waiting 5s for Queue Worker execution...');
        await new Promise(r => setTimeout(r, 5000));

        // Check DB
        const ptVersion = await app.documents('api::spell.spell').findOne({
            documentId: spell.documentId,
            locale: 'pt'
        });
        
        if (ptVersion) {
            console.log(`✅ PT Version exists: ${ptVersion.name}`);
            if (ptVersion.name.includes('[PT]') || ptVersion.name !== spell.name) {
                 console.log('✅ Translation applied.');
            } else {
                 console.warn('⚠️ Translation might be identical.');
            }
        } else {
            console.error('❌ PT Version NOT found (Worker did not run or failed).');
            console.warn('NOTE: If you do not have Redis running locally, the worker will not pick up the job.');
        }

    } else {
        console.error('❌ Failed to enqueue job.');
    }

  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
