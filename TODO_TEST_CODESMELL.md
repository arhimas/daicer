# Code Smell & Test Coverage Audit
> Generated from `TO_DOC.md`

## Legend
- 🟢 **Coverage**: Fully Tested
- 🟡 **Coverage**: Partially Tested / Mocked Only
- 🔴 **Coverage**: Untested
- 🧹 **Smell**: Needs Refactoring / Governance Violation
- ✨ **Smell**: Clean
- ❓ **Status**: Pending Check

## Phase 1: Foundation (Deepest)

### Voxel Engine Utils
- [ ] `src/api/voxel-engine/src/utils/math.ts`
  - 🔴 **Coverage**: Untested (Critical for procedural generation)
  - ✨ **Smells**: Clean

### GraphQL Lifecycle
- [x] `src/lifecycle/graphql/index.ts`
  - ⚪ **Coverage**: Trivial Export
- [ ] `src/lifecycle/graphql/mutation-resolvers.ts`
  - 🟢 **Coverage**: Tested (`graphql-room-management.test.ts`)
  - ✨ **Smells**: Clean
- [ ] `src/lifecycle/graphql/resolvers.ts`
  - 🟢 **Coverage**: Tested (`graphql-queries.test.ts`)
  - 🧹 **Smell**: `as unknown` usage in `availableActions` (Line 100, 108)
- [ ] `src/lifecycle/graphql/tool-generator.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: Helper function `toCamelCase` should be in shared utils. `any` usage in `toolRegistry` access.
- [ ] `src/lifecycle/graphql/type-defs.ts`
  - ⚪ **Coverage**: Schema Definition

### Map Explorer Plugins (Admin Utils)
// ... map explorer files ...
- [ ] `src/plugins/map-explorer/admin/src/utils/getTranslation.ts`
  - ⚪ **Coverage**: Trivial
- [ ] `src/plugins/map-explorer/admin/src/utils/render-engine.ts`
  - 🟢 **Coverage**: Comprehensive (`render-engine.comprehensive.test.ts`)
  - ✨ **Smells**: Clean
- [ ] `src/plugins/map-explorer/admin/src/utils/shape-tools.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smells**: Clean

### Queue Dashboard Plugins
- [ ] `src/plugins/queue-dashboard/admin/src/utils/getTranslation.ts`
  - ⚪ **Coverage**: Trivial

### Schemas (Zod Definitions)
- [ ] `src/schemas/agent-responses.ts`
  - ⚪ **Coverage**: Schema Definition (Type-only)
  - 🧹 **Smell**: `z.any()` usage in `TurnResponseSchema.commands` (Line 35).
- [ ] `src/schemas/dm-turn.ts`
  - ⚪ **Coverage**: Schema Definition (Type-only)

## Phase 2: Shared & Core Utils

### Shared Schemas
- [ ] `src/shared/schemas/entity.ts`
  - ⚪ **Coverage**: Schema Definitions
  - 🧹 **Smell**: Heavy use of `z.any()` (`equipment`, `talents`, `conditions`). Needs strict typing.
- [ ] `src/shared/schemas/actions.ts`
  - ⚪ **Coverage**: Schema Definitions
- [ ] `src/shared/schemas/events.ts`
  - ⚪ **Coverage**: Schema Definitions
- [ ] `src/shared/schemas/actor.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/shared/schemas/common.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/shared/schemas/index.ts`
  - ❓ **Status**: Pending Check

### Shared Utilities
- [ ] `src/shared/utils/markdown-chunker.ts`
  - 🟢 **Coverage**: Tested (`__tests__/markdown-chunker.test.ts`)
