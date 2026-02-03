import { ActionIntent, ActionType } from '@daicer/engine/rules/actions';
import { z } from 'zod';
import { EntitySheetSchema } from '@daicer/engine/schemas/entity-sheet';
import { calculateDistance, Point3D } from '@daicer/engine/voxel/utils/math';
import { RuntimeAction } from '@daicer/engine/derivation/types';

type EntitySheet = z.infer<typeof EntitySheetSchema>;

export interface MagicValidationResult {
  valid: boolean;
  reason?: string;
  slotLevel?: number; // The level of the slot to be consumed
}

export interface SpellResult {
  success: boolean;
  slotConsumed?: number;
  targetsHit?: string[]; // IDs
  damageDetails?: {
    type: string;
    total: number;
    rolls: number[];
  }[];
  saveDC?: number;
  saveStat?: string;
  description: string;
  isAoE: boolean;
}

function findSpell(sheet: EntitySheet, actionId: string): RuntimeAction | undefined {
  // Safe cast since Engine ensures structuredActions are RuntimeActions
  const actions = (sheet.structuredActions || []) as unknown as RuntimeAction[];
  return actions.find((a) => a.id === actionId && a.sourceType === 'spell');
}

/**
 * Validates if a spell can be cast.
 */
export function validateSpellCast(
  caster: EntitySheet,
  intent: ActionIntent,
  casterPos: Point3D,
  targetPos?: Point3D
): MagicValidationResult {
  if (intent.type !== ActionType.CastSpell) return { valid: false, reason: 'Invalid Intent' };

  // 1. Check if Known/Prepared
  const spellAction = findSpell(caster, intent.actionId);
  if (!spellAction || spellAction.sourceType !== 'spell') {
    return { valid: false, reason: 'Spell not prepared or not found in actions.' };
  }

  // 2. Check Spell Slots
  const level = intent.level ?? spellAction.level ?? 0;

  // Cantrips (Level 0) are always valid recourse-wise
  if (level > 0) {
    if (!caster.spellbook || !caster.spellbook.slots) {
      return { valid: false, reason: 'No spell slots available.' };
    }
    const slot = caster.spellbook.slots.find((s) => s.level === level);
    if (!slot || slot.current < 1) {
      return { valid: false, reason: `No Level ${level} spell slots remaining.` };
    }
  }

  // 3. Range Check
  if (targetPos) {
    let maxDist = 5;

    // Check structured range object first
    if (spellAction.range) {
      if (spellAction.range.type === 'touch')
        maxDist = 7; // Reach + slack
      else maxDist = spellAction.range.value || 30;
    } else if (spellAction.originalRange) {
      // Fallback to parsing string
      if (spellAction.originalRange.toLowerCase().includes('touch')) maxDist = 7;
      else {
        const matches = spellAction.originalRange.match(/\d+/);
        if (matches) maxDist = parseInt(matches[0]);
        else maxDist = 30;
      }
    }

    const dist = calculateDistance(casterPos, targetPos);
    if (dist > maxDist) {
      return { valid: false, reason: 'Target out of range.' };
    }
  }

  return { valid: true, slotLevel: level };
}

/**
 * Resolves the casting of a spell.
 */
export interface ResolveSpellResult {
  slotConsumed?: number;
  saveDC: number;
  saveStat: string;
  isAoE: boolean;
  brokenConcentrationId?: string;
  newConcentrationId?: string;
}

export function resolveSpell(sheet: EntitySheet, intent: ActionIntent): ResolveSpellResult {
  if (intent.type !== ActionType.CastSpell) {
    throw new Error('Invalid intent type for resolveSpell');
  }

  const spell = findSpell(sheet, intent.actionId);

  if (!spell || spell.sourceType !== 'spell') {
    throw new Error(`Spell ${intent.actionId} not found`);
  }

  // 1. Deduct Slot (if not cantrip)
  let slotConsumed: number | undefined;

  const levelToConsume = intent.level ?? spell.level ?? 0;

  if (levelToConsume > 0) {
    if (sheet.spellbook?.slots) {
      const slot = sheet.spellbook.slots.find((s) => s.level === levelToConsume);
      if (slot && slot.current > 0) {
        slot.current--;
        slotConsumed = levelToConsume;
      }
    }
  } else {
    slotConsumed = 0;
  }

  // 2. Handle Concentration
  let brokenConcentrationId: string | undefined;
  let newConcentrationId: string | undefined;

  if (spell.concentration) {
    // If already concentrating, break it
    if (sheet.spellbook?.concentratingOn) {
      brokenConcentrationId = sheet.spellbook.concentratingOn;
    }

    // Set new
    if (sheet.spellbook) {
      sheet.spellbook.concentratingOn = spell.id;
      newConcentrationId = spell.id;
    }
  }

  // 3. Output
  const dc = sheet.spellbook?.spellSaveDc ?? 10;
  const saveStat = spell.save?.attribute || 'dex';

  // AoE Check
  let isAoE = !!spell.aoe;
  if (!isAoE && spell.originalRange) {
    isAoE = !!spell.originalRange.match(/cone|sphere|line|cylinder|radius/i);
  }

  return {
    slotConsumed,
    saveDC: dc,
    saveStat,
    isAoE,
    brokenConcentrationId,
    newConcentrationId,
  };
}
