import { Speed } from '../types';

/**
 * Defines the movement capabilities of an entity in the game world.
 * Each key represents a movement mode, and the value is the speed in feet (or cells).
 */
export interface SpeedCapabilities {
  /** Walking speed on land. */
  walk: number;
  /** Flying speed, if capable of flight. */
  fly?: number;
  /** Swimming speed, if capable of swimming. */
  swim?: number;
  /** Climbing speed, if capable of climbing surfaces. */
  climb?: number;
  /** Burrowing speed, if capable of moving through earth. */
  burrow?: number;
  /** Whether the entity can hover while flying. */
  hover?: boolean;
}

/**
 * Normalizes a Speed value (number or object) into a fully explicit Speed capabilities object.
 * Handles cases where speed is a simple number (assumed walk) or a partial object.
 *
 * @param speed - The raw speed value (number | object)
 * @returns Normalized object with walk, fly, swim, etc. populated.
 */
export const getMovementModes = (speed: Speed | undefined | null): SpeedCapabilities => {
  if (speed === undefined || speed === null) {
    return { walk: 0 };
  }

  if (typeof speed === 'number') {
    return { walk: speed };
  }

  return {
    walk: speed.walk ?? 0,
    fly: speed.fly,
    swim: speed.swim,
    climb: speed.climb,
    burrow: speed.burrow,
    hover: !!speed.hover,
  };
};

/**
 * Checks if an entity has a specific movement capability.
 * Returns true if the entity has a non-zero speed for the requested mode.
 *
 * @param speed - The raw speed value (number | object)
 * @param mode - The movement mode to check (walk, fly, swim, etc.)
 * @returns True if the entity has the capability, false otherwise.
 */
export const canMove = (speed: Speed | undefined | null, mode: keyof SpeedCapabilities): boolean => {
  const modes = getMovementModes(speed);

  if (mode === 'walk') return (modes.walk ?? 0) > 0;

  const val = modes[mode];
  if (typeof val === 'boolean') return val;
  return (val ?? 0) > 0;
};
