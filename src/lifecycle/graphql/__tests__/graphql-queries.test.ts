import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerGraphQLExtension } from '../resolvers';

// Helper to extract resolvers from the extension registration
const extractResolvers = (mockStrapi: unknown) => {
  let capturedResolvers: any = {};
  const use = vi.fn((config) => {
    capturedResolvers = config.resolvers;
  });

  (mockStrapi as any).plugin = () => ({ service: () => ({ use }) });
  registerGraphQLExtension(mockStrapi);
  return capturedResolvers;
};

describe('GraphQL Queries & Resolvers', () => {
  // We need distinct mocks for different content types now
  const mockEntityFindMany = vi.fn();
  const mockItemFindMany = vi.fn();

  // Default fallback
  const defaultMockFindMany = vi.fn();

  const mockStrapi = {
    documents: (uid: string) => {
      if (uid === 'api::entity.entity') return { findMany: mockEntityFindMany };
      if (uid === 'api::item.item') return { findMany: mockItemFindMany };
      return { findMany: defaultMockFindMany };
    },
    plugin: vi.fn(),
    log: { info: vi.fn(), error: vi.fn() },
    service: vi.fn((uid) => {
      if (uid === 'api::agent.tool-registry') {
        return {
          getTools: () => [], // Return empty tools list for testing
        };
      }
      return { use: vi.fn() };
    }),
  };

  let resolvers: any;

  beforeEach(() => {
    vi.clearAllMocks();
    resolvers = extractResolvers(mockStrapi);
    // Reset implementations
    mockEntityFindMany.mockResolvedValue([]);
    mockItemFindMany.mockResolvedValue([]);
    defaultMockFindMany.mockResolvedValue([]);
  });

  describe('Query: searchEntities', () => {
    const search = async (query: string) => {
      if (!resolvers || !resolvers.Query) {
        console.error('Resolvers not captured:', resolvers);
        throw new Error('Resolvers extraction failed');
      }
      return resolvers.Query.searchEntities(null, { query }, {});
    };

    it('should return empty if query < 2 chars', async () => {
      expect(await search('a')).toEqual([]);
      expect(mockEntityFindMany).not.toHaveBeenCalled();
    });

    it('should search both monsters and characters (players) for normal query', async () => {
      mockEntityFindMany.mockResolvedValue([
        { documentId: 'm1', name: 'Goblin', type: 'monster' },
        { documentId: 'c1', name: 'Hero', type: 'player' },
      ]);
      mockItemFindMany.mockResolvedValue([{ documentId: 'i1', name: 'Sword', type: 'weapon' }]);

      const res = await search('goblin');

      expect(res).toHaveLength(3);
      expect(res).toContainEqual({ id: 'm1', name: 'Goblin', type: 'monster' });
      expect(res).toContainEqual({ id: 'c1', name: 'Hero', type: 'player' }); // Mapped type
      expect(res).toContainEqual({ id: 'i1', name: 'Sword', type: 'item', subtype: 'weapon' });

      // Verify filters
      expect(mockEntityFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: expect.arrayContaining([{ name: { $contains: 'goblin' } }]),
          }),
        })
      );
    });

    it('should list all monsters when query is "monsters"', async () => {
      mockEntityFindMany.mockResolvedValue([{ documentId: 'm1', name: 'M1', type: 'monster' }]);

      const res = await search('monsters');
      expect(res).toBeDefined();

      // Check calls. Should see 1 call to entity findMany with monster filter
      expect(mockEntityFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: expect.arrayContaining([{ type: 'monster' }]),
          }),
        })
      );
    });

    it('should list all characters when query is "characters"', async () => {
      mockEntityFindMany.mockResolvedValue([{ documentId: 'c1', name: 'C1', type: 'player' }]);

      await search('characters');

      expect(mockEntityFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: expect.arrayContaining([{ type: 'player' }]),
          }),
        })
      );
    });
  });

  describe('Static Resolvers', () => {
    it('should resolve abilities', () => {
      const res = resolvers.Query.abilities();
      expect(res).toHaveLength(6);
      expect(res[0]).toHaveProperty('id', 'str');
    });

    it('should resolve skills', () => {
      const res = resolvers.Query.skills();
      expect(res).toBeInstanceOf(Array);
      expect(res.length).toBeGreaterThan(0);
    });

    it('should resolve alignments', () => {
      const res = resolvers.Query.alignments();
      expect(res).toHaveLength(9);
    });

    it('should resolve backgrounds', () => {
      const res = resolvers.Query.backgrounds();
      expect(res).toHaveLength(2);
    });

    it('should resolve conditions', () => {
      const res = resolvers.Query.conditions();
      expect(res).toHaveLength(1);
    });
  });

  describe('Room.messages', () => {
    // Use dynamic lookups to avoid "undefined" error at compile time if structure differs
    const resolveMessages = async (p: unknown, a: unknown, c: unknown) => resolvers.Room.messages(p, a, c);

    it('should filter by room and recipient', async () => {
      const context = { state: { user: { documentId: 'u1' } } };
      await resolveMessages({ documentId: 'r1' }, {}, context);

      expect(defaultMockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            room: { documentId: 'r1' },
            $or: [{ recipient: { $null: true } }, { recipient: { documentId: 'u1' } }],
          }),
        })
      );
    });

    it('should only show public messages if no user', async () => {
      const context = { state: { user: null } };
      await resolveMessages({ documentId: 'r1' }, {}, context);

      expect(defaultMockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: [{ recipient: { $null: true } }],
          }),
        })
      );
    });
  });

  describe('Room.turns', () => {
    const resolveTurns = async (p: unknown, a: unknown) => resolvers.Room.turns(p, a);

    it('should fetch recent turns', async () => {
      await resolveTurns({ documentId: 'r1' }, {});
      expect(defaultMockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { room: { documentId: 'r1' } },
          limit: 5,
          sort: 'turnNumber:desc',
        })
      );
    });
  });
});
