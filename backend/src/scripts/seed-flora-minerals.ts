/**
 * Seed Flora, Minerals, and Items
 * Usage: yarn ts-node src/scripts/seed-flora-minerals.ts
 */

const Strapi = require('@strapi/strapi');

async function seed() {
  const factory = Strapi.createStrapi || Strapi.default || Strapi;
  const app = await factory({ distDir: './dist', appDir: process.cwd() }).load();

  console.log('Seeding Flora, Minerals, and Loot...');

  // 1. ITEMS (Raw Materials & Loot)
  const itemsData = [
    // ORGANIC
    { name: 'Apple', type: 'consumable', value: 1, desc: 'A crisp red apple.' },
    { name: 'Pinecone', type: 'loot', value: 0, desc: 'A dry pinecone.' },
    { name: 'Oak Wood', type: 'loot', value: 2, desc: 'A log of tough heartwood.' },
    { name: 'Birch Wood', type: 'loot', value: 2, desc: 'Pale, papery wood.' },
    { name: 'Pine Wood', type: 'loot', value: 2, desc: 'Resinous softwood.' },
    { name: 'Palm Frond', type: 'loot', value: 1, desc: 'Large leafy frond.' },
    { name: 'Cactus Meat', type: 'consumable', value: 1, desc: 'Hydrating plant flesh.' },
    { name: 'Bamboo Stalk', type: 'loot', value: 2, desc: 'Hollow, sturdy stalk.' },
    { name: 'Baobab Bark', type: 'loot', value: 5, desc: 'Thick, fibrous bark.' },
    { name: 'Mushroom Cap', type: 'consumable', value: 1, desc: 'Edible fungus.' },
    { name: 'Vine Rope', type: 'tool', value: 1, desc: 'Crude rope made from vine.' },
    { name: 'Acacia Wood', type: 'loot', value: 3, desc: 'Hard, durable wood.' },
    { name: 'Mangrove Root', type: 'loot', value: 2, desc: 'Water-logged root.' },
    { name: 'Mahogany Plank', type: 'loot', value: 10, desc: 'Rich, dark wood.' },
    { name: 'Willow Branch', type: 'loot', value: 1, desc: 'Flexible whip-like branch.' },
    { name: 'Glow Spore', type: 'loot', value: 5, desc: 'Bioluminescent powder.' },
    { name: 'Spider Silk', type: 'loot', value: 10, desc: 'Strong, sticky thread.' },

    // MINERALS / ORES
    { name: 'Granite Chunk', type: 'loot', value: 1, desc: 'Heavy grey stone.' },
    { name: 'Flint', type: 'tool', value: 1, desc: 'Sharp fire-starting stone.' },
    { name: 'Coal', type: 'loot', value: 5, desc: 'Combustible black rock.' },
    { name: 'Iron Ore', type: 'loot', value: 10, desc: 'Raw iron.' },
    { name: 'Gold Ore', type: 'loot', value: 50, desc: 'Raw gold nugget.' },
    { name: 'Copper Ore', type: 'loot', value: 8, desc: 'Oxidized green/brown rock.' },
    { name: 'Silver Ore', type: 'loot', value: 25, desc: 'Shiny grey ore.' },
    { name: 'Mithril Ore', type: 'loot', value: 100, desc: 'Lightweight silvery ore.' },
    { name: 'Adamantine Ore', type: 'loot', value: 500, desc: 'Indestructible black ore.' },
    { name: 'Obsidian Shard', type: 'tool', value: 5, desc: 'Razor sharp glass.' },
    { name: 'Ruby', type: 'loot', value: 100, desc: 'Red gemstone.' },
    { name: 'Sapphire', type: 'loot', value: 100, desc: 'Blue gemstone.' },
    { name: 'Emerald', type: 'loot', value: 100, desc: 'Green gemstone.' },
    { name: 'Diamond', type: 'loot', value: 500, desc: 'Hardest clear gemstone.' },
    { name: 'Amethyst', type: 'loot', value: 50, desc: 'Purple quartz.' },
    { name: 'Quartz', type: 'loot', value: 10, desc: 'Clear crystal.' },
    { name: 'Sulfur', type: 'loot', value: 5, desc: 'Yellow powder, smells of eggs.' },
    { name: 'Salt', type: 'consumable', value: 1, desc: 'Basic seasoning.' },
    { name: 'Ice Shard', type: 'loot', value: 0, desc: 'Cold to the touch.' },
    { name: 'Magma Core', type: 'loot', value: 50, desc: 'Still hot.' },

    // MISC
    { name: 'Bone', type: 'loot', value: 0, desc: 'Old dry bone.' },
    { name: 'Hide', type: 'loot', value: 5, desc: 'Animal skin.' },
  ];

  const itemMap = new Map();

  for (const item of itemsData) {
    const slug = item.name.toLowerCase().replace(/ /g, '-');
    let existing = await app.db.query('api::item.item').findOne({ where: { slug } });
    if (!existing) {
      console.log(`Creating Item: ${item.name}`);
      existing = await app.db.query('api::item.item').create({
        data: {
          name: item.name,
          slug,
          type: item.type,
          value: item.value,
          description: [{ type: 'paragraph', children: [{ type: 'text', text: item.desc }] }], // Richtext
          publishedAt: new Date(),
        },
      });
    }
    itemMap.set(item.name, existing);
  }

  // Helper to get item ID (returns component shape for inventory)
  const getLoot = (name, chance = 1, qty = 1) => {
    const item = itemMap.get(name);
    if (!item) return null;
    return {
      item: item.id,
      quantity: qty,
      isEquipped: false,
      // 'chance' logic isn't in schema, assume monster *always* carries this in inventory to drop on death
    };
  };

  // 2. MONSTERS (Flora/Minerals)
  const floraData = [
    // TREES
    { name: 'Oak Tree', type: 'plant', cr: 2, hp: 50, ac: 15, loot: 'Oak Wood' },
    { name: 'Birch Tree', type: 'plant', cr: 1, hp: 40, ac: 13, loot: 'Birch Wood' },
    { name: 'Pine Tree', type: 'plant', cr: 1, hp: 45, ac: 14, loot: 'Pine Wood' },
    { name: 'Palm Tree', type: 'plant', cr: 1, hp: 35, ac: 12, loot: 'Palm Frond' },
    { name: 'Willow Tree', type: 'plant', cr: 2, hp: 60, ac: 13, loot: 'Willow Branch' },
    { name: 'Baobab Tree', type: 'plant', cr: 3, hp: 100, ac: 16, loot: 'Baobab Bark' },
    { name: 'Acacia Tree', type: 'plant', cr: 1, hp: 45, ac: 14, loot: 'Acacia Wood' },
    { name: 'Mangrove Tree', type: 'plant', cr: 2, hp: 55, ac: 14, loot: 'Mangrove Root' },
    { name: 'Spruce Tree', type: 'plant', cr: 1, hp: 45, ac: 14, loot: 'Pine Wood' },
    { name: 'Mahogany Tree', type: 'plant', cr: 2, hp: 60, ac: 15, loot: 'Mahogany Plank' },
    { name: 'Giant Bamboo', type: 'plant', cr: 3, hp: 80, ac: 18, loot: 'Bamboo Stalk' },
    { name: 'Dead Tree', type: 'plant', cr: 0, hp: 20, ac: 10, loot: 'Wood' }, // Generic?

    // SMALLER FLORA
    { name: 'Cactus', type: 'plant', cr: 0.125, hp: 10, ac: 11, loot: 'Cactus Meat' },
    { name: 'Rose Bush', type: 'plant', cr: 0, hp: 5, ac: 10, loot: null },
    { name: 'Berry Bush', type: 'plant', cr: 0, hp: 5, ac: 10, loot: 'Apple' }, // Placeholder for berries
    { name: 'Vine', type: 'plant', cr: 0, hp: 2, ac: 10, loot: 'Vine Rope' },
    { name: 'Giant Mushroom', type: 'plant', cr: 0.5, hp: 20, ac: 8, loot: 'Mushroom Cap' },

    // MINERALS
    { name: 'Granite Rock', type: 'object', cr: 1, hp: 100, ac: 17, loot: 'Granite Chunk' },
    { name: 'Gold Vein', type: 'object', cr: 1, hp: 100, ac: 15, loot: 'Gold Ore' },
    { name: 'Iron Vein', type: 'object', cr: 2, hp: 150, ac: 18, loot: 'Iron Ore' },
    { name: 'Copper Vein', type: 'object', cr: 1, hp: 120, ac: 16, loot: 'Copper Ore' },
    { name: 'Silver Vein', type: 'object', cr: 1, hp: 100, ac: 15, loot: 'Silver Ore' },
    { name: 'Mithril Node', type: 'object', cr: 4, hp: 300, ac: 22, loot: 'Mithril Ore' },
    { name: 'Adamantine Node', type: 'object', cr: 5, hp: 400, ac: 25, loot: 'Adamantine Ore' },
    { name: 'Ruby Crystal', type: 'object', cr: 1, hp: 50, ac: 14, loot: 'Ruby' },
    { name: 'Diamond Crystal', type: 'object', cr: 3, hp: 200, ac: 20, loot: 'Diamond' },
    { name: 'Coal Deposit', type: 'object', cr: 1, hp: 50, ac: 12, loot: 'Coal' },
    { name: 'Sulfur Vent', type: 'object', cr: 1, hp: 50, ac: 12, loot: 'Sulfur' },
  ];

  for (const mob of floraData) {
    const slug = mob.name.toLowerCase().replace(/ /g, '-');
    const existing = await app.db.query('api::entity.entity').findOne({ where: { slug } });

    const inventory = [];
    if (mob.loot) {
      const lootItem = getLoot(mob.loot, 1, Math.floor(Math.random() * 3) + 1);
      if (lootItem) inventory.push(lootItem);
    }

    if (!existing) {
      console.log(`Creating Flora/Mineral: ${mob.name}`);
      await app.db.query('api::entity.entity').create({
        data: {
          name: mob.name,
          slug,
          type: mob.type,
          challenge_rating: mob.cr,
          hp: mob.hp,
          maxHp: mob.hp,
          ac: mob.ac,
          level: Math.max(1, Math.floor(mob.cr)),
          inventory, // Attach loot
          publishedAt: new Date(),
        },
      });
    } else {
      // Update inventory if empty?
      console.log(`Updating ${mob.name} loot...`);
      await app.db.query('api::entity.entity').update({
        where: { id: existing.id },
        data: { inventory },
      });
    }
  }

  console.log('Done!');
  app.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed', error);
  process.exit(1);
});

export {};
