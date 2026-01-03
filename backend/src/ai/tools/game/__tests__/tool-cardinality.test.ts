import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performActionTool } from '../perform-action';
import { summonMonsterTool } from '../summon-monster';
import { summonCharacterTool } from '../summon-character';
import { StrapiContext } from '../tool-factory';
import { Strapi } from '@strapi/strapi';

// --- Mocks ---
const mockDispatch = vi.fn();
// Mock ActionDispatcher class
vi.mock('@daicer/engine', async (importOriginal) => {
  const actual = await importOriginal();
  // @ts-expect-error Mocking readonly property or mismatched signature
  return {
    ...actual,
    ActionDispatcher: vi.fn().mockImplementation(function () {
      return { dispatch: mockDispatch };
    }),
    EntityDeriver: {
      derive: vi.fn(() => ({ hp: 10, maxHp: 10 })),
    },
  };
});

const mockStrapi = {
  documents: vi.fn(() => ({
    findOne: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  })),
  service: vi.fn(),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};

const mockContext: StrapiContext = {
  strapi: mockStrapi as unknown as Strapi,
  roomDocumentId: 'room-1',
};

// --- Massive Test Data Generation ---

const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const actionTypes = ['SKILL_CHECK', 'ROLL_SAVE'];

const attributeTests = actionTypes.flatMap((type) =>
  attributes.flatMap((attr) => [
    {
      name: `${type} with attribute '${attr}'`,
      input: { commandType: type, payload: JSON.stringify({ actorId: 'hero', attribute: attr }) },
      expectedPayload: { actorId: 'hero', attribute: attr },
      success: true,
    },
    {
      name: `${type} normalization '${attr}' (from skill/stat)`,
      input: {
        commandType: type,
        payload: JSON.stringify({ actorId: 'hero', [type === 'SKILL_CHECK' ? 'skill' : 'stat']: attr }),
      },
      expectedPayload: { actorId: 'hero', attribute: attr },
      success: true,
    },
  ])
); // 2 * 6 * 2 = 24 tests

const combatActions = [
  { type: 'ATTACK', target: 'orc', weapon: 'sword', spell: undefined, item: undefined, action: undefined },
  { type: 'ATTACK', target: 'goblin', weapon: 'bow', spell: undefined, item: undefined, action: undefined },
  { type: 'CAST_SPELL', target: 'orc', spell: 'fireball', weapon: undefined, item: undefined, action: undefined },
  { type: 'CAST_SPELL', target: 'self', spell: 'heal', weapon: undefined, item: undefined, action: undefined },
  { type: 'USE_ITEM', target: 'self', item: 'potion', weapon: undefined, spell: undefined, action: undefined },
  { type: 'EQUIP', target: 'self', item: 'shield', weapon: undefined, spell: undefined, action: undefined },
  { type: 'UNEQUIP', target: 'self', item: 'shield', weapon: undefined, spell: undefined, action: undefined },
  {
    type: 'INTERACT',
    target: 'chest',
    interactId: 'open',
    weapon: undefined,
    spell: undefined,
    item: undefined,
    action: 'open',
  }, // interactId maps to action? Payload logic checks this.
  { type: 'MODIFY_TERRAIN', target: 'wall', action: 'destroy', weapon: undefined, spell: undefined, item: undefined },
].flatMap((a) => [
  {
    name: `${a.type} acting on ${a.target} with ${a.weapon || a.spell || a.item || a.action}`,
    input: {
      commandType: a.type,
      payload: JSON.stringify({ actorId: 'hero', targetId: a.target, itemId: a.item, spellId: a.spell }),
    },
    expectedPayload: { actorId: 'hero', targetId: a.target },
    success: true,
  },
  {
    name: `${a.type} Agent Alias check (attackerId/casterId)`,
    input: {
      commandType: a.type,
      payload: JSON.stringify({ [a.type === 'CAST_SPELL' ? 'casterId' : 'attackerId']: 'hero', targetId: a.target }),
    },
    expectedPayload: { actorId: 'hero' },
    success: true,
  },
]); // 9 * 2 = 18 tests

const invalidJsonTests = Array.from({ length: 10 }, (_, i) => ({
  name: `Invalid JSON Case #${i}`,
  input: { commandType: 'ATTACK', payload: `{ "key": "val" ${i} }` }, // Syntax error
  error: 'Invalid JSON payload',
})); // 10 tests

const summonMonsters = Array.from({ length: 25 }, (_, i) => ({
  type: 'monster',
  id: `mon-${i}`,
  name: `Monster ${i}`,
})); // 25 tests

const summonChars = Array.from({ length: 25 }, (_, i) => ({
  type: 'character',
  id: `char-${i}`,
  name: `Character ${i}`,
})); // 25 tests

// Merge all Action Tests
const allActionTests = [...attributeTests, ...combatActions, ...invalidJsonTests];

describe('SOTA Tool Cardinality Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockReturnValue({ success: true, events: [], message: 'OK' });

    (mockStrapi.documents as unknown as vi.Mock).mockReturnValue({
      findOne: vi.fn().mockResolvedValue({
        documentId: 'room-1',
        entity_sheets: [],
      }),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ documentId: 'new-1', name: 'Spawned' }),
    }); // Keeping strict on strapi mocks is hard due to complex types, might need specific cast

    mockStrapi.service.mockReturnValue({
      spawnMonster: vi.fn().mockResolvedValue({ documentId: 'spawned-m', name: 'Monster' }),
      spawnCharacter: vi.fn().mockResolvedValue({ documentId: 'spawned-c', name: 'Char' }),
    });
  });

  describe('Perform Action Permutations (Attributes, Combat, Aliases)', () => {
    it.each(allActionTests)('$name', async ({ input, expectedPayload, error }) => {
      const tool = performActionTool(mockContext);
      // Explicit cast to satisfy tool.func signature
      const resultString = await tool.func(input as { commandType: string; payload: string }, mockContext);
      const result = JSON.parse(resultString as string);

      if (error) {
        expect(result.success).toBe(false);
        expect(result.message).toContain(error);
      } else {
        expect(result.success).toBe(true);
        expect(mockDispatch).toHaveBeenCalled();
        const command = mockDispatch.mock.calls[0][1];
        expect(command.payload).toEqual(expect.objectContaining(expectedPayload));
        expect(command.type).toBe(input.commandType);
      }
    });
  });

  describe('Summoning Permutations (High Volume)', () => {
    it.each([...summonMonsters, ...summonChars])('should summon $type $name', async ({ type, id }) => {
      const spawnMock = type === 'monster' ? mockStrapi.service().spawnMonster : mockStrapi.service().spawnCharacter;

      spawnMock.mockResolvedValue({ documentId: `spawned-${id}`, name: id });

      let tool;
      let input;
      if (type === 'monster') {
        tool = summonMonsterTool(mockContext);
        input = { monsterId: id, x: 0, y: 0, z: 0, amount: 1 };
      } else {
        tool = summonCharacterTool(mockContext);
        input = { characterId: id, x: 0, y: 0, z: 0, ownerId: 'u1' };
      }

      await tool.func(input as Record<string, unknown>, mockContext);
      expect(spawnMock).toHaveBeenCalled();
    });
  });
});
