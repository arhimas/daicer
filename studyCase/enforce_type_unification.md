# Enforce Type Unification: Study Case

## 1. Problem Statement

The current Daicer monorepo suffers from "Language Divergence". Each workspace speaks a different data dialect:

- **Frontend**: Generated GraphQL types (dependent on runtime `localhost:1337`).
- **Backend**: Strapi Content Types (Relational/Component based) + Internal Types.
- **Engine**: Pure TypeScript Zod Schemas (`src/schemas/entity-sheet.ts`).
- **Shared**: Zod schemas (`src/schemas`).

## 2. The Friction Point: "Impedance Mismatch"

A critical discovery is the structural difference between **Strapi Persistence** and **Engine Logic**.

### Example: Entity Sheet

**Engine (`EntitySheetSchema`)**:

```typescript
{
  attributes: { Strength: 10, Dexterity: 15... }, // Key-Value Record
  speed: { walk: 30 } // Simple Object
}
```

**Backend (Strapi `schema.json`)**:

```json
{
  "stats": { "type": "component", "component": "game.stats" },
  "position": { "type": "component", "component": "game.position" }
}
```

_Strapi wraps data in Components with their own IDs and potentially different nesting._

**Frontend (GraphQL)**:

```graphql
entitySheet {
  stats {
    strength
    dexterity
    # ...
  }
}
```

**The Consequence**:
Frontend code has to explicitly map `data.attributes.stats.strength` to `engine.attributes.Strength`. This mapping is manual, fragile, and untyped (or loosely typed).

## 3. The Unification Strategy

### Phase 1: The "Rosetta Stone" (Shared Types)

`@daicer/shared` must export the **Canonical Data Shapes** (DTOs).

- These shapes match the **Engine** (Pure Logic) structure.
- **Zod** is the definition language.
- **Validation**: All data entering/exiting the system (API responses, Socket payloads) must be validated against these Zod schemas.

### Phase 2: Backend Transformation Layer

The Backend must implement a **Transformation Layer** (Adapters) that converts:
`Strapi Entity` <-> `Shared DTO`

The API (GraphQL/REST) should ideally return the `Shared DTO` shape where possible, or Frontend must use the `Shared DTO` schema to validate the "Raw" GraphQL response and convert it immediately to the Canonical Shape.

### Phase 3: Strict Codegen Implementation

1.  **Stop using `localhost`**: Frontend codegen should run against a static schema file committed to the repo.
2.  **Fragment Masking**: Use GraphQL Fragments that match the Shared DTOs.

## 4. Implementation Plan (Proposal)

### Step 1: Centralize Schemas in Shared

Move `EntitySheetSchema` and its dependencies from `@daicer/engine` to `@daicer/shared`.

- **Target**: `shared/src/schemas/entity.ts`
- **Action**: Engine imports from Shared.

### Step 2: Create "Mappers" in Shared

Create `EntityMapper` in `shared` (or `frontend` utils) that takes a `GraphQLQuery` result and returns a `z.infer<typeof EntitySheetSchema>`.

- This creates a **Type Firewall**. Once inside the Frontend components, we only deal with the Canonical Type.

### Step 3: Enforce Backend Parity

Add a Backend Test that instantiates a Mock Entity, converts it to Strapi format, and ensures it survives the round trip without losing data.

## 5. Decision Required

Do we proceed with **Moving Engine Schemas to Shared** as the first action?
