import { resolveActions } from '../entity-adapter';

describe('Action Computation Logic', () => {
  const baseStats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    passivePerception: 10,
    initiativeBonus: 0,
  };

  describe('Field Preservation', () => {
    it('preserves complex damage objects', () => {
      const complexDamage = [
        { dice: '2d6', type: 'fire', bonus: 2 },
        { dice: '1d4', type: 'radiant' },
      ];
      const sheet = {
        actions: [
          {
            documentId: 'a1',
            name: 'Fire Strike',
            damage: complexDamage,
          },
        ],
      } as any;

      const res = resolveActions(sheet, baseStats);
      expect(res[0].damage).toEqual(complexDamage);
    });

    it('preserves save configuration', () => {
      const save = { type: 'dexterity', dc: 15, onSave: 'half' };
      const sheet = {
        actions: [{ documentId: 'a2', name: 'Trap', save }],
      } as any;

      const res = resolveActions(sheet, baseStats);
      expect(res[0].save).toEqual(save);
    });

    // 50 Iterations of random complex data integrity checks
    for (let i = 0; i < 50; i++) {
      it(`preserves integrity of random object structure ${i}`, () => {
        const randomData = { index: i, meta: { deep: true, val: i * 2 } };
        const sheet = {
          actions: [{ documentId: `rnd${i}`, name: 'Rnd', damage: randomData }],
        } as any;
        const res = resolveActions(sheet, baseStats);
        expect(res[0].damage).toEqual(randomData);
      });
    }
  });

  describe('Unarmed Logic Scaling', () => {
    // 50 Tests for Unarmed scaling
    for (let i = 0; i < 50; i++) {
      const str = i; // 0 to 49
      const mod = Math.floor((str - 10) / 2);
      it(`calculates unarmed for Strength ${str} (Mod ${mod})`, () => {
        const stats = { ...baseStats, strength: str };
        const res = resolveActions({} as any, stats);
        // Default 2 prof + mod
        expect(res[0].toHit).toBe(2 + mod);
        expect(res[0].damage?.[0].bonus).toBe(mod);
      });
    }
  });
});
