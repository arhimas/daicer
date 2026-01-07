# Structured Actions: EntitySheet Unification

## 1. Overview

The `EntitySheet` is the **Runtime Container** for all active entities in a Room. Whether the source is a `Character` (Player) or a `Monster` (DM), they are both essentially "flattened" into an `EntitySheet` when they spawn.

This document defines how the `EntitySheet` schema must evolve to robustly support the complex features defined in the previous documents (Spells, Charges, Conditions).

---

## 2. The Runtime Schema: `EntitySheet`

This schema represents the "In-Memory" state of a creature, persisted to the database to survive server reloads (`GameLoop` resilience).

### Core Properties

- **Name** (String)
- **Type** (Enum: `player`, `monster`, `npc`, `object`)
- **Source ID** (Integer): ID of the original `Character` or `Monster` document.
- **Controller** (String): User ID (Host) or "AI" (DM Agent).

### Vital Statistics (Mutable)

- **HP** (Integer): Current Hit Points.
- **TempHP** (Integer): Temporary Hit Points.
- **Conditions** (JSON Array): List of active condition objects.
  - `{ id: "stunned", duration: 1, source: "spell_mind_blast" }`
- **Exhaustion** (Integer): Level 0-6.

### Resource Pools (The "Gas Tank")

- **Resources** (JSON Object): Flexible map of all consumable resources.
  - _Keys_: Standardized IDs (`spell_slots_1`, `ki_points`, `rage`, `item_wand_charges`, `legendary_actions`).
  - _Value_: `{ current: 3, max: 4, reset: "long_rest" }`.
  - _Why JSON?_: We cannot hardcode schema fields for every possible class resource. JSON allows infinite extensibility (e.g., "Sorcery Points", "Superiority Dice").

### Action Registry (The "Menu")

- **Structured Actions** (JSON Array of `ActionDefinition`):
  - Instead of a Strapi Component (which is heavy and slow), we store the fully hydrated `ActionDefinition` objects (from `05_integration_engine.md`) as a JSON blob.
  - _Benefit_: Extremely fast lookups by the Game Engine.
  - _Sync_: Use `EntityDeriver` to re-generate this blob whenever Equipment or Spells change.

### Inventory & Equipment

- **Inventory** (Component `InventoryItem`):
  - Real-time list of items carried.
  - Tracks `quantity`.
  - Tracks `equipped` state.

---

## 3. Synchronization Strategy

How do we keep the "Sheet" in sync with the "Blueprint"?

### A. Spawning (One-Way)

1.  **Monster Spawn**: `Monster` blueprint -> `EntitySheet`.
    - `HP` = `Monster.HP`
    - `Actions` = `Monster.InnateActions`
    - `Resources` = `Monster.LegendaryConfig`
2.  **Character Entry**: `Character` blueprint -> `EntitySheet`.
    - `HP` = `Character.HP` (or persisted from last session).
    - `Actions` = Derived from `Character.Classes + Equipment`.

### B. "Save" Back Propagation (Character Only)

When a Player Level Up happens or they change equipment:

1.  **Frontend**: Player edits their `Character` (Blueprint).
2.  **Event**: `CHARACTER_UPDATED` event.
3.  **Engine**: Detects active `EntitySheet` for that character.
4.  **Re-Derive**: Runs `EntityDeriver.derive()` to update the `EntitySheet` stats/actions (e.g., new max HP, new Spells).
    - _Constraint_: Must preserve `current` values (Current HP, Current Slots) unless they exceed the new specific Max.

---

## 4. The "Active Effects" Array

This is the engine's way of tracking buff/debuff durations.

```typescript
type ActiveEffect = {
  uid: string; // Unique ID
  name: string; // "Blessed"
  description: string; // "+1d4 to attacks"
  duration: {
    type: 'rounds' | 'minutes';
    remaining: number;
  };
  concentration?: {
    casterId: string; // Who is concentrating?
  };
  modifiers?: {
    // Mechanic overrides
    ac?: number;
    attackBonus?: number;
    saveBonus?: number;
  };
};
```

- **Engine Logic**: At `StartTurn`, iterate this array. Decrement `remaining`. If `0`, remove.
- **Frontend**: Render icons/tooltips near the Token.
