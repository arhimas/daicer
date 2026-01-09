import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { DieRoll } from '../ui/dice-roll-animation/types';

/**
 * Parse dice notation like "1d20+5", "3d6", "2d8+3" into die type and count
 */
function parseDiceNotation(notation: string): { type: number; count: number; modifier: number } | null {
  const match = notation.match(/(\d+)d(\d+)(?:\+(\d+))?/i);
  if (!match || !match[1] || !match[2]) return null;

  const count = parseInt(match[1], 10);
  const type = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  return { type, count, modifier };
}

/**
 * Extract individual die rolls from breakdown string like "[15] + 5" or "[3, 5, 2] + 3"
 */
function extractDieRolls(breakdown: string | undefined, count: number, result: number, modifier: number): number[] {
  if (!breakdown) {
    const basePerDie = Math.floor((result - modifier) / count);
    return Array(count).fill(basePerDie);
  }

  const bracketMatch = breakdown.match(/\[([^\]]+)\]/);
  if (!bracketMatch || !bracketMatch[1]) {
    const basePerDie = Math.floor((result - modifier) / count);
    return Array(count).fill(basePerDie);
  }

  const rollsStr = bracketMatch[1];
  if (rollsStr.includes(',')) {
    return rollsStr.split(',').map((r) => parseInt(r.trim(), 10));
  }

  return [parseInt(rollsStr, 10)];
}

export interface DiceRollData {
  dice: string;
  result: number;
  breakdown?: string;
  purpose?: string;
}

interface UseDiceRollStateOptions {
  roll: DiceRollData;
  animate?: boolean;
}

/**
 * Custom hook for managing dice roll animation state
 * Provides stable, memoized state management for dice roll cards
 */
export function useDiceRollState({ roll, animate = true }: UseDiceRollStateOptions) {
  // Refs for stable state that should never change after mount
  const initializedRef = useRef(false);

  // State
  const [animatedValue, setAnimatedValue] = useState(animate ? 0 : roll.result);
  const [animationComplete, setAnimationComplete] = useState(!animate);
  const [shouldAnimate] = useState(animate); // Capture initial animation state safely

  // Derived display value - if not animating, always match prop
  const displayValue = shouldAnimate ? animatedValue : roll.result;

  // Stable, memoized dice data - only recalculate if roll data actually changes
  const diceData = useMemo<DieRoll[]>(() => {
    try {
      const parsed = parseDiceNotation(roll.dice);
      if (!parsed) {
        console.warn(`useDiceRollState: Could not parse "${roll.dice}"`);
        return [];
      }

      const { type, count, modifier } = parsed;

      // Validate die type
      const validTypes = [2, 4, 6, 8, 10, 12, 20];
      if (!validTypes.includes(type)) {
        console.warn(`useDiceRollState: Invalid die type d${type}`);
        return [];
      }

      // Extract individual rolls
      const individualRolls = extractDieRolls(roll.breakdown, count, roll.result, modifier);

      // Create stable DieRoll objects
      const rolls: DieRoll[] = individualRolls.map((rollValue, index) => ({
        type: type as 2 | 4 | 6 | 8 | 10 | 12 | 20,
        result: rollValue,
        id: `die-${roll.dice}-${index}-${rollValue}`,
      }));
      return rolls;
    } catch (error) {
      console.error('useDiceRollState: Parse error', error);
      return []; // Return empty array to match DieRoll[] type
    }
  }, [roll.dice, roll.breakdown, roll.result]);

  const internalRenderError = diceData === null;

  // Stable critical roll detection
  const criticalType = useMemo<'success' | 'fail' | null>(() => {
    if (!roll.dice.includes('d20')) return null;
    const naturalRoll = roll.breakdown?.match(/\[(\d+)\]/)?.[1];
    if (!naturalRoll) return null;
    if (naturalRoll === '20') return 'success';
    if (naturalRoll === '1') return 'fail';
    return null;
  }, [roll.dice, roll.breakdown]);

  // Number counting animation - only runs once
  useEffect(() => {
    if (!initializedRef.current && shouldAnimate) {
      initializedRef.current = true;

      const duration = 1600;
      const steps = 30;
      const increment = roll.result / steps;
      let current = 0;
      let step = 0;

      const interval = setInterval(() => {
        step += 1;
        current += increment;

        if (step >= steps) {
          setAnimatedValue(roll.result);
          clearInterval(interval);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [roll.result, shouldAnimate]);

  // Stable animation complete callback
  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  return {
    // Data
    diceData,
    displayValue,
    criticalType,

    // State
    animationComplete,
    renderError: internalRenderError,
    shouldAnimate,

    // Callbacks
    onAnimationComplete: handleAnimationComplete,
  };
}
