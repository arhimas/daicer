const { createStrapi } = require('@strapi/strapi');

async function verify() {
  const app = await createStrapi({ distDir: './dist' }).load();
  try {
    const zones = await app.db.query('api::entity-zone.entity-zone').findMany();
    const blueprints = await app.db.query('api::blueprint.blueprint').findMany();

    console.log('--- ZONES ---');
    console.table(zones.map((z) => ({ id: z.id, name: z.name, category: z.category, slug: z.slug })));

    console.log('\n--- BLUEPRINTS ---');
    console.table(blueprints.map((b) => ({ id: b.id, name: b.name, category: b.category })));
  } catch (e) {
    console.error(e);
  } finally {
    app.destroy();
  }
}

verify();
