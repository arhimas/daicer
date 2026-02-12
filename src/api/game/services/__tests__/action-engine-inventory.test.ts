import { describe, it, expect, vi, beforeEach } from 'vitest';
import actionEngineFactory from '../action-engine';

describe('Action Engine: Inventory Commands', () => {
  let actionEngine: any;
  let mockStrapi: any;
  let mockInventoryService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInventoryService = {
      dropItem: vi.fn(),
      pickupItem: vi.fn(),
      dropItemAt: vi.fn(),
    };

    mockStrapi = {
      documents: vi.fn((uid) => ({
        findOne: vi.fn(async ({ documentId }) => {
          if (documentId === 'hero') {
            return {
              documentId: 'hero',
              position: { x: 10, y: 10, z: 0 },
              room: { documentId: 'room-1' },
            };
          }
          return null;
        }),
        create: vi.fn(),
        update: vi.fn(),
      })),
      service: vi.fn((uid) => {
        if (uid === 'api::game.inventory-service') return mockInventoryService;
        return null;
      }),
    };

    vi.stubGlobal('strapi', mockStrapi);
    actionEngine = actionEngineFactory({ strapi: mockStrapi });
  });

  describe('DROP_ITEM', () => {
    it('should resolve DROP_ITEM successfully', async () => {
      mockInventoryService.dropItem.mockResolvedValue({ success: true });

      const command = {
        type: 'DROP_ITEM',
        payload: { actorId: 'hero', itemComponentId: 'item-1' },
      };

      const results = await actionEngine.dispatch('room-1', [command]);
      const result = results[0];

      expect(result.success).toBe(true);
      expect(mockInventoryService.dropItem).toHaveBeenCalledWith('hero', 'item-1');
      expect(result.events[0].type).toBe('ITEM_DROPPED');
      expect(result.events[0].payload.position).toEqual({ x: 10, y: 10, z: 0 });
    });

    it('should fail if inventory service fails', async () => {
      mockInventoryService.dropItem.mockResolvedValue({ success: false });

      const command = {
        type: 'DROP_ITEM',
        payload: { actorId: 'hero', itemComponentId: 'item-1' },
      };

      const results = await actionEngine.dispatch('room-1', [command]);
      expect(results[0].success).toBe(false);
    });
  });

  describe('PICKUP_ITEM', () => {
    it('should resolve PICKUP_ITEM successfully', async () => {
      mockInventoryService.pickupItem.mockResolvedValue({ success: true });

      const command = {
        type: 'PICKUP_ITEM',
        payload: { actorId: 'hero', targetId: 'item-ent-1' },
      };

      const results = await actionEngine.dispatch('room-1', [command]);
      const result = results[0];

      expect(result.success).toBe(true);
      expect(mockInventoryService.pickupItem).toHaveBeenCalledWith('hero', 'item-ent-1');
      // No events for pickup yet in code
      expect(result.events).toEqual([]);
    });

    it('should fail if pickup fails', async () => {
      mockInventoryService.pickupItem.mockResolvedValue({ success: false });
      const command = {
          type: 'PICKUP_ITEM',
           payload: { actorId: 'hero', targetId: 'item-ent-1' },
      };
      const results = await actionEngine.dispatch('room-1', [command]);
      expect(results[0].success).toBe(false);
    });
  });

  describe('THROW_ITEM', () => {
      it('should resolve THROW_ITEM successfully', async () => {
          mockInventoryService.dropItemAt.mockResolvedValue({ success: true });
          
          const targetPos = { x: 15, y: 15, z: 0 };
          const command = {
              type: 'THROW_ITEM',
              payload: { actorId: 'hero', itemComponentId: 'bomb', targetPosition: targetPos },
          };
          
          const results = await actionEngine.dispatch('room-1', [command]);
          const result = results[0];
          
          expect(result.success).toBe(true);
          expect(mockInventoryService.dropItemAt).toHaveBeenCalledWith('hero', 'bomb', targetPos);
          expect(result.events[0].type).toBe('ITEM_DROPPED'); // Thrown uses ItemDropped for now
          expect(result.events[0].payload.position).toEqual(targetPos);
      });

      it('should fail if throw fails', async () => {
          mockInventoryService.dropItemAt.mockResolvedValue({ success: false });
           const command = {
              type: 'THROW_ITEM',
              payload: { actorId: 'hero', itemComponentId: 'bomb', targetPosition: {x:0, y:0, z:0} },
          };
          
          const results = await actionEngine.dispatch('room-1', [command]);
          expect(results[0].success).toBe(false);
      });
  });
});
