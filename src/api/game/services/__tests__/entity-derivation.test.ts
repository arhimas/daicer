import { vi } from 'vitest';
import entityDerivationFactory from '../entity-derivation';

// Mock Strapi
// @ts-expect-error: Mock
global.strapi = {
  documents: vi.fn(),
  service: vi.fn(),
};

describe('Entity Derivation Service', () => {
  // Helper to generate mock sheet
  const mockSheet = {
    documentId: 'sheet-1',
    name: 'Hero',
    type: 'player',
    level: 5, // PB = +3
    stats: {
      strength: 16, // +3
      dexterity: 14, // +2
      constitution: 14, // +2
      intelligence: 10, // +0
      wisdom: 12, // +1
      charisma: 8, // -1
    },
    proficiencies: [
      { slug: 'athletics', name: 'Athletics' },
      { slug: 'save_dexterity', name: 'Dexterity Save' },
    ],
    actions: [
      {
        name: 'Sword',
        type: 'melee',
        attack: { bonus: 5 },
        effects: [{ type: 'damage', dice: '1d6', subtype: 'slashing' }],
      },
    ],
  };

  it('calculates derived values correctly', async () => {
    const updateMock = vi.fn();
    // @ts-expect-error: Mock
    strapi.documents.mockReturnValue({
      findOne: vi.fn().mockResolvedValue(mockSheet),
      update: updateMock,
    });

    const service = entityDerivationFactory({ strapi });
    await service.deriveAndPersist('sheet-1');

    expect(updateMock).toHaveBeenCalled();
    const callArg = updateMock.mock.calls[0][0].data;

    // Verify Skills
    const athletics = callArg.computedSkills.find((s: any) => s.name === 'athletics');
    // STR (+3) + PB (+3) = +6
    expect(athletics.value).toBe(6);
    expect(athletics.proficient).toBe(true);

    const stealth = callArg.computedSkills.find((s: any) => s.name === 'stealth');
    // DEX (+2) + PB (0) = +2
    expect(stealth.value).toBe(2);
    expect(stealth.proficient).toBe(false);

    // Verify Saves
    const dexSave = callArg.computedSaves.find((s: any) => s.stat === 'dexterity');
    // DEX (+2) + PB (+3) = +5
    expect(dexSave.value).toBe(5);

    const strSave = callArg.computedSaves.find((s: any) => s.stat === 'strength');
    // STR (+3) + PB (0) = +3
    expect(strSave.value).toBe(3);

    // Verify Actions
    const sword = callArg.computedActions[0];
    expect(sword.toHit).toBe(5);
    expect(sword.damageDice).toBe('1d6');
  });
});
