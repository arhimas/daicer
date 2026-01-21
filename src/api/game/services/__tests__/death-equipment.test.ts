import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActionEngineFunc from '../action-engine';
import { ChunkManager } from '../../../voxel-engine/services/chunk-manager';

// Mock Config
const { mockStrapi } = vi.hoisted(() => ({
  mockStrapi: {
    documents: vi.fn(),
    service: vi.fn(),
    db: {
      query: vi.fn(),
    },
  },
}));

// Mock Factories
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, factory: any) => factory({ strapi: mockStrapi }),
  },
}));

// Mock ChunkManager
vi.mock('../../../voxel-engine/services/chunk-manager', () => ({
  ChunkManager: {
    getInstance: vi.fn().mockReturnValue({
      editVoxel: vi.fn(),
    }),
  },
}));

describe('ActionEngine Equipment Persistence', () => {
  let actionEngine: any;
  const mockDropAll = vi.fn();
  const mockCreateEvent = vi.fn();
  const mockChunkManagerEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Strapi Mocks
    mockStrapi.service.mockImplementation((name: string) => {
      if (name === 'api::game.inventory-service') {
        return { dropAll: mockDropAll };
      }
      return {};
    });

    mockStrapi.documents.mockReturnValue({
      findOne: vi.fn().mockResolvedValue({}), // Default
      update: vi.fn().mockResolvedValue({}),
      create: mockCreateEvent,
    });

    // Inject Mock ChunkManager into the test scope
    const cm = ChunkManager.getInstance();
    cm.editVoxel = mockChunkManagerEdit;

    actionEngine = ActionEngineFunc({ strapi: mockStrapi });
  });

  const ROOM_ID = 'room-1';

  it.skip('should NOT drop inventory when a PLAYER dies', async () => {
    const actorId = 'killer-1';
    const targetId = 'player-1';

    // Mock Data
    const actor = {
      documentId: actorId,
      computedActions: [{ id: 'act-1', attack_bonus: 5, damage: [{ diceCount: 1, diceValue: 6, flatBonus: 100 }] }],
      room: { documentId: ROOM_ID },
    };

    const target = {
      documentId: targetId,
      type: 'player', // Crucial: PLAYER TYPE
      hp: 1,
      armorClass: 10,
      position: { x: 10, y: 10, z: 0 },
      name: 'Hero',
    };

    // Mock FindOne
    mockStrapi.documents().findOne.mockImplementation(async ({ documentId }: { documentId: string }) => {
      if (documentId === actorId) return actor;
      if (documentId === targetId) return target;
      return null;
    });

    // Execute Attack
    const command = {
        type: 'ATTACK',
        payload: {
          actorId,
          targetId,
        },
      };

    await actionEngine.dispatch(ROOM_ID, [command]);

    // Verify: Event Emitted for Death
    expect(mockCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'ENTITY_DEATH',
          actor: targetId,
        }),
      })
    );

    // Verify: DropAll was NOT called
    expect(mockDropAll).not.toHaveBeenCalled();
  });

  it.skip('SHOULD drop inventory when a MONSTER dies', async () => {
     const actorId = 'killer-1';
     const targetId = 'monster-1';
 
     // Mock Data
     const actor = {
       documentId: actorId,
       computedActions: [{ id: 'act-1', attack_bonus: 5, damage: [{ diceCount: 1, diceValue: 6, flatBonus: 100 }] }],
       room: { documentId: ROOM_ID },
     };
 
     const target = {
       documentId: targetId,
       type: 'monster', // Crucial: MONSTER TYPE
       hp: 1,
       armorClass: 10,
       position: { x: 10, y: 10, z: 0 },
       name: 'Goblin',
     };
 
     // Mock FindOne
     mockStrapi.documents().findOne.mockImplementation(async ({ documentId }: { documentId: string }) => {
       if (documentId === actorId) return actor;
       if (documentId === targetId) return target;
       return null;
     });
 
     // Execute Attack
     const command = {
        type: 'ATTACK', 
        payload: {
            actorId,
            targetId, 
        }
     };
 
     await actionEngine.dispatch(ROOM_ID, [command]);
 
     // Verify: Event Emitted for Death
     expect(mockCreateEvent).toHaveBeenCalledWith(
       expect.objectContaining({
         data: expect.objectContaining({
           type: 'ENTITY_DEATH',
           actor: targetId,
         }),
       })
     );
 
     // Verify: DropAll WAS called
     expect(mockDropAll).toHaveBeenCalledWith(targetId);
   });
});
