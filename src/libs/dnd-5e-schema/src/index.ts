import action from './action.json';
import appearance from './appearance.json';
import areaEffect from './area-effect.json';
import castingConfig from './casting-config.json';
// ... dynamic imports would be better but explicit is safer for types
// For now, let's export a map.

export const SCHEMAS = {
  action,
  appearance,
  areaEffect,
  castingConfig,
  // Add others as needed or use a glob pattern in build
} as const;

export type SchemaKey = keyof typeof SCHEMAS;
