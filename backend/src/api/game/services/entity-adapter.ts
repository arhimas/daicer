import { Entity, EntityAction, EntityFeature } from '@daicer/engine';

interface StrapiStats {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  passivePerception?: number;
}

interface StrapiAction {
  id?: string;
  name: string;
  type?: 'melee' | 'ranged' | 'spell' | 'utility';
  toHit?: number;
  reach?: number;
  range?: string;
  damage?: { dice: string; bonus: number; type: string }[];
  save?: { dc: number; stat: string };
  description: string;
}

interface StrapiFeature {
  name: string;
  description: string;
  usage_max?: number;
  usage_per?: string;
}

interface StrapiBlueprint {
  stats?: StrapiStats;
  baseStats?: StrapiStats;
  ac?: number;
  structuredActions?: StrapiAction[];
  features?: StrapiFeature[];
}

interface StrapiItem {
  name?: string;
  type?: string;
  damage?: unknown;
}

interface StrapiSheetInput {
  documentId: string;
  type?: 'player' | 'monster' | 'npc';
  name?: string;
  currentHp?: number;
  maxHp?: number;
  stats?: StrapiStats;
  character?: StrapiBlueprint;
  monster?: StrapiBlueprint;
  structuredActions?: StrapiAction[];
  inventory?: StrapiItem[];
  position?: { x: number; y: number; z: number };
}

export default () => ({
  /**
   * Adapts a CharacterSheet (populated with character/monster) to a unified EngineEntity.
   */
  adapt(sheet: unknown): Entity {
    if (!sheet) throw new Error('Cannot adapt null sheet');
    const s = sheet as StrapiSheetInput;

    const type = s.type || 'player';
    const name = s.name || 'Unknown Entity';
    const hp = s.currentHp || 0;
    const maxHp = s.maxHp || 1;

    // Resolve Blueprint
    let blueprint: StrapiBlueprint | undefined;
    if (type === 'monster' || type === 'npc') {
      blueprint = s.monster;
    } else {
      blueprint = s.character;
    }

    // Fallback stats
    const stats = blueprint?.stats || blueprint?.baseStats || s.stats || {};

    const strength = stats.strength || 10;
    const dexterity = stats.dexterity || 10;
    const constitution = stats.constitution || 10;
    const intelligence = stats.intelligence || 10;
    const wisdom = stats.wisdom || 10;
    const charisma = stats.charisma || 10;

    const passivePerception = stats.passivePerception || 10 + Math.floor((wisdom - 10) / 2);
    const initiativeBonus = Math.floor((dexterity - 10) / 2);

    // AC Resolution
    let ac = 10 + initiativeBonus; // Default unarmored
    if (blueprint?.ac) {
      ac = blueprint.ac;
    }

    // Actions Resolution
    // Actions Resolution
    const actions: EntityAction[] = [];

    // Check Sheet Source (Primary) or Blueprint Source (Fallback)
    const sourceActions = s.structuredActions || blueprint?.structuredActions;

    if (sourceActions) {
      actions.push(
        ...sourceActions.map((a) => ({
          id: a.id, // Ensure ID is preserved if available
          name: a.name,
          type: a.type || 'utility',
          toHit: a.toHit,
          reach: a.reach,
          range: a.range,
          damage: a.damage,
          save: a.save,
          description: a.description,
        }))
      );
    }

    // Inventory Actions
    if (!blueprint?.structuredActions && s.inventory) {
      const inventory = s.inventory;
      if (Array.isArray(inventory)) {
        inventory.forEach((item) => {
          if (item.name) {
            actions.push({
              name: item.name,
              type: 'melee', // Default to melee
              toHit: strength > dexterity ? Math.floor((strength - 10) / 2) + 2 : Math.floor((dexterity - 10) / 2) + 2,
              damage: [{ dice: '1d8', bonus: Math.floor((strength - 10) / 2), type: 'slashing' }], // Stub
              description: `Attack with ${item.name}`,
            });
          }
        });
      }
    }

    // Always add Unarmed Strike if no actions
    if (actions.length === 0) {
      actions.push({
        name: 'Unarmed Strike',
        type: 'melee',
        toHit: Math.floor((strength - 10) / 2) + 2,
        damage: [{ dice: '1', bonus: Math.floor((strength - 10) / 2), type: 'bludgeoning' }], // simplified
        description: 'Punch or Kick',
      });
    }

    // Features Resolution
    const features: EntityFeature[] = [];
    if (blueprint?.features) {
      features.push(
        ...blueprint.features.map((f) => ({
          name: f.name,
          description: f.description,
          usage: f.usage_max ? { max: f.usage_max, per: f.usage_per || 'long_rest' } : undefined,
        }))
      );
    }

    return {
      id: s.documentId,
      name,
      type: type as Entity['type'],
      hp,
      maxHp,
      ac,
      stats: {
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        passivePerception,
        initiativeBonus,
      },
      actions,
      features,
      color: '#ffffff', // Stub
      visionRadius: 30, // Stub
      speed: 30,
      position: s.position || { x: 0, y: 0, z: 0 },
    };
  },
});
