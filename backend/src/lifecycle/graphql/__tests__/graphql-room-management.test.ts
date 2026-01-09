import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMutationResolvers } from '../mutation-resolvers';

import { StrapiInterface } from '../../../ai/tools/tool-factory';

// Mock Strapi
const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockUpdate = vi.fn();

const mockStrapi = {
  documents: (_uid: string) => ({
    create: mockCreate,
    findMany: mockFindMany,
    update: mockUpdate,
  }),
  service: vi.fn(),
  log: {
    info: vi.fn(),
    error: vi.fn(),
  },
};

const resolvers = getMutationResolvers(mockStrapi as unknown as StrapiInterface);

describe('GraphQL Mutation: Room Management', () => {
  const mockUser = { documentId: 'user-1', username: 'TestUser', id: 1 };
  const mockContext = { state: { user: mockUser } };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockCreate.mockResolvedValue({ documentId: 'new-doc-1' });
    mockFindMany.mockResolvedValue([]);
    mockUpdate.mockResolvedValue({ documentId: 'updated-doc-1' });
  });

  describe('createRoom', () => {
    it('should throw if user is not logged in', async () => {
      await expect(resolvers.createRoom({}, { data: {} }, { state: {} })).rejects.toThrow('You must be logged in');
    });

    it('should correctly separate World fields', async () => {
      const inputData = {
        name: 'My Room',
        seed: 'abc-123',
        fogRadius: 10,
        description: 'Room Desc', // Should stay in room or unused? The logic deletes world/dm fields. Room keeps rest.
      };

      await resolvers.createRoom(null, { data: inputData }, mockContext);

      // check room create
      const lastCallData = mockCreate.mock.calls[2][0].data;
      expect(lastCallData.name).toBe('My Room');
      expect(lastCallData).not.toHaveProperty('seed');
      expect(lastCallData).not.toHaveProperty('fogRadius');
    });

    it('should correctly separate DM fields', async () => {
      const inputData = {
        difficulty: 'Hard',
        dmStyle: 'Gritty',
        name: 'Room 2',
      };

      await resolvers.createRoom(null, { data: inputData }, mockContext);

      // Check DM Setting Create
      // DM fields are called second usually?
      // Order: World -> DM -> Room
      // const calls = mockCreate.mock.calls;
      // Call 0: World
      // Call 1: DM (Logic: create 'api::dm-setting.dm-setting')
      // Call 2: Room

      // Find the DM Setting call (can't rely on strict order if async/parallel changed later, but checking args)
      // Actually code awaits sequentially.

      // DM creation call check
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            difficulty: 'Hard',
            dmStyle: 'Gritty',
          }),
        })
      );
    });

    it('should handle settings object nesting', async () => {
      // Logic: if (data.settings) extract(settings); delete roomData.settings
      const inputData = {
        settings: {
          fogRadius: 55,
          difficulty: 'Easy',
        },
      };

      await resolvers.createRoom(null, { data: inputData }, mockContext);

      // World gets fogRadius
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ fogRadius: 55 }),
        })
      );

      // DM gets difficulty
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ difficulty: 'Easy' }),
        })
      );

      // Room does NOT have settings
      const roomCall = mockCreate.mock.calls.find((c) => c[0].status === 'published' && c[0].data.players);
      expect(roomCall[0].data.settings).toBeUndefined();
    });

    it('should initialize player list with owner', async () => {
      await resolvers.createRoom(null, { data: {} }, mockContext);

      const roomCall = mockCreate.mock.calls.find((c) => c[0].data.players);
      expect(roomCall[0].data.players).toHaveLength(1);
      expect(roomCall[0].data.players[0]).toMatchObject({
        user: 'user-1',
        name: 'TestUser',
        isOnline: true,
      });
    });

    // Parameterized Field Distribution Test
    const fieldMappingCases = [
      { field: 'seed', target: 'world' },
      { field: 'seaLevel', target: 'world' },
      { field: 'moistureScale', target: 'world' },
      { field: 'structureChance', target: 'world' },
      { field: 'difficulty', target: 'dm' },
      { field: 'tone', target: 'dm' },
      { field: 'dmSystemPrompt', target: 'dm' },
      { field: 'customField', target: 'room' }, // Unknown fields go to room
    ];

    it.each(fieldMappingCases)('should map $field to $target', async ({ field, target }) => {
      const val = 'test-val';
      await resolvers.createRoom(null, { data: { [field]: val } }, mockContext);

      if (target === 'world') {
        // Check first call (World)
        expect(mockCreate.mock.calls[0][0].data[field]).toBe(val);
        // Verify not in room (last call)
        expect(mockCreate.mock.calls[2][0].data[field]).toBeUndefined();
      } else if (target === 'dm') {
        // Check second call (DM)
        expect(mockCreate.mock.calls[1][0].data[field]).toBe(val);
        expect(mockCreate.mock.calls[2][0].data[field]).toBeUndefined();
      } else {
        // Room
        expect(mockCreate.mock.calls[2][0].data[field]).toBe(val);
      }
    });
  });

  describe('joinRoom', () => {
    it('should throw if no user', async () => {
      await expect(resolvers.joinRoom({}, { code: '123' }, { state: {} })).rejects.toThrow('You must be logged in');
    });

    it('should throw if room not found', async () => {
      mockFindMany.mockResolvedValue([]);
      await expect(resolvers.joinRoom({}, { code: 'bad-code' }, mockContext)).rejects.toThrow('Room not found');
    });

    it('should return room directly if user already joined', async () => {
      mockFindMany.mockResolvedValue([
        {
          documentId: 'r1',
          players: [{ user: { documentId: 'user-1' } }],
        },
      ]);

      const res = await resolvers.joinRoom({}, { code: 'r1' }, mockContext);
      expect(res.documentId).toBe('r1');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return room if user joined by ID (fallback)', async () => {
      mockFindMany.mockResolvedValue([
        {
          documentId: 'r1',
          players: [{ user: { id: 1 } }], // matches mockUser.id
        },
      ]);

      const res = await resolvers.joinRoom({}, { code: 'r1' }, mockContext);
      expect(res.documentId).toBe('r1');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should add user to players list if not joined', async () => {
      const existingPlayer = { user: { documentId: 'other' } };
      mockFindMany.mockResolvedValue([
        {
          documentId: 'r1',
          players: [existingPlayer],
        },
      ]);
      mockUpdate.mockResolvedValue({ documentId: 'r1-updated' });

      const res = await resolvers.joinRoom({}, { code: 'r1' }, mockContext);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'r1',
          data: expect.objectContaining({
            players: expect.arrayContaining([
              existingPlayer,
              expect.objectContaining({ user: 'user-1', name: 'TestUser' }),
            ]),
          }),
        })
      );
      expect(res.documentId).toBe('r1-updated');
    });

    // Parameterized join scenarios (20 cases)
    // Fuzzing valid codes
    const codes = Array.from({ length: 15 }, (_, i) => `room-${i}`);
    it.each(codes)('should join valid room code %s', async (code) => {
      mockFindMany.mockResolvedValue([{ documentId: 'r1', players: [] }]);
      await resolvers.joinRoom({}, { code }, mockContext);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: [{ roomId: code }, { code: code }],
          }),
        })
      );
    });
  });
});
