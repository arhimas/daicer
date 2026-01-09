import {
  Entity,
  EntityAction,
  EntityFeature,
  EntityItem,
  EntityLanguage,
  EntityProficiency,
  EntitySpell,
  EntityTrait,
  StatBlock,
} from '../../../engine';

// =============================================================================
// STRICT SOURCE TYPES (Mirrors Strapi Schema)
// =============================================================================

export interface StrapiComponentStats {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  passivePerception?: number;
  initiativeBonus?: number;
}

export interface StrapiInventoryItem {
  id: string | number;
  quantity: number;
  slot: string;
  isEquipped: boolean;
  item?: {
    documentId: string;
    name: string;
    description?: string;
    [key: string]: unknown;
  };
}

export interface StrapiSpell {
  documentId: string;
  name: string;
  level: number;
  school?: { name: string };
  casting_time?: string;
  range?: string;
  description?: string;
}

export interface StrapiSpellbook {
  id: string | number;
  knownSpells?: StrapiSpell[];
  preparedSpells?: StrapiSpell[];
  spellcastingAbility?: string;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  slots?: unknown[]; // Simplifying generic slots for now
  concentratingOn?: unknown;
}

export interface StrapiAction {
  documentId: string;
  name: string;
  type?: EntityAction['type']; // Use engine type
  toHit?: number;
  damage?: { dice: string; bonus?: number; type: string }[];
  save?: { dc?: number; stat?: string };
  area?: { type: string; size: number };
  range?: number | string; // 60 or "60/120"
  description?: string;
  action_definition?: {
    documentId: string;
    name: string;
  };
}

export interface StrapiEntitySheet {
  documentId: string;
  name: string;
  type: 'player' | 'monster' | 'npc';

  // Vitals
  currentHp?: number;
  maxHp?: number;
  ac?: number;
  armorClass?: number; // Legacy/Blueprint fallback
  speed?: number;

  // Relations/Blueprints
  character?: {
    documentId: string;
    name: string;
    stats?: StrapiComponentStats;
    classes?: unknown[];
    race?: unknown;
    background?: string;
  };
  monster?: {
    documentId: string;
    name: string;
    stats?: StrapiComponentStats;
    ac?: number;
    hp?: number;
    challenge_rating?: number;
    actions?: StrapiAction[];
    features?: { documentId: string; name: string; description?: string }[];
    resistances?: string[];
    immunities?: string[];
    vulnerabilities?: string[];
  };

  // Components
  stats?: StrapiComponentStats;
  inventory?: StrapiInventoryItem[];
  spellbook?: StrapiSpellbook;

  // Direct Relations
  actions?: StrapiAction[];
  proficiencies?: { documentId: string; name: string; type?: string }[];
  languages?: { documentId: string; name: string; is_rare?: boolean }[];
  traits?: { documentId: string; name: string; description?: string }[];
  features?: { documentId: string; name: string; description?: string; level?: number }[];

  // Misc
  resistances?: string[];
  immunities?: string[];
  vulnerabilities?: string[];
  position?: { x: number; y: number; z: number };
  color?: string;

  // Catch-all
  [key: string]: unknown;
}

// =============================================================================
// ADAPTER LOGIC
// =============================================================================

export const resolveBaseStats = (sheet: StrapiEntitySheet): StatBlock => {
  const s = sheet.stats || {};
  const b = sheet.character?.stats || sheet.monster?.stats || {};

  // Helper to fallback: Sheet > Blueprint > Default 10
  const getStat = (key: keyof StrapiComponentStats) => s[key] ?? b[key] ?? 10;

  const strength = getStat('strength');
  const dexterity = getStat('dexterity');
  const constitution = getStat('constitution');
  const intelligence = getStat('intelligence');
  const wisdom = getStat('wisdom');
  const charisma = getStat('charisma');

  // Derived
  const initiativeBonus = Math.floor((dexterity - 10) / 2);
  const passivePerception = getStat('passivePerception') || 10 + Math.floor((wisdom - 10) / 2);

  return {
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
    passivePerception,
    initiativeBonus,
  };
};

export const resolveInventory = (inventory?: StrapiInventoryItem[]): EntityItem[] => {
  if (!inventory || !Array.isArray(inventory)) return [];

  return inventory.map((entry) => ({
    id: entry.id ? String(entry.id) : `inv_${Math.random().toString(36).substring(2, 7)}`,
    quantity: entry.quantity || 1,
    slot: entry.slot || 'backpack',
    isEquipped: !!entry.isEquipped,
    item: entry.item
      ? {
          documentId: entry.item.documentId,
          name: entry.item.name,
          description: entry.item.description,
        }
      : undefined,
  }));
};

export const resolveSpells = (sheet: StrapiEntitySheet): EntitySpell[] => {
  const spells: EntitySpell[] = [];
  const sb = sheet.spellbook;

  if (!sb) return spells;

  const mapSpell = (s: StrapiSpell, source: 'known' | 'prepared'): EntitySpell => ({
    documentId: s.documentId,
    name: s.name,
    level: s.level || 0,
    school: s.school?.name,
    source,
    castingTime: s.casting_time,
    range: s.range,
    description: s.description,
  });

  if (Array.isArray(sb.knownSpells)) {
    spells.push(...sb.knownSpells.map((s) => mapSpell(s, 'known')));
  }

  if (Array.isArray(sb.preparedSpells)) {
    // Avoid duplicates if a spell is both known and prepared (prefer prepared source marker?)
    // Actually, usually we list all. Frontend can dedupe or show status.
    // For now, simple push.
    sb.preparedSpells.forEach((s) => {
      if (!spells.find((existing) => existing.documentId === s.documentId)) {
        spells.push(mapSpell(s, 'prepared'));
      } else {
        // Update source to 'prepared' if already exists as known?
        const existing = spells.find((e) => e.documentId === s.documentId);
        if (existing) existing.source = 'prepared';
      }
    });
  }

  return spells;
};

