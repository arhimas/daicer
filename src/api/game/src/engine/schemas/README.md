# Engine Schemas

Type Definitions using Zod for runtime validation.

## Principles

1. **Validation at Boundaries**: All inputs (Commands, API calls) must be validated against these schemas.
2. **Shared Kernel**: Many schemas (EntitySheet, Actions) are re-exported from `src/shared` to share types with the Frontend.
3. **Strictness**: We use `z.strict()` where possible to reject unknown fields, but `passthrough()` for loose metadata bags.

## Core Schemas

- **Commands**: `MoveCommand`, `AttackCommand`, etc.
- **Game**: `Room`, `WorldSettings`.
- **Voxel**: `BlockType`, `ChunkDTO`.
