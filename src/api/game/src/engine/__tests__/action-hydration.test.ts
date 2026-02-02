import { describe, it, expect } from 'vitest';
import { deriveActions } from '../derivation/capabilities';
import { DerivationContext } from '../derivation/types';

describe('Action Hydration Logic', () => {
  it('should hydrate a Longsword into a standard melee action', () => {
    const item = {
      id: 'item-1',
      documentId: 'doc-item-1',
      name: 'Longsword',
      damage_dice: '1d8',
      damage_type: { name: 'Slashing' },
      equipment_category: { slug: 'martial-weapon' },
      // Versatile property check
      versatile_damage: '1d10',
      properties: [],
      isEquipped: true,
    };

    const context: DerivationContext = {
      attributes: { strength: 16, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      stats: { strength: 16 }, // Legacy fallback
      proficiencyBonus: 2,
      equipment: [item as any],
      level: 1,
      // Mock other required fields if any
    };

    const actions = deriveActions(context);

    // 1. Should have Main Action + Versatile Variant + Unarmed (optional but likely)
    expect(actions.length).toBeGreaterThanOrEqual(1);

    const swordAction = actions.find((a) => a.id === 'weapon_doc-item-1');
    expect(swordAction).toBeDefined();

    // Attack Bonus: Str (+3) + Prof (+2) = +5
    expect(swordAction?.attack?.bonus).toBe(5);

    // Damage: 1d8 + 3 (Str)
    expect(swordAction?.effects?.[0].dice).toBe('1d8');
    expect(swordAction?.effects?.[0].flat).toBe(3);
    expect(swordAction?.effects?.[0].subtype).toBe('Slashing');

    // Check Versatile
    const versatileAction = actions.find((a) => a.id === 'weapon_doc-item-1_versatile');
    expect(versatileAction).toBeDefined();
    expect(versatileAction?.effects?.[0].dice).toBe('1d10');
  });

  it('should hydrate a Dagger (Finesse) using Dex if Dex > Str', () => {
    const item = {
      id: 'item-2',
      documentId: 'doc-item-2',
      name: 'Dagger',
      damage_dice: '1d4',
      damage_type: { name: 'Piercing' },
      equipment_category: { slug: 'simple-weapon' },
      properties: [{ slug: 'finesse' }],
      isEquipped: true,
    };

    // Dex 18 (+4), Str 10 (+0)
    const context: DerivationContext = {
      attributes: { strength: 10, dexterity: 18, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      stats: { strength: 10, dexterity: 18 },
      proficiencyBonus: 2,
      equipment: [item as any],
      level: 1,
    };

    const actions = deriveActions(context);
    const daggerAction = actions.find((a) => a.id === 'weapon_doc-item-2');

    expect(daggerAction).toBeDefined();
    // Attack Bonus: Dex (+4) + Prof (+2) = +6
    expect(daggerAction?.attack?.bonus).toBe(6);
    // Damage: 1d4 + 4
    expect(daggerAction?.effects?.[0].flat).toBe(4);
  });
});