- [ ] `src/shared/utils/room-rune-generator.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smells**: Clean

### General Utilities (`src/utils`)
- [ ] `src/utils/dev-logger.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smells**: Clean. Used in `worker-manager.ts`.
- [ ] `src/utils/error-handling.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: `isStrapiError` export appears unused externally.
- [ ] `src/utils/prompt.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: `any` usage implicit in Strapi document fetching. Used in Narrative Engine.
- [ ] `src/utils/room-code.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smells**: Clean. Used in `RoomController`.
- [ ] `src/utils/upload.ts`
  - ❓ **Status**: Pending Check

### Exporters (`src/utils/exporters`)
- [ ] `src/utils/exporters/god-mode.ts`
  - ❓ **Status**: Pending Check

### LLM Utils (`src/utils/llm`)
- [ ] `src/utils/llm/gemini.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/utils/llm/image.ts`
  - ❓ **Status**: Pending Check (Potential Deprecation)
- [ ] `src/utils/llm/index.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/utils/llm/local.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/utils/llm/python-bridge.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/utils/llm/structured.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/utils/llm/text.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/utils/llm/types.ts`
  - ❓ **Status**: Pending Check

## Phase 3: Core Engine

### Core Logic
- [ ] `src/api/game/src/engine/rules/combat.ts`
  - 🔴 **Coverage**: Untested (CRITICAL)
  - 🧹 **Smell**: `resolveAttack` complexity. `as unknown` usage.
- [ ] `src/api/game/src/engine/rules/magic.ts`
  - 🔴 **Coverage**: Untested (CRITICAL)
  - 🧹 **Smell**: Regex fragility.
- [ ] `src/api/game/src/engine/core/deterministic-turn-processor.ts`
  - 🔴 **Coverage**: Untested (CRITICAL)
  - 🧹 **Smell**: `JSON.parse(JSON.stringify)`.
- [x] `src/api/game/src/engine/rules/actions.ts`
  - ⚪ **Coverage**: Trivial Re-export
- [ ] `src/api/game/src/engine/rules/conditions.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean logic, but complex enough to warrant unit tests.
- [ ] `src/api/game/src/engine/rules/dice.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean.
- [ ] `src/api/game/src/engine/rules/dnd5e.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: `createCharacterSnapshot` relies on heavy `as unknown` casing (Line 45+).

- [ ] `src/api/game/src/engine/rules/leveling.ts`
  - 🟢 **Coverage**: Comprehensive (`leveling.comprehensive.test.ts`)
  - ✨ **Smell**: Clean logic.
- [ ] `src/api/game/src/engine/rules/narrator.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Simple string formatters. Low risk.
- [ ] `src/api/game/src/engine/rules/resting.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: `shortRest` and `longRest` imply mutation of the Sheet object (Side Effects).
- [ ] `src/api/game/src/engine/rules/spatial.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: `hasLineOfSight` (Bresenham 3D) and `findPath` (A*) are complex algorithms requiring verification.


### Engine Compilation
- [ ] `src/api/game/src/engine/compilation/CompilationOrchestrator.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: `declare const strapi: any` global stub usage. Extensive `any` casting.
- [ ] `src/api/game/src/engine/compilation/Compiler.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean base class.

- [ ] `src/api/game/src/engine/compilation/atoms/ConditionCompiler.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean logic.
- [ ] `src/api/game/src/engine/compilation/atoms/DamageTypeCompiler.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean logic.
- [ ] `src/api/game/src/engine/compilation/blueprints/EntityCompiler.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Basic validation.
- [ ] `src/api/game/src/engine/compilation/compounds/EquipmentCompiler.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: Hardcoded `mockContext` in production code (Line 34). Duplicate smell.

- [ ] `src/api/game/src/engine/compilation/molecules/FeatureCompiler.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Trivial validation.
- [ ] `src/api/game/src/engine/compilation/molecules/SpellCompiler.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: Hardcoded `mockContext` in production code (Line 31). Uses `any` frequently.


### Engine Derivation
- [ ] `src/api/game/src/engine/derivation/ActionHydrator.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: Complex logic using `any` inputs.
- [ ] `src/api/game/src/engine/derivation/attributes.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Trivial.
- [ ] `src/api/game/src/engine/derivation/capabilities.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/src/engine/derivation/defenses.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean logic.
- [ ] `src/api/game/src/engine/derivation/skills.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean logic.
- [ ] `src/api/game/src/engine/derivation/types.ts`
  - ❓ **Status**: Pending Check


### Engine Mechanics
- [ ] `src/api/game/src/engine/mechanics/damage/DamageInstance.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean logic (`resolveAgainst`).
- [ ] `src/api/game/src/engine/mechanics/damage/DamageType.ts`
  - ⚪ **Coverage**: Type Definition

