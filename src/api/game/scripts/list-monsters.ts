/**
 * Script to list monsters for selection
 */

const main = async ({ strapi }) => {
  try {
    const monsters = await strapi.documents('api::entity.entity').findMany({
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

    // Group by likely biome tags (naive) or just list them
    const simpleList = weakMonsters.map((m) => ({
      id: m.documentId,
      name: m.name,
      cr: m.challenge_rating,
      level: m.level,
      slug: m.slug,
    }));

    console.log(JSON.stringify(simpleList, null, 2));
  } catch (error) {
    console.error(error);
  }
};

export default main;
