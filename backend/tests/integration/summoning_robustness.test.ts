import { vi, describe, it, expect } from 'vitest';
import { getRegistryTools } from '../../src/api/narrator/services/tool-registry';
import { z } from 'zod';
import { Core } from '@strapi/strapi';

// Mocks for Strapi and dependencies
const mockSpawnMonster = vi.fn(async (_roomId, _monsterId, _pos) => {
  return { documentId: 'new-sheet-id', name: 'Mock Monster' }; // Updated to return a shape matching expectations if needed
});

const mockStrapi = {
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
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
    if (name === 'api::game.game-broadcaster') {
      return {
        broadcastRoomEntities: vi.fn(),
      };
    }
    if (name === 'api::agent.tool-registry') {
      return {
        getTools: vi.fn().mockReturnValue([
          {
            name: 'summon_monster',
            description: 'Summons a monster',
            schema: z.object({
              templateId: z.string(),
              x: z.number(),
              y: z.number(),
              z: z.number(),
            }),
            handler: async (roomId, args, _user) => {
              // Mock handler logic duplicating what real tool would do
              // Logic: check valid ID via doc service, then call spawnMonster
              // To simulate failure:
              if (args.templateId === 'doc-non-existent')
                throw new Error(`Monster template with ID "${args.templateId}" not found`);

              await mockStrapi
                .service('api::game.spawn-service')
                .spawnMonster(roomId, args.templateId, { x: args.x, y: args.y, z: args.z });
              return `Successfully summoned "Mock Monster"`;
            },
          },
        ]),
        registerTool: vi.fn(),
      };
    }
    return null;
  }),
  documents: vi.fn((uid) => {
    if (uid === 'api::monster.monster') {
      return {
        findOne: vi.fn(async ({ documentId }) => {
          if (documentId === 'doc-goblin-123') {
            return { documentId: 'doc-goblin-123', name: 'Goblin' };
          }
          return null;
        }),
        findMany: vi.fn(async ({ filters }) => {
          if (filters.name && filters.name.$contains === 'Goblin') {
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
    return null;
  }),
};

describe('Narrator Tool Registry Integration', () => {
  const ROOM_DOC_ID = 'doc-room-123';

  it('should register summon_monster tool', () => {
    const tools = getRegistryTools(mockStrapi as unknown as Core.Strapi, ROOM_DOC_ID);
    const summonTool = tools.find((t) => t.name === 'summon_monster');
    expect(summonTool).toBeDefined();
  });

  it('should successfully summon a monster by Template ID', async () => {
    const tools = getRegistryTools(mockStrapi as unknown as Core.Strapi, ROOM_DOC_ID);
    const summonTool = tools.find((t) => t.name === 'summon_monster');

    if (!summonTool) throw new Error('Tool not found');

    const result = await summonTool.invoke({
      templateId: 'doc-goblin-123',
      x: 10,
      y: 10,
      z: 0,
    });

    // Expect success message
    expect(result).toContain('Successfully summoned "Mock Monster"');

    // Verify spawnService was called with the ROOM_DOC_ID and Template ID
    expect(mockSpawnMonster).toHaveBeenCalledWith(ROOM_DOC_ID, 'doc-goblin-123', { x: 10, y: 10, z: 0 });
  });

  it('should fail gracefully for non-existent monster ID', async () => {
    const tools = getRegistryTools(mockStrapi as unknown as Core.Strapi, ROOM_DOC_ID);
    const summonTool = tools.find((t) => t.name === 'summon_monster');

    const result = await summonTool!.invoke({
      templateId: 'doc-non-existent',
      x: 0,
      y: 0,
      z: 0,
    });

    expect(result).toContain('Error: Monster template with ID "doc-non-existent" not found');
  });
});
