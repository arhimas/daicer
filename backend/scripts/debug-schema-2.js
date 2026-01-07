const strapiFactory = require('@strapi/strapi');

async function debugSchema() {
  const strapi = await strapiFactory({ distDir: './dist' }).load();

  try {
    const meta = strapi.db.metadata.get('api::knowledge-snippet.knowledge-snippet');
    console.log('Knowledge Snippet Attributes:', Object.keys(meta.attributes));
    const sourceAttr = meta.attributes.source;
    console.log('Source Relation:', sourceAttr);
    // Print the JOIN column if visible
    if (sourceAttr.joinColumn) {
      console.log('Join Column:', sourceAttr.joinColumn);
    }
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

debugSchema();
