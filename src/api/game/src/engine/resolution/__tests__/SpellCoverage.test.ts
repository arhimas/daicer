import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ActionDispatcher } from '../ActionDispatcher';
import { ActionHydrator } from '../../derivation/ActionHydrator';
import { DerivationContext } from '../../derivation/types';

const SPELLS_TO_TEST = {
  heals: ['cure-wounds', 'healing-word', 'heal', 'mass-cure-wounds', 'prayer-of-healing'],
  damage: ['magic-missile', 'scorching-ray', 'guiding-bolt', 'inflict-wounds', 'finger-of-death'],
  aoe_cone: ['burning-hands', 'cone-of-cold', 'prismatic-spray', 'fear'],
  aoe_sphere: ['fireball', 'shatter', 'delayed-blast-fireball', 'circle-of-death', 'sunburst'],
  aoe_cube: ['thunderwave', 'faerie-fire'],
  aoe_line: ['lightning-bolt', 'gust-of-wind', 'sunbeam'],
  aoe_cylinder: ['moonbeam', 'flame-strike', 'call-lightning'],
  utility: ['detect-magic', 'mage-armor', 'shield', 'fly', 'invisibility'],
};

const FLAT_SPELL_LIST = Object.values(SPELLS_TO_TEST).flat();

// Mock Context for Hydration
const mockContext: DerivationContext = {
  stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 18, wisdom: 14, charisma: 12 },
  attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 18, wisdom: 14, charisma: 12 },
  proficiencyBonus: 3,
  spellcastingAbility: 'intelligence',
  level: 5,
  equipment: [],
};

// Mock Entities for Resolution
const sourceEntity = {
  name: 'Test Caster',
  stats: mockContext.stats,
  proficiencyBonus: mockContext.proficiencyBonus,
};

const targetEntity = {
  name: 'Test Target',
  ac: 14,
  stats: { dexterity: 12, constitution: 12 }, // +1 mod
  hp: 50,
};

// Enrichment Map to simulate "Polished" data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPELL_CONFIGS: Record<string, any> = {
  // ---------------- HEALS ----------------
  'cure-wounds': {
    range_config: { type: 'touch', distance: 5 },
    mechanics_config: { action_type: 'Heal' }, // Auto-hit/usage
    damage_instances: [{ effect_type: 'Healing', dice_count: 1, dice_value: 8 }]
  },
  'healing-word': {
    range_config: { type: 'ranged', distance: 60 },
    mechanics_config: { action_type: 'Heal' },
    damage_instances: [{ effect_type: 'Healing', dice_count: 1, dice_value: 4 }]
  },
  'heal': {
    range_config: { type: 'ranged', distance: 60 },
    mechanics_config: { action_type: 'Heal' },
    damage_instances: [{ effect_type: 'Healing', flat_bonus: 70 }] 
  },
  'mass-cure-wounds': {
    range_config: { type: 'ranged', distance: 60, aoe_shape: 'sphere', aoe_size: 30 },
    mechanics_config: { action_type: 'Heal' },
    damage_instances: [{ effect_type: 'Healing', dice_count: 3, dice_value: 8 }]
  },
  'prayer-of-healing': {
    range_config: { type: 'ranged', distance: 30 },
    mechanics_config: { action_type: 'Heal' },
    damage_instances: [{ effect_type: 'Healing', dice_count: 2, dice_value: 8 }]
  },

  // ---------------- DAMAGE ----------------
  'magic-missile': {
    range_config: { type: 'ranged', distance: 120 },
    mechanics_config: { action_type: 'Auto' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'force', dice_count: 1, dice_value: 4, flat_bonus: 1 }]
  },
  'scorching-ray': {
    range_config: { type: 'ranged', distance: 120 },
    mechanics_config: { action_type: 'Ranged Attack' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'fire', dice_count: 2, dice_value: 6 }]
  },
  'guiding-bolt': {
    range_config: { type: 'ranged', distance: 120 },
    mechanics_config: { action_type: 'Ranged Attack' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'radiant', dice_count: 4, dice_value: 6 }]
  },
  'inflict-wounds': {
    range_config: { type: 'touch', distance: 5 },
    mechanics_config: { action_type: 'Melee Attack' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'necrotic', dice_count: 3, dice_value: 10 }]
  },
  'finger-of-death': {
    range_config: { type: 'ranged', distance: 60 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'necrotic', dice_count: 7, dice_value: 8, flat_bonus: 30 }]
  },

  // ---------------- AOE SPHERE ----------------
  'fireball': {
    range_config: { type: 'ranged', distance: 150, aoe_shape: 'sphere', aoe_size: 20 },
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'fire', dice_count: 8, dice_value: 6 }]
  },
  'shatter': {
    range_config: { type: 'ranged', distance: 60, aoe_shape: 'sphere', aoe_size: 10 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'thunder', dice_count: 3, dice_value: 8 }]
  },
  'delayed-blast-fireball': {
    range_config: { type: 'ranged', distance: 150, aoe_shape: 'sphere', aoe_size: 20 },
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'fire', dice_count: 12, dice_value: 6 }]
  },
  'circle-of-death': {
    range_config: { type: 'ranged', distance: 150, aoe_shape: 'sphere', aoe_size: 60 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'necrotic', dice_count: 8, dice_value: 6 }]
  },
  'sunburst': {
    range_config: { type: 'ranged', distance: 150, aoe_shape: 'sphere', aoe_size: 60 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'radiant', dice_count: 12, dice_value: 6 }]
  },

  // ---------------- AOE CONE ----------------
  'burning-hands': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'cone', aoe_size: 15 },
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'fire', dice_count: 3, dice_value: 6 }]
  },
  'cone-of-cold': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'cone', aoe_size: 60 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'cold', dice_count: 8, dice_value: 8 }]
  },
  'prismatic-spray': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'cone', aoe_size: 60 },
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'fire', dice_count: 10, dice_value: 6 }] // Simplified for test
  },
  'fear': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'cone', aoe_size: 30 },
    mechanics_config: { action_type: 'Wisdom Save', save_effect: 'none' }, // Condition only
    damage_instances: []
  },

  // ---------------- AOE CUBE ----------------
  'thunderwave': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'cube', aoe_size: 15 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'thunder', dice_count: 2, dice_value: 8 }]
  },
  'faerie-fire': {
    range_config: { type: 'ranged', distance: 60, aoe_shape: 'cube', aoe_size: 20 },
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'none' },
    damage_instances: []
  },

  // ---------------- AOE LINE ----------------
  'lightning-bolt': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'line', aoe_size: 100 },
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'lightning', dice_count: 8, dice_value: 6 }]
  },
  'gust-of-wind': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'line', aoe_size: 60 },
    mechanics_config: { action_type: 'Strength Save', save_effect: 'none' },
    damage_instances: []
  },
  'sunbeam': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'line', aoe_size: 60 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'radiant', dice_count: 6, dice_value: 8 }]
  },

  // ---------------- AOE CYLINDER ----------------
  'moonbeam': {
    range_config: { type: 'ranged', distance: 120, aoe_shape: 'cylinder', aoe_size: 5, aoe_height: 40 },
    mechanics_config: { action_type: 'Constitution Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'radiant', dice_count: 2, dice_value: 10 }]
  },
  'flame-strike': {
    range_config: { type: 'ranged', distance: 60, aoe_shape: 'cylinder', aoe_size: 10, aoe_height: 40 },
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'fire', dice_count: 4, dice_value: 6 }] // Simplified (split dmg)
  },
  'call-lightning': {
    range_config: { type: 'ranged', distance: 120, aoe_shape: 'cylinder', aoe_size: 60, aoe_height: 10 }, // Range is to point, cloud is cylinder
    mechanics_config: { action_type: 'Dexterity Save', save_effect: 'half' },
    damage_instances: [{ effect_type: 'Damage', damage_type: 'lightning', dice_count: 3, dice_value: 10 }]
  },

  // ---------------- UTILITY ----------------
  'detect-magic': {
    range_config: { type: 'self', distance: 0, aoe_shape: 'sphere', aoe_size: 30 },
    mechanics_config: { action_type: 'Utility' },
    damage_instances: []
  },
  'mage-armor': {
    range_config: { type: 'touch', distance: 5 },
    mechanics_config: { action_type: 'Utility' },
    damage_instances: []
  },
  'shield': {
    range_config: { type: 'self', distance: 0 },
    mechanics_config: { action_type: 'Reaction' },
    damage_instances: []
  },
  'fly': {
    range_config: { type: 'touch', distance: 5 },
    mechanics_config: { action_type: 'Utility' },
    damage_instances: []
  },
  'invisibility': {
    range_config: { type: 'touch', distance: 5 },
    mechanics_config: { action_type: 'Utility' },
    damage_instances: []
  },
};

