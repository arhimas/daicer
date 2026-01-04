import { createStrapi } from '@strapi/strapi';
import { getMapImageTool } from '../src/ai/tools/game/get-map-image';

async function verifyImageTool() {
  const strapi = await createStrapi({ distDir: './dist' }).load();
  await strapi.server.mount();

  console.log('Strapi loaded. Finding a room...');

  // Find a valid room
  const room = await strapi.documents('api::room.room').findFirst({
    populate: ['entity_sheets'],
  });

  if (!room) {
    console.error('No rooms found. Cannot verify.');
    process.exit(1);
  }

  console.log(`Using room: ${room.documentId}`);

  // Mock Context
  const context = {
    strapi,
    roomDocumentId: room.documentId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: {} as any,
  };

  const tool = getMapImageTool(context);

  console.log('Testing Global View...');
  const resultGlobalStr = await tool.func({ x: 0, y: 0, radius: 16, broadcast: false });
  const resultGlobal = JSON.parse(resultGlobalStr);

  console.log(
    'Global View Result:',
    resultGlobal.description,
    resultGlobal.base64?.length > 0 ? 'Base64 Present' : 'Base64 Missing'
  );

  // Test POV if entities exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entities = (room as any).entity_sheets;
  if (entities && entities.length > 0) {
    const entity = entities[0];
    console.log(`Testing POV View for ${entity.name} (${entity.documentId})...`);
    const resultPOVStr = await tool.func({ entityId: entity.documentId, radius: 16, broadcast: false });
    const resultPOV = JSON.parse(resultPOVStr);

    console.log(
      'POV View Result:',
      resultPOV.description,
      resultPOV.base64?.length > 0 ? 'Base64 Present' : 'Base64 Missing'
    );
  } else {
    console.log('No entities found for POV test.');
  }

  process.exit(0);
}

verifyImageTool().catch((err) => {
  console.error(err);
  process.exit(1);
});
