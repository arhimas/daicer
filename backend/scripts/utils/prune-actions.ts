import { getStrapiClient } from './strapi-client';

const main = async () => {
  const client = getStrapiClient();
  console.log('🗑️  Pruning ALL Action Definitions (REST API)...');

  try {
    let deletedCount = 0;
    while (true) {
      // Fetch a batch of actions
      const actions = await client.collection('actions').find({
        pagination: { limit: 100 },
        fields: ['id'],
      });

      if (!actions.data || actions.data.length === 0) {
        break;
      }

      console.log(`Found batch of ${actions.data.length} actions. Deleting...`);

      // Delete in parallel
      await Promise.all(
        actions.data.map(async (action: any) => {
          await client.collection('actions').delete(action.documentId || action.id);
        })
      );

      deletedCount += actions.data.length;
      console.log(`Deleted ${deletedCount} actions so far...`);
    }

    console.log('✅ Successfully deleted all actions.');
  } catch (error) {
    console.error('❌ Error pruning actions:', error);
  }
};

main();
