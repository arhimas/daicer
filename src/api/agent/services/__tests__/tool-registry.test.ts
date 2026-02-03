/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolRegistryFunc from '@/api/agent/services/tool-registry';

// Mock Strapi
const mockDispatch = vi.fn();
const mockStrapi = {
  service: vi.fn((name: string) => {
    if (name === 'api::game.action-engine') {
      return { dispatch: mockDispatch };
    }
    return {};
  }),
  documents: vi.fn(),
};

describe('Tool Registry Item Actions', () => {
  let registry: any;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = ToolRegistryFunc({ strapi: mockStrapi as any });
  });

  it('should register and dispatch drop_item', async () => {
    expect(registry.hasTool('drop_item')).toBe(true);

    const payload = { entityId: 'actor-1', itemComponentId: 'item-1' };
    await registry.execute('drop_item', 'room-1', payload, {});

    expect(mockDispatch).toHaveBeenCalledWith('room-1', [
      expect.objectContaining({
        type: 'DROP_ITEM',
        payload: { actorId: 'actor-1', itemComponentId: 'item-1' },
      }),
    ]);
  });

  it('should register and dispatch pickup_item', async () => {
    expect(registry.hasTool('pickup_item')).toBe(true);

    const payload = { actorId: 'actor-1', targetId: 'loot-1' };
    await registry.execute('pickup_item', 'room-1', payload, {});

    expect(mockDispatch).toHaveBeenCalledWith('room-1', [
      expect.objectContaining({
        type: 'PICKUP_ITEM',
        payload: { actorId: 'actor-1', targetId: 'loot-1' },
      }),
    ]);
  });

  it('should register and dispatch throw_item', async () => {
    expect(registry.hasTool('throw_item')).toBe(true);

    const payload = {
      actorId: 'actor-1',
      itemComponentId: 'item-1',
      targetEntityId: 'goblin-1',
      targetPosition: { x: 10, y: 10, z: 0 },
    };
    await registry.execute('throw_item', 'room-1', payload, {});

    expect(mockDispatch).toHaveBeenCalledWith('room-1', [
      expect.objectContaining({
        type: 'THROW_ITEM',
        payload: {
          actorId: 'actor-1',
          itemComponentId: 'item-1',
          targetEntityId: 'goblin-1',
          targetPosition: { x: 10, y: 10, z: 0 },
        },
      }),
    ]);
  });
});
