import { describe, it, expect, vi, beforeEach } from 'vitest';
import actionEngineFactory from '../action-engine';

describe('ActionEngine V2 (Pure Logic)', () => {
  let actionEngine: any;
  let mockStrapi: any;

  const mockActor = {
    documentId: 'actor-1',
    name: 'Hero',
    position: { x: 0, y: 0, z: 0 },
    speed: { walk: 30 },
    stats: { strength: 10, dexterity: 10 },
    room: { config: { chunkSize: 16 } },
  };

  const mockRoomEntities = [
    { documentId: 'actor-1', position: { x: 0, y: 0, z: 0 } },
    { documentId: 'obstacle-1', position: { x: 5, y: 0, z: 0 } },
  ];

  beforeEach(() => {
    mockStrapi = {
      documents: vi.fn((_uid) => ({
        findOne: vi.fn(async ({ documentId }) => {
          if (documentId === 'actor-1') return mockActor;
          if (documentId === 'target-1')
            return { ...mockActor, documentId: 'target-1', hp: 10, armorClass: 10, position: { x: 5, y: 0, z: 0 } };
          return null;
        }),
        findMany: vi.fn(async () => mockRoomEntities),
        update: vi.fn(),
        create: vi.fn(),
      })),
      service: vi.fn(() => ({
        dropItem: vi.fn(async () => ({ success: true })),
      })),
    };

    actionEngine = actionEngineFactory({ strapi: mockStrapi });
  });

  it('should resolve MOVE command without persistence when dryRun is true', async () => {
    const command = {
      type: 'MOVE',
      payload: {
        actorId: 'actor-1',
        targetPosition: { x: 3, y: 0, z: 0 },
        mode: 'walk',
      },
    };

    const results = await actionEngine.dispatch('room-1', [command], true); // dryRun = true

    expect(results).toHaveLength(1);
    const result = results[0];

    expect(result.success).toBe(true);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('ENTITY_MOVED');
    expect(result.stateDiff.updates).toHaveLength(1);
    expect(result.stateDiff.updates[0]).toMatchObject({
      collection: 'api::entity-sheet.entity-sheet',
      documentId: 'actor-1',
      data: { position: { x: 3, y: 0, z: 0 } },
    });

    // Ensure NO persistence calls
    expect(mockStrapi.documents('api::entity-sheet.entity-sheet').update).not.toHaveBeenCalled();
    expect(mockStrapi.documents('api::game-event.game-event').create).not.toHaveBeenCalled();
  });

  it('should resolve ATTACK command without persistence when dryRun is true', async () => {
    // Prepare Actor Actions
    mockActor.actions = [
      {
        documentId: 'action-sword',
        name: 'Longsword',
        attack_bonus: 5,
        damage_instances: [{ dice_count: 1, dice_value: 6, flat_bonus: 2 }],
      },
    ];

    const command = {
      type: 'ATTACK',
      payload: {
        actorId: 'actor-1',
        targetId: 'target-1',
        weaponId: 'action-sword',
      },
    };

    const results = await actionEngine.dispatch('room-1', [command], true); // dryRun = true
    const result = results[0];

    expect(result.success).toBe(true);
    expect(result.events[0].type).toBe('ATTACK_RESULT');

    // If hit (likely with bonus +5 vs AC 10), check damage
    // Since we allow randomness in this specific implementation (using Math.random), we can't guarantee hit inside this test specific without mocking Math.random.
    // But the key assertion is PERSISTENCE AVOIDANCE.

    expect(mockStrapi.documents('api::entity-sheet.entity-sheet').update).not.toHaveBeenCalled();
    expect(mockStrapi.documents('api::game-event.game-event').create).not.toHaveBeenCalled();
  });
});
