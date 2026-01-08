import { COLLECTION_MAP } from '../../constants';
import { updateEntity } from '../../../../utils/strapi-client';
import { getActionDefinitionId, getSpellDefinitionId, getEquipmentDefinitionId } from '../../action-utils';

export const monsterHandler = async (entity: any, result: any, client: any) => {
  const allRawActions = [
    ...(result.actions || []),
    ...(result.legendary_actions || []).map((la: any) => ({ ...la, activation_type: 'legendary' })),
  ];

  const actions = await Promise.all(
    allRawActions.map(async (a: any) => {
      // 1. Spell Inference (Check if action name matches a known spell)
      let spellDefId = await getSpellDefinitionId(a.name, client);
      if (!spellDefId && a.type === 'spell') {
        // Should have been found, but maybe name mismatch? Keep as generic action.
      }
      const isSpell = !!spellDefId || a.type === 'spell';

      // 2. Equipment Inference
      const isWeapon = a.type === 'melee_weapon' || a.type === 'ranged_weapon';
      const equipmentDefId = isWeapon ? await getEquipmentDefinitionId(a.name, client) : null;

      const uniqueName = isSpell ? a.name : `${entity.name} ${a.name}`;
      const actionType = isSpell ? 'spell' : a.type === 'ranged_weapon' ? 'ranged' : 'melee';

      const normalizeDamageType = (dt: string): string => {
        if (!dt) return 'Slashing';
        const valid = [
          'Acid',
          'Bludgeoning',
          'Cold',
          'Fire',
          'Force',
          'Lightning',
          'Necrotic',
          'Piercing',
          'Poison',
          'Psychic',
          'Radiant',
          'Slashing',
          'Thunder',
        ];
        const formatted = dt.charAt(0).toUpperCase() + dt.slice(1).toLowerCase();
        return valid.includes(formatted) ? formatted : 'Slashing';
      };

      const dmgConfig = {
        dice_count: a.damage_dice || (a.damage_bonus ? 1 : 0),
        dice_value: a.damage_dice_value || 6,
        flat_bonus: a.damage_bonus || 0,
        damage_type: normalizeDamageType(a.damage_type),
        effect_type: 'Damage',
        timing: 'Instant',
      };
      const finalDamage = dmgConfig.dice_count > 0 ? [dmgConfig] : [];

      const richData = {
        damage: finalDamage,
        range: a.range,
        reach: a.reach,
        save: a.save_dc ? { dc: a.save_dc, stat: (a.save_attribute || 'str').toLowerCase().slice(0, 3) } : null,
      };

      // Only create generic action definition if it's NOT a pure spell or we want both
      // Usually monsters have specific versions of spells, but if it IS a spell, we prefer the Spell Link.
      const actionDefId = await getActionDefinitionId(
        uniqueName,
        a.type,
        (a.description || '').substring(0, 1000),
        richData,
        client
      );

      return {
        name: a.name,
        type: actionType,
        activation_type: a.activation_type || 'action',
        toHit: a.toHit || 0,
        reach: a.reach || 5,
        damage: finalDamage,
        save: richData.save,
        description: (a.description || '').substring(0, 1000),
        action_definition: actionDefId,
        spell_definition: spellDefId,
        equipment_definition: equipmentDefId,
      };
    })
  );

  const uniqueActions = actions.filter((a: any, i, self) => i === self.findIndex((t: any) => t.name === a.name));

  // Sanitize for Strapi 'game.action' Component
  const sanitizedActions = uniqueActions.map((a: any) => ({
    name: a.activation_type === 'legendary' ? `[Legendary] ${a.name}` : a.name,
    type: ['melee', 'ranged', 'spell', 'utility'].includes(a.type) ? a.type : 'utility', // Strict Enum
    toHit: a.toHit,
    reach: a.reach, // Note: game.action has 'reach', not 'range'
    damage: a.damage,
    save: a.save,
    description: a.description,
    action_definition: a.action_definition,
    spell_definition: a.spell_definition,
    // equipment_definition is NOT in game.action schema, so we don't send it here.
  }));

  const sanitizedFeatures = [
    ...(result.features || []),
    ...(result.reactions || []).map((r: any) => ({ ...r, name: `[Reaction] ${r.name}` })),
  ].map((f: any) => ({
    name: f.name,
    description: f.description,
    source: 'monster',
    // activation_type is NOT in game.feature schema
    // usage_max/usage_per can be passed if extracted, but defaulting to undefined is safe.
  }));

  await updateEntity(COLLECTION_MAP.monsters, entity.documentId || entity.id, {
    structuredActions: sanitizedActions,
    features: sanitizedFeatures,
    actions: uniqueActions.map((a: any) => a.action_definition).filter(Boolean),
    spells: uniqueActions.map((a: any) => a.spell_definition).filter(Boolean),
    equipments: uniqueActions.map((a: any) => a.equipment_definition).filter(Boolean),
  });
};
