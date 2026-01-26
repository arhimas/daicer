/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActionEngineFunc from '../action-engine';

// Mock Config & Constants
const { mockStrapi } = vi.hoisted(() => ({
  mockStrapi: {
    documents: vi.fn(),
    service: vi.fn(),
    db: { query: vi.fn() },
  },
}));

vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, factory: any) => factory({ strapi: mockStrapi }),
  },
}));

vi.mock('../../../voxel-engine/services/chunk-manager', () => ({
  ChunkManager: { getInstance: vi.fn().mockReturnValue({ editVoxel: vi.fn() }) },
}));

describe('ActionEngine Item Interactions', () => {
  let actionEngine: any;
  const mockDropItem = vi.fn();
  const mockPickupItem = vi.fn();
  const mockDropItemAt = vi.fn();
  const mockCreateEvent = vi.fn();
  const mockUpdateEntity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockStrapi.service.mockImplementation((name: string) => {
      if (name === 'api::game.inventory-service') {
        return {
          dropItem: mockDropItem,
          pickupItem: mockPickupItem,
          dropItemAt: mockDropItemAt,
        };
      }
      return {};
    });

    mockStrapi.documents.mockReturnValue({
      findOne: vi.fn().mockReturnValue({
        // Default return for findOne chaining
      }),
      update: mockUpdateEntity,
      create: mockCreateEvent,
    });

    actionEngine = ActionEngineFunc({ strapi: mockStrapi });
  });

  it('should handle DROP_ITEM command', async () => {
    mockDropItem.mockResolvedValue({ success: true, message: 'Dropped' });
    const mockActor = { documentId: 'actor-1', room: { documentId: 'room-1' } };
    mockStrapi.documents().findOne.mockResolvedValue(mockActor);

    const command = {
      type: 'DROP_ITEM',
      payload: { actorId: 'actor-1', itemComponentId: 'comp-1' },
    };

    const resultArr = await actionEngine.dispatch('room-1', [command]);
    const result = resultArr[0];

    expect(result.success).toBe(true);
    expect(mockDropItem).toHaveBeenCalledWith('actor-1', 'comp-1');
    expect(mockCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'ITEM_DROPPED' }),
      })
    );
  });

  it('should handle PICKUP_ITEM command', async () => {
    mockPickupItem.mockResolvedValue({ success: true, message: 'Picked up' });
    const mockActor = { documentId: 'actor-1', room: { documentId: 'room-1' } };
    mockStrapi.documents().findOne.mockResolvedValue(mockActor);

    const command = {
      type: 'PICKUP_ITEM',
      payload: { actorId: 'actor-1', targetId: 'loot-1' },
    };

    const resultArr = await actionEngine.dispatch('room-1', [command]);
    const result = resultArr[0];

    expect(result.success).toBe(true);
    expect(mockPickupItem).toHaveBeenCalledWith('actor-1', 'loot-1');
  });

  it('should handle THROW_ITEM at a location', async () => {
    mockDropItemAt.mockResolvedValue({ success: true, message: 'Dropped at Loc' });
    const mockActor = { documentId: 'actor-1', room: { documentId: 'room-1' }, stats: { dexterity: 10 } };
    mockStrapi.documents().findOne.mockResolvedValue(mockActor);

    const command = {
      type: 'THROW_ITEM',
      payload: {
        actorId: 'actor-1',
        itemComponentId: 'comp-1',
        targetPosition: { x: 10, y: 10, z: 0 },
      },
    };

    const resultArr = await actionEngine.dispatch('room-1', [command]);
    const result = resultArr[0];

    expect(result.success).toBe(true);
    // Should call dropItemAt regardless of hit logic if no entity target
    expect(mockDropItemAt).toHaveBeenCalledWith('actor-1', 'comp-1', { x: 10, y: 10, z: 0 });
    expect(mockCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'ITEM_DROPPED' }),
      })
    );
  });
});
