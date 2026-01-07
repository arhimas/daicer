# Structured Actions: Character & Spellcasting

## 1. Overview

Characters are the primary drivers of the Action System. Their ability to use Spells and Feats depends on their **Class**, **Level**, and **Resource Pools**. This document defines the schema for Characters and how they integrate with the `Spell` system defined in `01_spells.md`.

---

## 2. Data Model: `Character` (Enhancement)

The `Character` schema must be robust enough to define _potential_ actions, which the `EntityDeriver` then converts into _runtime_ `EntitySheet` actions.

### Schema: `Character`

- **Name** (String)
- **Race** (Relation -> `Race`)
- **Classes** (Repeatable Component `ClassLevel`):
  - **Class** (Relation -> `Class`)
  - **Level** (Integer)
  - **Subclass** (Relation -> `Subclass`, Optional)
- **Stats** (Component: `Stats`): Str, Dex, Con, Int, Wis, Cha.
- **Background** (Relation -> `Background`)
- **Feats** (Relation -> `Feat`, Many-to-Many)
- **Spell Configuration** (Component `SpellConfig`):
  - **Ability** (Enum: `Int`, `Wis`, `Cha`): Override for multiclassing or specific builds.
  - **Prepared Spells** (Relation -> `Spell`, Many-to-Many): The list of spells currently ready.
  - **Known Spells** (Relation -> `Spell`, Many-to-Many): For Bard, Sorcerer, Warlock.
  - **Spellbook** (Relation -> `Spell`, Many-to-Many): For Wizards (Repository of all owned spells).

---

## 3. Spellcasting Rules & Resources

The Engine must calculate **Spell Slots** and **Pact Magic** slots based on the character's class levels.

### A. Spell Slot Calculation (The "multiclass" Table)

- **Logic**:
  - Full Casters (Wizard, Sorcerer, Bard, Druid, Cleric): Level = Class Level.
  - Half Casters (Paladin, Ranger): Level = floor(Class Level / 2).
  - Third Casters (Arcane Trickster, Eldritch Knight): Level = floor(Class Level / 3).
  - _Total Caster Level_ determines slots per day (Standard 5e Table).
- **Resource ID**: `spell_slots_level_1` through `spell_slots_level_9`.

### B. Pact Magic (Warlock)

- **Logic**: Warlock slots are kept _separate_ from the standard array.
- **Resource ID**: `pact_magic_slots`.
- **Recharge**: `Short Rest`.
- **Tier**: All Pact slots are of the _same_ level (max 5th), determined by Warlock level.

### C. Preparation vs Known

- **Prepared Casters** (Cleric, Druid, Wizard, Paladin):
  - _Constraint_: Can prepare `Level + Mod` spells.
  - _UI_: Player selects from `Known` (or whole list for Cleric/Druid) -> pushes to `Prepared`.
  - _Engine_: Only `Prepared` spells are converted into `ActionDefinition`.
- **Known Casters** (Bard, Sorcerer, Ranger, Warlock):
  - _Constraint_: Fixed number of spells known.
  - _Engine_: All `Known` spells are converted into `ActionDefinition`.

---

## 4. Derivation: `EntityDeriver.deriveSpells()`

This function bridges the `Character` blueprint to the `EntitySheet`.

1.  **Calculate Slots**:
    - Compute Total Caster Level.
    - Generate `resources` map (e.g. `{ spell_slots_level_1: { max: 4, current: 4 } }`).
2.  **Collect Active Spells**:
    - If Class uses Preparation: Fetch `Prepared` spells.
    - If Class uses Known: Fetch `Known` spells.
    - Add `Always Prepared` spells (Domain/Oath spells).
    - Add `Ritual` spells (if Class has Ritual Casting).
3.  **Generate Actions**:
    - For each Spell, create an `ActionDefinition` (id=`spell_{id}`).
    - **Upcasting**: The Action UI should allow selecting a _higher_ slot level at cast time.
      - _Engine_: The `ActionDefinition` itself defines the _Base_ effect.
      - _Resolver_: Accepts `slotLevel` param. If `slotLevel > baseLevel`, apply `Scaling` logic (from `01_spells.md`).

---

## 5. Feats & Special Abilities

Feats often grant actions (e.g., "Telekinetic Shove") or passive bonuses.

- **Action Feats**: Modeled exactly like Spells but with `sourceType: 'feat'`.
- **Resource**: Some uses `Short Rest` resources, others use `Psionic Dice` or are unlimited.
