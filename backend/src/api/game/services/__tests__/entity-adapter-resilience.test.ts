import { describe, it, expect } from 'vitest';
import EntityAdapter from '../entity-adapter';
import { EntitySheetValues, EntityType } from '../../../../lifecycle/socket/types';
import { Creature } from '@daicer/engine';

describe('Service: Entity Adapter - Hydration Layer (Stress Test)', () => {
  const adapter = EntityAdapter();

  // The Adapter's job is to take a DB EntitySheet and convert it to an Engine Entity (Creature).
  // It must calculate stats (currentHp, ac, etc.) and not crash on missing data.
  // It is a pure function effectively.

  const testCases = [
    // 1. Basic Hydration (Happy Path)
    {
      desc: 'Valid Monster Sheet',
      input: {
        documentId: 'e1',
        name: 'Orc',
        type: 'monster' as EntityType,
        currentHp: 10,
        maxHp: 15,
        stats: { strength: 16, dexterity: 12, constitution: 14, intelligence: 8, wisdom: 10, charisma: 9 },
        position: { x: 0, y: 0, z: 0 },
      },
      assertions: (e: Creature) => {
        expect(e.id).toBe('e1');
        expect(e.hp).toBe(10);
        expect(e.maxHp).toBe(15);
        expect(e.stats.strength).toBe(16);
      },
    },

    // 2. Missing Stats (Defaults)
    {
      desc: 'Missing Stats Object',
      input: { documentId: 'e2', name: 'Weakling', type: 'monster', stats: null },
      assertions: (e: Creature) => {
        expect(e.stats.strength).toBe(10); // Check default 10
      },
    },
    {
      desc: 'Partial Stats (Dex only)',
      input: { documentId: 'e3', type: 'monster', stats: { dexterity: 18 } },
      assertions: (e: Creature) => {
        expect(e.stats.dexterity).toBe(18);
        expect(e.stats.strength).toBe(10); // Default
      },
    },

    // 3. HP Logic (Current > Max?)
    {
      desc: 'Current HP > Max HP (Should preserve or clamp? Adapter usually preserves)',
      input: { documentId: 'e4', type: 'monster', currentHp: 20, maxHp: 10 },
      assertions: (e: Creature) => {
        expect(e.hp).toBe(20);
        expect(e.maxHp).toBe(10);
      },
    },
    {
      desc: 'Negative HP',
      input: { documentId: 'e5', type: 'monster', currentHp: -5, maxHp: 10 },
      assertions: (e: Creature) => {
        expect(e.hp).toBe(-5);
      },
    },
    {
      desc: 'Zero Max HP',
      input: { documentId: 'e6', type: 'monster', currentHp: 5, maxHp: 0 },
      assertions: (e: Creature) => {
        expect(e.maxHp).toBe(1); // Falsy 0 defaults to 1 safety
        // Should not be Infinity or NaN
      },
    },

    // 4. Position Resilience
    {
      desc: 'Null Position',
      input: { documentId: 'e7', position: null },
      assertions: (e: Creature) => expect(e.position).toEqual({ x: 0, y: 0, z: 0 }),
    },
    {
      desc: 'Partial Position',
      input: { documentId: 'e8', position: { x: 10 } },
      assertions: (e: Creature) => expect(e.position.x).toBe(10),
    },

    // 5. Structure & Inventory (Deep nesting)
    {
      desc: 'Inventory Items',
      input: { documentId: 'e9', inventory: [{ name: 'Sword', effects: [] }] },
      assertions: (e: Creature) => {
        // Adapter usually puts inventory in... inventory?
        // Check implementation if it maps inventory.
        expect(e.inventory).toBeUndefined(); // Adapter does not map inventory to root prop logic check
        // Wait, adapter code maps inventory to actions array if present!
        expect(e.actions.some((a) => a.name === 'Sword')).toBe(true);
      },
    },

    // 6. Type Handling
    {
      desc: 'Type: Character',
      input: { documentId: 'c1', type: 'character' },
      assertions: (e: Creature) => expect(e.type).toBe('character'),
    },
    {
      desc: 'Type: Null -> Player',
      input: { documentId: 'm1', type: null },
      assertions: (e: Creature) => expect(e.type).toBe('monster'),
    },
  ];

  // Fuzz Generator (40 cases)
  for (let i = 0; i < 40; i++) {
    testCases.push({
      desc: `Jagged Entity ${i}`,
      input: {
        documentId: `j-${i}`,
        name: `Jagged ${i}`,
        type: (i % 3 === 0 ? 'character' : 'monster') as EntityType,
        // Randomly corrupted stats
        stats: i % 2 === 0 ? null : { strength: i },
        // Randomly corrupted hp
        currentHp: i % 4 === 0 ? undefined : i, // undefined passed as currentHp? logic might fail
        maxHp: 100,
      },
      assertions: (e: Creature) => {
        expect(e.id).toBe(`j-${i}`);
        if (i % 2 === 0)
          expect(e.stats.strength).toBe(10); // default
        else expect(e.stats.strength).toBe(i);

        if (i % 4 === 0) {
          // If undefined, what does adapter do?
          expect(typeof e.hp).toBe('number');
        } else {
          expect(e.hp).toBe(i);
        }
      },
    });
  }

  it.each(testCases)('$desc', ({ input, assertions }) => {
    const result = adapter.adapt(input as unknown as EntitySheetValues);
    assertions(result);
  });
});
