import { getStrapiClient } from '../../utils/strapi-client';

export const getEnrichmentContext = async () => {
  const client = getStrapiClient();

  console.log('📚 Loading Global Enrichment Context...');

  // Load Spells
  let spells: string[] = [];
  try {
    let page = 1;
    while (true) {
      const res: any = await client.collection('spells').find({
        pagination: { page, pageSize: 100 },
        fields: ['name'],
      });
      if (!res.data || res.data.length === 0) break;
      spells.push(...res.data.map((s: any) => s.name));
      if (res.meta?.pagination?.pageCount <= page) break;
      page++;
    }
    spells.sort();
  } catch (e) {
    console.warn('Failed to load spells context', e);
  }

  // Load Equipment
  let equipment: string[] = [];
  try {
    let page = 1;
    while (true) {
      const res: any = await client.collection('equipments').find({
        pagination: { page, pageSize: 100 },
        fields: ['name'],
      });
      if (!res.data || res.data.length === 0) break;
      equipment.push(...res.data.map((e: any) => e.name));
      if (res.meta?.pagination?.pageCount <= page) break;
      page++;
    }
    equipment.sort();
  } catch (e) {
    console.warn('Failed to load equipment context', e);
  }

  console.log(`✅ Loaded Context: ${spells.length} Spells, ${equipment.length} Equipment.`);

  return {
    spells,
    equipment,
  };
};
