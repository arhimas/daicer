# Mechanics: Registry

The look-up system connecting Data (CMS) to Logic (Code).

## Registries

- **ClassRegistry**: Stores `ClassDefinition` mappings (Barbarian, Rogue, Wizard logic).
- **FeatureRegistry**: Stores `FeatureHandler` mappings (Sneak Attack logic, Rage logic).

## Pattern

When the engine runs:

1. It sees a Feature on the Entity Sheet (`slug: "sneak-attack"`).
2. It asks `FeatureRegistry.get("sneak-attack")`.
3. If code exists, it executes `canApply()` and `applyDamageBonus()`.
4. If no code exists, it treats it as a passive text feature.
