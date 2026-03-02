import { createStrapi } from '@strapi/strapi';

async function mapCardinality() {
  const strapi = createStrapi({ serveAdminPanel: false, autoReload: false });
  await strapi.load();

  try {
    const entities = await strapi.db.query('api::entity.entity').findMany({ select: ['size', 'category'] });
    const items = await strapi.db.query('api::item.item').findMany({ select: ['size', 'type'] });
    const terrains = await strapi.db.query('api::terrain.terrain').findMany({ select: ['slug'] });
    const blueprints = await strapi.db.query('api::blueprint.blueprint').findMany({ select: ['name', 'category', 'documentId']});

    const breakdown = {
      entities: {
        total: entities.length,
        bySize: entities.reduce((acc, e) => {
          const s = e.size || 'Medium';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {}),
        byCategory: entities.reduce((acc, e) => {
          const c = e.category || 'Unknown';
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {})
      },
      items: {
        total: items.length,
        bySize: items.reduce((acc, i) => {
          const s = i.size || 'Medium';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {}),
        byType: items.reduce((acc, i) => {
          const t = i.type || 'Unknown';
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {})
      },
      terrains: {
        total: terrains.length
      },
      blueprints: {
        total: blueprints.length,
        list: blueprints.map(b => `[${b.category}] ${b.name}`)
      }
    };

    console.log("=== CARDINALITY_REPORT_START ===");
    console.log(JSON.stringify(breakdown, null, 2));
    console.log("=== CARDINALITY_REPORT_END ===");
  } catch(e) {
    console.error(e);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

mapCardinality();
