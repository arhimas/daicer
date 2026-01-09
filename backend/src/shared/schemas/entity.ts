import { z } from 'zod';
import { SpeedSchema } from './actor'; // Using local import since SpeedSchema is in shared/src/schemas/actor.ts

export const AttributeSchema = z.enum(['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']);

export const SavingThrowsSchema = z.object({
  fortitude: z.number(),
  reflex: z.number(),
  will: z.number(),
});

export const SkillDetailSchema = z.object({
  name: z.string(),
  ability: AttributeSchema,
  modifier: z.number(),
  proficiency: z.enum(['none', 'trained', 'proficient', 'expertise']),
  notes: z.string().optional(),
});

export const TalentSchema = z.object({
  name: z.string(),
  category: z.enum(['class', 'racial', 'background', 'custom']),
  description: z.string(),
});

export const BackgroundDetailsSchema = z.object({
  origin: z.string(),
  upbringing: z.string(),
  motivation: z.string(),
  keyEvents: z.array(z.string()),
  allies: z.array(z.string()).optional(),
});

export const ResourcePoolSchema = z.object({
  name: z.string(),
  current: z.number(),
  max: z.number(),
  refresh: z.enum(['at-will', 'encounter', 'short-rest', 'long-rest', 'daily', 'custom']),
  description: z.string().optional(),
});

export const AdvancementPointsSchema = z.object({
  ability: z.number(),
  skill: z.number(),
  talent: z.number(),
});

export const EntityActionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string(), // "melee_attack", etc.
  toHit: z.number().optional(),
  damage: z.array(z.object({ dice: z.string(), bonus: z.number(), type: z.string() })).optional(),
  range: z.string().optional(),
  save: z.object({ dc: z.number(), stat: z.string() }).optional(),
  properties: z.array(z.string()).optional(),
  description: z.string().optional(),
  action_definition: z.object({ documentId: z.string().optional(), name: z.string() }).optional(),
});

export const EntitySpellSchema = z.object({
  documentId: z.string().optional(),
  name: z.string(),
  level: z.number(),
  school: z.string().optional(),
  source: z.enum(['known', 'prepared']),
  castingTime: z.string().optional(),
  range: z.string().optional(),
  description: z.string().optional(),
});

export const EntityProficiencySchema = z.object({
  documentId: z.string().optional(),
  name: z.string(),
  type: z.string().optional(),
});

export const EntityLanguageSchema = z.object({
  documentId: z.string().optional(),
  name: z.string(),
  isRare: z.boolean().optional(),
});

export const EntityTraitSchema = z.object({
  documentId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
});

export const InventoryItemSchema = z.object({
  id: z.string().optional(),
  quantity: z.number(),
  slot: z.string(),
  isEquipped: z.boolean(),
  item: z
    .object({
      documentId: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
    })
    .optional(),
  // Legacy flat fields support if needed, but per new structure we prefer 'item' relation
  name: z.string().optional(),
  properties: z.array(z.string()).optional(),
  weight: z.number().optional(),
  cost: z.object({ amount: z.number(), unit: z.string() }).optional(),
});

export const FeatureSchema = z.object({
  documentId: z.string().optional(), // Relation ID
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  level: z.number().optional(),
  usage: z
    .object({
      max: z.number(),
      current: z.number().optional(),
      per: z.string(),
    })
    .optional(),
});

// New Structured Spell Slots
export const SpellSlotsSchema = z.array(
  z.object({
    level: z.number(),
    max: z.number(),
    current: z.number(),
  })
);

// Conditions
export const ConditionSchema = z.object({
  name: z.string(), // e.g. "Stunned", "Prone"
  duration: z.number(), // in Rounds
  source: z.string().optional(),
});

export const SpellbookSchema = z.object({
  id: z.string().optional(),
  knownSpells: z.array(z.string()).optional(), // List of Spell Document IDs
  preparedSpells: z.array(z.string()).optional(), // List of Spell Document IDs
  spellcastingAbility: z.enum(['intelligence', 'wisdom', 'charisma']).or(z.string()),
  spellSaveDc: z.number(),
  spellAttackBonus: z.number(),
  concentratingOn: z.string().nullable().optional(), // Spell ID
  slots: SpellSlotsSchema,
});

export const EntitySheetSchema = z.object({
  id: z.string().optional(),
  documentId: z.string().optional(),
  name: z.string(),
  race: z.string(),
  characterClass: z.string(), // e.g. "Wizard 5"

  // Core Vitals
  hp: z.number(),
  maxHp: z.number(),
  temporaryHp: z.number().default(0),

  // Defenses (Beta)
  resistances: z.array(z.string()).default([]),
  immunities: z.array(z.string()).default([]),
  vulnerabilities: z.array(z.string()).default([]),

  // Progression
  level: z.number(),
  xp: z.number(),

  // Resources
  hitDice: z.object({
    total: z.number(),
    current: z.number(),
    die: z.string(), // "1d6"
  }),

  deathSaves: z.object({
    successes: z.number(),
    failures: z.number(),
  }),

  // Combat Stats
  armorClass: z.number(),
  initiative: z.number(),
  initiativeBonus: z.number(), // Added
  speed: SpeedSchema,
  proficiencyBonus: z.number(),
  inspiration: z.boolean(),

  // Attributes & Skills
  attributes: z.record(AttributeSchema, z.number()),
  savingThrows: SavingThrowsSchema,
  skills: z.record(z.string(), z.number()),
  skillDetails: z.array(SkillDetailSchema),
  expertises: z.array(z.string()),

  // Equipment & Inventory
  equipment: z.array(z.any()), // Legacy/Flat
  inventory: z.array(InventoryItemSchema).default([]), // New Strict
  currency: z.object({
    cp: z.number(),
    sp: z.number(),
    ep: z.number(),
    gp: z.number(),
    pp: z.number(),
  }),

  // Actions & Capabilities
  actions: z.array(EntityActionSchema).default([]),
  // Deprecated support (optional)
  structuredActions: z.array(z.any()).default([]),

  // Spellcasting
  spells: z.array(EntitySpellSchema).default([]),
  spellbook: SpellbookSchema.optional(),

  // Relations
  proficiencies: z.array(EntityProficiencySchema).default([]),
  languages: z.array(EntityLanguageSchema).default([]),
  traits: z.array(EntityTraitSchema).default([]),
  features: z.array(FeatureSchema).default([]),

  // Lists (Legacy/Migration support combined with new)
  talents: z.array(z.any()).default([]), // Simplified from TalentSchema

  // State Tracking
  conditions: z.array(z.any()).default([]), // Simplified from ConditionSchema
  resources: z.array(ResourcePoolSchema).default([]),

  // Flavor / Blueprint Data
  class: z.unknown().optional(), // Reference object
  background: z.string(),
  alignment: z.string(),
  appearance: z.object({
    age: z.string(),
    height: z.string(),
    weight: z.string(),
    eyes: z.string(),
    skin: z.string(),
    hair: z.string(),
    description: z.string(),
  }),
  personality: z.object({
    traits: z.string(),
    ideals: z.string(),
    bonds: z.string(),
    flaws: z.string(),
  }),
  backstory: z.string(),
  backgroundDetails: BackgroundDetailsSchema,
  alliesAndOrganizations: z.string(),
  treasure: z.string(),
  advancementPoints: AdvancementPointsSchema,
  avatarAssets: z
    .object({
      id: z.string(),
      mimeType: z.string(),
      storagePath: z.string(),
      publicUrl: z.string(),
      prompt: z.string(),
      createdAt: z.string(),
    })
    .nullable()
    .optional(),
});
