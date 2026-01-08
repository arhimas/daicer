import { getStrapiClient } from '../utils/strapi-client';

async function run() {
  console.log('🔍 Debugging Strapi Schema with COMPLEX Payload...');
  const client = getStrapiClient();

  // 1. Get or Create a test spell
  let spells = await client.collection('spells').find({ pagination: { limit: 1 } });
  let id;

  if (!spells.data || spells.data.length === 0) {
    console.log('⚠️ No spells found! Creating a dummy spell for testing...');
    const newSpell = await client.collection('spells').create({
      name: 'Test Spell ' + Date.now(),
      level: 3,
      school: 'Evocation',
      description: 'A test spell description.',
      slug: 'test-spell-' + Date.now(),
    });
    id = newSpell.documentId || newSpell.id;
    console.log(`✅ Created Dummy Spell: ${newSpell.name} (ID: ${id})`);
  } else {
    const spell = spells.data[0];
    id = spell.documentId || spell.id;
    console.log(`🎯 Testing update on Spell: ${spell.name} (ID: ${id})`);
  }

  // 2. Construct Complex Payload (Mimicking 400 Failures)
  // FAILED PAYLOAD for Absorb Elements
  const payload = {
    casting_config: {
      time_value: 1,
      time_unit: 'Reaction',
      is_ritual: false,
      is_concentration: false,
      components: {
        verbal: false,
        somatic: true,
        material: false,
        cost_gp: 0,
        consumed: false,
      },
      reaction_trigger: 'taking acid, cold, fire, lightning, or thunder damage',
    },
    condition_instances: [
      {
        condition: 'Special',
        description: 'Resistance to the triggering damage type until the start of your next turn.',
      },
    ],
    damage_instances: [
      {
        dice_count: 1,
        dice_value: 6,
        flat_bonus: 0,
        effect_type: 'Damage',
        timing: 'One Time Trigger',
      },
    ],
    duration_config: {
      type: 'Time-Limited',
      concentration: false,
      unit: 'Rounds',
      value: 1,
    },
    mechanics_config: {
      action_type: 'None',
    },
    range_config: {
      type: 'Self',
    },
    scaling_config: {
      scales: true,
      dice_count: 1,
      dice_value: 6,
      method: 'Per Slot Level',
      type: 'Dice',
    },
    school: 'Abjuration',
  };

  console.log('Sending Payload:', JSON.stringify(payload, null, 2));

  try {
    const res = await client.collection('spells').update(id, payload);
    console.log('✅ Success! Payload Accepted.', res.data.id);
  } catch (err: any) {
    console.error('❌ Failed!', err.message);
    // console.dir(err, { depth: null });
    if (err.response?.data) {
      console.error('Details:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

run();
