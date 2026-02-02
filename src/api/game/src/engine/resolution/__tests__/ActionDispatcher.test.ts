import { describe, it, expect, vi } from 'vitest';
import { ActionDispatcher } from '../ActionDispatcher';
import { Entity } from '../../types';
import { RuntimeAction } from '../../derivation/types';

describe('ActionDispatcher', () => {
  const mockSource: Entity = {
    id: 'source-1',
    name: 'Hero',
    // Minimal mock properties needed for the test
  } as unknown as Entity;

  const mockTarget: Entity = {
    id: 'target-1',
    name: 'Goblin',
    armorClass: 15,
    stats: {
      strength: 10,
      dexterity: 10, // Mod +0
      constitution: 14, // Mod +2
      intelligence: 8,
      wisdom: 12,
      charisma: 8,
    },
  } as unknown as Entity;

  it('should resolve a simple attack hit', () => {
    
    const action: RuntimeAction = {
      name: 'Sword Swing',
      actionId: 'action-1',
      sourceId: 'source-1',
      type: 'attack',
         
      attack: {
        bonus: 5,
        critRange: 20,
        range: 5,
        type: 'melee',
      },
      effects: [
         {
          type: 'damage',
          dice: '1d6',
          flat: 2,
          subtype: 'slashing',
        },
      ],
    } as unknown as RuntimeAction;

    // Roll 15 + 5 = 20 >= 15 AC (Hit)
    // Math.random() * 20 -> 0.74 * 20 = 14.8 -> floor 14 + 1 = 15
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.74); 

    const result = ActionDispatcher.resolve(mockSource, mockTarget, action);

    expect(result.hit).toBe(true);
    expect(result.log.some((l) => l.includes('HIT'))).toBe(true);
    // Damage: 1d6+2. random 0.74 * 6 = 4.44 -> 4+1 = 5. Total 5+2 = 7.
    expect(result.damageTotal).toBe(7);

    randomSpy.mockRestore();
  });

  it('should resolve a miss', () => {
    const action: RuntimeAction = {
      name: 'Weak Swing',
      attack: {
        bonus: 0, 
        critRange: 20,
      },
      effects: [],
    } as unknown as RuntimeAction;

    // Roll 5 + 0 = 5 < 15 AC (Miss)
    // Math.random() * 20 -> 0.2 * 20 = 4 -> floor 4 + 1 = 5
    const randomSpy =  vi.spyOn(Math, 'random').mockReturnValue(0.2);

    const result = ActionDispatcher.resolve(mockSource, mockTarget, action);
    
    expect(result.hit).toBe(false);
    expect(result.damageTotal).toBe(0);

    randomSpy.mockRestore();
  });

  it('should resolve a saving throw', () => {
    // Target has Con 14 (+2 mod)
    const action: RuntimeAction = {
      name: 'Poison Cloud',
      attack: { bonus: 100 }, // Hit first
      save: {
        attribute: 'con',
        dc: 10,
        effect: 'half',
      },
      effects: [
         {
          type: 'damage',
          dice: '1d6', // Add dice to test parsing
           // Mock random 0.8 -> 4.8 -> 4 + 1 = 5
          flat: 5,
          subtype: 'poison',
        },
      ]
    } as unknown as RuntimeAction;

    // Force save pass: Roll 10 + 2 = 12 >= 10
    // Math.random() * 20 -> 0.45 * 20 = 9 -> 9+1 = 10
    // But we need a consistent mock for the dice roll too if we reuse the spy.
    // 0.45 for d20 -> 10.
    // 0.45 for 1d6 -> 0.45 * 6 = 2.7 -> 2+1 = 3.
    // Total damage: 3 + 5 = 8. Half = 4.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.45); 

    const result = ActionDispatcher.resolve(mockSource, mockTarget, action);

    expect(result.hit).toBe(true);
    expect(result.savePassed).toBe(true);
    expect(result.damageTotal).toBe(4); 

    randomSpy.mockRestore();
  });

  it('should apply conditions on failed save', () => {
     const action: RuntimeAction = {
      name: 'Stun Ray',
      attack: { bonus: 100 },
      save: {
        attribute: 'dex',
        dc: 20, // High DC
        effect: 'negate',
      },
      effects: [
         {
          type: 'apply_condition',
          subtype: 'stunned',
        },
      ]
    } as unknown as RuntimeAction;

    // Force save fail: Roll 1 + 0 = 1 < 20
    // Math.random() = 0.0
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.0); 

    const result = ActionDispatcher.resolve(mockSource, mockTarget, action);

    expect(result.savePassed).toBe(false);
    expect(result.conditionsApplied).toContain('stunned');

    randomSpy.mockRestore();
  });
  
  it('should handle critical hits logic with dice', () => {
       const action: RuntimeAction = {
      name: 'Crit Swing',
      attack: {
        bonus: 0,
        critRange: 19,
      },
      effects: [
        {
          type: 'damage',
          dice: '1d6',
          flat: 0,
        },
      ],
    } as unknown as RuntimeAction;

    // Force Crit: Roll 19 + 0 = 19 (Crit)
    // Math.random() * 20 -> 0.9 * 20 = 18 -> 18+1 = 19
    // Dice: 0.9 * 6 = 5.4 -> 5+1 = 6.
    // Two dice (normal + crit): 6 + 6 = 12.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const result = ActionDispatcher.resolve(mockSource, mockTarget, action);

    expect(result.crit).toBe(true);
    expect(result.hit).toBe(true);
    expect(result.damageTotal).toBe(12);

    randomSpy.mockRestore();
  });
});
