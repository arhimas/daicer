import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMutationResolvers } from '@/lifecycle/graphql/mutation-resolvers';
import { mockStrapi, resetMockStrapi } from '@/lifecycle/graphql/__tests__/test-utils/mock-strapi';

describe('E2E: Tactician Flow', () => {
  let resolvers;
  let context;

  beforeEach(() => {
    resetMockStrapi();
    resolvers = getMutationResolvers(mockStrapi);
    context = {
      state: {
        user: { documentId: 'user-1', username: 'Tactician' },
      },
    };

    // Spy on the game service delegate
    mockStrapi.service('api::game.game').generateWorld = vi.fn().mockResolvedValue('Generated Description');
    // Ensure world-generation service is also mocked if accessed directly (though mutation uses game service)
    mockStrapi.service('api::game.world-generation').generateWorld = vi.fn().mockResolvedValue('Generated Description');
  });

  it('should update world config and regenerate preview (Bug Repro)', async () => {
    // 1. Create Room
    const createArgs = {
      data: {
        name: 'My Campaign',
        seed: 'seed-1', // Initial Seed
        theme: 'Fantasy',
      },
    };

    // Create Room returns a promise resolving to the created entity
    const room = await resolvers.createRoom(null, createArgs, context);
    expect(room).toBeDefined();
    expect(room.phase).toBe('lobby');

    // Verify initial world state in DB matches input
    // The createRoom resolver separates world/dm/room fields.
    // We need to fetch the world associated with the room.
    // In our mock DB, 'api::world.world' should have an entry.
    const worlds = mockStrapi.db['api::world.world'];
    const worldId = room.world; // In mock create, relations are usually just IDs
    const world1 = worlds.find((w) => w.documentId === worldId);

    expect(world1).toBeDefined();
    expect(world1.seed).toBe('seed-1');

    // 2. Generate World (First Pass)
    // Should call game service with seed-1
    await resolvers.generateWorld(null, { roomId: room.roomId, language: 'en' }, context);

    expect(mockStrapi.service('api::game.game').generateWorld).toHaveBeenCalledTimes(1);
    const firstCallArgs = mockStrapi.service('api::game.game').generateWorld.mock.calls[0][0]; // settings arg
    expect(firstCallArgs.seed).toBe('seed-1');

    // 3. Update World Config (Simulate checking "Update Params")
    // The frontend likely calls 'updateWorld' directly via Strapi generic mutation OR a custom one.
    // If it's generic, we simulate the DB update.
    // simulate Generic Update:
    mockStrapi.documents('api::world.world').update.mockImplementation(async ({ documentId, data }) => {
      const existing = worlds.find((w) => w.documentId === documentId);
      if (existing) {
        Object.assign(existing, data);
        return existing;
      }
      return null;
    });

    await mockStrapi.documents('api::world.world').update({
      documentId: worldId,
      data: { seed: 'seed-2' },
    });

    // Verify DB updated
    const world2 = worlds.find((w) => w.documentId === worldId);
    expect(world2.seed).toBe('seed-2');

    // 4. Generate World (Second Pass)
    // Should call game service with seed-2
    await resolvers.generateWorld(null, { roomId: room.roomId, language: 'en' }, context);

    expect(mockStrapi.service('api::game.game').generateWorld).toHaveBeenCalledTimes(2);
    const secondCallArgs = mockStrapi.service('api::game.game').generateWorld.mock.calls[1][0]; // settings arg

    // THIS IS THE CRITICAL BUG CHECK
    // If resolver fetches stale data or room.populate didn't pick up the change, this will fail.
    expect(secondCallArgs.seed).toBe('seed-2');
  });

  it('should broadcast room code logic (Placeholder for now)', async () => {
    // Just verifying flow
    expect(true).toBe(true);
  });
});
