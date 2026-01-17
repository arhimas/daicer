# 07. Entity Compilation Specification

## 1. Objective
To verify that a full `EntitySheet` (Character/Monster) is mechanically sound. This is the **Master Compile** that aggregates all others.

## 2. Static Validation
- **Core Fields**: `name`, `hp`, `ac`, `stats` (Str, Dex, etc.).
- **Relations**: Valid `race`, `class`, `items`, `spells`.

## 3. Recursive Logic Validation
1.  **Component Compile**:
    - Run **Race Compile** on `entity.race`.
    - Run **Class Compile** on `entity.class`.
    - Run **Equipment Compile** on all `entity.inventory`.
    - Run **Spell Compile** on all `entity.spellbook`.
2.  **Failure Propagation**: If any component fails, the Entity Compile fails (or marks "Partial Warning").

## 4. Full Simulation (The "Turn Test")
**Engine Path**: `src/api/game/src/engine/derivation/capabilities.ts` + `ActionDispatcher`.

1.  **Derivation**:
    - Call `deriveActions(context)`. Verify > 0 actions (at least Unarmed).
    - Call `deriveSpeed(context)`. Verify > 0 speed.
2.  **Mock Turn**:
    - **Select Action**: Pick the strongest available action (highest potential damage).
    - **Target**: Mock Dummy (AC 15).
    - **Execute**: `ActionDispatcher.resolve(entity, dummy, action)`.
    - **Verify**: Log contains "Attack Roll" and "Damage".

## 5. Success Criteria
1.  All sub-components (Race, Class, Items, Spells) are valid.
2.  Stats are fully derived (Action list populated).
3.  Entity can successfully execute at least one Action in the simulation.
