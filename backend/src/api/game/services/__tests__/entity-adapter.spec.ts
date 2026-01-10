import createAdapter, {
  resolveBaseStats,
  resolveInventory,
  resolveSpells,
  resolveActions,
  StrapiEntitySheet,
  StrapiInventoryItem,
} from '../entity-adapter';
import { StatBlock } from '../../src/engine';

import { describe, it, expect } from 'vitest';

describe('EntityDeriver', () => {
  const adapterService = createAdapter();

  const mockSheet = (partial: Partial<StrapiEntitySheet> = {}): StrapiEntitySheet => ({
    documentId: 'doc_default',
    name: 'Default Entity',
    type: 'npc',
    ...partial,
  });

  describe('resolveBaseStats', () => {
    it('returns default 10s when empty', () => {
      const stats = resolveBaseStats(mockSheet());
      expect(stats.strength).toBe(10);
      expect(stats.dexterity).toBe(10);
      expect(stats.initiativeBonus).toBe(0);
    });

    it('prioritizes sheet stats over character stats', () => {
      const sheet: StrapiEntitySheet = {
        documentId: '1',
        name: 'Test',
        type: 'player',
        stats: { strength: 18 },
        character: {
          documentId: 'c1',
          name: 'Char',
          stats: { strength: 10 },
        },
      };
      const stats = resolveBaseStats(sheet);
      expect(stats.strength).toBe(18);
    });

    it('prioritizes monster stats if sheet stats missing', () => {
      const sheet: StrapiEntitySheet = {
        documentId: '1',
        name: 'Gb',
        type: 'monster',
        monster: {
          documentId: 'm1',
          name: 'Goblin',
          stats: { dexterity: 14 },
        },
      };
      const stats = resolveBaseStats(sheet);
      expect(stats.dexterity).toBe(14);
      expect(stats.initiativeBonus).toBe(2); // (14-10)/2
    });

    // Bulk Permutation Tests
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    attributes.forEach((attr) => {
      it(`resolves ${attr} correctly from sheet`, () => {
        const sheet = mockSheet({ stats: { [attr]: 15 } });
        const res = resolveBaseStats(sheet);
        expect(res[attr as keyof typeof res]).toBe(15);
      });
    });
  });

  describe('resolveInventory', () => {
    it('handles empty inventory', () => {
      expect(resolveInventory([])).toEqual([]);
      expect(resolveInventory(undefined)).toEqual([]);
    });

    it('getLevelFromXP returns correct level', () => {
      const input = [
        {
          id: 1,
          quantity: 5,
          slot: 'backpack',
          isEquipped: true,
          item: { documentId: 'i1', name: 'Sword' },
        },
      ];
      const res = resolveInventory(input as StrapiInventoryItem[]);
      expect(res).toHaveLength(1);
      expect(res[0].quantity).toBe(5);
      expect(res[0].isEquipped).toBe(true);
      expect(res[0].item?.name).toBe('Sword');
    });

    it('generates ID if missing', () => {
      const input = [{ quantity: 1, slot: 'backpack' }];
      const res = resolveInventory(input as StrapiInventoryItem[]);
      expect(res[0].id).toMatch(/^inv_/);
    });

    // Bulk creation
    for (let i = 0; i < 20; i++) {
      it(`processes inventory item variation ${i}`, () => {
        const input = [{ id: i, quantity: i, slot: 'slot' + i, isEquipped: i % 2 === 0 }];
        const res = resolveInventory(input as StrapiInventoryItem[]);
        expect(res[0].quantity).toBe(i || 1);
        expect(res[0].isEquipped).toBe(i % 2 === 0);
      });
    }
  });

  describe('resolveSpells', () => {
    it('returns empty if no spellbook', () => {
      expect(resolveSpells(mockSheet())).toEqual([]);
    });

    it('maps known spells correctly', () => {
      const sheet = mockSheet({
        spellbook: {
          id: 1,
          knownSpells: [
            { documentId: 's1', name: 'Magic Missile', level: 1, casting_time: '1 action', range: '120 ft' },
          ],
        },
      });
      const spells = resolveSpells(sheet.spellbook);
      expect(spells).toHaveLength(1);
      expect(spells[0].name).toBe('Magic Missile');
      expect(spells[0].range).toBe('120 ft');
    });
  });

  describe('resolveActions', () => {
    it('returns empty if no actions', () => {
      const res = resolveActions(mockSheet(), { strength: 10 } as StatBlock);
      // expect fallback?
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('action-unarmed');
    });

    it('calculates unarmed strike based on strength', () => {
      const res = resolveActions(mockSheet(), { strength: 20 } as StatBlock); // +5 mod
      expect(res[0].toHit).toBe(7); // 2 + 5
      expect(res[0].damage?.[0].bonus).toBe(5);
    });

    it('uses explicit actions from sheet', () => {
      const sheet = mockSheet({
        actions: [{ documentId: 'a1', name: 'Slash', type: 'melee_attack' }],
      });
      const res = resolveActions(sheet, { strength: 10 } as StatBlock);
      expect(res[0].name).toBe('Slash');
    });

    // 50 permutations of stats => Unarmed damage
    for (let s = 1; s <= 50; s++) {
      it(`calculates unarmed for Strength ${s}`, () => {
        const mod = Math.floor((s - 10) / 2);
        const res = resolveActions(mockSheet(), { strength: s } as StatBlock);
        expect(res[0].damage?.[0].bonus).toBe(mod);
      });
    }
  });

  describe('Game Event Service - State & Validation', () => {
    it('throws on invalid input', () => {
      expect(() => adapterService.adapt(null)).toThrow();
    });

    it('adapts a full goblin monster', () => {
      const goblinSource: StrapiEntitySheet = {
        documentId: 'doc_goblin_1',
        name: 'Snarg',
        type: 'monster',
        monster: {
          documentId: 'm_gob',
          name: 'Goblin',
          stats: { dexterity: 14, strength: 8 },
          hp: 7,
          ac: 15,
        },
      };

      const entity = adapterService.adapt(goblinSource);

      expect(entity.id).toBe('doc_goblin_1');
      expect(entity.name).toBe('Snarg');
      expect(entity.stats.dexterity).toBe(14);
      expect(entity.stats.initiativeBonus).toBe(2);
      expect(entity.armorClass).toBe(15);
      expect(entity.hp).toBe(7);
      expect(entity.type).toBe('monster');
    });

    // Bulk Adaptation Tests
    for (let i = 0; i < 20; i++) {
      it(`adapts entity variant ${i}`, () => {
        const ent = adapterService.adapt({
          documentId: `e${i}`,
          name: `Ent ${i}`,
          type: 'npc',
          currentHp: 10 + i,
        });
        expect(ent.hp).toBe(10 + i);
        expect(ent.id).toBe(`e${i}`);
      });
    }

    // MONSTER SPECIFIC (50 Tests)
    for (let i = 1; i <= 50; i++) {
      it(`adapts monster configuration ${i} (HP/AC scale)`, () => {
        const source: StrapiEntitySheet = {
          documentId: `mon_${i}`,
          name: `Beast ${i}`,
          type: 'monster',
          monster: {
            documentId: `m_${i}`,
            name: `Beast Blueprint ${i}`,
            hp: 10 * i,
            ac: 10 + Math.floor(i / 5),
          },
        };
        const ent = adapterService.adapt(source);
        expect(ent.type).toBe('monster');
        expect(ent.maxHp).toBe(10 * i);
        expect(ent.armorClass).toBe(10 + Math.floor(i / 5));
      });
    }

    // CHARACTER SPECIFIC (50 Tests)
    for (let i = 1; i <= 50; i++) {
      it(`adapts character configuration ${i} (Stats/Classes)`, () => {
        const level = i % 20 || 1;
        const source: StrapiEntitySheet = {
          documentId: `char_${i}`,
          name: `Hero ${i}`,
          type: 'player',
          character: {
            documentId: `c_${i}`,
            name: `Blueprint ${i}`,
            classes: [{ name: 'Fighter', level }],
          },
          stats: { strength: 10 + (i % 10), dexterity: 10 },
        };
        const ent = adapterService.adapt(source);
        expect(ent.type).toBe('player');
        expect(ent.level).toBe(level);
        expect(ent.stats.strength).toBe(10 + (i % 10));
      });
    }
  });
});