describe('Spell Coverage Analysis (10% Sample)', () => {
    
  test.each(FLAT_SPELL_LIST)('Should correctly hydrate and resolve %s', (slug) => {
    const filePath = path.join(process.cwd(), 'data/library/molecules/spells', `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`Spell file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rawSpellData = JSON.parse(fileContent);
    
    // ENRICH DATA
    const config = SPELL_CONFIGS[slug] || {};
    const spellData = {
        ...rawSpellData,
        ...config,
        id: slug,
        documentId: slug,
    };

    // 1. Hydration
    const action = ActionHydrator.hydrateFromSpell(spellData, mockContext);
    
    expect(action).toBeDefined();
    expect(action.id).toContain(spellData.slug); // Our ID generation usually includes doc ID, but checking basic integrity
    expect(action.sourceType).toBe('spell');
    expect(action.name).toBe(spellData.name);

    // 2. Structural Assertions based on config
    
    // Check Range
    if (spellData.range.includes('Self')) {
        expect(action.range.type).toBe('self');
    } else if (spellData.range.toLowerCase().includes('touch')) {
        expect(action.range.type).toBe('touch');
    } else {
        expect(action.range.type).toBe('ranged');
    }

    // Check AOE
    if (spellData.range.includes('cone')) {
        expect(action.aoe?.shape).toBe('cone');
    } else if (spellData.range.includes('sphere') || spellData.range.includes('radius')) {
         // Some "radius" spells are spheres, unless specified otherwise
        expect(['sphere', 'cylinder']).toContain(action.aoe?.shape);
    } else if (spellData.range.includes('cube')) {
        expect(action.aoe?.shape).toBe('cube');
    } else if (spellData.range.includes('line')) {
        expect(action.aoe?.shape).toBe('line');
    }

    // Check Effects
    if (spellData.damage_instances?.length > 0) {
        expect(action.effects?.length).toBeGreaterThan(0);
        const dmg = action.effects?.find(e => e.type === 'damage' || e.type === 'healing');
        expect(dmg).toBeDefined();
        if (dmg?.type === 'damage') {
             expect(dmg.dice || dmg.flat).toBeTruthy();
        }
    }

    // 3. Resolution Simulation (Dry Run)
    // We only simulate if it has effects to resolve
    if (action.effects && action.effects.length > 0) {
        const result = ActionDispatcher.resolve(sourceEntity, targetEntity, action);
        
        // Basic resolution integrity
        expect(result).toBeDefined();
        expect(result.log).toBeDefined();
    }
  });

});
