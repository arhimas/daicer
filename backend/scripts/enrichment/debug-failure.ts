import { getStrapiClient } from '../utils/strapi-client';

async function run() {
  const client = getStrapiClient();
  const failingId = 'ajwyv7kyjlil221ir303c36a'; // Abi-Dalzim's Horrid Wilting

  console.log(`[Debug] Attempting to update spell ${failingId} with complex payload...`);

  // Mocking the data likely generated for Abi-Dalzim's
  const payload = {
    casting_config: {
      time_value: 1,
      time_unit: 'Action',
      is_ritual: false,
      components: {
        verbal: true,
        somatic: true,
        material: true,
        material_description: 'A bit of sponge'.repeat(20).substring(0, 250), // Verify truncation
        cost_gp: 0,
        consumed: false,
      },
    },
    damage_instances: [
      {
        effect_type: 'Damage',
        damage_type: 'Necrotic',
        dice_count: 12,
        dice_value: 8,
        timing: 'Instant',
      },
    ],
    // This spell has scaling
    scaling_config: {
      scales: true,
      type: 'Dice',
      method: 'Per Slot Level', // Verify enum
      dice_count: 0, // Should be optional?
    },
  };

  try {
    const res = await client.collection('spells').update(failingId, payload);
    console.log('[Debug] Success:', res.data?.id);
  } catch (error: any) {
    console.error('[Debug] Error:', error.message);
    if (error.response?.data) {
      console.error('[Debug] Server Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

run();