export const resolveActions = (sheet: StrapiEntitySheet, stats: StatBlock): EntityAction[] => {
  const actions: EntityAction[] = [];

  // 1. Explicit Actions from Relation (Sheet > Monster Blueprint)
  const sourceActions = sheet.actions && sheet.actions.length > 0 ? sheet.actions : sheet.monster?.actions || [];

  if (sourceActions && Array.isArray(sourceActions)) {
    actions.push(
      ...sourceActions.map((a) => ({
        id: String(a.documentId || Math.random()),
        name: a.name,
        type: (a.type as any) || 'utility',
        toHit: a.toHit,
        damage: a.damage as any, // Pass-through JSON
        save: a.save as any,
        area: a.area as any,
        range: a.range as any,
        description: a.description,
        action_definition: a.action_definition
          ? {
              documentId: a.action_definition.documentId,
              name: a.action_definition.name,
            }
          : undefined,
      }))
    );
  }

  // 2. Unarmed Strike Fallback
  if (actions.length === 0) {
    const strMod = Math.floor((stats.strength - 10) / 2);
    actions.push({
      id: 'action-unarmed',
      name: 'Unarmed Strike',
      type: 'melee_attack',
      toHit: 2 + strMod, // Proficiency (2) + Str
      damage: [{ dice: '1', bonus: strMod, type: 'bludgeoning' }],
      description: 'Standard unarmed strike',
    });
  }

  return actions;
};

// =============================================================================
// MAIN SERVICE EXPORT
// =============================================================================

export default () => ({
  adapt(input: unknown): Entity {
    // 0. Safety Cast
    const sheet = input as StrapiEntitySheet;
    if (!sheet || typeof sheet !== 'object') {
      throw new Error('EntityAdapter received invalid input');
    }

    // 1. Resolve Components
    const stats = resolveBaseStats(sheet);
    const inventory = resolveInventory(sheet.inventory);
    const spells = resolveSpells(sheet);
    const actions = resolveActions(sheet, stats);

    // 2. Resolve Vitals
    const maxHp = sheet.maxHp || sheet.monster?.hp || 10;
    const hp = sheet.currentHp ?? maxHp;

    // AC Logic: Sheet Override > Monster AC > 10 + Dex
    let armorClass = sheet.ac ?? sheet.armorClass;
    if (armorClass === undefined) {
      if (sheet.monster?.ac) armorClass = sheet.monster.ac;
      else armorClass = 10 + stats.initiativeBonus;
    }

    // 3. Relations
    const proficiencies: EntityProficiency[] = (sheet.proficiencies || []).map((p) => ({
      documentId: p.documentId,
      name: p.name,
      type: p.type,
    }));

    const languages: EntityLanguage[] = (sheet.languages || []).map((l) => ({
      documentId: l.documentId,
      name: l.name,
      isRare: l.is_rare,
    }));

    const traits: EntityTrait[] = (sheet.traits || [])
      .concat((sheet.monster?.features as any) || [] /* legacy mix */)
      .map((t) => ({
        documentId: t.documentId,
        name: t.name,
        description: t.description,
      }));

    const features: EntityFeature[] = (sheet.features || []).map((f) => ({
      documentId: f.documentId,
      name: f.name,
      description: f.description,
      level: f.level,
    }));

    // 4. Construct Output
    return {
      id: sheet.documentId, // Strict reliance on documentId
      name: sheet.name || 'Unknown Entity',
      type: sheet.type || 'monster',
      position: (sheet as any).position || { x: 0, y: 0, z: 0 },

      hp,
      maxHp,
      armorClass,
      speed: sheet.speed || 30,

      level: sheet.character?.classes?.[0] ? 1 : sheet.monster ? (sheet.monster as any).challenge_rating : 1, // Simplistic level for now

      stats,
      // We map inventory to 'equipment' logic if needed,
      // but Engine 'equipment' field is CharacterEquipment (EntityItem[]).
      equipment: inventory,

      actions,
      features,

      // Relations
      conditions: [], // Runtime only, not on sheet usually
      resistances: sheet.resistances || (sheet.monster?.resistances as any) || [],
      immunities: sheet.immunities || (sheet.monster?.immunities as any) || [],
      vulnerabilities: sheet.vulnerabilities || (sheet.monster?.vulnerabilities as any) || [],

      // Visuals
      color: (sheet as any).color || '#ffffff',
      visionRadius: 30, // Default

      // Embed the sheet for full detail access
      sheet: {
        ...sheet,
        // Ensure strictly typed fields override any loose JSON
        hp,
        maxHp,
        stats: { ...stats }, // Ensure shape matches
        inventory: inventory as any, // engine expects exact shape?
        // Note: engine types might differ slightly on inventory item, checked above, looks compatible (InventoryItem vs EntityItem alias)
        actions,
        spells,
        proficiencies,
        languages,
        traits,
        features,
        // Legacy
        spellbook: sheet.spellbook
          ? ({
              ...sheet.spellbook,
              // normalize IDs if needed? StrapiSpell already has documentId.
            } as any)
          : undefined,
      } as any, // Cast to any to satisfy the complex EntitySheet generic union if needed/inferred
    };
  },
});
