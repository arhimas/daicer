import { getStrapi } from '@/cli/utils/bootstrap';
import { EMBEDDABLE_MODELS } from '@/config/embedding';

async function wipeEmbeddings() {
  console.log('🧹 Starting Knowledge Base Wipe (Embeddings only)...');

  const strapi = await getStrapi();

  try {
    for (const uid of EMBEDDABLE_MODELS) {
      console.log(`Processing ${uid}...`);
      try {
        // Use db.query to bypass hooks and be raw fast
        const result = await strapi.db.query(uid).updateMany({
          where: {
            embedding: { $notNull: true },
          },
          data: {
            embedding: null,
          },
        });
        console.log(`   ✨ Cleared ${result.count} embeddings from ${uid}`);
      } catch (err) {
        console.warn(`   ⚠️ Failed to clear ${uid}:`, err.message);
      }
    }
    console.log('✅ Knowledge Base Wiped Successfully.');
  } catch (error) {
    console.error('❌ Wipe Failed:', error);
  } finally {
    strapi.stop();
  }
}

wipeEmbeddings();
