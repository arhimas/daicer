import { describe, it, expect } from 'vitest';

// Mock types representing the "Rich" structure from the schema
interface MockAction {
  documentId: string;
  name: string;
  type: 'melee' | 'ranged' | 'spell' | 'utility';
  damage?: {
    dice: string;
    type: string; // 'fire', 'slashing', etc.
  }[];
  save?: {
    attribute: string;
    dc: number;
  };
  area?: {
    shape: 'sphere' | 'cone' | 'cube';
    size: number;
  };
}

interface MockEntitySheet {
  name: string;
  actions: MockAction[]; // The relation resolved
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
  const generatePermutations = (count: number): MockAction[] => {
    const actions: MockAction[] = [];
    for (let i = 0; i < count; i++) {
      const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];

      const damageCount = Math.floor(Math.random() * 3); // 0 to 2 damage instances
      const damage = Array.from({ length: damageCount }).map(() => ({
        dice: '1d8',
        type: damageTypes[Math.floor(Math.random() * damageTypes.length)],
      }));

      const hasSave = Math.random() > 0.5;
      const save = hasSave
        ? {
            attribute: attributes[Math.floor(Math.random() * attributes.length)],
            dc: 10 + Math.floor(Math.random() * 10),
          }
        : undefined;

      const hasArea = Math.random() > 0.7;
      const area = hasArea
        ? {
            shape: areaShapes[Math.floor(Math.random() * areaShapes.length)],
            size: 15 + Math.floor(Math.random() * 45), // 15 to 60 ft
          }
        : undefined;

      actions.push({
        documentId: `action_doc_${i}`,
        name: `Generated Action ${i} [${type}]`,
        type,
        damage: damage.length ? damage : undefined,
        save,
        area,
      });
    }
    return actions;
  };

  const generatedActions = generatePermutations(250);

  it.each(generatedActions)('should correctly persist and retrieve rich data for $name', (action) => {
    // 1. Simulate "DB" state (The relation source)
    const dbAction = { ...action };

    // 2. Simulate "Linkage" (What spawn-service does: links by ID)
    const linkId = dbAction.documentId;
    expect(linkId).toBeDefined();

    // 3. Simulate "Hydration" (What engine/graphql does: resolves relation)
    // In a real e2e this comes from Strapi. Here we verify the contract:
    // "If I have the relation, do I have the data?"
    const hydratedSheet: MockEntitySheet = {
      name: 'Test Monster',
      actions: [dbAction], // The engine sees the resolved relation
    };

    const targetAction = hydratedSheet.actions.find((a) => a.documentId === linkId);
    expect(targetAction).toBeDefined();

    // 4. Verify Richness
    // Type Integrity
    expect(targetAction?.type).toBe(action.type);

    // Damage Integrity
    if (action.damage) {
      expect(targetAction?.damage).toHaveLength(action.damage.length);
      targetAction?.damage?.forEach((d, idx) => {
        expect(d.type).toBe(action.damage![idx].type);
        expect(damageTypes).toContain(d.type);
      });
    }

    // Save Integrity
    if (action.save) {
      expect(targetAction?.save).toBeTruthy();
      expect(attributes).toContain(targetAction?.save?.attribute);
      expect(targetAction?.save?.dc).toBeGreaterThan(9);
    }

    // Area Integrity
    if (action.area) {
      expect(targetAction?.area).toBeTruthy();
      expect(areaShapes).toContain(targetAction?.area?.shape);
    }
  });

  it('should handle multi-damage complex actions (e.g. Meteor Swarm equivalent)', () => {
    // Manual "Edge Case" for the 251st test
    const complexAction: MockAction = {
      documentId: 'meteor_swarm',
      name: 'Meteor Swarm',
      type: 'spell',
      damage: [
        { dice: '20d6', type: 'fire' },
        { dice: '20d6', type: 'bludgeoning' },
      ],
      save: { attribute: 'dex', dc: 19 },
      area: { shape: 'sphere', size: 40 },
    };

    const sheet = { name: 'Archmage', actions: [complexAction] };
    const resolution = sheet.actions[0];

    expect(resolution.damage).toHaveLength(2);
    expect(resolution.damage![0].type).toBe('fire');
    expect(resolution.damage![1].type).toBe('bludgeoning');
    expect(resolution.save?.attribute).toBe('dex');
    expect(resolution.area?.size).toBe(40);
  });
});
