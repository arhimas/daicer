import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
// We need to prevent actual worker threads.
vi.mock('../../../voxel-engine/services/chunk-manager', () => ({
  ChunkManager: {
    getInstance: vi.fn().mockReturnValue({
      editVoxel: vi.fn(),
    }),
  },
}));

describe('ActionEngine Death Persistence', () => {
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

    actionEngine = ActionEngineFunc;
  });

  it('should create a persistent death marker when a monster dies', async () => {
    const actorId = 'actor-1';
    const targetId = 'monster-1';

    // Mock Data
    const actor = {
      documentId: actorId,
      actions: [
        { documentId: 'act-1', attack_bonus: 5, damage_instances: [{ dice_count: 1, dice_value: 6, flat_bonus: 100 }] },
      ], // High damage
      room: { documentId: 'room-1' },
    };

    const target = {
      documentId: targetId,
      type: 'monster',
      hp: 10,
      armorClass: 10,
      position: { x: 10, y: 10, z: 0 },
      name: 'Goblin King',
    };

    // Mock FindOne
    mockStrapi.documents().findOne.mockResolvedValueOnce(actor).mockResolvedValueOnce(target);

    // Execute Attack
    const command = {
      type: 'ATTACK',
      payload: {
        actorId,
        targetId,
      },
    };

    const result = await actionEngine.handleAttack(command);

    expect(result.success).toBe(true);

    // Verify DropAll
    expect(mockDropAll).toHaveBeenCalledWith(targetId);

    // Verify Event Creation
    // Attack Result + Entity Death
    expect(mockCreateEvent).toHaveBeenCalledTimes(2);

    // Verify ChunkPersistence
    expect(mockChunkManagerEdit).toHaveBeenCalledWith(
      0,
      0, // 10/16 = 0
      10,
      10, // 10%16 = 10
      0, // z
      undefined, // newType preserved
      'Entity Death',
      expect.objectContaining({
        type: 'death_marker',
        victim: 'Goblin King',
      })
    );
  });
});
