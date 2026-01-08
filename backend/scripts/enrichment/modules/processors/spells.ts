import { processCollection } from './enrichment-runner';
import { COLLECTION_MAP } from '../constants';
import { SpellSchema } from '../schemas';
import { updateEntity } from '../../../utils/strapi-client';

export const runSpells = async (limit: number, isDryRun: boolean) => {
  await processCollection({
    uid: COLLECTION_MAP.spells,
    schema: SpellSchema,
    promptTemplate: `You are a D&D Rules Engine. Analyze the provided Spell description and extract its mechanical data.
    - Accurately identify Magic School, Concentration (Duration), and Ritual tags.
    - Map Casting Time to Action, Bonus Action, or Reaction.
    - Map Range to 'Self', 'Touch', 'Ranged (Feet)', 'Sight', or 'Unlimited'.
    - For Areas (Cone, Cube, etc.), set Range Type to 'Self' (if originating from caster) or 'Ranged (Feet)' AND set strict AOE Shape/Size.
    - CONDITIONS: Use ONLY these: Blinded, Charmed, Deafened, Exhaustion, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious. If unsure or unique (like 'Resistance'), use 'Special' and describe it.
    - CONDITIONS: Use ONLY these: Blinded, Charmed, Deafened, Exhaustion, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious. If unsure or unique (like 'Resistance'), use 'Special' and describe it.
    - Parse all damage as split values: dice_count (e.g. 8), dice_value (e.g. 6), flat_bonus (e.g. 0).
    - DAMAGE TYPE: Choose ONE primary type from: Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder. If 'Radiant or Necrotic', pick the most common one or create two separate damage instances.
    - MECHANICS: Identify the precise Action Type (e.g. 'Melee Spell Attack', 'Dexterity Save', 'Auto-Hit', or 'None' for utilities).
    - MECHANICS: If a Save is present, identify the Save Effect (e.g. 'Half' or 'Negate').
    - DURATION: Strictly map Duration Type (Instantaneous, Concentration, Time-Limited) and extract Value/Unit.
    - SCALING: If the spell says "At Higher Levels", extract the Dice Count/Value scaling rules.
    
    RESPONSE FORMAT EXAMPLE:
    {
      "school": "Evocation",
      "casting_config": { "time_value": 1, "time_unit": "Action", "is_concentration": false, "is_ritual": false, "components": { "verbal": true, "somatic": true, "material": false } },
      "range_config": { "type": "Ranged (Feet)", "distance": 60, "aoe_shape": "Sphere", "aoe_size": 20 },
      "duration_config": { "type": "Instantaneous", "concentration": false },
      "mechanics_config": { "action_type": "Dexterity Save", "save_effect": "Half" },
      "damage_instances": [{ "dice_count": 8, "dice_value": 6, "damage_type": "Fire", "timing": "Instant", "effect_type": "Damage" }],
      "condition_instances": [{ "condition": "Prone", "description": "Knocked prone on failed save" }],
      "scaling_config": { "scales": true, "type": "Dice", "method": "Per Slot Level", "dice_count": 1, "dice_value": 6 }
    }`,
    limit,
    isDryRun,
    handler: async (entity, result) => {
      // Helper to truncate (Max 250 for short text fields)
      if (result.condition_instances) {
        result.condition_instances.forEach((c: any) => {
          if (c.description) c.description = c.description.substring(0, 250);
        });
      }
      if (result.casting_config?.components?.material_description) {
        result.casting_config.components.material_description =
          result.casting_config.components.material_description.substring(0, 200);
      }
      const res = await updateEntity(COLLECTION_MAP.spells, entity.documentId || entity.id, result);
      if (!res) throw new Error('DB Update Failed');
    },
  });
};
