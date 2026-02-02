# Core Type Definitions

The canonical TypeScript definitions for the Daicer Game Engine. These interfaces define the "Shape of the World" and are used by both the backend engine and frontend/admin clients.

## Key Interfaces

### `EntitySheet.ts`

The **EntitySheet** is the runtime representation of any actor in the game (Player, Monster, NPC).

- **Unified Model**: Handles both PC and NPC data structures.
- **Relational IDs**: Links to `room`, `monster` (template), and `owner` (user actions).
- **Runtime State**: Tracks `hp`, `position`, `conditions`, and `initiative`.

### `ActionDefinition.ts`

The **Runtime Action** contract. This is what the `ActionDispatcher` consumes.

- **Source Agnostic**: Whether it's a Spell, a Weapon Attack, or a Lair Action, it compiles down to this same structure.
- **Strictly Typed Mechanics**: Defines `damage` dice, `save` types, and `cost` resources explicitly for the engine.
