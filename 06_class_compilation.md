# 06. Class Compilation Specification

## 1. Objective
To verify that a `Class` definition is valid, including its progression table, hit dice, and feature tree.

## 2. Static Validation
- **Core Fields**: `slug`, `name`, `hit_die` (d6, d8, d10, d12).
- **Progression**: Check `class_levels` relational consistency (Levels 1-20 should ideally exist).

## 3. Logic Validation (Feature Tree)
**Engine Path**: `src/api/game/src/engine/rules/leveling.ts` (or similar derivation logic).

1.  **Mock Context**: Level 20 implementation of this class.
2.  **Feature Collection**: Gather all features from Levels 1-20.
3.  **Recursion**: Run **Feature Compilation** (Spec #03) on EVERY feature in the class progression.

## 4. Simulation (HP Derivation)
1.  **Mock Entity**: Level 1 Entity of this Class (Con 10).
2.  **Calculate HP**: Verify `maxHP` equals max roll of `hit_die` (Level 1 rule).
3.  **Level Up**: Simulate Level 2. Verify HP increases by average or roll range.

## 5. Success Criteria
1.  Hit Die is valid.
2.  All linked Class Features compile successfully.
3.  HP calculation logic works for Level 1 and Level N.
