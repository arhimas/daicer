# Engine Integration Tests

This directory contains integration and functional tests for the Core Game Engine. Unlike the unit tests located within specific subdirectories (e.g., `resolution/__tests__`), these tests cover cross-module interactions and high-level game mechanics.

## Test Suite

### `action-hydration.test.ts`

Verifies the `ActionHydrator` pipeline, ensuring that raw JSON actions (from Spells, Items, Features) are correctly inflated into executable `RuntimeAction` objects with all necessary modifiers.

### `item-polymorphism.test.ts`

Tests the handling of polymorphic item data, ensuring that Weapons, Armor, and Consumables are correctly differentiated and that their specific properties (Range, Damage, AC) are respected by the engine.

### `loot-mechanics.test.ts`

Validates the loot generation and distribution systems, including drop tables, randomness (PRNG) usage, and inventory management.

### `rich-actions.test.ts`

Tests complex action scenarios, such as multi-target spells, conditional effects, and state-dependent logic, ensuring the `ActionDispatcher` resolves them correctly depending on the game state.