- [ ] `src/api/game/src/engine/mechanics/features/rage.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Clean logic.
- [ ] `src/api/game/src/engine/mechanics/features/sneak-attack.ts`
  - 🔴 **Coverage**: Untested
  - 🧹 **Smell**: Relies on implicit `properties` hydration (Fragile).
- [ ] `src/api/game/src/engine/mechanics/registry/ClassDefinition.ts`
  - ⚪ **Coverage**: Type Definition
- [ ] `src/api/game/src/engine/mechanics/registry/ClassRegistry.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Trivial Registry.
- [ ] `src/api/game/src/engine/mechanics/registry/FeatureRegistry.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Trivial Registry.


### Engine Voxel
- [ ] `src/api/game/src/engine/voxel/config.ts`
  - ⚪ **Coverage**: Configuration Interface
- [ ] `src/api/game/src/engine/voxel/terrain-generator.ts`
  - 🔴 **Coverage**: Untested (CRITICAL)
  - ✨ **Smell**: Core procedural logic.
- [ ] `src/api/game/src/engine/voxel/utils/math.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Math Utils.


### Engine World
- [ ] `src/api/game/src/engine/world/world-atlas.ts`
  - 🟢 **Coverage**: Tested (`world-atlas.test.ts`)
- [ ] `src/api/game/src/engine/world/index.ts`
  - ⚪ **Coverage**: Re-export.


## Phase 4: Feature Services (Stateful)

### Game Services
- [x] `src/api/game/services/action-engine.ts`
  - 🟢 **Coverage**: Matrix Tested (`action-engine.matrix.test.ts`)
  - 🧹 **Smell**: `handleModifyTerrain` weak typing.
- [ ] `src/api/game/services/biome-spawn-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/entity-derivation.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/entity-lifecycle.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/game-ledger.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/game.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/history-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/inventory-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/llm-gateway.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/lock-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/map-visualization.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/narrative-engine.ts`
  - 🔴 **Coverage**: Untested
  - ✨ **Smell**: Prompt logic mixed with IO.
- [ ] `src/api/game/services/spawn-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/terrain-feature-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/tool-executor.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/translation.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/turn-persistence.ts`
  - ❓ **Status**: Pending Check
- [x] `src/api/game/services/turn-pipeline.ts`
  - 🟢 **Coverage**: Comprehensive (`turn-pipeline.comprehensive.test.ts`)
  - 🧹 **Smell**: `parseTextAction` is fragile.

- [ ] `src/api/game/services/turn-processing.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/visibility-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/services/world-generation.ts`
  - ❓ **Status**: Pending Check

### Other Services
- [ ] `src/services/code-ingestion-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/services/embedding-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/services/entity-knowledge-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/services/image-generation-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/services/llm-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/services/unified-search-service.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/services/mechanics/action-generator.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/services/mechanics/feature-hydrator.ts`
  - ❓ **Status**: Pending Check

## Phase 5: API Surface

### Controllers & Routes
- [ ] `src/api/game/controllers/engine.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/controllers/god-mode.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/game/controllers/locales.ts`
  - ❓ **Status**: Pending Check
- [ ] `src/api/room/controllers/room.ts`
  - ❓ **Status**: Pending Check
  
> Note: Full Controller/Route list is extensive (see `TO_DOC.md`), skipping boilerplate entries here unless they have logic.
