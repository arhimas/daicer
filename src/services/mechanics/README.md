# Mechanics Services

This directory contains standalone helper services that bridge raw data and the Game Engine's runtime types.

## Components

### [`ActionGenerator`](./action-generator.ts)

A pure function service responsible for converting raw **Item data** (specifically Weapons) into executable **EntityActions**.

- **Calculations**: Handles "To Hit" and "Damage" modifiers based on:
  - Ability Scores (Str vs Dex via Finesse property).
  - Proficiency Bonus.
  - Weapon properties (Ranged, Melee, Light).
- **Output**: Returns an `EntityAction` compatible with the `ActionDispatcher`.

### [`FeatureHydrator`](./feature-hydrator.ts)

A pure function service that collates and filters features from multiple sources to build a character's feature verification list.

- **Responsibility**: Combines Racial Features (always active) and Class Features (gated by Level).
- **Use Case**: Used during `EntitySheet` derivation to populate the `features` array.
