import { EntitySheet } from '../types';
import { RuleSet, ClassDefinition } from '../types/rules';
import { calculateModifier } from './dnd5e';

/**
 * Pure Functional Reducer for Level Up.
 * Returns a NEW EntitySheet with updated stats based on Rules and Class Definition.
 * 
 * Logic:
 * 1. Increases Level.
 * 2. Adds HP (Fixed avg + Con mod).
 * 3. Adds Hit Die.
 * 4. Recalculates Proficiency Bonus.
 * 5. Expands Spell Slots (if applicable).
 * 6. Adds Features (as Relation Stubs).
 */
export function resolveLevelUp(sheet: EntitySheet, classDef: ClassDefinition, rules: RuleSet): EntitySheet {
  // Create a shallow copy (or deep if needed, shallow is usually fine for top-level structs in Redux-like patterns,
  // but here we have nested objects like hitDice, spellbook. A structured clone or spread is safer).
  // For now, we will manually spread the nested objects we touch.
  const newSheet: EntitySheet = {
    ...sheet,
    hitDice: { ...sheet.hitDice },
    attributes: { ...sheet.attributes },
    spellbook: sheet.spellbook ? { ...sheet.spellbook, slots: [...(sheet.spellbook.slots || [])] } : undefined,
    features: sheet.features ? [...sheet.features] : [],
  };

  const currentLevel = newSheet.level;
  const newLevel = currentLevel + 1;

  if (newLevel > 20) return sheet; // Cap at 20 (or use rules.cap if provided)

  newSheet.level = newLevel;

  // 1. HP Increase (Deterministic Average)
  // Hit Die from Class Definition (e.g. "1d12")
  const hitDieStr = classDef.hit_die || newSheet.hitDice.die || '1d8';
  const parts = hitDieStr.split('d');
  const sides = parseInt(parts[1] ?? parts[0] ?? '8') || 8;
  const avg = Math.floor(sides / 2) + 1;
  const conScore = newSheet.attributes.Constitution ?? 10;
  const conMod = calculateModifier(conScore);

  const hpGain = Math.max(1, avg + conMod);

  newSheet.maxHp += hpGain;
  newSheet.hp += hpGain;

  // 2. Hit Dice Increase
  newSheet.hitDice.total += 1;
  newSheet.hitDice.current += 1; // Regain 1 HD on level up? Or just capacity? Usually capacity.
  // We assume full heal of the NEW die? Rules vary. Let's just add capacity.

  // 3. Proficiency Bonus (From Rules)
  // rules.proficiency_table might be { "1": 2, "5": 3 } or array. Schema said JSON.
  // If array: [0, 2, 2, 2, 2, 3...] (0-indexed) so level 1 is index 1?
  // Or map { "1": 2 }. Let's assume Map based on `types/rules.ts` definition: { [level: string]: number }
  const profBonus = rules.proficiency_table[newLevel.toString()] || Math.ceil(1 + newLevel / 4); // Fallback formula
  newSheet.proficiencyBonus = profBonus;

  // 4. Spell Slots (If Caster)
  // Check Class Definition for Spellcasting feature or slot progression
  // We look for 'progression' for this level in ClassDef
  const levelData = classDef.progression.find((p) => p.level === newLevel);

  // If class provides specific slots (e.g. Warlock), use that.
  // If class is "Full Caster" map to Global Rules.
  // For MVP refactor, let's assumes Class Def has `spell_slots` array if it's a caster.
  // OR we rely on a flag.

  // Strategy: If `levelData.spell_slots` is present, use it.
  // Else if `rules.full_caster_slots` is present and Class name matches known casters?
  // Better: The Class Definition should ideally contain the full progression table or we fetch it.

  // Implementation: We look at `levelData?.spell_slots`.
  if (levelData?.spell_slots && newSheet.spellbook) {
    const newSlotsConfig = levelData.spell_slots; // Expect number[]: [4, 2] -> 4 lvl1, 2 lvl2

    newSheet.spellbook.slots = newSlotsConfig.map((total, idx) => {
      const level = idx + 1;
      const existing = sheet.spellbook?.slots?.find((s) => s.level === level);
      if (existing) {
        return { level, max: total, current: existing.current + (total - existing.max) };
      }
      return { level, max: total, current: total };
    });
  }

  // 5. Features
  // We identify features gained at this NEW level from the Class Definition.
  // We append them to the sheet's feature list as Relation Stubs.
  if (levelData?.features?.length) {
    // Initialize if missing
    if (!newSheet.features) newSheet.features = [];

    // Append new features (avoiding strict duplicates if desired, but for now just pushing)
    // In a real Strapi relation, we'd add the ID. Here we push the stub.
    // We check if we already have it to avoid double-adding on re-calc (though levelUp is usually state transition).
    for (const feat of levelData.features) {
       // Simple duplication check by name for now, assuming unique names per class feature set
       const exists = newSheet.features.find(f => f.name === feat.name);
       if (!exists) {
         newSheet.features.push({
           documentId: feat.documentId,
           name: feat.name,
           // We could hydrate description/type if available in ClassDef, but typically it lives on the Feature entity itself.
           // The Engine hydration phase (later) would fetch the full Feature logic.
         });
       }
    }
  }

  return newSheet;
}

// Helper to get Level from XP (Pure)
export function getLevelFromXP(xp: number, rules: RuleSet): number {
  const table = rules.xp_table; // Expect [0, 300, 900...]
  for (let i = table.length - 1; i >= 0; i--) {
    if (xp >= table[i]) return i + 1;
  }
  return 1;
}
