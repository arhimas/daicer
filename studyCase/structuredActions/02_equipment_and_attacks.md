# Structured Actions: Equipment & Physical Attacks

## 1. Overview

While Spells are self-contained distinct documents, **Physical Attacks** are usually _derived_ from Equipment (Weapons). This document outlines the schema logic to bridge `Equipment` items to the `Action` structure used by the Engine.

## 2. Cardinalities (Weapon Properties)

The `Weapon Property` enumeration governs how a weapon behaves mechanically.

### Common Properties (SRD)

- `Ammunition`: Requires ammo (need to link to Ammo item).
- `Finesse`: Can use Strength or Dexterity for Attack/Damage.
- `Heavy`: Small creatures have Disadvantage.
- `Light`: Allows dual-wielding (Bonus Action attack).
- `Loading`: Limited to 1 attack per turn (without Feat).
- `Range`: Uses dex, has normal/long range.
- `Reach`: Adds 5ft to range.
- `Special`: Custom rules (e.g., Lance, Net).
- `Thrown`: Can be thrown (Str or Dex logic applies).
- `Two-Handed`: Requires 2 hands.
- `Versatile`: Can be used 1H or 2H (changing damage die).

---

## 3. Data Model Enhancements: `Equipment` & `Weapon`

The existing `Equipment` schema in Strapi serves as the base. We need to ensure it maps correctly to the `Action` interface.

### Schema: `Equipment` (Weapon Variant)

- **Name**: e.g. "Longsword"
- **Category**: `Weapon` (Enum or Relation)
- **Subcategory**: `Simple Melee`, `Martial Melee`, `Simple Ranged`, `Martial Ranged`.
- **Damage Dice**: String (e.g., "1d8")
- **Damage Type**: Relation to `DamageType`.
- **Properties**: Many-to-Many relation to `WeaponProperty`.
- **Range Normal**: Integer (feet).
- **Range Long**: Integer (feet).
- **Versatile Damage**: String (e.g., "1d10") - _New Field Needed_.

---

## 4. Derivation Logic: From Item to Action

When an entity equips a weapon, the `EntityDeriver` must generate a corresponding `Action` structure.

### A. The "Attack" Action Definition

We map the physical item fields to the `Action` fields defined in `01_spells.md` (Group 5 & 6).

- **Name**: Item Name (e.g. "Longsword")
- **Action Type**: Derived from Subcategory + Category.
  - Melee Weapon -> `Melee Weapon Attack`
  - Ranged Weapon -> `Ranged Weapon Attack`
- **Range**:
  - Melee: 5ft (or +5 if `Reach`).
  - Ranged: `normal`/`long` from Item.
  - Thrown: `normal`/`long` from Item.
- **To Hit Bonus**: `Proficiency Bonus` (if proficient) + `Attribute Mod` (Str/Dex) + `Magic Bonus`.
- **Damage Component**:
  - **Dice**: `damage_dice` from Item.
  - **Type**: `damage_type` from Item.
  - **Flat Bonus**: `Attribute Mod` + `Magic Bonus` (if any).

### B. Handling "Finesse"

- **Logic**: If Property includes `Finesse`, the Deriver compares `STR` and `DEX` mods and uses the higher one for both To-Hit and Damage.

### C. Handling "Versatile"

- **Logic**: A Versatile weapon generates _two_ potential usage modes or the UI offers a toggle.
  - _Simplification_: The Engine receives a `isTwoHanded` flag in the `ActionPayload`, which swaps the `1d8` for `1d10` during resolution.

### D. Ammunition

- **Constraint**: Ranged weapons with `Ammunition` property require a linked Inventory Slot containing the ammo.
- **Integration**: The `UseAction` flow must decrement the ammo quantity.

---

## 5. Unarmed Strikes & Natural Weapons

Monsters and Monks rely on Natural Weapons. These are defined similarly but exist as "Innate Actions" rather than Inventory Items.

### Schema: `NaturalWeapon` (Component)

Used in the `Monster` schema's `structuredActions`.

- **Name**: "Bite", "Claw".
- **Type**: `Melee Weapon Attack`.
- **Reach**: Integer (e.g. 5, 10).
- **Damage Configuration**: Same repeatable `damage_instance` component as Spells.
- **Auto-Grapple**: Often applies a Condition on hit (e.g., `Grappled` escape DC X).
