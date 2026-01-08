const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GOOGLE_API_KEY or GEMINI_API_KEY not found in .env files.');
  process.exit(1);
}

/**
 * Comprehensive Game Data Enrichment Script (Premium CLI Mode)
 *
 * Usage: yarn tsx backend/scripts/enrichment/enrich-game-data.ts [--target=spells|monsters|equipment|magic-items|all] [--limit=10000] [--dry-run]
 */

import { z } from 'zod';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { getStrapiClient, updateEntity } from '../utils/strapi-client';
import ShortUniqueId from 'short-unique-id';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import { jsonrepair } from 'jsonrepair';

const uidGen = new ShortUniqueId({ length: 8 });

// --- Configuration ---
const COLLECTION_MAP = {
  spells: 'spells',
  equipment: 'equipments',
  'magic-items': 'magic-items',
  monsters: 'monsters',
};

const MODEL_NAME = 'gemini-3-flash-preview';
const CONCURRENCY_LIMIT = 16; // Adjusted to 16 for optimal stability vs speed

// --- Shared Configuration Schemas ---
const CastingConfigSchema = z.object({
  time_value: z.number().describe('Numeric value of casting time'),
  time_unit: z.enum(['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'Day', 'Round']),
  reaction_trigger: z.string().optional().nullable().describe('Trigger condition if reaction'),
  is_ritual: z.boolean(),
  components: z.object({
    verbal: z.boolean(),
    somatic: z.boolean(),
    material: z.boolean(),
    material_description: z.string().optional().nullable(),
    cost_gp: z.number().default(0),
    consumed: z.boolean().default(false),
  }),
});

const RangeConfigSchema = z.object({
  type: z.enum(['Self', 'Touch', 'Ranged (Feet)', 'Ranged (Miles)', 'Sight', 'Unlimited']),
  distance: z.number().optional().nullable(),
  aoe_shape: z.enum(['Cone', 'Cube', 'Cylinder', 'Line', 'Sphere', 'Hemisphere']).optional().nullable(),
  aoe_size: z.number().optional().nullable(),
  aoe_height: z.number().optional().nullable(),
});

const DurationConfigSchema = z.object({
  type: z.enum(['Instantaneous', 'Concentration', 'Time-Limited', 'Until Dispelled', 'Until Triggered', 'Special']),
  value: z.number().optional().nullable(),
  unit: z.enum(['Rounds', 'Minutes', 'Hours', 'Days']).optional().nullable(),
  concentration: z.boolean().default(false),
});

const MechanicsConfigSchema = z.object({
  action_type: z.enum([
    'Melee Spell Attack',
    'Ranged Spell Attack',
    'Melee Weapon Attack',
    'Ranged Weapon Attack',
    'Strength Save',
    'Dexterity Save',
    'Constitution Save',
    'Intelligence Save',
    'Wisdom Save',
    'Charisma Save',
    'Auto-Hit',
    'None',
  ]),
  save_effect: z.enum(['Negate', 'Half', 'None']).optional().nullable(),
});

const DamageInstanceSchema = z.object({
  effect_type: z.enum(['Damage', 'Healing', 'TempHP']),
  damage_type: z
    .enum([
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
    ])
    .optional()
    .nullable(),
  dice_count: z.number(),
  dice_value: z.number(),
  flat_bonus: z.number().default(0),
  timing: z.enum(['Instant', 'Start of Turn', 'End of Turn', 'One Time Trigger']).default('Instant'),
});

const ConditionInstanceSchema = z.object({
  condition: z.enum([
    'Blinded',
    'Charmed',
    'Deafened',
    'Exhaustion',
    'Frightened',
    'Grappled',
    'Incapacitated',
    'Invisible',
    'Paralyzed',
    'Petrified',
    'Poisoned',
    'Prone',
    'Restrained',
    'Stunned',
    'Unconscious',
    'Special',
  ]),
  description: z.string().optional().nullable(),
  chance: z.number().default(100),
  duration_rounds: z.number().optional().nullable(),
});

const ScalingConfigSchema = z.object({
  scales: z.boolean(),
  type: z.enum(['Dice', 'Target', 'Duration']).default('Dice'),
  method: z.enum(['Per Slot Level', 'Every 2 Slot Levels', 'Specific Thresholds']).default('Per Slot Level'),
  dice_count: z.number().optional().nullable(),
  dice_value: z.number().optional().nullable(),
});

// --- Entity Specific Schemas ---

const SpellSchema = z.object({
  casting_config: CastingConfigSchema.optional().nullable(),
  range_config: RangeConfigSchema.optional().nullable(),
  duration_config: DurationConfigSchema.optional().nullable(),
  mechanics_config: MechanicsConfigSchema.optional().nullable(),
  damage_instances: z.array(DamageInstanceSchema).optional().nullable(),
  condition_instances: z.array(ConditionInstanceSchema).optional().nullable(),
  scaling_config: ScalingConfigSchema.optional().nullable(),
});

const WeaponSchema = z.object({
  damage_dice: z.string().describe('e.g. 1d8'),
  damage_type: z.string().describe('e.g. Slashing'),
  range_normal: z.number().optional().nullable(),
  range_long: z.number().optional().nullable(),
  properties: z.array(z.string()).describe("List of weapon properties e.g. ['Finesse', 'Light']"),
  versatile_damage: z.string().optional().nullable().describe('e.g. 1d10'),
});

const MagicItemSchema = z.object({
  rarity: z.enum(['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']),
  requires_attunement: z.boolean(),
  attunement_description: z.string().optional().nullable(),
  has_charges: z.boolean(),
  max_charges: z.number().optional().nullable(),
  recharge_formula: z.string().optional().nullable().describe('e.g. 1d6+1'),
  recharge_trigger: z.enum(['Dawn', 'Dusk', 'Long Rest', 'Special']).optional().nullable(),
  active_abilities: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        charge_cost: z.number().default(0),
      })
    )
    .optional(),
});

