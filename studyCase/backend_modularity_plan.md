# Backend Modularity Improvement Plan

> **Goal**: Decompose monolithic services (`EntityAdapter`, `CombatEngine`) into granular, testable, and reliable modules. Shift from imperative "God Class" logic to a functional, plugin-based architecture (Strategy/Command Patterns).

## 1. Adapter Layer Refactoring (`entity-adapter.ts`)

**Current State**: Single 380+ line file carrying schema types, validation, and transformation logic for Stats, Inventory, Spells, and Actions.

**Target State**: A `EntityAdapter` directory with specialized sub-adapters.

### Proposed Structure

```text
src/api/game/services/
└── adapters/
    ├── index.ts              # Main facade (export default () => ...)
    ├── types.ts              # Shared Strapi Schema Types
    ├── stats.adapter.ts      # resolveBaseStats
    ├── inventory.adapter.ts  # resolveInventory
    ├── spell.adapter.ts      # resolveSpells
    ├── action.adapter.ts     # resolveActions
    └── traits.adapter.ts     # Traits, Features, Languages, Proficiencies
```

### Key Changes

1.  **Type Separation**: Move `StrapiComponentStats`, `StrapiEntitySheet`, etc. to `adapters/types.ts`.
2.  **Pure Functions**: Each sub-adapter exports pure functions that take specific inputs (e.g., `resolveSpells(spellbook: StrapiSpellbook): EntitySpell[]`) rather than the whole sheet.
3.  **Strict Facade**: The main `index.ts` aggregates these functions, maintaining the functional pipeline `adapt(input) -> Entity`.

## 2. Engine & Mechanics Refactoring (`combat.ts`)

**Current State**: `combat.ts` (~390 lines) contains `resolveAttack`, which hardcodes logic for specific classes ("Sneak Attack" for Rogue, "Rage" for Barbarian) and conditions ("Prone"). This violates Open/Closed principles.

**Target State**: A "Feature Handler" or "Effect System" where classes/races inject behavior.

### Proposed Modules

#### A. Mechanics Registry

Create a system to register logic for specific keywords/features.

```typescript
// Core concept: Feature Handlers
interface CombatFeatureHandler {
  canApply(attacker: Entity, action: Action, context: CombatContext): boolean;
  applyDamageBonus?(...): number;
  applyAttackModifier?(...): void;
}

// Example: Rogue Sneak Attack Handler
const RogueSneakAttack: CombatFeatureHandler = {
  canApply: (attacker, action, ctx) => {
    // Check for "Sneak Attack" feature safely
    // Check for Finesse/Ranged
    // Check for Advantage
  },
  applyDamageBonus: (level) => Math.ceil(level/2) * d6
};
```

#### B. Directory Split

```text
src/engine/
├── mechanics/
│   ├── damage.ts            # Damage Types, Resistance/Immunity Calc (Standalone)
│   ├── dice.ts              # Existing dice logic
│   ├── conditions.ts        # Condition effect registry (Prone, Blinded)
│   └── combat/
│       ├── pipeline.ts      # The "resolveAttack" orchestrator
│       ├── validators.ts    # validateAttack (Range, etc.)
│       └── features/        # The new home for class-specifics
│           ├── rage.ts
│           ├── sneak-attack.ts
│           └── smite.ts
```

### Specific "Module" Actions

1.  **Damage Module**:

    - Extract the "Resist/Immune/Vulnerable" logic from `combat.ts` loop into `mechanics/damage.ts`.
    - Function: `calculateDamage(amount: number, type: string, target: Entity): number`.

2.  **Class/Race Modules**:

    - Instead of `if (feature.name === 'Sneak Attack')` inside the main loop, loop through `entity.features` and delegate to a `FeatureRegistry`.
    - **Short-term Fix**: Move `Sneak Attack` and `Rage` blocks into helper functions `resolveSneakAttack(...)` and `resolveRage(...)` inside `features/` to clean the main pipeline.

3.  **Spell Module**:
    - Ensure `EntitySpell` is robust.
    - The resolution logic is currently simple, but if spells need "Scaling" (Fireball at lvl 4), this logic belongs in `mechanics/magic/scaling.ts`, not the adapter.

## 3. Implementation Steps

1.  **Refactor Adapters First**: It's the safest refactor. Split `entity-adapter.ts` into 5 files.
    - _Reliability Gain_: Easier to test `resolveInventory` in isolation.
2.  **Extract Damage Logic**: Move the math for resistance/vulnerability to a pure utility.
    - _Reliability Gain_: Single source of truth for "Does Fire hurt a Tiefling?".
3.  **Refactor Combat Pipeline**: Break `resolveAttack` into steps: `determineHit()`, `calculateBaseDamage()`, `applyFeatureBonuses()`, `applyResistances()`.
    - _Reliability Gain_: Each step can be unit tested with mock entities.

## 4. Testing Strategy

- **Granular Tests**: `stats.adapter.spec.ts` should exist and test ONLY stats.
- **Pipeline Tests**: `combat.spec.ts` should test the _flow_, not every class feature.
- **Feature Tests**: `features/sneak-attack.spec.ts` should strictly test the rogue logic.

This approach ensures that adding a new class (e.g., Paladin) only involves adding `paladin.ts` and registering it, without risking breaking the core combat loop.
