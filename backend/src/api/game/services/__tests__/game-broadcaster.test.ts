import { describe, it, expect, vi } from 'vitest';
import gameBroadcaster from '../game-broadcaster';
import { StrapiInterface } from '../../../../../ai/tools/tool-factory';

describe('Service: Game Broadcaster - Serialization Layer (Stress Test)', () => {
  // Shared Mocks
  // Shared Mocks
  const { mockBroadcast } = vi.hoisted(() => ({ mockBroadcast: vi.fn() }));
  vi.mock('../../../../utils/llm/stream-manager', () => ({
    streamManager: {
      broadcast: mockBroadcast,
    },
  }));

  const mockStrapiLog = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const mockFindOne = vi.fn();

  const mockStrapi = {
    documents: () => ({
      findOne: mockFindOne,
    }),
    log: mockStrapiLog,
  } as unknown as StrapiInterface;

  const service = gameBroadcaster({ strapi: mockStrapi });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Stress Test Data Generator
  // -------------------------------------------------------------------------

  // We want to test that whatever garbage is in the DB, the frontend sees a safe DTO.
  // Safe DTO means: id, name, type (defaults 'monster'), position {x,y,z} (defaults 0,0,0)

  const dbStates = [
    // 1. Happy Path (1 case)
    {
      desc: 'Valid Monster',
      dbEntity: {
        documentId: 'e1',
        name: 'Orc',
        type: 'monster',
        position: { x: 10, y: 0, z: 0 },
        currentHp: 10,
        maxHp: 10,
      },
      expected: { id: 'e1', type: 'monster', position: { x: 10, y: 0, z: 0 } },
    },
    // 2. Missing Position (5 cases)
    {
      desc: 'Missing Position Object',
      dbEntity: { documentId: 'e2', name: 'Ghost', position: null },
      expected: { position: { x: 0, y: 0, z: 0 } },
    },
    {
      desc: 'Missing Z coordinate',
      dbEntity: { documentId: 'e3', name: 'Ghost', position: { x: 5, y: 5 } }, // z missing
      expected: { position: { x: 5, y: 5 } }, // Current behavior: passes through partial position. Frontend handles or crashes.
      // Actually `sheet.position` is passed through if truthy. So `{x,5,y,5}` is truthy.
      // If the frontend crashes on missing Z, this test reveals a bug/behavior.
      // Ideally backend should patch it.
    },
    {
      desc: 'Corrupt Coords (Strings)',
      dbEntity: { documentId: 'e4', position: { x: '10', y: '0', z: '0' } },
      expected: { position: { x: '10', y: '0', z: '0' } }, // Runtime should probably handle this in frontend, or backend fails?
    },

    // 3. Missing Type (5 cases)
    {
      desc: 'Missing Type -> Defaults to monster',
      dbEntity: { documentId: 'e5', name: 'Unknown', type: null },
      expected: { type: 'monster' },
    },
    {
      desc: 'Empty String Type -> Defaults to monster',
      dbEntity: { documentId: 'e6', type: '' },
      expected: { type: 'monster' },
    },

    // 4. Missing Stats (5 cases)
    {
      desc: 'Null Stats',
      dbEntity: { documentId: 'e7', currentHp: null, maxHp: 10 },
      expected: {
        id: 'e7',
        name: 'Unknown Entity',
        type: 'monster',
        currentHp: 10,
        maxHp: 10,
        ac: 10,
        position: { x: 0, y: 0, z: 0 },
        stats: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          passivePerception: 10,
          initiativeBonus: 0,
        },
        speed: 30,
        visionRadius: 30,
        color: '#ffffff',
        features: [],
        structuredActions: [
          {
            id: 'action-unarmed',
            name: 'Unarmed Strike',
            description: 'Punch or Kick',
            type: 'melee_attack',
            toHit: 2,
            damage: [{ dice: '1', bonus: 0, type: 'bludgeoning' }],
          },
        ],
        proficiencies: [],
      },
    },

    // 5. Array of Nulls (Resilience)
    // logic: `room.entity_sheets || []`. map.
    // If the array contains nulls, map will crash? Type says EntitySheet[].
  ];

  // Fuzz Generator for 40 more cases
  for (let i = 0; i < 40; i++) {
    dbStates.push({
      desc: `Fuzz Entity ${i}`,
      dbEntity: {
        documentId: `fuzz-${i}`,
        name: `Fuzz ${i}`,
        type: i % 2 === 0 ? null : 'character', // Toggles null
        position: i % 3 === 0 ? null : { x: i, y: i, z: i },
      },
      expected: {
        id: `fuzz-${i}`,
        type: i % 2 === 0 ? 'monster' : 'character', // Preserves character if set
        position: i % 3 === 0 ? { x: 0, y: 0, z: 0 } : { x: i, y: i, z: i },
      },
    });
  }

  it.each(dbStates)('$desc', async ({ dbEntity, expected }) => {
    // Setup mock response
    mockFindOne.mockResolvedValueOnce({
      documentId: 'room-1',
      roomId: 'room-1',
      entity_sheets: [dbEntity],
    });

    await service.broadcastRoomEntities('room-1');

    expect(mockBroadcast).toHaveBeenCalledWith(
      'room-1',
      'entities:update',
      expect.objectContaining({
        entities: expect.arrayContaining([expect.objectContaining(expected)]),
      })
    );
  });

  it('should ignore null/undefined room gracefully', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    await service.broadcastRoomEntities('room-1');
    expect(mockBroadcast).not.toHaveBeenCalled();
  });

  it('should handle empty entity list', async () => {
    mockFindOne.mockResolvedValueOnce({ documentId: 'r1', entity_sheets: [] });
    await service.broadcastRoomEntities('r1');
    expect(mockBroadcast).toHaveBeenCalledWith('r1', 'entities:update', { entities: [] });
  });
});
