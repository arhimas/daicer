
# Engine Rules

The specific logic implementations of D&D 5e / Daicer System rules.

## Modules
- **Combat**: `resolveAttack()`, Attack Validation, Critical Hits, Advantage/Disadvantage logic.
- **Spatial**: `findPath()` (A*), `hasLineOfSight()` (Bresenham's 3D).
- **Actions**: Type definitions re-exported from Shared for engine consistency.

These functions are mostly "Pure" logic, taking inputs and returning results without side effects.
