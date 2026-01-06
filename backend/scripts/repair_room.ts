import { getStrapiClient, updateEntity } from './utils/strapi-client';

async function repair() {
  const client = getStrapiClient();
  const roomId = '9926cd7a-720f-4c89-bf11-420c69824be7'; // User's active room code
  console.log(`[Repair] Looking for room: ${roomId}`);

  try {
    // 1. Find Room
    const res = await client.collection('rooms').find({
      filters: { code: roomId },
    });

    if (!res.data || res.data.length === 0) {
      console.error('[Repair] Room not found!');
      return;
    }

    const room = res.data[0];
    console.log(`[Repair] Found room: ${room.documentId}. Checking state...`);

    const updateData: any = {};

    // 2. Check Entropy
    if (!room.entropyState) {
      console.log('[Repair] -> Missing entropyState. Injecting default.');
      updateData.entropyState = {
        entropyPool: 0,
        conditions: [],
        eventsLog: [],
      };
    } else {
      console.log('[Repair] -> entropyState exists.');
    }

    // 3. Check Turn Data
    if (!room.turnData) {
      console.log('[Repair] -> Missing turnData. Injecting default.');
      updateData.turnData = {
        turnNumber: 0,
        timestamp: Date.now(),
      };
    } else {
      console.log('[Repair] -> turnData exists.');
    }

    // 4. Check Explored Tiles
    if (!room.exploredTiles) {
      console.log('[Repair] -> Missing exploredTiles. Injecting empty.');
      updateData.exploredTiles = {};
    }

    // 5. Apply Update
    if (Object.keys(updateData).length > 0) {
      const updated = await updateEntity('rooms', room.documentId, updateData);
      if (updated) {
        console.log('[Repair] SUCCESS: Room repaired.');
      } else {
        console.error('[Repair] FAILED: Update returned null.');
      }
    } else {
      console.log('[Repair] No repairs needed.');
    }
  } catch (error: any) {
    console.error('[Repair] Error:', error.message || error);
  }
}

repair();
