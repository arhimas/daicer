
import path from 'path';

async function main() {
  const backendRoot = path.resolve(__dirname, '../../');
  process.chdir(backendRoot);
  console.log('Booting Strapi in:', backendRoot);

  const { createStrapi } = await import('@strapi/strapi');
  // Try without distDir options to let it auto-detect or fail gracefully
  const strapi = await createStrapi({}).load();

  console.log('✅ Strapi loaded.');

  const cts = Object.keys(strapi.contentTypes).filter(uid => uid.startsWith('api::'));
  console.log(`ContentTypes: ${cts.length}`);

  try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snippets = await strapi.documents('api::knowledge-snippet.knowledge-snippet' as any).findMany({
          filters: { sourceType: 'schema' },
          limit: 1000
      });
      console.log(`Schema Snippets in DB: ${snippets.length}`);
      if (snippets.length > 0) {
          console.log('Sample Snippet:', snippets[0].title);
          console.log('Linked Source:', snippets[0].source);
      }
  } catch (e) {
      console.error('Error querying snippets:', e);
  }
  
  await strapi.destroy();
  process.exit(0);
}
main();
