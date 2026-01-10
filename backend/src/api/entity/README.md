# Monster API (`api::monster`)

## Purpose

This module defines the **Monster** entity, which serves as a static "Blueprint" for creating enemies, creatures, and other non-player entities in the game world.

## Architecture

In the Unified Entity System:

- **Monsters** are blueprints that "mutate via DM fiat" or pre-computation.
- They are instantiated as `EntitySheet` objects when spawned into a `Room`.
- Unlike Characters, they often rely on pre-calculated stats (AC, HP) but can override them via Equipment (Hybrid Mode).

## Key Entities

- **Monster** (`content-type`): The core record containing stats, actions, and features.

## Usage

Monsters are primarily created and managed via the Strapi Admin Panel.
The `spawn-service` reads these records to generate runtime entities.

```typescript
// Example usage in SpawnService
const monster = await strapi.entityService.findOne('api::monster.monster', id, {
  populate: ['stats', 'structuredActions', 'equipment'],
});
// Convert to EntitySheet...
```

## Dependencies

- **Upstream**: None.
- **Downstream**: `spawn-service`, `EntityDeriver` (Engine).
- **Components**:
  - `game.stats`: Core attributes (Str, Dex, etc).
  - `game.action`: Structured attacks/abilities.
  - `game.feature`: Passive traits.
  - `game.inventory-item`: Optional equipment for Hybrid Mode.
