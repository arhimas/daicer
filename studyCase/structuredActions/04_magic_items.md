# Structured Actions: Magic Items & Artifacts

## 1. Overview

Magic Items introduce a unique layer of complexity: **Charges**, **Attunement**, and **Active Effects** that mimic spells but operate under different constraints.

---

## 2. Cardinalities

### A. Rarity

- `Common`, `Uncommon`, `Rare`, `Very Rare`, `Legendary`, `Artifact`

### B. Attunement

- `None`, `Required`, `By Class`, `By Skill`, `Special`

### C. Recharge Logic

- `Dawn`, `Dusk`, `Short Rest`, `Long Rest`, `Special` (e.g., "When you crit")

---

## 3. Data Model: `MagicItem` (Enhancement)

Building on the existing `Magic Item` schema.

### Group 1: Mechanics

- **Is Variant** (Boolean): Generic items (e.g., "Weapon +1") vs Specific ("Holy Avenger").
- **Base Item** (Relation): Links to `Equipment` (e.g., Longsword) if variant.
- **Attunement** (Component):
  - **Required** (Boolean)
  - **Condition** (Text): "Requires attunement by a Paladin"

### Group 2: Charges & Resources (Component: `charge_config`)

- **Has Charges** (Boolean)
- **Max Charges** (Integer)
- **Recharge Trigger** (Enum -> Recharge Logic)
- **Recharge Formula** (String): e.g., "1d6 + 4"
- **Destroy on Empty** (Boolean): e.g., "On a roll of 1 in d20"

### Group 3: Active Abilities (Repeatable Component: `item_action`)

A Magic Item can have multiple _Active_ effects.

- **Name**: e.g. "Cast Fireball", "Lightning Javelin"
- **Cost**: Integer (Charges cost)
- **Effect Type**:
  - **Spell Reference**: Links to a `Spell` document.
  - **Embedded Action**: Full `Action` definition (if unique).
- **Save DC Override**: Integer (Optional). If null, use Caster's DC or Item's fixed DC.
- **Attack Bonus Override**: Integer (Optional).

---

## 4. Integration Logic

### A. Inventory Integration

When a Magic Item is added to a Character's inventory:

1.  **Instantiation**: The `InventoryItem` component acts as the container.
2.  **State Tracking**: The `InventoryItem` (or a specific `ItemState` entity) must track `current_charges`.
3.  **Attunement Slot**: The Character Sheet has limited Attunement slots (usually 3).

### B. Action Injection

If the item is equipped (or attuned):

1.  **Derivation**: The `EntityDeriver` scans `active_abilities`.
2.  **Injection**: It creates new entries in the `structuredActions` array.
    - _ID_: `item_{itemId}_{actionName}`
    - _Resource Check_: Included in the action logic ("Requires 3 charges").

### C. Consumption

When the action is performed:

1.  The Engine verifies `current_charges >= cost`.
2.  If valid, `current_charges` is decremented.
3.  The Effect is resolved.
