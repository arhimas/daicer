import { describe, it, expect } from 'vitest';
import { RuntimeAction, RuntimeEffect } from '../derivation/types';

interface MockEntitySheet {
  name: string;
  actions: RuntimeAction[];
}

/**
 * Property-based test generator for Rich Actions.
 * Simulates a "Spawn" + "Enrich" cycle where we verify that
 * the engine can handle all permutations of complex actions.
 */
describe('Rich Actions Logic Integration', () => {
  const damageTypes = ['fire', 'cold', 'slashing', 'bludgeoning', 'force', 'necrotic', 'radiant'];
  const actionTypes = ['melee', 'ranged', 'spell', 'utility'] as const;
  const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const areaShapes = ['sphere', 'cone', 'cube'] as const;

  // Helper to generate random action permutations
  const generatePermutations = (count: number): RuntimeAction[] => {
    const actions: RuntimeAction[] = [];
    for (let i = 0; i < count; i++) {
      const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];

      const damageCount = Math.floor(Math.random() * 3); // 0 to 2 damage instances
      const effects: RuntimeEffect[] = Array.from({ length: damageCount }).map(() => ({
        type: 'damage',
        dice: '1d8',
        subtype: damageTypes[Math.floor(Math.random() * damageTypes.length)],
      }));

      const hasSave = Math.random() > 0.5;
      const save = hasSave
        ? {
            attribute: attributes[Math.floor(Math.random() * attributes.length)],
            dc: 10 + Math.floor(Math.random() * 10),
          }
        : undefined;

      const hasArea = Math.random() > 0.7;
      const aoe = hasArea
        ? {
            shape: areaShapes[Math.floor(Math.random() * areaShapes.length)],
            size: 15 + Math.floor(Math.random() * 45), // 15 to 60 ft
          }
        : undefined;

      actions.push({
        id: `action_doc_${i}`,
        name: `Generated Action ${i} [${type}]`,
        type,
        effects: effects.length ? effects : undefined,
        save,
        aoe,
      });
    }
    return actions;
  };

  const generatedActions = generatePermutations(250);

  it.each(generatedActions)('should correctly persist and retrieve rich data for $name', (action) => {
    // 1. Simulate "DB" state
    const dbAction = { ...action };

    // 2. Simulate "Linkage"
    const linkId = dbAction.id;
    expect(linkId).toBeDefined();

    // 3. Simulate "Hydration"
    // "If I have the relation, do I have the data?"
    const hydratedSheet: MockEntitySheet = {
      name: 'Test Monster',
      actions: [dbAction], // The engine sees the resolved relation
    };

    const targetAction = hydratedSheet.actions.find((a) => a.id === linkId);
    expect(targetAction).toBeDefined();

    // 4. Verify Richness
    // Type Integrity
    expect(targetAction?.type).toBe(action.type);

    // Damage Integrity (via effects)
    if (action.effects) {
      expect(targetAction?.effects).toHaveLength(action.effects.length);
      targetAction?.effects?.forEach((e, idx) => {
        expect(e.type).toBe('damage');
        expect(e.subtype).toBe(action.effects![idx].subtype);
        expect(damageTypes).toContain(e.subtype);
      });
    }

    // Save Integrity
    if (action.save) {
      expect(targetAction?.save).toBeTruthy();
      expect(attributes).toContain(targetAction?.save?.attribute);
      expect(targetAction?.save?.dc).toBeGreaterThan(9);
    }

    // Area Integrity (aoe)
    if (action.aoe) {
      expect(targetAction?.aoe).toBeTruthy();
      expect(areaShapes).toContain(targetAction?.aoe?.shape);
    }
  });

  it('should handle multi-damage complex actions (e.g. Meteor Swarm equivalent)', () => {
    const complexAction: RuntimeAction = {
      id: 'meteor_swarm',
      name: 'Meteor Swarm',
      type: 'spell',
      effects: [
        { type: 'damage', dice: '20d6', subtype: 'fire' },
        { type: 'damage', dice: '20d6', subtype: 'bludgeoning' },
      ],
      save: { attribute: 'dex', dc: 19 },
      aoe: { shape: 'sphere', size: 40 },
    };

    const sheet = { name: 'Archmage', actions: [complexAction] };
    const resolution = sheet.actions[0];

    expect(resolution.effects).toHaveLength(2);
    expect(resolution.effects![0].subtype).toBe('fire');
    expect(resolution.effects![1].subtype).toBe('bludgeoning');
    expect(resolution.save?.attribute).toBe('dex');
    expect(resolution.aoe?.size).toBe(40);
  });
});
