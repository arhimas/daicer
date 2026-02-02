# Compilation Compounds

Compilers for composite items:

- **EquipmentCompiler**: Validates `item` (Weapons, Armor, Loot).
  - Performs **Hydration Checks** for weapons: attempts to generate `RuntimeActions` to ensure the item is usable in combat.
