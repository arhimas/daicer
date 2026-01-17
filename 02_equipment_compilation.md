# 02. Equipment Compilation Specification

## 1. Objective
To verify that an `Item` (Equipment) is valid, capable of being equipped, and correctly generating actions or modifiers.

## 2. Static Validation
- **Core Fields**: `name`, `type`, `equipment_category`.
- **Weapon Fields**: If `equipment_category` is weapon, must have `damage_dice`, `damage_type`.
- **Armor Fields**: If `equipment_category` is armor, must have `armor_class`, `str_minimum` (if heavy).

## 3. Hydration Logic
### A. Weapons
**Engine Path**: `src/api/game/src/engine/derivation/ActionHydrator.ts`
**Method**: `hydrateFromEquipment(item, context)`

1.  **Mock Context**: Standard Fighter (Str 16, Dex 14).
2.  **Hydrate**: Call `hydrateFromEquipment`.
3.  **Result Check**: Return array `RuntimeAction[]`. Must contain at least 1 action (e.g., "Longsword Attack").

### B. Armor / Passive Items
**Engine Path**: `src/api/game/src/engine/derivation/capabilities.ts`
**Method**: `deriveSpeed` (for Heavy Armor checks) or `calculateAC` (not yet fully implemented but implied).

1.  **Mock Context**: Weak Character (Str 8).
2.  **Derive**: Equip Heavy Armor.
3.  **Result Check**: Verify `deriveSpeed` applies movement penalty (Speed 30 -> 20).

## 4. Simulation (Dry Run)
### Weapon Attack
1.  **Source**: Mock Entity equipped with the item.
2.  **Action**: Pick the first hydated `RuntimeAction`.
3.  **Execute**: `ActionDispatcher.resolve(source, target, action)`.
4.  **Assertion**: Damage is calculated, logs generated.

## 5. Success Criteria
1.  Static Schema passes.
2.  Weapons generate >= 1 `RuntimeAction`.
3.  Armor properties are readable by `deriveSpeed` logic.
4.  Dry run execution (for weapons) is successful.
