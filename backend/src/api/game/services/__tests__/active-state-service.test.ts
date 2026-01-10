import { describe, it, expect, vi, beforeEach } from 'vitest';
import activeStateServiceFactory from '../active-state-service';

// Mock Dependencies
const mockFindOne = vi.fn();
const mockUpdate = vi.fn();
const mockCreate = vi.fn();
const mockAdapt = vi.fn();
const mockDbFindOne = vi.fn();

const globalStrapi = {
  entityService: {
    findOne: mockFindOne,
    update: mockUpdate,
    create: mockCreate,
  },
  contentType: vi.fn().mockReturnValue({ attributes: {} }),
  service: (name: string) => {
    if (name === 'api::game.entity-adapter') return { adapt: mockAdapt };
    return {};
  },
  db: {
    query: () => ({ findOne: mockDbFindOne }),
  },
} as any;

describe('ActiveStateService', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = activeStateServiceFactory({ strapi: globalStrapi });
  });

  it('should derive and persist a new active state', async () => {
    // Setup Inputs
    const sheetId = 'sheet-123';
    const mockSheet = { id: sheetId, name: 'Hero', check: 'exists' };
    mockFindOne.mockResolvedValue(mockSheet);
    mockDbFindOne.mockResolvedValue(null); // No existing active state

    // Mock EntityAdapter Output
    mockAdapt.mockReturnValue({
      id: sheetId,
      level: 5,
      hp: 40,
      maxHp: 50,
      armorClass: 16,
      speed: { walk: 30 },
      stats: {
        strength: 18, // Mod +4
        dexterity: 14, // Mod +2
        wisdom: 10, // Mod 0
        initiativeBonus: 2,
        passivePerception: 10,
      },
      actions: [
        {
          name: 'Sword',
          attack: { bonus: 7 },
          range: { type: 'melee', value: 5 },
          effects: [{ type: 'damage', dice: '1d8', subtype: 'slashing' }],
        },
      ],
      resistances: ['fire'],
      immunities: [],
      vulnerabilities: [],
    });

    // Execute
    await service.deriveAndPersist(sheetId);

    // Assertions
    expect(mockFindOne).toHaveBeenCalledWith('api::entity-sheet.entity-sheet', sheetId, expect.any(Object));
    expect(mockAdapt).toHaveBeenCalledWith(mockSheet);

    // Check Payload passed to Create
    const createCall = mockCreate.mock.calls[0];
    const payload = createCall[1].data;

    expect(payload.sheet).toBe(sheetId);
    expect(payload.level).toBe(5);
    expect(payload.computedArmorClass).toBeUndefined(); // We changed schema key to just armorClass
    expect(payload.armorClass).toBe(16);
    expect(payload.attributes.strength).toBe(18);

    // Verify Skill Calculation (Athletics = Str Mod +4 + PB +3 (level 5) ? Assuming not proficient unless mocked)
    // In our manual logic, we didn't mock proficiencies in sheet nicely, let's assume raw check:
    // Str 18 (+4). PB 3. Athletics = 4.
    expect(payload.skills.athletics).toBe(4);

    // Action Mapping
    expect(payload.computedActions).toHaveLength(1);
    expect(payload.computedActions[0].toHit).toBe(7);
    expect(payload.computedActions[0].damageDice).toBe('1d8');
  });
});
