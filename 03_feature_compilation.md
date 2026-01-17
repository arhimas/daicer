# 03. Feature Compilation Specification

## 1. Objective
To verify that a Class `Feature` is correctly registered in the engine and its logic hooks are operative.

## 2. Static Validation
- **Core Fields**: `slug`, `name`, `level`.
- **Registry Check**: The `slug` (or `name`) MUST exist in the `FeatureRegistry`.

## 3. Logic Validation (Registry Lookup)
**Engine Path**: `src/api/game/src/engine/mechanics/registry/FeatureRegistry.ts`
**Method**: `FeatureRegistry.get(slug)`

1.  **Lookup**: Query the Registry for the feature's slug.
2.  **Assertion**: Returned handler must be not null.
3.  **Interface Check**: Returned handler must implement `FeatureDefinition` (checking for `onTurnStart`, `applyDamageBonus`, etc.).

## 4. Simulation (Hook Verification)
*Note: This is more abstract as features trigger on specific events.*

1.  **Mock Entity**: Create entity possessing this feature.
2.  **Mock Context**: `CombatContext`.
3.  **Trigger Simulation**:
    - If `applyDamageBonus` exists: Call with dummy action. Verify it returns a modifier or 0.
    - If `onTurnStart` exists: Call it. Verify it returns valid `StateChange[]` (or void).
    - If `canApply` exists: Call it. Verify boolean return.

## 5. Success Criteria
1.  Feature exists in Database.
2.  Feature `slug` resolves to a valid Handler in `FeatureRegistry`.
3.  Handler methods can be invoked without error.
