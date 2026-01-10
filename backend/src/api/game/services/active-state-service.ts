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
  documentId?: string; // Strapi ID (optional if synthesized)
  id?: string; // Runtime ID
  name: string;
  type?: string;
  attack?: { bonus: number };
  effects?: Array<{ type: string; dice?: string; subtype?: string }>;
  save?: { attribute?: string; stat?: string; dc: number };
  range?: string | { value: number; type?: string };
  cost?: string | { type: string }; // Handle object cost from RuntimeAction
  description?: string;
  action_definition?: Record<string, unknown>;
}

export default factories.createCoreService('api::active-state.active-state', ({ strapi }) => ({
  async deriveAndPersist(sheetId: string) {
    // 1. Fetch the Sheet (Deep Populate)
    const sheet = await strapi.entityService.findOne('api::entity-sheet.entity-sheet', sheetId, {
      populate: {
        stats: true,
        inventory: {
          populate: {
            equipment_category: true,
            damage_type: true,
            properties: true,
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
        activeState: true,
      },
    });

    if (!sheet) {
      throw new Error(`EntitySheet ${sheetId} not found`);
    }

    // 2. Use EntityAdapter to get the "Engine View" (Base Derivation)
    // We use the exposed service method 'adapt'
    const entity: Entity = strapi.service('api::game.entity-adapter').adapt(sheet, { ignoreActiveState: true });

    // 3. Calculate Extra Enriched Data (Skills & Saves)
    // The Entity interface gives us 'stats' (Attributes) and 'proficiencyBonus' (implicit via level usually, but we need it explicit)
    // EntityAdapter returns 'stats' with modifiers? No, 'stats' are raw scores usually?
    // Let's check EntityStats type: { strength: number ... } - usually score.

    // Recalculate basic derivation pieces that might be missing from the flat Entity view
    const stats = entity.stats;
    const proficiencyBonus = EntityDeriver.calculateProficiencyBonus(entity.level || 1);

    // Skills
    const skills: Record<string, number> = {};
    for (const skill of SKILLS) {
      // Simple logic: Attribute Mod + PB (if proficient)
      // We need to know which attribute maps to which skill.
      // For now, using standard D&D mapping or looking it up if possible.
      // Hardcoding standard mapping for robustness.
      let attr = 'wisdom';
      if (['athletics'].includes(skill)) attr = 'strength';
      if (['acrobatics', 'sleight_of_hand', 'stealth'].includes(skill)) attr = 'dexterity';
      if (['arcana', 'history', 'investigation', 'nature', 'religion'].includes(skill)) attr = 'intelligence';
      if (['animal_handling', 'insight', 'medicine', 'perception', 'survival'].includes(skill)) attr = 'wisdom';
      if (['deception', 'intimidation', 'performance', 'persuasion'].includes(skill)) attr = 'charisma';

      const mod = EntityDeriver.calculateModifier(stats[attr] || 10);

      // Check proficiency from sheet (the Adapter might not expose strictly mapped proficiencies easily)
      // The sheet has 'proficiencies' relation.
      // We iterate sheet.proficiencies (if available) to find matches.
      const isProficient = sheet.proficiencies?.some(
        (p: { slug?: string; name: string }) => p.slug === skill || p.name.toLowerCase() === skill.replace('_', ' ')
      );

      skills[skill] = mod + (isProficient ? proficiencyBonus : 0);
    }

    // Saves
    const saves: Record<string, number> = {};
    for (const attr of ATTRIBUTES) {
      const mod = EntityDeriver.calculateModifier(stats[attr] || 10);
      // Check save proficiency (Class usually grants this)
      // If sheet.class is populated...
      // For simplicity in this iteration, we look for 'proficiencies' starting with 'save_' or check class.
      // This logic might need refinement relative to pure Engine logic, but this is the "Bridge".
      const isProficient = sheet.proficiencies?.some(
        (p: { slug?: string; name: string }) => p.slug === `save_${attr}` || p.name.toLowerCase() === `${attr} save`
      );

      saves[attr] = mod + (isProficient ? proficiencyBonus : 0);
    }

    // 4. Map Resolved Actions
    // Entity.actions are already resolved RuntimeActions.
    const computedActions =
      entity.actions?.map((action: ResolvedAction) => ({
        name: action.name,
        type: determineActionType(action),
        toHit: action.attack?.bonus || 0,
        damageDice: action.effects?.find((e) => e.type === 'damage')?.dice || '',
        damageBonus: action.attack?.bonus || 0, // Approx (usually damage bonus ~ attack bonus - PB + magic) - simplistic
        damageType: action.effects?.find((e) => e.type === 'damage')?.subtype || 'physical',
        saveAbility: action.save?.attribute || action.save?.stat,
        saveDc: action.save?.dc,
        range: typeof action.range === 'string' ? 0 : action.range?.value || 0,
        description: action.description || '',
        resourceCost: typeof action.cost === 'string' ? action.cost : action.cost?.type,
      })) || [];

    // 5. Persist to ActiveState
    // Upsert logic: Check if exists
    const existing = await strapi.db.query('api::active-state.active-state').findOne({
      where: { sheet: sheetId },
    });

    const payload = {
      sheet: sheetId,
      attributes: stats,
      level: entity.level,
      proficiencyBonus,
      currentHp: entity.hp,
      maxHp: entity.maxHp,
      armorClass: entity.armorClass,
      speed: entity.speed, // JSON
      initiativeBonus: stats.initiativeBonus,
      passivePerception: stats.passivePerception,
      skills,
      saves,
      resistances: entity.resistances,
      immunities: entity.immunities,
      vulnerabilities: entity.vulnerabilities,
      computedActions,
    };

    if (existing) {
      return strapi.entityService.update('api::active-state.active-state', existing.id, {
        data: payload as unknown as Record<string, unknown>,
      });
    } else {
      return strapi.entityService.create('api::active-state.active-state', {
        data: payload as unknown as Record<string, unknown>,
      });
    }
  },
}));

function determineActionType(action: { type?: string; range?: string | { type?: string } }): string {
  if (action.type) return action.type;
  if (typeof action.range === 'object' && action.range?.type === 'melee') return 'melee';
  if (typeof action.range === 'object' && action.range?.type === 'ranged') return 'ranged';
  return 'utility';
}
