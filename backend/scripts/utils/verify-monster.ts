import { getStrapiClient } from './strapi-client';
import { getGeminiModel } from '../enrichment/modules/llm';

const main = async () => {
  const args = process.argv.slice(2);
  const nameOrId = args[0];

  if (!nameOrId) {
    console.error('Please provide a monster Name or ID');
    process.exit(1);
  }

  const client = getStrapiClient();
  console.log(`🔍 Inspecting Monster: ${nameOrId}`);

  try {
    // Try by ID first
    let monster;
    try {
      monster = await client.collection('monsters').findOne(nameOrId, { populate: '*' });
    } catch (e) {
      // Ignore
    }

    // Try by Name
    if (!monster || !monster.data) {
      const res = await client.collection('monsters').find({
        filters: { name: { $eq: nameOrId } },
        populate: '*',
      });
      if (res.data && res.data.length > 0) {
        monster = { data: res.data[0] };
      }
    }

    if (!monster || !monster.data) {
      console.error('❌ Monster not found');
      process.exit(1);
    }

    const m = monster.data;
    console.log('---------------------------------------------------');
    console.log(`🆔 ID: ${m.documentId || m.id}`);
    console.log(`🐉 Name: ${m.name}`);
    console.log(`📝 Description: ${(m.description || '').substring(0, 100)}...`);

    console.log('\n⚔️  STRUCTURED ACTIONS:');
    if (m.structuredActions) {
      m.structuredActions.forEach((a: any) => {
        console.log(`  - [${a.type}] ${a.name}`);
        console.log(`    Definition ID: ${a.action_definition}`);
        console.log(`    Desc: ${a.description}`);
      });
    } else {
      console.log('  (None)');
    }

    console.log('\n🔗 LINKED ACTIONS (Relations):');
    if (m.actions && m.actions.length > 0) {
      m.actions.forEach((a: any) => {
        console.log(`  - [ID: ${a.id}] ${a.name} (${a.type})`);
        console.log(`    Unique Name: ${a.name}`); // Verify namespacing in Definition
      });
    } else {
      console.log('  (None)');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

main();
