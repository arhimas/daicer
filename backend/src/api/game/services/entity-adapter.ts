import { Entity, EntityAction, EntityFeature, EntitySheet, StatBlock } from '../../../engine';

// Remove local StrapiStats/StrapiAction in favor of Shared types or partials
type StrapiStats = Partial<StatBlock>;

export default () => ({
  adapt(s: unknown): Entity {
    // 1. Identify Type & Blueprint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = s as any;
    let type: Entity['type'] = (raw.type as Entity['type']) || 'monster';
    let blueprint: Record<string, unknown> | null = null;

    // Type guard / Casting

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = (raw.classes || blueprint?.classes || []) as any[];

    // Equipment

    // Inventory / Equipment Integration
    // Priority: equipment_items (Component) > equipment (Relation Legacy) > raw.inventory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const equipmentItems = (raw.equipment_items || blueprint?.equipment_items || []) as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawEquipments = (raw.equipments || blueprint?.equipments || []) as any[]; // Legacy fallback

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const equipment: any[] = [];

    if (equipmentItems.length > 0) {
      // Modern Component Path
      equipment.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...equipmentItems.map((c: any) => {
          // Handle Relation expansion if populated
          const itemData = c.item || {};
          const name = itemData.name || 'Unknown Item';

          return {
            id: c.id || `eq_${Math.random().toString(36).substr(2, 5)}`,
            name: name,
            quantity: c.quantity || 1,
            slot: c.slot || 'backpack',
            isEquipped: c.isEquipped || false,
            definitionId: itemData.documentId || itemData.id, // Link to definition
          };
        })
      );
    } else if (rawEquipments.length > 0) {
      // Legacy Relation Path
      equipment.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...rawEquipments.map((e: any) => ({
          id: e.documentId || e.id,
          name: e.name || 'Unknown',
          quantity: 1,
          slot: 'backpack',
          isEquipped: false,
        }))
      );
    }

    // Use currentHp if available, fallback to hp (often synonymous in DB), fallback to maxHp or blueprint default
    let maxHp = (raw.maxHp as number) ?? (blueprint?.maxHp as number) ?? 10;
    if (maxHp < 1) maxHp = 1; // Safety clamp
    const hp = (raw.currentHp as number) ?? (raw.hp as number) ?? maxHp;

    // AC Resolution
    let armorClass = 10 + initiativeBonus; // Default unarmored
    if (raw.armorClass !== undefined && raw.armorClass !== null) {
      armorClass = raw.armorClass as number;
    } else if (raw.ac !== undefined && raw.ac !== null) {
      armorClass = raw.ac as number;
    } else if (blueprint?.armorClass) {
      armorClass = blueprint.armorClass as number;
    } else if (blueprint?.ac) {
      armorClass = blueprint.ac as number;
    }

    // Actions Resolution
    const actions: EntityAction[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceActions = (raw.structuredActions || blueprint?.structuredActions || raw.actions) as any[]; // Added raw.actions for legacy

    // ... (Map Action Type helper)
    const mapActionType = (t: string): EntityAction['type'] => {
      if (t === 'melee' || t === 'melee_attack') return 'melee_attack';
      if (t === 'ranged' || t === 'ranged_attack') return 'ranged_attack';
      if (t === 'spell') return 'spell';
      return 'utility';
    };

    if (sourceActions) {
      actions.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...sourceActions.map((a: any) => {
          const rawId = a.documentId || a.id;
          const id =
            typeof rawId === 'string' && isNaN(Number(rawId))
              ? rawId
              : `action_${rawId || Math.random().toString(36).substr(2, 9)}`;

          let type: EntityAction['type'] = 'utility';
          if (a.type) {
            type = mapActionType(a.type);
          } else if (a.damage && a.damage.length > 0) {
            type = 'melee_attack';
          }

          // Handle Legacy/JSON vs Component/Relation structure
          const toHit = a.toHit ?? 0; // New api::action field

          // Handle Range/Reach resolution from Component or raw
          let range = a.range;
          let reach = a.reach;
          if (!range && !reach && a.range_config) {
            if (a.range_config.type === 'Touch' || a.range_config.type === 'Reach') {
              reach = a.range_config.distance;
            } else {
              range = a.range_config.distance;
            }
          }

          const actionObj = {
            id,
            name: a.name,
            type,
            toHit,
            reach,
            range,
            damage: a.damage_instances || a.damage, // Handle component vs JSON
            save: a.save,
            description: a.description,
          };
          return actionObj;
        })
      );
    }

    // Inventory Actions
    if (!blueprint?.structuredActions && raw.inventory) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inventory = raw.inventory as any[];
      if (Array.isArray(inventory)) {
        inventory.forEach((item) => {
          if (item.name) {
            actions.push({
              id: `inv-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
              name: item.name,
              type: 'melee_attack',
              toHit: strength > dexterity ? Math.floor((strength - 10) / 2) + 2 : Math.floor((dexterity - 10) / 2) + 2,
              damage: [{ dice: '1d8', bonus: Math.floor((strength - 10) / 2), type: 'slashing' }],
              description: `Attack with ${item.name}`,
            });
          }
        });
      }
    }

    // Unarmed
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

    // Features Resolution
    const features: EntityFeature[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sourceFeatures = (raw.features || blueprint?.features) as any[]; // check raw.features too
    if (sourceFeatures) {
      features.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...sourceFeatures.map((f: any) => ({
          name: f.name,
          description: f.description,
          usage: f.usage_max ? { max: f.usage_max, per: f.usage_per || 'long_rest' } : undefined,
        }))
      );
    }

    // Sync back to structuredActions (Side effect, maybe remove? Keeping for now)
    // Sync back to structuredActions (ENSURE ID CONSISTENCY)
    if (actions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s as any).structuredActions = actions;
    }

    // ID Resolution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawId = (s as any).documentId || (s as any).id;
    const id = rawId ? String(rawId) : `temp_${Math.random().toString(36).substr(2, 9)}`;

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
      equipment,
      actions,
      features,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions: (raw.conditions || []) as any[],
      resistances: (raw.resistances || blueprint?.resistances || []) as string[],
      immunities: (raw.immunities || blueprint?.immunities || []) as string[],
      vulnerabilities: (raw.vulnerabilities || blueprint?.vulnerabilities || []) as string[],
      color: '#ffffff',
      visionRadius: 30,
      speed: (raw.speed as number) ?? 30, // Use raw speed if present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      position: (s as any).position || { x: 0, y: 0, z: 0 },
      sheet: s as unknown as EntitySheet,
    };
  },
});
