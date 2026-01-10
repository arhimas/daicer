/**
 * Standalone script to list monsters
 */
const Strapi = require('@strapi/strapi');

async function main() {
  // Initialize Strapi
  const app = await Strapi.createStrapi({ distDir: './dist' }).load();
  await app.start();

  try {
    const monsters = await app.documents('api::entity.entity').findMany({
      populate: ['stats'],
      limit: 1000,
    });

    // Filter for "Weak" (CR <= 2 or Level <= 4)
    const weakMonsters = monsters.filter((m) => {
      const cr = m.challenge_rating || 0;
      const level = m.level || 1;
      return cr <= 2 && level <= 4;
    });

    console.log(`Found ${weakMonsters.length} weak monsters.`);

    // Output relevant data for me to "grab"
    const list = weakMonsters
      .map((m) => `"${m.name}" (ID: ${m.documentId}, CR: ${m.challenge_rating}, Lvl: ${m.level})`)
      .join('\n');
    console.log(list);
  } catch (error) {
    console.error(error);
  } finally {
    app.destroy();
    process.exit(0);
  }
}

main();
export {};
