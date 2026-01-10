import createAdapter, { StrapiEntitySheet } from '../entity-adapter';

import { describe, it, expect } from 'vitest';

describe('Integration: Room Entity Adaptation', () => {
  const adapterService = createAdapter();

  const createMockEntity = (id: string, type: 'monster' | 'player'): StrapiEntitySheet => ({
    documentId: id,
    name: `Entity ${id}`,
    type,
    stats: { strength: 10, dexterity: 12 },
    monster: type === 'monster' ? { documentId: `m_${id}`, name: 'Mon', ac: 14, hp: 20 } : undefined,
    character: type === 'player' ? { documentId: 'c1', name: 'Hero' } : undefined,
    currentHp: 20,
    maxHp: 20,
  });

  it('adapts a room of mix entities correctly', () => {
    const rawEntities = [
      createMockEntity('m1', 'monster'),
      createMockEntity('p1', 'player'),
      createMockEntity('m2', 'monster'),
    ];

    const adapted = rawEntities.map((e) => adapterService.adapt(e));

    expect(adapted).toHaveLength(3);
    expect(adapted[0].type).toBe('monster');
    expect(adapted[1].type).toBe('player');
    expect(adapted[1].level).toBe(1);
    expect(adapted[2].armorClass).toBe(14); // From monster blueprint
  });

  // MASSIVE INTEGRATION SIMULATION (100 Entities)
  describe('Massive Room Load', () => {
    const rawEntities: StrapiEntitySheet[] = [];
    for (let i = 0; i < 100; i++) {
      rawEntities.push(createMockEntity(`e_${i}`, i % 5 === 0 ? 'player' : 'monster'));
    }

    it('adapts 100 entities without error', () => {
      const start = Date.now();
      const adapted = rawEntities.map((e) => adapterService.adapt(e));
      const dur = Date.now() - start;

      expect(adapted).toHaveLength(100);
      // Performance sanity check (should be < 50ms for 100 entities logic)
      expect(dur).toBeLessThan(500);
    });

    // Individual Verification Loop
    for (let i = 0; i < 100; i++) {
      it(`verifies entity ${i} integrity`, () => {
        const ent = adapterService.adapt(rawEntities[i]);
        expect(ent.id).toBe(`e_${i}`);
        expect(ent.name).toBe(`Entity e_${i}`);
        expect(ent.maxHp).toBe(20);
        // Check derived
        expect(ent.stats.dexterity).toBe(12);
        expect(ent.stats.initiativeBonus).toBe(1);
      });
    }
  });
});
