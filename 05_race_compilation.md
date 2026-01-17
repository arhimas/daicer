# 05. Race Compilation Specification

## 1. Objective
To verify that a `Race` definition is valid and correctly applies its base attributes, speed, and traits to an entity.

## 2. Static Validation
- **Core Fields**: `slug`, `name`, `speed`.
- **Relations**: Must have valid entries in `traits` Relation.
- **Attributes**: Must specify `ability_bonuses` (if applicable) or `ability_score_improvement`.

## 3. Logic Validation (Derivation)
**Engine Path**: `src/api/game/src/engine/derivation/capabilities.ts`
**Method**: `deriveSpeed(context)`

1.  **Mock Context**: Empty context with just this Race assigned.
2.  **Derive Speed**: Call `deriveSpeed`.
3.  **Assertion**: `speed.walk` matches the Race's defined speed.

## 4. Simulation (Trait Integration)
1.  **Iterate Traits**: For each Trait in the Race, run **Trait Compilation** logic (see Spec #04).
2.  **Aggregation**: Ensure all traits compile successfully. If one fails, the Race fails.

## 5. Success Criteria
1.  Race Speed derives correctly.
2.  All associated Traits are valid and compilable.
3.  Ability Score bonuses are readable.
