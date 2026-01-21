import { factories } from '@strapi/strapi';
import { EntityDeriver } from '../src/engine/derivation';
import { Entity } from '../src/engine/types';

const SKILLS = [
  'acrobatics',
  'animal_handling',
  'arcana',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'sleight_of_hand',
  'stealth',
  'survival',
];

const ATTRIBUTES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

interface ResolvedAction {
  documentId?: string;
  id?: string;
  name: string;
  type?: string;
  attack?: { bonus: number };
  effects?: Array<{ type: string; dice?: string; subtype?: string }>;
  save?: { attribute?: string; stat?: string; dc: number };
  range?: string | { value: number; type?: string };
  cost?: string | { type: string };
  description?: string;
}

import { Core } from '@strapi/strapi';

// Define the shape of the Populated Sheet to satisfy TypeScript
// We rely on loose typing here as generated types are strictly relational IDs for relations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PopulatedSheet = any & {
  documentId: string;
  stats?: any; 
  actions?: any[];
  features?: any[];
  inventory?: any[];
  conditions?: any[];
  proficiencies?: any[];
  proficiences?: any[]; // typo safety
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  speed?: number | { walk: number };
  armorClass?: number;
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async deriveAndPersist(sheetId: string) {
    // 1. Fetch Sheet with DEEP population
    const sheetRaw = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: sheetId,
       
      populate: {
        stats: true,
        inventory: {
          populate: {
            item: {
              populate: {
                equipment_data: {
                  populate: {
                    damage_type: true,
                    properties: true,
                  },
                },
              },
            },
          },
        },
        spellbook: {
          populate: {
            spells: {
              populate: {
                school: true,
              },
            },
          },
        },
        actions: true,
        features: true,
        traits: true,
        conditions: true,
        race: true,
        class: true,
        proficiencies: true,
      } as any, // Deep nested populate often fails strict TS checks in Strapi 5
    });

    if (!sheetRaw) {
      throw new Error(`EntitySheet ${sheetId} not found`);
    }

    const sheet = sheetRaw as unknown as PopulatedSheet;

    // 2. Direct Hydration (No Adapter)
    // We construct a lightweight Entity object for derivation purposes
    const entity: Entity = {
      id: sheet.documentId,
      name: sheet.name,
      type: sheet.type || 'character',
      level: sheet.level || 1,
      stats: sheet.stats || {},
      hp: sheet.currentHp ?? sheet.maxHp,
      maxHp: sheet.maxHp,
      armorClass: sheet.ac || 10, // Mapped from 'ac'
      speed: sheet.stats?.walkSpeed || 30, // Or fetch from stats component
      actions: sheet.actions || [],
      features: sheet.features || [],

      resistances: sheet.resistances || [],
      immunities: sheet.immunities || [],
      vulnerabilities: sheet.vulnerabilities || [],

      // Mock inventory for derivation if needed, though derivation mainly uses stats/profs
      equipment: sheet.inventory || [],

      // Add other required props of Entity interface with defaults
      position: sheet.position || { x: 0, y: 0, z: 0 },
      visionRadius: 60,
      color: '#fff',
      conditions: sheet.conditions || [],
    };

    // 3. Calculate Derived Values
    const stats = entity.stats;
    const proficiencyBonus = EntityDeriver.calculateProficiencyBonus(entity.level || 1);

    // Skills (Using Components)
    const computedSkills = SKILLS.map((skill) => {
      let attr = 'wisdom';
      if (['athletics'].includes(skill)) attr = 'strength';
      if (['acrobatics', 'sleight_of_hand', 'stealth'].includes(skill)) attr = 'dexterity';
      if (['arcana', 'history', 'investigation', 'nature', 'religion'].includes(skill)) attr = 'intelligence';
      if (['animal_handling', 'insight', 'medicine', 'perception', 'survival'].includes(skill)) attr = 'wisdom';
      if (['deception', 'intimidation', 'performance', 'persuasion'].includes(skill)) attr = 'charisma';

      const mod = EntityDeriver.calculateModifier(stats[attr] || 10);
      const isProficient = sheet.proficiencies?.some(
        (p: { slug?: string; name: string }) => p.slug === skill || p.name.toLowerCase() === skill.replace('_', ' ')
      );

      return {
        name: skill,
        value: mod + (isProficient ? proficiencyBonus : 0),
        proficient: !!isProficient,
      };
    });

    // Saves (Using Components)
    const computedSaves = ATTRIBUTES.map((attr) => {
      const mod = EntityDeriver.calculateModifier(stats[attr] || 10);
      const isProficient = sheet.proficiencies?.some(
        (p: { slug?: string; name: string }) => p.slug === `save_${attr}` || p.name.toLowerCase() === `${attr} save`
      );

      return {
        stat: attr,
        value: mod + (isProficient ? proficiencyBonus : 0),
        proficient: !!isProficient,
      };
    });

    // Actions (Using Components)
    const computedActions =
      entity.actions?.map((action: ResolvedAction) => ({
        name: action.name,
        type: determineActionType(action),
        toHit: action.attack?.bonus || 0,
        damageDice: action.effects?.find((e) => e.type === 'damage')?.dice || '',
        damageBonus: action.attack?.bonus || 0,
        damageType: action.effects?.find((e) => e.type === 'damage')?.subtype || 'physical',
        saveAbility: action.save?.attribute || action.save?.stat,
        saveDc: action.save?.dc,
        range: typeof action.range === 'string' ? 0 : action.range?.value || 0,
        description: action.description || '',
        resourceCost: typeof action.cost === 'string' ? action.cost : action.cost?.type,
      })) || [];

    // Defenses
    const defenses = [
      ...(entity.resistances || []).map((t) => ({ damageType: t, modifier: 'resistance' })),
      ...(entity.immunities || []).map((t) => ({ damageType: t, modifier: 'immunity' })),
      ...(entity.vulnerabilities || []).map((t) => ({ damageType: t, modifier: 'vulnerability' })),
    ];

    // Weight Calculation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const computedWeight = (entity.equipment || []).reduce((acc: number, entry: any) => {
        const w = entry.item?.weight || 0;
        const q = entry.quantity || 1;
        return acc + (w * q);
    }, 0);

    // 4. Update EntitySheet directly
    await strapi.entityService.update('api::entity-sheet.entity-sheet', sheetId, {
      data: {
        currentHp: entity.hp,
        maxHp: entity.maxHp,
        ac: entity.armorClass, 
        
        computedWeight, // Persist calculated weight

        tempHp: 0, // Default or tracking? Entity doesn't have tempHp in interface yet?
        initiativeBonus: stats.initiativeBonus || EntityDeriver.calculateModifier(stats.dexterity),
        passivePerception: stats.passivePerception || 10 + EntityDeriver.calculateModifier(stats.wisdom),

        computedSkills,
        computedSaves,
        computedActions,
        defenses,
      } as unknown as Record<string, unknown>,
    });
  },
});

function determineActionType(action: { type?: string; range?: string | { type?: string } }): string {
  if (action.type) return action.type;
  if (typeof action.range === 'object' && action.range?.type === 'melee') return 'melee';
  if (typeof action.range === 'object' && action.range?.type === 'ranged') return 'ranged';
  return 'utility';
}
