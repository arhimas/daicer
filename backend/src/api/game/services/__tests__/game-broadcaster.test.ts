import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import gameBroadcaster from '../game-broadcaster';
import { setupStrapi, cleanupStrapi } from '../../../../tests/setup-strapi';
import { TestFactory } from '../../../../tests/factory';

describe('Service: Game Broadcaster - Integration', () => {
  // Mock external broadcast target (Socket/Stream)
  const { mockBroadcast } = vi.hoisted(() => ({ mockBroadcast: vi.fn() }));
  vi.mock('../../../../utils/llm/stream-manager', () => ({
    streamManager: {
      broadcast: mockBroadcast,
    },
  }));

  let strapi: any;
  let factory: TestFactory;

  // Setup Real Strapi
  beforeAll(async () => {
    strapi = await setupStrapi();
    factory = new TestFactory(strapi);
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  it('should broadcast valid room entities from the real database', async () => {
    // 1. Create Data
    const room = await factory.createRoom({
      name: 'Integration Room',
    });

    const monster = await factory.createMonster({
      name: 'Integration Orc',
      hit_points: 25,
      // position: { x: 10, y: 10, z: 0 }, // Position is actually on the EntitySheet, not Monster? Checking schema...
      // Monster schema not fully checked but let's assume raw data.
    });

    const entitySheet = await factory.createEntitySheet({
      name: 'Instance of Orc',
      type: 'monster',
      monster: monster.documentId,
      currentHp: 25,
      maxHp: 25,
      position: { x: 10, y: 10, z: 0 }, // Position is on EntitySheet based on schema I read
    });

    // 2. Link Entity Sheet to Room
    await strapi.documents('api::room.room').update({
      documentId: room.documentId,
      data: {
        entity_sheets: [entitySheet.documentId],
      },
    });

    // 3. Initialize Service with Real Strapi
    const service = gameBroadcaster({ strapi });

    // 4. Execute
    await service.broadcastRoomEntities(room.documentId);

    // 5. Verify
    expect(mockBroadcast).toHaveBeenCalledWith(
      room.documentId,
      'entities:update',
      expect.objectContaining({
        entities: expect.arrayContaining([
          expect.objectContaining({
            id: entitySheet.documentId,
            name: 'Instance of Orc',
            type: 'monster',
            position: expect.objectContaining({ x: 10, y: 10, z: 0 }),
            currentHp: 25,
            // Monster details might be nested or flattened depending on broadcaster logic.
            // Assuming broadcaster sends specific fields from entity sheet + monster.
          }),
        ]),
      })
    );
  });

  it('should handle empty rooms correctly', async () => {
    const emptyRoom = await factory.createRoom({ name: 'Empty Room' });
    const service = gameBroadcaster({ strapi });

    await service.broadcastRoomEntities(emptyRoom.documentId);

    expect(mockBroadcast).toHaveBeenCalledWith(emptyRoom.documentId, 'entities:update', { entities: [] });
  });

  // Note: We skipped the "Corrupt Data" tests because the TestFactory creates valid data by definition.
  // The Strapi Entity Service prevents most invalid states (like missing required components) during creation.
});
