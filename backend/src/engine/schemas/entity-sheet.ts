// Re-export from shared to maintain backward compatibility during migration
// effectively declaring that "the schema lives in shared now"
export {
  AttributeSchema,
  SavingThrowsSchema,
  SkillDetailSchema,
  TalentSchema,
  BackgroundDetailsSchema,
  ResourcePoolSchema,
  AdvancementPointsSchema,
  InventoryItemSchema,
  FeatureSchema,
  SpellSlotsSchema,
  ConditionSchema,
  SpellbookSchema,
  EntitySheetSchema,
  EntityActionSchema,
  EntitySpellSchema,
  EntityProficiencySchema,
  EntityLanguageSchema,
  EntityTraitSchema,
} from '../../shared';