const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  usage_max: z.number().optional().nullable(),
  usage_per: z.enum(['short_rest', 'long_rest', 'day', 'dawn', 'dusk', 'other']).optional().nullable(),
});

const MonsterEnrichmentSchema = z.object({
  actions: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['melee_weapon', 'ranged_weapon', 'spell', 'ability', 'other']).default('other'),
      description: z.string(),
      toHit: z.number().optional().nullable(),
      range: z.number().optional().nullable(),
      reach: z.number().optional().nullable(),
      damage_dice: z.number().optional().nullable(),
      damage_bonus: z.number().optional().nullable(),
      damage_type: z.string().optional().nullable(),
      save_dc: z.number().optional().nullable(),
      save_attribute: z.string().optional().nullable(),
    })
  ),
  features: z.array(FeatureSchema).optional().default([]),
});

const ClassEnrichmentSchema = z.object({
  features: z.array(FeatureSchema).default([]),
});

// --- Main Runner ---

const run = async () => {
  console.log(
    boxen(
      gradient.passion('  🎲  DAICER ENRICHMENT ENGINE  🎲  ') + `\n${chalk.dim('  Powered by Gemini 3.0 Flash  ')}`,
      {
        padding: 1,
        borderStyle: 'classic',
        borderColor: 'magenta',
        float: 'center',
      }
    )
  );

  const args = process.argv.slice(2);
  const target = args.find((arg) => arg.startsWith('--target='))?.split('=')[1] || 'all';
  const limitArg = args.find((arg) => arg.startsWith('--limit='))?.split('=')[1];
  const limit = limitArg ? parseInt(limitArg, 10) : 5000;
  const isDryRun = args.includes('--dry-run');

  if (isDryRun) console.log(chalk.yellow.bold('🚧 DRY RUN MODE ACTIVE - No changes will be written to DB 🚧\n'));

  console.log(chalk.blue(`ℹ️  Running with Concurrency Limit: ${CONCURRENCY_LIMIT}`));

  const client = getStrapiClient();

  // Initialize Raw Model
  const rawModel = new ChatGoogleGenerativeAI({
    model: MODEL_NAME,
    maxOutputTokens: 8192,
    temperature: 0,
    apiKey: apiKey,
  });

  // Concurrency Helper
  async function pMap(iterable: any[], mapper: (item: any) => Promise<any>, options: { concurrency: number }) {
    const results: any[] = [];
    const executing: Promise<any>[] = [];
    for (const item of iterable) {
      const p = mapper(item).then((res) => results.push(res));
      executing.push(p);
      const clean = () => executing.splice(executing.indexOf(p), 1);
      p.then(clean).catch(clean);
      if (executing.length >= options.concurrency) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);
    return results;
  }

  const processCollection = async (
    uid: string,
    schema: z.ZodSchema,
    promptTemplate: string,
    handler: (entity: any, result: any) => Promise<void>
  ) => {
    console.log(chalk.cyan(`\n>>> Processing Collection: ${uid.toUpperCase()}`));

    // UI Setup
    const multibar = new cliProgress.MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format: '{bar} | {percentage}% | {value}/{total} | {status}',
      },
      cliProgress.Presets.shades_grey
    );

    let totalItems = 0;
    try {
      const countRes: any = await client.collection(uid).find({ pagination: { pageSize: 1 } });
      totalItems = countRes.meta?.pagination?.total || limit;
      if (totalItems > limit) totalItems = limit;
    } catch (e) {
      totalItems = limit;
    }

    const b1 = multibar.create(totalItems, 0, { status: 'Starting...' });

    let processedCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let successCount = 0;

    // Structured Model (Lazy init per schema)
    const structuredModel = rawModel.withStructuredOutput(schema);

    let page = 1;
    const pageSize = 100;

    while (processedCount < limit) {
      if (processedCount >= limit) break;
      b1.update(processedCount, { status: `Fetching Page ${page}...` });

      try {
        const response: any = await client.collection(uid).find({
          populate: '*',
          pagination: { page, pageSize },
        });

        const entities = response.data;
        if (!entities || entities.length === 0) break;

        // Process this batch with concurrency
        await pMap(
          entities,
          async (entity: any) => {
            if (processedCount >= limit) return;

            const entityName = entityNormalizeName(entity);
            b1.update(processedCount, { status: `Processing ${entityName.substring(0, 15)}...` });

            const descText = extractDescription(entity);

            if (!descText || descText.length < 10) {
              skipCount++;
              processedCount++;
              b1.increment();
              return;
            }

            // Retry Loop
            let attempts = 0;
            const MAX_RETRIES = 3;
            let success = false;
            let result: any = null;

            while (attempts < MAX_RETRIES && !success) {
              attempts++;
              try {
                // 1. Try Native Structured Output
                try {
                  result = await structuredModel.invoke(
                    `${promptTemplate}
                            Entity Name: ${entityName}
                            Description: ${descText}`
                  );
                } catch (invokeError) {
                  // 2. Fallback to Raw + Repair if Structured Logic Fails
                  // This catches the 'Expected , or }' JSON Parse error from LangChain
                  const rawResult = await rawModel.invoke(
                    `${promptTemplate}
                            Entity Name: ${entityName}
                            Description: ${descText}
                            IMPORTANT: RETURN ONLY VALID JSON COMPLIANT WITH THE SCHEMA. NO MARKDOWN.`
                  );
                  let rawText = rawResult.content.toString();
                  // Strip markdown
                  rawText = rawText
                    .replace(/^```json/, '')
                    .replace(/^```/, '')
                    .replace(/```$/, '');
                  // Repair
                  rawText = jsonrepair(rawText);
                  result = JSON.parse(rawText);
                }

                if (isDryRun === true) {
                  // DRY
                } else {
                  await handler(entity, result);
                }
                success = true;
                successCount++;
              } catch (e: any) {
                if (attempts >= MAX_RETRIES) {
                  multibar.log(chalk.red(`   Fail ${entityName}: ${e.message.substring(0, 40)}\n`));
                  errorCount++;
                } else {
                  // Exponential backoff
                  await new Promise((r) => setTimeout(r, 1000 * attempts));
                }
              }
            }

            processedCount++;
            b1.increment();
          },
          { concurrency: CONCURRENCY_LIMIT }
        );
      } catch (err: any) {
        multibar.log(chalk.red(`   Page Fetch Error: ${err.message}\n`));
        break;
      }
      page++;
    }

    b1.update(processedCount, { status: 'Complete!' });
    b1.stop();
    multibar.stop();

    console.log(chalk.green(`\n✅ Collection ${uid} Complete!`));
    console.log(`   Success: ${successCount} | Skipped: ${skipCount} | Errors: ${errorCount}`);
  };

  // --- Helpers ---
  function entityNormalizeName(e: any): string {
    return e.name || e.title || 'Unknown';
  }

  function extractDescription(e: any): string {
    let t = '';
    if (typeof e.description === 'string') t += e.description;
    else if (Array.isArray(e.description)) {
      t += e.description.map((b: any) => b.children?.map((c: any) => c.text).join('')).join('\n');
    }

    // For Monsters, if description is basic/empty, append JSON blocks for better context
    if (e.actions) t += '\nActions: ' + JSON.stringify(e.actions);
    if (e.special_abilities) t += '\nAbilities: ' + JSON.stringify(e.special_abilities);

    // Fallback if still empty
    if (!t && e.desc) t = e.desc; // common alt

    return t;
  }

  try {
    // 1. Spells
    if (target === 'all' || target === 'spells') {
      await processCollection(
        COLLECTION_MAP.spells,
        SpellSchema,
        `You are a D&D Rules Engine. Analyze the provided Spell description and extract its mechanical data into the requested schema.`,
        async (entity, result) => {
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
        }
      );
    }

    // 2. Equipment (Weapons)
    if (target === 'all' || target === 'equipment') {
      await processCollection(
        COLLECTION_MAP.equipment,
        WeaponSchema,
        `You are a D&D Rules Engine. Analyze the provided Item/Weapon description and extract its properties.`,
        async (entity, result) => {
          const res = await updateEntity(COLLECTION_MAP.equipment, entity.documentId || entity.id, {
            damage_dice: result.damage_dice,
            versatile_damage: result.versatile_damage,
            range_normal: result.range_normal,
            range_long: result.range_long,
          });
          if (!res) throw new Error('DB Update Failed');
        }
      );
    }

    // 3. Magic Items
    if (target === 'all' || target === 'magic-items') {
      await processCollection(
        COLLECTION_MAP['magic-items'],
        MagicItemSchema,
        `Analyze the provided Magic Item. Extract rarity, attunement, charges, and active abilities.`,
        async (entity, result) => {
          const res = await updateEntity(COLLECTION_MAP['magic-items'], entity.documentId || entity.id, {
            rarity: result.rarity,
            requires_attunement: result.requires_attunement,
            attunement_description: result.attunement_description
              ? result.attunement_description.substring(0, 250)
              : null,
            has_charges: result.has_charges,
            max_charges: result.max_charges,
            recharge_formula: result.recharge_formula,
            recharge_trigger: result.recharge_trigger,
          });
          if (!res) throw new Error('DB Update Failed');
        }
      );
    }

    // 4. Monsters
    if (target === 'all' || target === 'monsters') {
      await processCollection(
        COLLECTION_MAP.monsters,
        MonsterEnrichmentSchema,
        `Analyze the provided Monster. Extract its Actions AND Special Abilities/Traits into structured data.`,
        async (entity, result) => {
          const mappedActions = result.actions.map((a: any) => ({
            id: `monster_action_${uidGen.randomUUID()}`,
            name: a.name,
            sourceType: 'monster_action',
            sourceId: entity.documentId || entity.id,
            description: (a.description || '').substring(0, 1000), // Actions descriptions are Long Text usually
            range: { type: a.type === 'ranged' ? 'ranged' : 'melee', value: a.range || a.reach || 5 },
            attack: {
              type: a.type.includes('weapon')
                ? a.type.includes('ranged')
                  ? 'ranged_weapon'
                  : 'melee_weapon'
                : 'auto_hit',
              bonus: a.toHit || 0,
              critRange: 20,
            },
            effects: a.damage_dice
              ? [
                  {
                    type: 'damage',
                    subtype: a.damage_type || 'slashing',
                    dice: a.damage_dice,
                    flat: a.damage_bonus || 0,
                    timing: 'instant',
                  },
                ]
              : [],
            save: a.save_dc
              ? {
                  attribute: a.save_attribute?.toLowerCase().slice(0, 3) || 'str',
                  dc: a.save_dc,
                  effect: 'half',
                }
              : undefined,
          }));

          // Deduplicate actions by name to prevent LLM hallucinations or repetitions
          const uniqueActions = mappedActions.filter(
            (action, index, self) => index === self.findIndex((t) => t.name === action.name)
          );

          // Map Features
          const mappedFeatures = (result.features || []).map((f: any) => ({
            name: f.name,
            description: (f.description || '').substring(0, 1000), // Truncate to be safe
            source: 'monster',
            usage_max: f.usage_max,
            usage_per: f.usage_per,
          }));

          const res = await updateEntity(COLLECTION_MAP.monsters, entity.documentId || entity.id, {
            structuredActions: uniqueActions,
            features: mappedFeatures,
          });
          if (!res) throw new Error('DB Update Failed');
        }
      );
    }

    if (target === 'all' || target === 'classes') {
      await processCollection(
        'classes',
        ClassEnrichmentSchema,
        `Analyze the provided D&D 5e Class. Extract its Class Features (e.g. Rage, Wild Shape, Spellcasting, Divine Smite) into structured data.`,
        async (entity, result) => {
          // Map Features
          const mappedFeatures = (result.features || []).map((f: any) => ({
            name: f.name,
            description: (f.description || '').substring(0, 1000),
            source: 'class',
            usage_max: f.usage_max,
            usage_per: f.usage_per,
          }));

          const res = await updateEntity('classes', entity.documentId || entity.id, {
            features: mappedFeatures,
          });
          if (!res) throw new Error('DB Update Failed');
        }
      );
    }
  } catch (err: any) {
    if (err.message?.includes('403')) console.error(chalk.red('Auth Error: Check STRAPI_AUDIT_TOKEN'));
    else console.error(chalk.red('Global Error:'), err);
  }
};

run();
