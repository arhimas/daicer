# 01. Spell Compilation Specification

## 1. Objective
To verify that a `Spell` data object is valid, strictly typed, and **can be executed** by the game engine without crashing.

## 2. Static Validation (Schema Level)
Before logic simulation, the Spell must pass strict schema validation:
- **Core Fields**: `slug`, `name`, `level`, `school` must be present.
- **Config Components**:
    - `casting_config`: Must specify `action_type` (Action/Bonus/Reaction).
    - `range_config`: Must specify `type` (Self/Touch/Ranged) and `distance`.
    - `mechanics_config`: If `action_type` is Attack/Save, must specify details.
- **Damage Instances**: If present, must have valid `dice_count`, `dice_value`, and `damage_type`.

## 3. Hydration Logic (Transformation)
The system must successfully convert the static JSON into a `RuntimeAction` using the engine's Hydrator.

**Engine Path**: `src/api/game/src/engine/derivation/ActionHydrator.ts`
**Method**: `hydrateFromSpell(spell, context)`

### Steps:
1.  **Mock Context**: Create a `DerivationContext` representing a standard caster (e.g., Level 5 Wizard, Int 16).
2.  **Hydrate**: Call `hydrateFromSpell`.
3.  **Result Check**: Ensure the returned object matches the `RuntimeAction` interface (has `id`, `effects[]`, `attack` or `save` struct).

## 4. Simulation (Dry Run)
The system must prove the spell does not crash the `ActionDispatcher`.

**Engine Path**: `src/api/game/src/engine/resolution/ActionDispatcher.ts`
**Method**: `resolve(source, target, action)`

### Steps:
1.  **Mock Source**: Create a dummy entity (The Caster).
2.  **Mock Target**: Create a dummy entity (The Target, e.g., "Training Dummy" with 10 AC, 100 HP).
3.  **Execute**: Call `ActionDispatcher.resolve(source, target, runtimeAction)`.
4.  **Assertion**:
    - **No Exceptions**: The function returns a `ResolutionResult`.
    - **Math Integrity**: `result.damageTotal` should be numeric ( >= 0).
    - **Log Integrity**: `result.log` should contain entries (e.g., "Attack Roll...", "Fire Damage...").

## 5. Success Criteria
The Spell is marked `Valid` if:
1.  Schema validation passes.
2.  Hydration produces a `RuntimeAction`.
3.  Dry run produces a `ResolutionResult` with no runtime errors.
