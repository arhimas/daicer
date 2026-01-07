# Structured Actions: Spells & Magic System

## 1. Cardinalities (Enumerations)

These enumerations define the fixed options available for Spell creation. They should be implemented as Strapi Enumeration fields or strict Typescript string unions.

### A. Schools of Magic

- `Abjuration`
- `Conjuration`
- `Divination`
- `Enchantment`
- `Evocation`
- `Illusion`
- `Necromancy`
- `Transmutation`

### B. Casting Time Units

- `Action`
- `Bonus Action`
- `Reaction`
- `Minute`
- `Hour`
- `Day`

### C. Range Types

- `Self`
- `Touch`
- `Ranged (Feet)`
- `Ranged (Miles)`
- `Sight`
- `Unlimited`

### D. Area of Effect (AoE) Shapes

- `Cone`
- `Cube`
- `Cylinder`
- `Line`
- `Sphere`
- `Hemisphere`

### E. Duration Types

- `Instantaneous`
- `Concentration`
- `Time-Limited` (Rounds/Minutes/Hours)
- `Until Dispelled`
- `Until Triggered`
- `Special`

### F. Attack / Save Types

- `Melee Spell Attack`
- `Ranged Spell Attack`
- `Strength Save`
- `Dexterity Save`
- `Constitution Save`
- `Intelligence Save`
- `Wisdom Save`
- `Charisma Save`
- `Auto-Hit` (e.g., Magic Missile)
- `None` (Utility)

### G. Damage Types

- `Acid`, `Bludgeoning`, `Cold`, `Fire`, `Force`, `Lightning`, `Necrotic`, `Piercing`, `Poison`, `Psychic`, `Radiant`, `Slashing`, `Thunder`

### H. Conditions

- `Blinded`, `Charmed`, `Deafened`, `Exhaustion`, `Frightened`, `Grappled`, `Incapacitated`, `Invisible`, `Paralyzed`, `Petrified`, `Poisoned`, `Prone`, `Restrained`, `Stunned`, `Unconscious`

---

## 2. Strapi Data Model: `Spell`

This schema completely replaces the current simplified `Spell` content type.

### Group 1: Meta Data

- **Name** (String, Required, Unique)
- **Level** (Integer): 0-9
- **School** (Enum -> _Schools of Magic_)
- **Classes** (Relation): Many-to-Many with `Class`
- **Description** (Rich Text)
- **Icon** (Media): Optional spell icon

### Group 2: Casting Requirements (Component: `casting_config`)

- **Time Value** (Integer): e.g., `1`
- **Time Unit** (Enum -> _Casting Time Units_)
- **Reaction Trigger** (Text, Optional): Required if Unit is `Reaction`
- **Is Ritual** (Boolean)
- **Components** (Component: `spell_components`)
  - **Verbal** (Boolean)
  - **Somatic** (Boolean)
  - **Material** (Boolean)
  - **Material Description** (Text): e.g., "A diamond worth 300gp"
  - **Cost GP** (Integer, Default 0)
  - **Consumed** (Boolean, Default false)

### Group 3: Range & Area of Effect (Component: `range_config`)

- **Type** (Enum -> _Range Types_)
- **Distance** (Integer): In feet (or miles if Type is `Ranged (Miles)`)
- **AoE Shape** (Enum -> _AoE Shapes_, Optional)
- **AoE Size** (Integer): Radius/Length in feet
- **AoE Height** (Integer, Optional): For Cylinders

### Group 4: Duration (Component: `duration_config`)

- **Type** (Enum -> _Duration Types_)
- **Value** (Integer, Optional): For Time-Limited
- **Unit** (Enum: `Rounds`, `Minutes`, `Hours`, `Days`, Optional)
- **Concentration** (Boolean)

### Group 5: Mechanics (Component: `mechanics_config`)

- **Action Type** (Enum -> _Attack / Save Types_)
- **Save Effect** (Enum: `Negate`, `Half`, `None`): Defaults to `None` for Attacks.

### Group 6: Damage & Healing (Repeatable Component: `damage_instance`)

Allows for complex spells like _Flame Strike_ (Fire + Radiant) or DoTs.

- **Effect Type** (Enum: `Damage`, `Healing`, `TempHP`)
- **Damage Type** (Enum -> _Damage Types_)
- **Dice Count** (Integer): Number of dice
- **Dice Value** (Integer): d4, d6, d8, d10, d12, d20
- **Flat Bonus** (Integer): Static modifier (usually 0 for spells, commonly `mod` but spell definitions usually have explicit rolls or `mod` placeholders)
- **Timing** (Enum: `Instant`, `Start of Turn`, `End of Turn`, `One Time Trigger`)

### Group 7: Conditions (Repeatable Component: `condition_instance`)

- **Condition** (Enum -> _Conditions_)
- **Chance** (Integer): 1-100 (Default 100)
- **Duration Rounds** (Integer, Optional): If different from spell duration or fixed.

### Group 8: Scaling (Component: `scaling_config`)

- **Scales** (Boolean)
- **Type** (Enum: `Dice`, `Target`, `Duration`)
- **Method** (Enum: `Per Slot Level`, `Every 2 Slot Levels`, `Specific Thresholds`)
- **Dice Count** (Integer): Dice allowed to add
- **Dice Value** (Integer): Value of dice to add

---

## 3. Integration Logic (Preview)

The `Spell` content type serves as a **Blueprint**. When a Character prepares a spell or a Monster has innate casting:

1.  **Preparation**: The Engine references the `Spell` document.
2.  **Cast Action**: The Engine converts the `Spell` data into a runtime `ActionDefinition`.
3.  **Resolution**: The `ActionDispatcher` reads `mechanics_config` to determine if it's an Attack Roll or Save request.
4.  **Application**: On hit/fail, `damage_instance` components are iterated to apply damage/healing. Conditions are pushed to the target's `ActiveEffects` array.
