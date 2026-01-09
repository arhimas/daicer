/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Helper: Safe Relation Extractor
const extractRelation = <T>(source: any, field: string, mapper: (item: any) => T): T[] => {
  const rel = source?.[field];
  if (!rel) return [];
  if (Array.isArray(rel)) return rel.filter((i) => !!i).map(mapper);
  return []; // Should be array for manyToMany
};

// Remove local StrapiStats/StrapiAction in favor of Shared types or partials
type StrapiStats = Partial<StatBlock>;

export default () => ({
  adapt(s: unknown): Entity {
    // 1. Identify Type & Blueprint
    const raw = s as any;
    let type: Entity['type'] = (raw.type as Entity['type']) || 'monster';
    let blueprint: Record<string, unknown> | null = null;

    if (raw.character) {
      type = 'player';
      blueprint = raw.character;
    } else if (raw.monster) {
      type = 'monster';
      blueprint = raw.monster;
    }

    // 2. Extract Stats
    // Priority: Sheet Overrides > Blueprint Stats > Raw Attributes (Legacy)
    const sheetStats = raw.stats as StrapiStats | undefined;
    const rawAttrs = raw.attributes as StrapiStats | undefined;

    let blueprintStats: StrapiStats | undefined;
    if (blueprint?.stats) {
      blueprintStats = blueprint.stats as StrapiStats;
    }

    const strength = sheetStats?.strength ?? blueprintStats?.strength ?? rawAttrs?.strength ?? 10;
    const dexterity = sheetStats?.dexterity ?? blueprintStats?.dexterity ?? rawAttrs?.dexterity ?? 10;
    const constitution = sheetStats?.constitution ?? blueprintStats?.constitution ?? rawAttrs?.constitution ?? 10;
    const intelligence = sheetStats?.intelligence ?? blueprintStats?.intelligence ?? rawAttrs?.intelligence ?? 10;
    const wisdom = sheetStats?.wisdom ?? blueprintStats?.wisdom ?? rawAttrs?.wisdom ?? 10;
    const charisma = sheetStats?.charisma ?? blueprintStats?.charisma ?? rawAttrs?.charisma ?? 10;
    const passivePerception =
      sheetStats?.passivePerception ?? blueprintStats?.passivePerception ?? rawAttrs?.passivePerception ?? 10;

    // 3. Derived Utils
    const dexMod = Math.floor((dexterity - 10) / 2);
    const initiativeBonus = dexMod; // Simple rule for now

    // 4. Basic Info
    const name = (raw.name as string) || (blueprint?.name as string) || 'Unknown Entity';

    // Level & Classes
    const level = (raw.level as number) || (blueprint?.level as number) || 1;

    const classes = (raw.classes || blueprint?.classes || []) as any[];

    // 5. Inventory (Components)
    // Priority: Sheet Inventory Component
    const inventory: EntityItem[] = [];
    if (raw.inventory && Array.isArray(raw.inventory)) {
      inventory.push(
        ...raw.inventory.map((c: any) => ({
          id: c.id || `inv_${Math.random().toString(36).substr(2, 5)}`,
          quantity: c.quantity || 1,
          slot: c.slot || 'backpack',
          isEquipped: c.isEquipped || false,
          item: c.item
            ? {
                documentId: c.item.documentId || c.item.id,
                name: c.item.name || 'Unknown Item',
                description: c.item.description,
              }
            : undefined,
        }))
      );
    }

    // 6. Spells (Spellbook Component)
    const spells: EntitySpell[] = [];
    if (raw.spellbook) {
      // Known
      if (Array.isArray(raw.spellbook.knownSpells)) {
        spells.push(
          ...raw.spellbook.knownSpells.map((sp: any) => ({
            documentId: sp.documentId || sp.id,
            name: sp.name,
            level: sp.level,
            school: sp.school?.name,
            source: 'known' as const,
            castingTime: sp.casting_time,
            range: sp.range,
            description: sp.description,
          }))
        );
      }
      // Prepared
      if (Array.isArray(raw.spellbook.preparedSpells)) {
        spells.push(
          ...raw.spellbook.preparedSpells.map((sp: any) => ({
            documentId: sp.documentId || sp.id,
            name: sp.name,
            level: sp.level,
            school: sp.school?.name,
            source: 'prepared' as const,
            castingTime: sp.casting_time,
            range: sp.range,
            description: sp.description,
          }))
        );
      }
    }

    // 7. Actions (Components)
    // Priority: Sheet Actions Component
    const actions: EntityAction[] = [];
    if (raw.actions && Array.isArray(raw.actions)) {
      actions.push(
        ...raw.actions.map((a: any) => ({
          id: String(a.id),
          name: a.name,
          type: a.type || 'utility',
          toHit: a.toHit,
          damage: a.damage, // Pass through component data
          save: a.save,
          area: a.area,
          range: a.range, // From Component or Relation? Component schema has range? No, relation does. Wait, component game.action DOES have range field? No, schema.json for action has reach, toHit. Let's assume raw action has what we populated.
          // Fallback if Component lacks fields but Relation has them?
          // For now, rely on what SpawnService put into the Component.
          description: a.description,
          action_definition: a.action_definition
            ? {
                documentId: a.action_definition.documentId || a.action_definition.id,
                name: a.action_definition.name,
              }
            : undefined,
        }))
      );
    }
    // Inventory Actions (Fallback / Legacy Support)
    if (raw.inventory && Array.isArray(raw.inventory)) {
      const inv = raw.inventory as any[];
      inv.forEach((entry) => {
        const itemName = entry.name || entry.item?.name; // Component or Relation name
        if (itemName) {
          if (!actions.some((a) => a.name === itemName)) {
            actions.push({
              id: `inv-${itemName.replace(/\s+/g, '-').toLowerCase()}`,
              name: itemName,
              type: 'melee_attack',
              toHit: strength > dexterity ? Math.floor((strength - 10) / 2) + 2 : Math.floor((dexterity - 10) / 2) + 2,
              damage: [{ dice: '1d6', bonus: 0, type: 'slashing' }],
              description: `Attack with ${itemName} (Derived)`,
            });
          }
        }
      });
    }

    // Fallback: If no actions on sheet, we might want to derive unarmed?
    if (actions.length === 0) {
      actions.push({
        id: 'action-unarmed',
        name: 'Unarmed Strike',
        type: 'melee_attack',
        toHit: Math.floor((strength - 10) / 2) + 2,
        damage: [{ dice: '1', bonus: Math.floor((strength - 10) / 2), type: 'bludgeoning' }],
        description: 'Punch or Kick',
      });
    }

    // 8. Relations (Proficiencies, Languages, Traits)
    const probMapper = (p: any): EntityProficiency => ({
      documentId: p.documentId || p.id,
      name: p.name,
      type: p.type,
    });
    const proficiencies = extractRelation(raw, 'proficiencies', probMapper);

    const langMapper = (l: any): EntityLanguage => ({
      documentId: l.documentId || l.id,
      name: l.name,
      isRare: l.is_rare,
    });
    const languages = extractRelation(raw, 'languages', langMapper);

    const traitMapper = (t: any): EntityTrait => ({
      documentId: t.documentId || t.id,
      name: t.name,
      description: t.description,
    });
    const traits = extractRelation(raw, 'traits', traitMapper);

    // Features Resolution
    const features: EntityFeature[] = [];

    const sourceFeatures = extractRelation(raw, 'features', (f: any) => ({
      documentId: f.documentId || f.id,
      name: f.name,
      description: f.description,
      level: f.level,
    }));
    features.push(...sourceFeatures);

    // Sync back to structuredActions (ENSURE ID CONSISTENCY)
    if (actions.length > 0) {
      (s as any).structuredActions = actions;
    }

    // HP & AC
    let maxHp = (raw.maxHp as number) ?? (blueprint?.maxHp as number) ?? 10;
    if (maxHp < 1) maxHp = 1;
    const hp = (raw.currentHp as number) ?? (raw.hp as number) ?? maxHp;

    let armorClass = 10 + initiativeBonus;
    if (raw.armorClass !== undefined && raw.armorClass !== null) {
      armorClass = raw.armorClass as number;
    } else if (raw.ac !== undefined && raw.ac !== null) {
      armorClass = raw.ac as number;
    } else if (blueprint?.armorClass) {
      armorClass = blueprint.armorClass as number;
    } else if (blueprint?.ac) {
      armorClass = blueprint.ac as number;
    }

    // ID Resolution

    const rawId = (s as any).documentId || (s as any).id;
    const id = rawId ? String(rawId) : `temp_${Math.random().toString(36).substr(2, 9)}`;

    // Legacy equipment field (derived from inventory)
    const equipment = inventory.map((item) => ({
      id: item.id,
      name: item.item?.name || 'Unknown Item',
      quantity: item.quantity,
      isEquipped: item.isEquipped,
      slot: item.slot || 'backpack', // Fix: Added required slot property
    }));

    return {
      id,
      name,
      type: type as Entity['type'],
      hp,
      maxHp,
      armorClass,
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
      level,
      classes,
      equipment, // This legacy field is generated from `inventory` / `equipment_items` earlier in file
      actions,
      features,

      conditions: (raw.conditions || []) as any[],
      resistances: (raw.resistances || blueprint?.resistances || []) as string[],
      immunities: (raw.immunities || blueprint?.immunities || []) as string[],
      vulnerabilities: (raw.vulnerabilities || blueprint?.vulnerabilities || []) as string[],
      color: '#ffffff',
      visionRadius: 30,
      sheet: {
        id: (s as any).documentId || (s as any).id,
        documentId: (s as any).documentId,
        name,
        race: (raw.race as string) || (blueprint?.race as string) || 'Unknown',
        characterClass: (raw.characterClass as string) || (blueprint?.characterClass as string) || 'Unknown Class',
        level,
        xp: (raw.xp as number) ?? (blueprint?.xp as number) ?? 0,

        // Core Vitals
        hp,
        maxHp,
        temporaryHp: (raw.temporaryHp as number) ?? 0,
        armorClass,
        speed: (raw.speed as number) ?? 30,
        initiative: 0,
        initiativeBonus,
        proficiencyBonus: (raw.proficiencyBonus as number) ?? 2,
        inspiration: (raw.inspiration as boolean) ?? false,

        // Defenses
        resistances: (raw.resistances || blueprint?.resistances || []) as string[],
        immunities: (raw.immunities || blueprint?.immunities || []) as string[],
        vulnerabilities: (raw.vulnerabilities || blueprint?.vulnerabilities || []) as string[],

        // Resources
        hitDice: (raw.hitDice as any) || { total: level, current: level, die: '1d8' },
        deathSaves: (raw.deathSaves as any) || { successes: 0, failures: 0 },
        currency: (raw.currency as any) || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        resources: (raw.resources as any[]) || [],
        conditions: (raw.conditions as any[]) || [],

        // Attributes & Skills
        attributes: {
          Strength: strength,
          Dexterity: dexterity,
          Constitution: constitution,
          Intelligence: intelligence,
          Wisdom: wisdom,
          Charisma: charisma,
        },
        skills: (raw.skills as any) || {},
        skillDetails: (raw.skillDetails as any[]) || [],
        expertises: (raw.expertises as string[]) || [],
        savingThrows: (raw.savingThrows as any) || { fortitude: 0, reflex: 0, will: 0 },

        // Equipment & Actions
        actions,
        inventory,
        equipment: (raw.equipment as any[]) || [], // legacy
        structuredActions: actions, // legacy

        // Magic
        spells,
        spellbook: raw.spellbook
          ? {
              id: raw.spellbook.id,
              knownSpells: raw.spellbook.knownSpells?.map((s: any) => s.documentId || s.id),
              preparedSpells: raw.spellbook.preparedSpells?.map((s: any) => s.documentId || s.id),
              spellcastingAbility: raw.spellbook.spellcastingAbility || 'intelligence',
              spellSaveDc: raw.spellbook.spellSaveDc || 10,
              spellAttackBonus: raw.spellbook.spellAttackBonus || 0,
              concentratingOn: raw.spellbook.concentratingOn,
              slots: raw.spellbook.slots || [],
            }
          : undefined,

        // Relations
        proficiencies,
        languages,
        traits,
        features,
        talents: (raw.talents as any[]) || [],

        // Flavor
        class: blueprint?.class || null,
        background: (raw.background as string) || '',
        alignment: (raw.alignment as string) || '',
        appearance: (raw.appearance as any) || {
          age: '',
          height: '',
          weight: '',
          eyes: '',
          skin: '',
          hair: '',
          description: '',
        },
        personality: (raw.personality as any) || {
          traits: '',
          ideals: '',
          bonds: '',
          flaws: '',
        },
        backstory: (raw.backstory as string) || '',
        backgroundDetails: (raw.backgroundDetails as any) || {
          origin: '',
          upbringing: '',
          motivation: '',
          keyEvents: [],
          allies: [],
        },
        alliesAndOrganizations: (raw.alliesAndOrganizations as string) || '',
        treasure: (raw.treasure as string) || '',
        advancementPoints: (raw.advancementPoints as any) || { ability: 0, skill: 0, talent: 0 },
        avatarAssets: (raw.avatarAssets as any) || undefined,
      },
      // Top Level Flattened for contracts (replaces legacy fields)
      speed: (raw.speed as number) ?? 30,
      position: (s as any).position || { x: 0, y: 0, z: 0 },
    };
  },
});
