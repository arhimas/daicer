# Structured Actions: Monster & Epic Actions

## 1. Overview

Monsters in D&D 5e use a variety of action types beyond standard attacks. This document defines the structures for **Multiattack**, **Legendary Actions**, **Lair Actions**, and **Regional Effects**.

---

## 2. Standard Actions & Multiattack

### A. Innate Actions

Monsters have "Innate Actions" defined directly on their sheet (e.g., "Bite", "Claw", "Breath Weapon"). These use the same `Action` schema as Spells/Weapons but are stored in the `structuredActions` component.

### B. Multiattack (The Meta-Action)

A `Multiattack` is a specific Action that triggers _other_ actions.

#### Schema: `MultiattackProfile`

- **Name**: "Multiattack"
- **Description**: "The dragon makes three attacks: one with its bite and two with its claws."
- **Sequence** (JSON/Repeatable Component):
  - `ActionID`: Reference to "Bite" or "Claw".
  - `Count`: Number of times to execute (e.g., 2).
  - `TargetLogic`: "Same Target" or "Different Targets".

_Integration_: When the Engine resolves `Multiattack`, it does not roll dice itself. Instead, it expands the action into a **Queue of Sub-Actions** that the DM/Agent resolves sequentially.

---

## 3. Legendary Actions

Legendary creatures can take actions _outside_ their turn, at the end of another creature's turn.

### Schema: `LegendaryConfig` (on Monster)

- **Actions Per Round**: Integer (usually 3).
- **Reset Condition**: `Start of Turn`.

### Schema: `LegendaryActionOption`

Stored in `monster.legendary_actions`.

- **Name**: e.g. "Tail Attack", "Wing Attack (Costs 2 Actions)".
- **Cost**: Integer (1, 2, or 3).
- **Effect**:
  - _Reference_: Link to an existing `structuredAction` (e.g., Tail).
  - _Independent_: Full `Action` definition (e.g., Wing Attack with AoE and Save).

_Integration_: The Engine must track a `legendaryActionsRemaining` counter for the monster. The UI must present a "Legendary Action" prompt to the DM at the end of every other combatant's turn.

---

## 4. Lair Actions

Lair actions occur on Initiative count 20 (losing ties).

### Schema: `LairAction`

Stored in `monster.lair_actions` (or potentially a separate `Lair` entity).

- **Trigger**: "Initiative 20".
- **Description**: Rich text describing the environmental effect.
- **Mechanics**:
  - **DC**: Saved DC (often fixed).
  - **Mechanics**: Standard `Action` definition (Save -> Effect).
  - **Constraint**: "Can't use the same effect two rounds in a row".

_Integration_: The Initiative System must automatically insert a "Lair Action" dummy combatant at Count 20 if a Lair-enabled monster is present.

---

## 5. Regional Effects

These are narrative or exploration-tier effects caused by the monster's presence.

### Schema: `RegionalEffect`

- **Description**: Text.
- **Range**: "1 mile", "6 miles".
- **Effect Type**: `Weather`, `Terrain`, `Psychic`.

_Integration_: These are primarily for the **Entropy System** (generating random encounters/weather) rather than tactical combat.
