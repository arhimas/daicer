import { getStrapiClient } from '../../utils/strapi-client';

export const getEnrichmentContext = async () => {
  const client = getStrapiClient();

  console.log('📚 Loading Global Enrichment Context...');

  // Load Spells
  let spells: string[] = [];
  try {
    const spellRes = await client.collection('spells').find({
      pagination: { limit: 1000 },
      fields: ['name'],
    });
    if (spellRes.data) {
      spells = spellRes.data.map((s: any) => s.name).sort();
    }
  } catch (e) {
    console.warn('Failed to load spells context', e);
  }

  // Load Equipment
  let equipment: string[] = [];
  try {
    const eqRes = await client.collection('equipments').find({
      pagination: { limit: 1000 },
      fields: ['name'],
    });
    if (eqRes.data) {
      equipment = eqRes.data.map((e: any) => e.name).sort();
    }
  } catch (e) {
    console.warn('Failed to load equipment context', e);
  }

  console.log(`✅ Loaded Context: ${spells.length} Spells, ${equipment.length} Equipment.`);

  return {
    spells,
    equipment,
  };
};
