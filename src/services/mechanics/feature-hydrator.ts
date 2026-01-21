import { EntityFeature } from '../../api/game/src/engine/types';

interface ClassFeatureSource {
  name: string;
  description: string;
  level: number;
  // usage?
}

interface RaceFeatureSource {
  name: string;
  description: string;
}

/**
 * Context required to hydrate features for a character.
 */
interface HydrationContext {
  /** Current level of the character (for filtering level-gated features). */
  characterLevel: number;
  /** Raw class feature data sources. */
  classFeatures: ClassFeatureSource[];
  /** Raw race feature data sources. */
  raceFeatures: RaceFeatureSource[];
}

/**
 * Converts raw database Feature sources into active EntityFeature objects.
 * Filters class features by character level and combines them with racial features.
 *
 * @param ctx - The hydration context containing level and raw sources.
 * @returns A list of active EntityFeatures.
 */
export function hydrateFeatures(ctx: HydrationContext): EntityFeature[] {
  const features: EntityFeature[] = [];

  // 1. Race Features (Always active)
  for (const f of ctx.raceFeatures) {
    features.push({
      name: f.name,
      description: f.description,
      // Race features usually constant, simplistic mapping for now.
    });
  }

  // 2. Class Features (Filtered by Level)
  for (const f of ctx.classFeatures) {
    if (f.level <= ctx.characterLevel) {
      features.push({
        name: f.name,
        description: f.description,
        // Logic for usage would go here if data source has it
      });
    }
  }

  return features;
}

export const FeatureHydrator = {
  hydrateFeatures,
};
