# Bio-Necessities Design

## Core Concept

Entities have biological needs that decay over time. Neglecting them leads to **Debuffs** (Exhaustion, Weakness). Satisfying them involves consuming items or performing actions.

## 1. The Meters (0-100)

All meters start at 100 (Satisfied) and decay towards 0 (Desperate).

1.  **Satiety (Food)**
    - _Decay_: -1 per Hour.
    - _Thresholds_:
      - `< 50`: Hungry (Nagging messages).
      - `< 20`: Starving (Disadvantage on STR/CON).
      - `0`: Dying (Taking damage).
2.  **Hydration (Water)**
    - _Decay_: -2 per Hour.
    - _Thresholds_:
      - `< 20`: Dehydrated (Disadvantage on Mental checks).
3.  **Energy (Sleep)**
    - _Decay_: -1 per 10 Minutes (active) or -1 per Hour (resting).
    - _Thresholds_:
      - `< 20`: Exhausted (Halved Speed).
4.  **Bladder/Bowels (Waste)**
    - _Accumulation_: Inverse meter. Starts at 0, fills to 100.
    - _Fill Rate_: +5 per Meal/Drink. +1 per Hour.
    - _Thresholds_:
      - `> 80`: Urgent (Dexterity penalties).
      - `100`: Accident (Social embarrassment, Hygiene reset).

## 2. Actions & Items

- **Items**: `FoodItem`, `WaterItem`.
  - Property: `nutritionValue`, `hydrationValue`.
- **Actions**:
  - `Eat`: Consumes item, restores Satiety. Increases Waste.
  - `Drink`: Consumes item, restores Hydration. Increases Waste.
  - `Sleep`: Restores Energy.
  - `Relieve Self`: Resets Waste to 0. Takes 1-5 minutes.

## 3. Auto-Regeneration

- **Health Regen**: Only active if Satiety > 80 AND Hydration > 80.
- **Mana/Stamina Regen**: Scaled by Energy level.

## 4. Implementation Strategy

1. **Schema Update**: Extend `EntitySheet` with `bio: { satiety, hydration, energy, waste }`.
2. **Tick System**: Engine function `processBioDecay(entity, timePassed)`.
3. **Events**: Trigger `ConditionAdded` events when thresholds are crossed.
