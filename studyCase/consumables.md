# Study Case: Consumables & Time System

## 1. Overview

Consumables are a distinct class of items in Daicer that provide beneficial or detrimental effects when used. Unlike permanent equipment (swords, armor), consumables are depleted upon use. This study explores their architecture, focusing on the dichotomy between **Instantaneous** and **Duration-based** effects, and the necessity of a robust **Time System**.

## 2. Consumable Types

### 2.1 Instantaneous Consumables

These items produce an immediate change in the game state and are then resolved.

- **Examples:** Potion of Healing (Restores HP), ration (Restores Energy/Hunger).
- **Mechanic:**
  1.  **Trigger:** User selects "Use Item" action.
  2.  **Cost:** Quantity decreases by 1.
  3.  **Effect:** `EntitySheet` properties are modified directly (e.g., `hp.current += 10`).
  4.  **Persistence:** None.

### 2.2 Duration-based Consumables

These items apply an effect that persists for a specific amount of time.

- **Examples:** Potion of Giant Strength (Set STR to 21 for 1 hour), Torch (Provide light for 1 hour).
- **Mechanic:**
  1.  **Trigger:** User selects "Use Item" action.
  2.  **Cost:** Quantity decreases by 1.
  3.  **Effect:** A `Condition` is added to `EntitySheet.conditions` or a `TemporaryFeature` is appended.
  4.  **Persistence:** The system must track the _expiration_ of this effect.

## 3. The Time System

To support duration-based consumables (and other long-running effects), Daicer requires a unified Time System. Using combat "Rounds" is insufficient for exploration or narrative time (e.g., "lasts 8 hours").

### 3.1 Proposed Architecture: `engine/src/time`

We propose creating a dedicated module for time management.

#### Core Concepts

- **Global Timestamp:** An absolute integer representing total seconds (or minutes) elapsed since the campaign start.
- **Time Scales:**
  - **Round:** 6 seconds (Combat).
  - **Minute:** 10 Rounds (Dungeon Crawling).
  - **Hour:** 60 Minutes (Exploration/Travel).
  - **Day:** 24 Hours (Long Rests/Downtime).

#### Integration Schema

The `Game` or `Room` schema should hold the `WorldClock` state.

```typescript
// engine/src/time/schemas.ts (Proposed)
export const WorldClockSchema = z.object({
  totalSeconds: z.number(), // The single source of truth
  round: z.number(), // Current combat round (if in combat)
  era: z.string(), // "Age of Arcanum"
  calendar: z.object({
    // For UI display
    year: z.number(),
    month: z.number(),
    day: z.number(),
    hour: z.number(),
    minute: z.number(),
  }),
});
```

### 3.2 Consumable Expiration

When a duration-based consumable is used, it stamps an `expiresAt` value on the applied condition.

```typescript
// In EntitySheet.conditions
export const ConditionSchema = z.object({
  name: z.string(),
  // ...
  expiresAt: z.number(), // WorldClock.totalSeconds value when this falls off
  durationLabel: z.string().optional(), // "1 Hour" (for UI)
});
```

## 4. Equipment & Backpack Context

### 4.1 Schema Integration

Consumables live within the `EntitySheet.equipment` array (defined in `engine/src/schemas/entity-sheet.ts`).

```typescript
export const InventoryItemSchema = z.object({
  item: z.string(), // "Potion of Healing"
  quantity: z.number(),
  slot: z.string(), // "backpack", "belt_pouch"
  properties: z.array(z.string()), // ["consumable", "liquid", "magical"]
  // ...
});
```

### 4.2 Entity Derivation (`EntityDeriver`)

The engine must dynamically derive "Use" actions for consumables found in the inventory.

1.  **Scan:** `EntityDeriver` iterates through `equipment`.
2.  **Identify:** Checks for `consumable` tag or lookup in `ItemDatabase`.
3.  **Generate:** Creates an `ActionDefinition` of type `UseItem`.
    - **Action Name:** "Drink Potion", "Eat Ration".
    - **Payload:** Includes the `itemId` to decrement.

### 4.3 "Juicy" Backpack Management

To feel "premium", the UI should treat containers (backpacks, belt pouches) as distinct interactive zones.

- **Quick Slots:** Items in "belt_pouch" should generate prominent actions in the UI.
- **Buried Items:** Items in "backpack" might require an Action to retrieve during combat.
- **Visualization:** Grid-based inventory or realistic weight/volume tracking.

## 5. Next Steps

1.  **Implement `engine/src/time`:** Define the `WorldClock` and helper utilities (`addTime(seconds)`, `formatTime(seconds)`).
2.  **Update `ConditionSchema`:** Add `expiresAt` field.
3.  **Refine `ActionDispatcher`:** Handle `ActionType.UseItem` to support logic for both instant (updater) and duration (condition adder) effects.
