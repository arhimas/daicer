/**
 * Enrichment Script for Spells
 *
 * Usage: yarn tsx scripts/enrichment/enrich-spells.ts [--slug <slug>] [--dry-run]
 *
 * Flow:
 * 1. Initialize Strapi (Headless)
 * 2. Iterate Spells (desc)
 * 3. RAG Lookup: Get context for the spell from Knowledge Base
 * 4. LLM Extraction: Extract mechanics to JSON
 * 5. Validation: Zod check
 * 6. Update: Write to Strapi
 */

import { factories } from '@strapi/strapi';
import { z } from 'zod';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
// Assuming internal services are available after Strapi boot
// We will access them via strapi.service(...)

// --- Zod Schemas for Validation ---
const CastingConfigSchema = z.object({
  time_value: z.number(),
  time_unit: z.enum(['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'Day']),
  reaction_trigger: z.string().optional(),
  is_ritual: z.boolean(),
  components: z.object({
    verbal: z.boolean(),
    somatic: z.boolean(),
    material: z.boolean(),
    material_description: z.string().optional(),
    cost_gp: z.number().default(0),
    consumed: z.boolean().default(false),
  }),
});

const RangeConfigSchema = z.object({
  type: z.enum(['Self', 'Touch', 'Ranged (Feet)', 'Ranged (Miles)', 'Sight', 'Unlimited']),
  distance: z.number().optional(),
  aoe_shape: z.enum(['Cone', 'Cube', 'Cylinder', 'Line', 'Sphere', 'Hemisphere']).optional(),
  aoe_size: z.number().optional(),
  aoe_height: z.number().optional(),
});

const DurationConfigSchema = z.object({
  type: z.enum(['Instantaneous', 'Concentration', 'Time-Limited', 'Until Dispelled', 'Until Triggered', 'Special']),
  value: z.number().optional(),
  unit: z.enum(['Rounds', 'Minutes', 'Hours', 'Days']).optional(),
  concentration: z.boolean().default(false),
});

const MechanicsConfigSchema = z.object({
  action_type: z.enum([
    'Melee Spell Attack',
    'Ranged Spell Attack',
    'Strength Save',
    'Dexterity Save',
    'Constitution Save',
    'Intelligence Save',
    'Wisdom Save',
    'Charisma Save',
    'Auto-Hit',
    'None',
  ]),
  save_effect: z.enum(['Negate', 'Half', 'None']).optional(),
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
    .optional(),
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
  description: z.string().optional(),
  chance: z.number().default(100),
  duration_rounds: z.number().optional(),
});

const ScalingConfigSchema = z.object({
  scales: z.boolean(),
  type: z.enum(['Dice', 'Target', 'Duration']).default('Dice'),
  method: z.enum(['Per Slot Level', 'Every 2 Slot Levels', 'Specific Thresholds']).default('Per Slot Level'),
  dice_count: z.number().optional(),
  dice_value: z.number().optional(),
});

const SpellStructureSchema = z.object({
  casting_config: CastingConfigSchema,
  range_config: RangeConfigSchema,
  duration_config: DurationConfigSchema,
  mechanics_config: MechanicsConfigSchema,
  damage_instances: z.array(DamageInstanceSchema).optional(),
  condition_instances: z.array(ConditionInstanceSchema).optional(),
  scaling_config: ScalingConfigSchema.optional(),
});

// --- Main Script ---

const run = async () => {
  // Bootstrap Strapi
  const strapi = await factories.createStrapi({ distDir: './dist' }).load();
  console.log('Strapi loaded successfully.');

  const args = process.argv.slice(2);
  const targetSlug = args.find((arg) => arg.startsWith('--slug='))?.split('=')[1];
  const isDryRun = args.includes('--dry-run');

  try {
    // 1. Fetch Spells
    const query: any = { populate: ['description'] }; // We need rich text desc
    if (targetSlug) {
      query.filters = { slug: targetSlug };
    }

    const spells = await strapi.documents('api::spell.spell').findMany(query);
    console.log(`Found ${spells.length} spells to process.`);

    // 2. Setup LLM
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-flash-latest', // Using 1.5 Flash as '3.0' alias for high speed
      maxOutputTokens: 8192,
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const parser = StructuredOutputParser.fromZodSchema(SpellStructureSchema);

    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(
        `You are a D&D 5e Rules Engine. 
        Analyze the following Spell Description and extract the mechanical data into strict JSON.
        
        Context (RAG): {rag_context}
        
        Spell: {spell_name}
        Description: {description}
        
        {format_instructions}`
      ),
      model,
      parser,
    ]);

    // 3. Process Loop
    for (const spell of spells) {
      console.log(`Processing: ${spell.name}...`);

      // A. RAG Context (Simulated or Real)
      // In a real scenario, we would search our vector DB for "Rules for <SpellName>"
      // For now, we rely on the description + specific known rules.
      const ragContext = 'Standard 5e SRD Rules apply.';

      // B. Unpack Rich Text
      // Simple text extraction from blocks
      const descText =
        (spell.description as any[])?.map((b) => b.children?.map((c: any) => c.text).join('')).join('\n') || '';

      // C. LLM Call
      try {
        const result = await chain.invoke({
          spell_name: spell.name,
          description: descText,
          rag_context: ragContext,
          format_instructions: parser.getFormatInstructions(),
        });

        console.log(`> Extracted Data for ${spell.name}`);
        if (isDryRun) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          // D. Validated Write
          await strapi.documents('api::spell.spell').update({
            documentId: spell.documentId,
            data: {
              casting_config: result.casting_config,
              range_config: result.range_config,
              duration_config: result.duration_config,
              mechanics_config: result.mechanics_config,
              damage_instances: result.damage_instances || [],
              condition_instances: result.condition_instances || [],
              scaling_config: result.scaling_config,
            },
          });
          console.log(`> Updated ${spell.name} in database.`);
        }
      } catch (err) {
        console.error(`> Failed to process ${spell.name}:`, err);
      }
    }
  } catch (error) {
    console.error('Script Error:', error);
  } finally {
    strapi.destroy();
  }
};

run();
