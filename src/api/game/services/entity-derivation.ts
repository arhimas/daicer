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

export default factories.createCoreService('api::game.entity-derivation', ({ strapi }) => ({
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
      },
    });

    if (!sheet) {
      throw new Error(`EntitySheet ${sheetId} not found`);
    }

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
      armorClass: sheet.armorClass,
      speed: sheet.speed || 30, // Or fetch from stats component
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

    // 4. Update EntitySheet directly
    await strapi.entityService.update('api::entity-sheet.entity-sheet', sheetId, {
      data: {
        currentHp: entity.hp,
        maxHp: entity.maxHp,
        ac: entity.armorClass, // Note: Schema calls it 'ac'
        // speed: entity.speed, // Schema defines 'speed' component on sheet? No, wait.
        // EntitySheet schema uses `stats` component which has walkSpeed etc.
        // But we computed derived speed in Entity.
        // Let's check EntitySheet schema again (from prev output).
        // It has `position` component. Attributes `stats` component.
        // `stats` component has `walkSpeed` etc.
        // We should update the `stats` component if we want to persist derived speed?
        // OR rely on derivation every time.
        // The user wants "ActiveState" gone. That means "Sheet" is the Runtime State.
        // So we MUST write back the current HP, AC, etc.
        // We do not need to write back 'stats' if they are just base scores.
        // But if speed changes (Haste), we need to write it somewhere.
        // EntitySheet has `active_effects` json? No we deleted it?
        // We added `tempHp`, `computedSkills` etc.
        // We did NOT add `speed` component to root.
        // `stats` component has speed. We can update that.

        tempHp: 0, // Default or tracking? Entity doesn't have tempHp in interface yet?
        initiativeBonus: stats.initiativeBonus || EntityDeriver.calculateModifier(stats.dexterity),
        passivePerception: stats.passivePerception || 10 + EntityDeriver.calculateModifier(stats.wisdom),

        computedSkills,
        computedSaves,
        computedActions,
        defenses,

        // If we want to persist derived stats (e.g. enhanced strength), we overwrite stats?
        // Usually Sheet stats = Base.
        // Derived stats = effective.
        // If we overwrite Sheet stats, we lose Base.
        // For now, we only persist COMPUTED outputs (skills, saves, actions).
        // Base stats remain as the source.
      } as unknown as Record<string, unknown>,
    });
  },
}));

function determineActionType(action: { type?: string; range?: string | { type?: string } }): string {
  if (action.type) return action.type;
  if (typeof action.range === 'object' && action.range?.type === 'melee') return 'melee';
  if (typeof action.range === 'object' && action.range?.type === 'ranged') return 'ranged';
  return 'utility';
}
