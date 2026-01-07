# Structured Actions: Integration Engine & Implementation Plan

## 1. The Unified Action Interface

The core of this system is the **polymorphic handling** of actions. Whether an action comes from a Spell, a Sword, or a Monster Interaction, it must be converted into a standard `ActionDefinition` at runtime.

### Runtime Interface: `ActionDefinition`

This is the object the Game Engine consumes.

```typescript
interface ActionDefinition {
  id: string; // Unique ID (e.g. "spell_fireball", "item_longsword_attack")
  name: string; // Display Name
  sourceType: 'spell' | 'weapon' | 'feature' | 'item';
  sourceId: string; // Document ID of the source entity

  // Cost
  cost?: {
    type: 'slot' | 'charge' | 'ammo' | 'action_economy';
    resourceId?: string; // e.g. "spell_slot_3", "ammo_arrow"
    amount: number;
    actionType: 'action' | 'bonus' | 'reaction';
  };

  // Targeting
  range: {
    type: 'melee' | 'ranged' | 'self' | 'sight';
    value: number; // feet
  };
  aoe?: {
    shape: 'sphere' | 'cone' | 'line' | 'cube';
    size: number;
    height?: number;
  };

  // Mechanics
  attack?: {
    type: 'melee_weapon' | 'ranged_spell' | etc;
    bonus: number;
    critRange?: number;
  };
  save?: {
    attribute: 'str' | 'dex' | etc;
    dc: number;
    effect: 'negate' | 'half' | 'none';
  };

  // Effect Payload
  effects: Array<{
    type: 'damage' | 'healing' | 'apply_condition';
    subtype?: string; // Damage Type (Fire) or Condition (Stunned)
    dice?: string; // "8d6"
    flat?: number;
    timing: 'instant' | 'start_turn' | 'end_turn';
  }>;
}
```

---

## 2. Integration with Game Loop

### A. Turn Processing

1.  **Start of Turn**:
    - Iterate `ActiveEffects`.
    - Apply `start_turn` effects (DoT).
    - Decrement `Condition` durations. Expires if 0.
2.  **Action Phase**:
    - Player selects Action -> Engine validates Cost (Has Slot? Has Ammo?).
    - Engine creates `ActionResolution` request.
3.  **End of Turn**:
    - Apply `end_turn` effects.
    - Handle `LegendaryAction` resets.

### B. Long & Short Rest

- **Short Rest**:
  - Reset `pact_magic` slots.
  - Reset features with `usage_per: short_rest`.
  - Allow Hit Dice spending (Healing).
- **Long Rest**:
  - Reset all Slots, HP, Hit Dice (half).
  - Reset features with `usage_per: long_rest` or `day`.
  - Reduce Exhaustion level by 1.

### C. Logic: `EntityDeriver` Enhancement

The `EntityDeriver` class needs a massive upgrade.

- **Current**: Derives simple derived stats.
- **New**: Must actively partial-hydrate all equipment and spells into `ActionDefinition` objects.
- **Performance**: Cache derived actions on the `EntitySheet` to avoid re-deriving every frame, but invalidate cache on Inventory/Spell change.

---

## 3. High-Level Implementation Plan

This roadmap outlines the steps to build this engine capability.

### Phase 1: Schema Migration (Backend)

1.  **Refactor Enums**: Create strict Type definitions for all Cardinalities defined in `01_spells.md`.
2.  **Rebuild `Spell` Content Type**: Implement the full schema with all Components.
3.  **Enhance `Equipment`**: Add Versatile/Properties support.
4.  **Create `MagicItem`**: New Content Type.

### Phase 2: The Action Definition (Core Engine)

1.  **Define Interface**: Create `engine/src/types/Action.ts` with the strict `ActionDefinition` interface.
2.  **Update `EntityDeriver`**:
    - Implement `deriveWeapons()`: Item -> Action.
    - Implement `deriveSpells()`: Spell -> Action.
    - Implement `deriveFeatures()`: Feature -> Action.

### Phase 3: The Resolution Engine (Game Rules)

1.  **Enhance `ActionDispatcher`**: Support polymorphic execution.
2.  **Build `EffectApplicator`**: Service that takes an Effect Payload (Damage/Condition) and applies it to a target (HP deduction, status tracking).
3.  **Implement Conditions**: Create `ConditionManager` to track/expire effects.

### Phase 4: UI Updates (Frontend)

1.  **Spellbook UI**: Display detailed spell data.
2.  **Action Palette**: Group actions by Source (Main, Bonus, Reaction).
3.  **Chat Log**: Richer breakdown of multi-part damage (e.g. Fireball + Save Result).

---

## 4. Integration with Entropy System

- **Usage**: Spells like _Call Lightning_ or _Control Weather_ interact directly with the Entropy System's `weatherState`.
- **Trigger**: When such a spell is cast, it pushes a `WeatherOverride` to the Entropy Context, locking the weather for the duration.
