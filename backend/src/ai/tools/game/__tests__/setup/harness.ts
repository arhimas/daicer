import { vi } from 'vitest';

export const createMockStrapi = () => {
  const mockRoom = {
    documentId: 'room-1',
    entities: [] as any[],
    entity_sheets: [] as any[], // Persistence layer
    config: {}, // WorldConfig
  };

  const mockStrapi = {
    documents: (uid: string) => ({
      findOne: async (args: any) => {
        if (uid === 'api::room.room') return mockRoom;
        return null;
      },
      findMany: async (args: any) => [],
    }),
    service: (uid: string) => {
      // Game Service Mock
      if (uid === 'api::game.game') {
        return {
          loadGameState: async (roomId: string) => {
            // Adapt sheets to entities
            return {
              room: mockRoom,
              entities: mockRoom.entity_sheets.map((s) => adaptSheetToEntity(s)),
            };
          },
          processAction: async (roomId: string, command: any) => {
            // We spy on ActionDispatcher usually, but this is the service layer
            return { success: true, events: [] };
          },
        };
      }
      // Entity Service
      if (uid === 'api::game.entity-service') {
        return {
          adapt: (sheet: any) => adaptSheetToEntity(sheet),
        };
      }
      return {};
    },
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    io: { to: () => ({ emit: vi.fn() }) },
  };

  return { mockStrapi, mockRoom };
};

// Helper: Entity Adapter Logic (Simplified for Test)
export const adaptSheetToEntity = (sheet: any) => {
  return {
    id: sheet.documentId,
    name: sheet.name,
    position: sheet.position || { x: 0, y: 0, z: 0 },
    hp: sheet.currentHp,
    maxHp: sheet.maxHp,
    stats: sheet.stats,
    speed: sheet.stats?.dexterity ? 30 + (sheet.stats.dexterity - 10) : 30, // Dynamic speed
    sheet: sheet, // Link back
    actions:
      sheet.structuredActions?.map((act: any) => ({
        id: act.id || 'act-1',
        name: act.name,
        type: act.type === 'melee' ? 'melee' : act.type === 'ranged' ? 'ranged' : act.type,
        range: act.range,
        description: act.description,
      })) || [],
  };
};

// Load Extracted Data
import rawData from './extracted-data.json';

const getMonster = (namePartial: string) =>
  rawData.monsters.find((m) => m.name.toLowerCase().includes(namePartial.toLowerCase())) || rawData.monsters[0];

const getChar = (namePartial: string) =>
  rawData.characters.find((c) => c.name.toLowerCase().includes(namePartial.toLowerCase())) || rawData.characters[0];

// Monsters Templates (Mapped to Real Data)
export const MOCK_MONSTERS = [
  {
    ...getMonster('Sprite'), // Weak substitute for Goblin
    documentId: 'mon-goblin',
    name: 'Goblin',
  },
  {
    ...getMonster('Orc'),
    documentId: 'mon-orc',
    name: 'Orc',
  },
  {
    ...getMonster('Rakshasa'), // Caster substitute for Lich
    documentId: 'mon-lich',
    name: 'Lich',
  },
  {
    ...getMonster('Ogre Zombie'), // Substitute for Cube (big, tough)
    documentId: 'mon-cube',
    name: 'Gelatinous Cube',
  },
  {
    ...getMonster('Adult Black Dragon'),
    documentId: 'mon-dragon',
    name: 'Red Dragon',
  },
  {
    ...getMonster('Giant Rat'), // Substitute for Kobold
    documentId: 'mon-kobold',
    name: 'Kobold',
  },
].map((m) => ({
  ...m,
  stats: m.stats || { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  structuredActions: m.structuredActions || [],
})); // Ensure stats structure

// Character Templates
export const MOCK_CHARACTERS = [
  {
    ...getChar('Fighter'),
    documentId: 'char-fighter',
    name: 'Fighter',
  },
  {
    ...getChar('Wizard'),
    documentId: 'char-wizard',
    name: 'Wizard',
  },
  {
    ...getChar('Rogue'),
    documentId: 'char-rogue',
    name: 'Rogue',
  },
  {
    ...getChar('Cleric'),
    documentId: 'char-cleric',
    name: 'Cleric',
  },
  {
    ...getChar('Barbarian'),
    documentId: 'char-barb',
    name: 'Barbarian',
  },
  {
    ...getChar('Ranger'),
    documentId: 'char-ranger',
    name: 'Ranger',
  },
].map((c) => {
  const char = c as any;
  return {
    ...char,
    hp: char.hp || 10,
    stats: char.stats || { strength: 10, dexterity: 10 },
    structuredActions:
      char.structuredActions && char.structuredActions.length > 0
        ? char.structuredActions
        : [{ id: 'act-default', name: 'Unarmed Strike', type: 'melee', range: 5, description: 'Basic attack' }],
  };
});
