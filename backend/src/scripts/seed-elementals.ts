/**
 * Standalone script to seed Elemental/Plant creatures
 */
const Strapi = require('@strapi/strapi');

async function main() {
  const app = await Strapi.createStrapi({ distDir: './dist' }).load();
  await app.start();

  try {
    const monsters = [
      {
        name: 'Awakened Tree',
        level: 5,
        challenge_rating: 2,
        hp: 59,
        maxHp: 59,
        armorClass: 13, // Natural armor
        stats: {
          strength: 19,
          dexterity: 6,
          constitution: 15,
          intelligence: 10,
          wisdom: 10,
          charisma: 7,
          passivePerception: 10,
          initiativeBonus: -2,
        },
        speed: 20,
        type: 'monster',
        description: 'A massive tree brought to life by magic.',
      },
      {
        name: 'Rock Elemental',
        level: 5,
        challenge_rating: 3,
        hp: 65,
        maxHp: 65,
        armorClass: 17, // Natural armor
        stats: {
          strength: 20,
          dexterity: 8,
          constitution: 20,
          intelligence: 5,
          wisdom: 10,
          charisma: 5,
          passivePerception: 10,
          initiativeBonus: -1,
        },
        speed: 25,
        type: 'monster',
        description: 'A living mound of earth and stone.',
      },
    ];

    for (const m of monsters) {
      // Check if exists
      const existing = await app.documents('api::entity.entity').findMany({
        filters: { name: m.name },
        limit: 1,
      });

      if (existing.length === 0) {
        console.log(`Creating ${m.name}...`);
        await app.documents('api::entity.entity').create({
          data: m,
          status: 'published',
        });
        console.log(`Created ${m.name}.`);
      } else {
        console.log(`Skipping ${m.name} (already exists).`);
      }
    }
  } catch (error) {
    console.error('Error seeding elementals:', error);
  } finally {
    app.destroy();
    process.exit(0);
  }
}

main();
export {};
