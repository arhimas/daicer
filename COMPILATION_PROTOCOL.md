# 🛑 DAICER ENTITY COMPILATION PROTOCOL (SOTA)

> [!CRITICAL]
> **ABSOLUTE ZERO TOLERANCE FOR INVALID DATA.**
> This document defines the **MANDATORY** Compilation logic for all game entities in the Daicer Engine.
> "Compilation" in this context means **Deep Static Analysis + Sandboxed Dry-Run Execution**.
> **IF IT DOES NOT COMPILE, IT DOES NOT EXIST.**

---

## 🏗️ Core Philosophy: "Hydrate & Execute"

We do not trust Schema validation alone. Schema checks type; Compilation checks **Life**.
Every Entity type follows this strict Pipeline:

1.  **Static Check (Schema)**: Basic JSON integrity (fields present).
2.  **Hydration (Derivation)**: Convert JSON -> `ActionHydrator` -> `RuntimeAction`.
3.  **Simulation (Dispatcher)**: Run the object in a `MockContext` sandbox via `ActionDispatcher.resolve()`.
4.  **Verdict**: Pass/Fail + Detailed Logs.

---

## 📜 01. Spell Compilation Protocol

### 1.1 Objective
Verify that a `Spell` slug produces a `RuntimeAction` that can be Cast, Resolved, and damage a target without crashing.

### 1.2 Hydration Logic
**Engine Path**: `src/api/game/src/engine/derivation/ActionHydrator.ts`
**Method**: `hydrateFromSpell(spell, context)`

#### Input Context
- **Caster**: Level 5 Wizard (Int 20).
- **Target**: Training Dummy (AC 10, HP 100).

#### Steps
1.  **Check Configs**: Verify `casting_config`, `range_config`, `mechanics_config` match Schema.
2.  **Hydrate**: Invoke `hydrateFromSpell`.
3.  **Assert Output**: Resulting `RuntimeAction` MUST have:
    - `id`: Unique determininstic ID.
    - `effects`: Non-empty array (unless utility).
    - `attack`/`save`: Correctly mapped from config.

### 1.3 Simulation (Dry Run)
**Engine Path**: `src/api/game/src/engine/resolution/ActionDispatcher.ts`

- **Execution**: `ActionDispatcher.resolve(caster, target, action)`.
- **Assertion**:
    - **No Crash**: Function completes.
    - **Damage**: `result.damageTotal` >= 0.
    - **Logs**: "Attack Roll", "Save Result", or "Damage" present in logs.

---

## ⚔️ 02. Equipment Compilation Protocol

### 2.1 Objective
Verify that `Item` (Weapon/Armor) correctly modifies stats or provides Actions.

### 2.2 Hydration: Weapons
**Method**: `hydrateFromEquipment(item, context)`

- **Input**: Level 5 Fighter.
- **Assertion**: Returns `RuntimeAction[]` array with length >= 1.
- **Dry Run**: Pick Action[0]. Execute vs Target. Verify "Hit" or "Miss" in logs.

### 2.3 Hydration: Armor
**Engine Path**: `src/api/game/src/engine/derivation/capabilities.ts`

- **Input**: Weak Character (Str 8).
- **Step**: Equip Item. Invoke `deriveSpeed(context)`.
- **Assertion**: Check if `speed.walk` is penalized (e.g., Heavy Armor penalty applied).

---

## 🧩 03. Feature Compilation Protocol

### 3.1 Objective
Verify Class `Feature` hooks are registered and operative.

### 3.2 Registry Lookup
**Engine Path**: `src/api/game/src/engine/mechanics/registry/FeatureRegistry.ts`

- **Step**: `FeatureRegistry.get(feature.slug)`.
- **Assert**: NOT UNDEFINED using case-insensitive lookup.

### 3.3 Hook Verification
- **Test**: Check for existence of implemented methods: `onTurnStart`, `applyDamageBonus`, `canApply`.
- **Dry Run**: If `applyDamageBonus` exists, invoke with Dummy Context. Assert return value is a valid modifier object.

---

## 🧬 04. Trait Compilation Protocol

### 4.1 Objective
Verify Racial/Monster `Trait` logic.

### 4.2 Handling Strategy
1.  **Registry Check**: Does it map to `FeatureRegistry`? (Run Feature Protocol).
2.  **Passive Check**: Does slug map to hardcoded Engine Key (e.g. `vision.darkvision`, `resistance.fire`)?

### 4.3 Simulation
- **Input**: Entity with Trait.
- **Trigger**:
    - For Resistances: Apply matching DamageType via `ActionDispatcher`.
    - **Assert**: Damage is halved or blocked.

---

## 🐍 05. Race Compilation Protocol

### 5.1 Objective
Verify `Race` data integrity and Trait inheritance.

### 5.2 Derivation Check
- **Speed**: Verify `deriveSpeed` returns correct integer for this race.
- **Size**: Verify definition exists.

### 5.3 Deep Recursion
- **Iterate Traits**: For every Relation in `race.traits`, execute **04. Trait Compilation Protocol**.
- **Verdict**: Race is VALID only if ALL Traits are VALID.

---

## 📚 06. Class Compilation Protocol

### 6.1 Objective
Verify `Class` level progression.

### 6.2 Data Integrity
- **Hit Die**: Must be d6/d8/d10/d12.
- **Progression**: Relation `class_levels` must not be empty.

### 6.3 Deep Recursion
- **Simulate Level 20**:
    - Collect ALL features from Levels 1-20.
    - Execute **03. Feature Compilation Protocol** on EACH feature.
- **Verdict**: Class is VALID only if ALL Features are VALID.

---

## 👤 07. Entity Compilation Protocol (The Master Test)

### 7.1 Objective
The Final Boss. Check `EntitySheet` mechanical validity.

### 7.2 Recursive Stack
1.  **Run Race Protocol** (`entity.race`).
2.  **Run Class Protocol** (`entity.class`).
3.  **Run Equipment Protocol** (All Items).
4.  **Run Spell Protocol** (All Spells).

### 7.3 The "Turn Test"
**Engine Path**: `src/api/game/src/engine/core/game-loop.ts` (conceptual)

1.  **Derive Capabilities**: `deriveSpeed`, `deriveActions`.
    - Assert: Speed > 0, Actions > 0.
2.  **Select Action**: Pick Highest Damage Action.
3.  **Execute**: `ActionDispatcher.resolve(entity, dummy, action)`.
4.  **Verify**: Log contains meaningful combat trace.

---

> [!IMPORTANT]
> **VERIFICATION MANDATE**
> This protocol must be run:
> 1. On `yarn codegen` (for schema check).
> 2. On `yarn seed` (for integrity).
> 3. Periodically via `yarn cli compile --all`.
