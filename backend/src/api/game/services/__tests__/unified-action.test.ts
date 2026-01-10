import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionEngineService } from '../action-engine';
// Local mock
const mockStrapi = {
  log: { info: vi.fn(), error: vi.fn() },
  documents: vi.fn(),
  plugin: vi.fn(() => ({ service: vi.fn() })),
};

// Mock dependencies
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: vi.fn((uid, cfg) => cfg),
  },
}));

// Mock Derivation
vi.mock('../../src/engine/derivation/ActionHydrator', () => ({
  ActionHydrator: {
    hydrateFromEquipment: vi.fn((item) => {
      if (item.name === 'Sword') {
        return [
          {
            id: 'weapon_sword',
            name: 'Sword',
            attack: { bonus: 5 },
            effects: [{ type: 'damage', dice: '1d8', flat: 2 }],
          },
        ];
      }
      return [];
    }),
    hydrateFromSpell: vi.fn((spell) => {
      if (spell.name === 'Fireball') {
        return [
          {
            id: 'spell_fireball',
            name: 'Fireball',
            save: { attribute: 'dex', dc: 15, effect: 'half' },
            effects: [{ type: 'damage', dice: '8d6' }],
          },
        ];
      }
      return [];
    }),
  },
}));

const mockActor = {
  documentId: 'actor-1',
  name: 'Hero',
  stats: { strength: 16, dexterity: 12 },
  room: { documentId: 'room-1', config: {} },
  inventory: [{ isEquipped: true, item: { name: 'Sword', type: 'weapon', equipment_data: {} } }],
  spellbook: [{ spell: { name: 'Fireball', level: 3 } }],
};

const mockTarget = {
  documentId: 'target-1',
  name: 'Goblin',
  stats: { dexterity: 10 },
  armorClass: 12,
  hp: 20,
};

describe('Unified Action System', () => {
  let service: any;
  const gameEventCreateSpy = vi.fn();

  beforeEach(async () => {
    const mod = await import('../action-engine');
    service = mod.default({ strapi: mockStrapi });
    vi.clearAllMocks();
    gameEventCreateSpy.mockClear();

    // Mock Strapi Docs
    mockStrapi.documents = vi.fn((uid) => {
      if (uid === 'api::entity-sheet.entity-sheet') {
        return {
          findOne: vi.fn(async ({ documentId }) => {
            if (documentId === 'actor-1') return mockActor;
            if (documentId === 'target-1') return mockTarget;
            return null;
          }),
          update: vi.fn(),
        };
      }
      if (uid === 'api::game-event.game-event') {
        return { create: gameEventCreateSpy };
      }
      return { findOne: vi.fn() };
    });
  });

  it('should handle melee attack', async () => {
    const command: ActionCommand = {
      type: 'DO_ACTION',
      payload: {
        actorId: 'actor-1',
        actionId: 'weapon_sword',
        targetId: 'target-1',
      },
    };

    const result = await service.handleAction(command);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Hit Goblin'); // Assuming mock RNG hits

    // Check Events
    expect(gameEventCreateSpy).toHaveBeenCalled();
    const calls = gameEventCreateSpy.mock.calls;
    const attackEvent = calls.find((c: any) => c[0].data.type === 'ATTACK_RESULT');
    expect(attackEvent).toBeDefined();
    expect(attackEvent[0].data.payload.actionId).toBe('weapon_sword');
  });

  it('should handle save spell (Fireball)', async () => {
    const command: ActionCommand = {
      type: 'DO_ACTION',
      payload: {
        actorId: 'actor-1',
        actionId: 'spell_fireball',
        targetId: 'target-1',
      },
    };

    const result = await service.handleAction(command);
    if (!result.success) console.error('HandleAction Failed:', result.message);

    expect(result.success).toBe(true);
    // Message depends on save result (RNG mocked?)
    // In actual run, Math.random() is used.

    // Check Events
    const calls = gameEventCreateSpy.mock.calls;

    const rollEvent = calls.find((c: any) => c[0].data.type === 'ROLL_RESULT');
    expect(rollEvent).toBeDefined();
    expect(rollEvent[0].data.payload.rollType).toBe('save');
    expect(rollEvent[0].data.payload.ability).toBe('dex');

    const damageEvent = calls.find((c: any) => c[0].data.type === 'DAMAGE_DEALT');
    expect(damageEvent).toBeDefined();
    expect(damageEvent[0].data.payload.source).toBe('Fireball');
  });
});
