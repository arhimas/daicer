import { vi, describe, it, expect } from 'vitest';
import { getRegistryTools } from '../../src/api/narrator/services/tool-registry';
import { Core } from '@strapi/strapi';

// Mocks for Strapi and dependencies
const mockSpawnMonster = vi.fn(async (_roomId, _monsterId, _pos) => {
  return { id: 'new-sheet-id', name: 'Mock Monster' };
});

const mockStrapi = {
  service: vi.fn((name) => {
    if (name === 'api::game.spawn-service') {
      return {
        spawnMonster: mockSpawnMonster,
        spawnCharacter: vi.fn(),
      };
    }
    if (name === 'api::game-event.game-event') {
      return {
        getGameState: vi.fn().mockResolvedValue({ entities: {} }),
        validateMove: vi.fn(),
        logEvent: vi.fn(),
        inspectTerrain: vi.fn(),
      };
    }
  }),
  documents: vi.fn((uid) => {
    if (uid === 'api::monster.monster') {
      return {
        findMany: vi.fn(async ({ filters }) => {
          if (filters.name.$contains === 'Goblin') {
            return [{ documentId: 'doc-goblin-123', name: 'Goblin' }];
          }
          return [];
        }),
      };
    }
    if (uid === 'api::character.character') {
      return {
        findMany: vi.fn().mockResolvedValue([]),
      };
    }
    if (uid === 'api::room.room') {
      return {
        findOne: vi.fn().mockResolvedValue({ documentId: 'doc-room-123' }),
      };
    }
  }),
};

describe('Narrator Tool Registry Integration', () => {
  const ROOM_DOC_ID = 'doc-room-123';

  it('should register summon_entity tool', () => {
    const tools = getRegistryTools(mockStrapi as unknown as Core.Strapi, ROOM_DOC_ID);
    const summonTool = tools.find((t) => t.name === 'summon_entity');
    expect(summonTool).toBeDefined();
  });

  it('should successfully summon a monster exactly matching name', async () => {
    const tools = getRegistryTools(mockStrapi as unknown as Core.Strapi, ROOM_DOC_ID);
    const summonTool = tools.find((t) => t.name === 'summon_entity');

    if (!summonTool) throw new Error('Tool not found');

    const result = await summonTool.invoke({
      name: 'Goblin',
      x: 10,
      y: 10,
      z: 0,
    });

    expect(result).toContain('Summoned monster "Goblin"');

    // Verify spawnService was called with the ROOM_DOC_ID, NOT the UUID
    expect(mockSpawnMonster).toHaveBeenCalledWith(ROOM_DOC_ID, 'doc-goblin-123', { x: 10, y: 10, z: 0 });
  });

  it('should fail gracefully for non-existent monster', async () => {
    const tools = getRegistryTools(mockStrapi as unknown as Core.Strapi, ROOM_DOC_ID);
    const summonTool = tools.find((t) => t.name === 'summon_entity');

    const result = await summonTool!.invoke({
      name: 'Dragon', // Not in our mock
      x: 0,
      y: 0,
    });

    expect(result).toContain('Could not find any monster or character');
  });
});
