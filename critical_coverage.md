# Critical Coverage Todo List

This document lists files with low coverage (< 80%) that require attention.
Testing these files is critical to ensure system stability and prevent regressions.

**Strategy**: Focus on Core Engine and Service files first.

## Priority Checklist

### 📂 src

- [ ] **0%** - `index.ts` <!-- src/index.ts -->

### 📂 src/api/agent/controllers

- [ ] **0%** - `agent.ts` <!-- src/api/agent/controllers/agent.ts -->

### 📂 src/api/agent/services

- [ ] **0%** - `tool-registry.ts` <!-- src/api/agent/services/tool-registry.ts -->
- [ ] **0%** - `agent.ts` <!-- src/api/agent/services/agent.ts -->

### 📂 src/api/assets/services

- [ ] **0%** - `assets.ts` <!-- src/api/assets/services/assets.ts -->

### 📂 src/api/entity-sheet/content-types/entity-sheet

- [ ] **0%** - `lifecycles.ts` <!-- src/api/entity-sheet/content-types/entity-sheet/lifecycles.ts -->

### 📂 src/api/game-data/controllers

- [ ] **0%** - `game-data.ts` <!-- src/api/game-data/controllers/game-data.ts -->

### 📂 src/api/game-data/services

- [ ] **0%** - `game-data.ts` <!-- src/api/game-data/services/game-data.ts -->

### 📂 src/api/game-event/services

- [ ] **0%** - `game-event.ts` <!-- src/api/game-event/services/game-event.ts -->

### 📂 src/api/game/controllers

- [ ] **0%** - `locales.ts` <!-- src/api/game/controllers/locales.ts -->
- [ ] **0%** - `god-mode.ts` <!-- src/api/game/controllers/god-mode.ts -->
- [ ] **0%** - `engine.ts` <!-- src/api/game/controllers/engine.ts -->

### 📂 src/api/game/schemas

- [ ] **0%** - `gateway-schemas.ts` <!-- src/api/game/schemas/gateway-schemas.ts -->
- [ ] **0%** - `events.ts` <!-- src/api/game/schemas/events.ts -->
- [ ] **0%** - `commands.ts` <!-- src/api/game/schemas/commands.ts -->

### 📂 src/api/game/scripts

- [ ] **0%** - `list-monsters.ts` <!-- src/api/game/scripts/list-monsters.ts -->

### 📂 src/api/game/services

- [ ] **0%** - `world-generation.ts` <!-- src/api/game/services/world-generation.ts -->
- [ ] **0%** - `visibility-service.ts` <!-- src/api/game/services/visibility-service.ts -->
- [ ] **0%** - `turn-processing.ts` <!-- src/api/game/services/turn-processing.ts -->
- [ ] **0%** - `turn-pipeline.ts` <!-- src/api/game/services/turn-pipeline.ts -->
- [ ] **0%** - `turn-persistence.ts` <!-- src/api/game/services/turn-persistence.ts -->
- [ ] **0%** - `translation.ts` <!-- src/api/game/services/translation.ts -->
- [ ] **0%** - `tool-executor.ts` <!-- src/api/game/services/tool-executor.ts -->
- [ ] **0%** - `terrain-feature-service.ts` <!-- src/api/game/services/terrain-feature-service.ts -->
- [ ] **0%** - `spawn-service.ts` <!-- src/api/game/services/spawn-service.ts -->
- [ ] **0%** - `narrative-engine.ts` <!-- src/api/game/services/narrative-engine.ts -->
- [ ] **0%** - `map-visualization.ts` <!-- src/api/game/services/map-visualization.ts -->
- [ ] **0%** - `lock-service.ts` <!-- src/api/game/services/lock-service.ts -->
- [ ] **0%** - `llm-gateway.ts` <!-- src/api/game/services/llm-gateway.ts -->
- [ ] **0%** - `inventory-service.ts` <!-- src/api/game/services/inventory-service.ts -->
- [ ] **0%** - `history-service.ts` <!-- src/api/game/services/history-service.ts -->
- [x] **80%+** - `game.ts` <!-- src/api/game/services/game.ts -->
- [ ] **0%** - `game-ledger.ts` <!-- src/api/game/services/game-ledger.ts -->
- [ ] **0%** - `entity-lifecycle.ts` <!-- src/api/game/services/entity-lifecycle.ts -->
- [ ] **0%** - `entity-derivation.ts` <!-- src/api/game/services/entity-derivation.ts -->
- [ ] **0%** - `biome-spawn-service.ts` <!-- src/api/game/services/biome-spawn-service.ts -->
- [ ] **0%** - `action-engine.ts` <!-- src/api/game/services/action-engine.ts -->

### 📂 src/api/game/services/blueprints

- [ ] **0%** - `entity.ts` <!-- src/api/game/services/blueprints/entity.ts -->

### 📂 src/api/game/src/engine/compilation

- [x] **80%+** - `Compiler.ts` <!-- src/api/game/src/engine/compilation/Compiler.ts -->
- [x] **80%+** - `CompilationOrchestrator.ts` <!-- src/api/game/src/engine/compilation/CompilationOrchestrator.ts -->

### 📂 src/api/game/src/engine/compilation/atoms

- [x] **80%+** - `DamageTypeCompiler.ts` <!-- src/api/game/src/engine/compilation/atoms/DamageTypeCompiler.ts -->
- [x] **80%+** - `ConditionCompiler.ts` <!-- src/api/game/src/engine/compilation/atoms/ConditionCompiler.ts -->

### 📂 src/api/game/src/engine/compilation/blueprints

- [x] **80%+** - `EntityCompiler.ts` <!-- src/api/game/src/engine/compilation/blueprints/EntityCompiler.ts -->

### 📂 src/api/game/src/engine/compilation/compounds

- [x] **80%+** - `EquipmentCompiler.ts` <!-- src/api/game/src/engine/compilation/compounds/EquipmentCompiler.ts -->

### 📂 src/api/game/src/engine/compilation/molecules

- [x] **80%+** - `SpellCompiler.ts` <!-- src/api/game/src/engine/compilation/molecules/SpellCompiler.ts -->
- [x] **80%+** - `FeatureCompiler.ts` <!-- src/api/game/src/engine/compilation/molecules/FeatureCompiler.ts -->

### 📂 src/api/game/src/engine/constants

- [x] **80%+** - `physics.ts` <!-- src/api/game/src/engine/constants/physics.ts -->

### 📂 src/api/game/src/engine/core

- [x] **80%+** - `game-loop.ts` <!-- src/api/game/src/engine/core/game-loop.ts -->
- [x] **80%+** - `deterministic-turn-processor.ts` <!-- src/api/game/src/engine/core/deterministic-turn-processor.ts -->

### 📂 src/api/game/src/engine/derivation

- [x] **80%+** - `types.ts` <!-- src/api/game/src/engine/derivation/types.ts -->
- [x] **80%+** - `skills.ts` <!-- src/api/game/src/engine/derivation/skills.ts -->
- [ ] **0%** - `index.ts` <!-- src/api/game/src/engine/derivation/index.ts -->
- [x] **80%+** - `defenses.ts` <!-- src/api/game/src/engine/derivation/defenses.ts -->
- [ ] **0%** - `capabilities.ts` <!-- src/api/game/src/engine/derivation/capabilities.ts -->
- [x] **80%+** - `attributes.ts` <!-- src/api/game/src/engine/derivation/attributes.ts -->
- [x] **80%+** - `ActionHydrator.ts` <!-- src/api/game/src/engine/derivation/ActionHydrator.ts -->

### 📂 src/api/game/src/engine/engine

- [x] **80%+** - `action-dispatcher.ts` <!-- src/api/game/src/engine/engine/action-dispatcher.ts -->

### 📂 src/api/game/src/engine/entropy

- [x] **80%+** - `index.ts` <!-- src/api/game/src/engine/entropy/index.ts -->

### 📂 src/api/game/src/engine/input

- [x] **80%+** - `ActionParser.ts` <!-- src/api/game/src/engine/input/ActionParser.ts -->

### 📂 src/api/game/src/engine/mechanics/damage

- [x] **80%+** - `DamageInstance.ts` <!-- src/api/game/src/engine/mechanics/damage/DamageInstance.ts -->

### 📂 src/api/game/src/engine/mechanics/features

- [x] **80%+** - `sneak-attack.ts` <!-- src/api/game/src/engine/mechanics/features/sneak-attack.ts -->
- [x] **80%+** - `rage.ts` <!-- src/api/game/src/engine/mechanics/features/rage.ts -->

### 📂 src/api/game/src/engine/mechanics/registry

- [x] **80%+** - `FeatureRegistry.ts` <!-- src/api/game/src/engine/mechanics/registry/FeatureRegistry.ts -->
- [x] **80%+** - `ClassRegistry.ts` <!-- src/api/game/src/engine/mechanics/registry/ClassRegistry.ts -->

### 📂 src/api/game/src/engine/narrator

- [x] **80%+** - `PromptBuilder.ts` <!-- src/api/game/src/engine/narrator/PromptBuilder.ts -->

### 📂 src/api/game/src/engine/resolution

- [x] **80%+** - `ActionDispatcher.ts` <!-- src/api/game/src/engine/resolution/ActionDispatcher.ts -->

### 📂 src/api/game/src/engine/rules

- [ ] **0%** - `spatial.ts` <!-- src/api/game/src/engine/rules/spatial.ts -->
- [ ] **0%** - `resting.ts` <!-- src/api/game/src/engine/rules/resting.ts -->
- [ ] **0%** - `narrator.ts` <!-- src/api/game/src/engine/rules/narrator.ts -->
- [ ] **0%** - `magic.ts` <!-- src/api/game/src/engine/rules/magic.ts -->
- [ ] **0%** - `leveling.ts` <!-- src/api/game/src/engine/rules/leveling.ts -->
- [ ] **0%** - `dnd5e.ts` <!-- src/api/game/src/engine/rules/dnd5e.ts -->
- [ ] **0%** - `dice.ts` <!-- src/api/game/src/engine/rules/dice.ts -->
- [ ] **0%** - `conditions.ts` <!-- src/api/game/src/engine/rules/conditions.ts -->
- [ ] **0%** - `combat.ts` <!-- src/api/game/src/engine/rules/combat.ts -->

### 📂 src/api/game/src/engine/schemas

- [ ] **0%** - `voxel.ts` <!-- src/api/game/src/engine/schemas/voxel.ts -->
- [ ] **0%** - `game.ts` <!-- src/api/game/src/engine/schemas/game.ts -->
- [ ] **0%** - `entity-min.ts` <!-- src/api/game/src/engine/schemas/entity-min.ts -->
- [ ] **0%** - `commands.ts` <!-- src/api/game/src/engine/schemas/commands.ts -->

### 📂 src/api/game/src/engine/types

- [ ] **0%** - `index.ts` <!-- src/api/game/src/engine/types/index.ts -->

### 📂 src/api/game/src/engine/utils

- [ ] **0%** - `movement.ts` <!-- src/api/game/src/engine/utils/movement.ts -->
- [ ] **0%** - `geometry.ts` <!-- src/api/game/src/engine/utils/geometry.ts -->

### 📂 src/api/game/src/engine/voxel

- [ ] **0%** - `terrain-generator.ts` <!-- src/api/game/src/engine/voxel/terrain-generator.ts -->
- [ ] **0%** - `config.ts` <!-- src/api/game/src/engine/voxel/config.ts -->

### 📂 src/api/game/src/engine/voxel/utils

- [ ] **0%** - `math.ts` <!-- src/api/game/src/engine/voxel/utils/math.ts -->

### 📂 src/api/game/src/engine/world

- [ ] **0%** - `world-atlas.ts` <!-- src/api/game/src/engine/world/world-atlas.ts -->

### 📂 src/api/knowledge-snippet/controllers

- [ ] **0%** - `knowledge-snippet.ts` <!-- src/api/knowledge-snippet/controllers/knowledge-snippet.ts -->

### 📂 src/api/knowledge-source/content-types/knowledge-source

- [ ] **0%** - `lifecycles.ts` <!-- src/api/knowledge-source/content-types/knowledge-source/lifecycles.ts -->

### 📂 src/api/knowledge-source/services

- [ ] **0%** - `knowledge-source.ts` <!-- src/api/knowledge-source/services/knowledge-source.ts -->

### 📂 src/api/narrator/controllers

- [ ] **0%** - `narrator.ts` <!-- src/api/narrator/controllers/narrator.ts -->

### 📂 src/api/narrator/services

- [ ] **0%** - `tools.ts` <!-- src/api/narrator/services/tools.ts -->
- [ ] **0%** - `tool-registry.ts` <!-- src/api/narrator/services/tool-registry.ts -->
- [ ] **0%** - `schemas.ts` <!-- src/api/narrator/services/schemas.ts -->
- [ ] **0%** - `narrator.ts` <!-- src/api/narrator/services/narrator.ts -->

### 📂 src/api/room

- [ ] **0%** - `types.ts` <!-- src/api/room/types.ts -->

### 📂 src/api/room/content-types/room

- [ ] **0%** - `lifecycles.ts` <!-- src/api/room/content-types/room/lifecycles.ts -->

### 📂 src/api/room/controllers

- [ ] **0%** - `room.ts` <!-- src/api/room/controllers/room.ts -->

### 📂 src/api/room/services

- [ ] **0%** - `turn-service.ts` <!-- src/api/room/services/turn-service.ts -->
- [ ] **0%** - `room.ts` <!-- src/api/room/services/room.ts -->
- [ ] **0%** - `action-registry.ts` <!-- src/api/room/services/action-registry.ts -->

### 📂 src/api/time-frame/services

- [ ] **0%** - `time-frame.ts` <!-- src/api/time-frame/services/time-frame.ts -->

### 📂 src/api/turn/content-types/turn

- [ ] **0%** - `lifecycles.ts` <!-- src/api/turn/content-types/turn/lifecycles.ts -->

### 📂 src/api/voxel-engine/controllers

- [ ] **0%** - `voxel-engine.ts` <!-- src/api/voxel-engine/controllers/voxel-engine.ts -->

### 📂 src/api/voxel-engine/services

- [ ] **0%** - `world-generator-logic.ts` <!-- src/api/voxel-engine/services/world-generator-logic.ts -->
- [ ] **0%** - `voxel-engine.ts` <!-- src/api/voxel-engine/services/voxel-engine.ts -->
- [ ] **0%** - `structure-service.ts` <!-- src/api/voxel-engine/services/structure-service.ts -->
- [ ] **0%** - `road-service.ts` <!-- src/api/voxel-engine/services/road-service.ts -->
- [ ] **0%** - `chunk-worker.ts` <!-- src/api/voxel-engine/services/chunk-worker.ts -->
- [ ] **0%** - `chunk-manager.ts` <!-- src/api/voxel-engine/services/chunk-manager.ts -->
- [ ] **0%** - `chunk-builder.ts` <!-- src/api/voxel-engine/services/chunk-builder.ts -->
- [ ] **0%** - `biome-service.ts` <!-- src/api/voxel-engine/services/biome-service.ts -->

### 📂 src/api/voxel-engine/services/generators

- [ ] **0%** - `structure-renderer.ts` <!-- src/api/voxel-engine/services/generators/structure-renderer.ts -->
- [ ] **0%** - `flora-generator.ts` <!-- src/api/voxel-engine/services/generators/flora-generator.ts -->
- [ ] **0%** - `civilization-generator.ts` <!-- src/api/voxel-engine/services/generators/civilization-generator.ts -->
- [ ] **0%** - `advanced-structure-generator.ts` <!-- src/api/voxel-engine/services/generators/advanced-structure-generator.ts -->

### 📂 src/api/voxel-engine/services/utils

- [ ] **0%** - `tile-helper.ts` <!-- src/api/voxel-engine/services/utils/tile-helper.ts -->
- [ ] **0%** - `physics.ts` <!-- src/api/voxel-engine/services/utils/physics.ts -->
- [ ] **0%** - `constants.ts` <!-- src/api/voxel-engine/services/utils/constants.ts -->

### 📂 src/api/voxel-engine/src

- [ ] **0%** - `terrain-generator.ts` <!-- src/api/voxel-engine/src/terrain-generator.ts -->
- [ ] **0%** - `config.ts` <!-- src/api/voxel-engine/src/config.ts -->

### 📂 src/api/voxel-engine/src/utils

- [ ] **0%** - `math.ts` <!-- src/api/voxel-engine/src/utils/math.ts -->

### 📂 src/api/world/content-types/world

- [ ] **0%** - `lifecycles.ts` <!-- src/api/world/content-types/world/lifecycles.ts -->

### 📂 src/cli

- [ ] **0%** - `index.ts` <!-- src/cli/index.ts -->

### 📂 src/cli/commands

- [ ] **0%** - `status.ts` <!-- src/cli/commands/status.ts -->
- [ ] **0%** - `schema.ts` <!-- src/cli/commands/schema.ts -->
- [ ] **0%** - `logs.ts` <!-- src/cli/commands/logs.ts -->
- [ ] **0%** - `knowledge.ts` <!-- src/cli/commands/knowledge.ts -->
- [ ] **0%** - `genesis.ts` <!-- src/cli/commands/genesis.ts -->
- [ ] **0%** - `explore.ts` <!-- src/cli/commands/explore.ts -->
- [ ] **0%** - `embed.ts` <!-- src/cli/commands/embed.ts -->
- [ ] **0%** - `compile.ts` <!-- src/cli/commands/compile.ts -->

### 📂 src/cli/utils

- [ ] **0%** - `ui.ts` <!-- src/cli/utils/ui.ts -->
- [ ] **0%** - `schema.ts` <!-- src/cli/utils/schema.ts -->
- [ ] **0%** - `filter-builder.ts` <!-- src/cli/utils/filter-builder.ts -->
- [ ] **0%** - `client.ts` <!-- src/cli/utils/client.ts -->
- [ ] **0%** - `bootstrap.ts` <!-- src/cli/utils/bootstrap.ts -->

### 📂 src/config

- [ ] **0%** - `langchain.ts` <!-- src/config/langchain.ts -->
- [ ] **0%** - `embedding.ts` <!-- src/config/embedding.ts -->

### 📂 src/cron

- [ ] **0%** - `deadlock-watchdog.ts` <!-- src/cron/deadlock-watchdog.ts -->

### 📂 src/engine/debug

- [ ] **0%** - `recorder.ts` <!-- src/engine/debug/recorder.ts -->

### 📂 src/genesis

- [ ] **0%** - `seeder.ts` <!-- src/genesis/seeder.ts -->

### 📂 src/genesis/schemas

- [ ] **0%** - `prompts.ts` <!-- src/genesis/schemas/prompts.ts -->
- [ ] **0%** - `molecules.ts` <!-- src/genesis/schemas/molecules.ts -->
- [ ] **0%** - `composites.ts` <!-- src/genesis/schemas/composites.ts -->
- [ ] **0%** - `components.ts` <!-- src/genesis/schemas/components.ts -->
- [ ] **0%** - `common.ts` <!-- src/genesis/schemas/common.ts -->
- [ ] **0%** - `atoms.ts` <!-- src/genesis/schemas/atoms.ts -->

### 📂 src/genesis/seed-data

- [ ] **0%** - `traits.ts` <!-- src/genesis/seed-data/traits.ts -->
- [ ] **0%** - `terrains.ts` <!-- src/genesis/seed-data/terrains.ts -->
- [ ] **0%** - `tags.ts` <!-- src/genesis/seed-data/tags.ts -->
- [ ] **0%** - `races.ts` <!-- src/genesis/seed-data/races.ts -->
- [ ] **0%** - `monsters.ts` <!-- src/genesis/seed-data/monsters.ts -->
- [ ] **0%** - `items.ts` <!-- src/genesis/seed-data/items.ts -->
- [ ] **0%** - `features.ts` <!-- src/genesis/seed-data/features.ts -->
- [ ] **0%** - `classes.ts` <!-- src/genesis/seed-data/classes.ts -->

### 📂 src/genesis/vault

- [ ] **0%** - `spells.ts` <!-- src/genesis/vault/spells.ts -->
- [ ] **0%** - `prompts.ts` <!-- src/genesis/vault/prompts.ts -->
- [ ] **0%** - `index.ts` <!-- src/genesis/vault/index.ts -->

### 📂 src/libs/dnd-5e-schema/scripts

- [ ] **0%** - `generator.ts` <!-- src/libs/dnd-5e-schema/scripts/generator.ts -->

### 📂 src/libs/dnd-5e-schema/src

- [ ] **0%** - `generated.ts` <!-- src/libs/dnd-5e-schema/src/generated.ts -->

### 📂 src/libs/llm-core/scripts

- [ ] **0%** - `generate-prompts.ts` <!-- src/libs/llm-core/scripts/generate-prompts.ts -->

### 📂 src/libs/llm-core/src/context

- [ ] **0%** - `snippets.ts` <!-- src/libs/llm-core/src/context/snippets.ts -->
- [ ] **0%** - `builder.ts` <!-- src/libs/llm-core/src/context/builder.ts -->

### 📂 src/libs/llm-core/src/prompt-registry

- [ ] **0%** - `index.ts` <!-- src/libs/llm-core/src/prompt-registry/index.ts -->

### 📂 src/libs/llm-core/src/services

- [ ] **0%** - `gemini.ts` <!-- src/libs/llm-core/src/services/gemini.ts -->

### 📂 src/lifecycle/graphql

- [ ] **0%** - `type-defs.ts` <!-- src/lifecycle/graphql/type-defs.ts -->
- [ ] **0%** - `tool-generator.ts` <!-- src/lifecycle/graphql/tool-generator.ts -->
- [ ] **0%** - `resolvers.ts` <!-- src/lifecycle/graphql/resolvers.ts -->
- [ ] **0%** - `mutation-resolvers.ts` <!-- src/lifecycle/graphql/mutation-resolvers.ts -->

### 📂 src/plugins/map-explorer/admin/src

- [ ] **0%** - `pluginId.ts` <!-- src/plugins/map-explorer/admin/src/pluginId.ts -->
- [ ] **0%** - `index.ts` <!-- src/plugins/map-explorer/admin/src/index.ts -->
- [ ] **0%** - `constants.ts` <!-- src/plugins/map-explorer/admin/src/constants.ts -->

### 📂 src/plugins/map-explorer/admin/src/pages

- [ ] **0%** - `HomePage.tsx` <!-- src/plugins/map-explorer/admin/src/pages/HomePage.tsx -->
- [ ] **0%** - `App.tsx` <!-- src/plugins/map-explorer/admin/src/pages/App.tsx -->

### 📂 src/plugins/map-explorer/admin/src/shims

- [ ] **0%** - `mock.ts` <!-- src/plugins/map-explorer/admin/src/shims/mock.ts -->
- [ ] **0%** - `fs.ts` <!-- src/plugins/map-explorer/admin/src/shims/fs.ts -->

### 📂 src/plugins/map-explorer/admin/src/utils

- [ ] **0%** - `shape-tools.ts` <!-- src/plugins/map-explorer/admin/src/utils/shape-tools.ts -->
- [ ] **0%** - `render-engine.ts` <!-- src/plugins/map-explorer/admin/src/utils/render-engine.ts -->
- [ ] **0%** - `getTranslation.ts` <!-- src/plugins/map-explorer/admin/src/utils/getTranslation.ts -->
- [ ] **0%** - `entity-geometry.ts` <!-- src/plugins/map-explorer/admin/src/utils/entity-geometry.ts -->

### 📂 src/plugins/map-explorer/server/src

- [ ] **0%** - `register.ts` <!-- src/plugins/map-explorer/server/src/register.ts -->
- [ ] **0%** - `destroy.ts` <!-- src/plugins/map-explorer/server/src/destroy.ts -->
- [ ] **0%** - `bootstrap.ts` <!-- src/plugins/map-explorer/server/src/bootstrap.ts -->

### 📂 src/plugins/map-explorer/server/src/controllers

- [ ] **0%** - `voxel-preview.ts` <!-- src/plugins/map-explorer/server/src/controllers/voxel-preview.ts -->
- [ ] **0%** - `map-controller.ts` <!-- src/plugins/map-explorer/server/src/controllers/map-controller.ts -->
- [ ] **0%** - `forge-controller.ts` <!-- src/plugins/map-explorer/server/src/controllers/forge-controller.ts -->

### 📂 src/plugins/map-explorer/server/src/routes

- [ ] **0%** - `index.ts` <!-- src/plugins/map-explorer/server/src/routes/index.ts -->

### 📂 src/plugins/map-explorer/server/src/routes/content-api

- [ ] **0%** - `index.ts` <!-- src/plugins/map-explorer/server/src/routes/content-api/index.ts -->

### 📂 src/plugins/map-explorer/server/src/services

- [ ] **0%** - `queue-service.ts` <!-- src/plugins/map-explorer/server/src/services/queue-service.ts -->
- [ ] **0%** - `map-service.ts` <!-- src/plugins/map-explorer/server/src/services/map-service.ts -->
- [ ] **0%** - `gemini-service.ts` <!-- src/plugins/map-explorer/server/src/services/gemini-service.ts -->
- [ ] **0%** - `context-service.ts` <!-- src/plugins/map-explorer/server/src/services/context-service.ts -->

### 📂 src/plugins/map-explorer/server/src/services/pixel-forge

- [ ] **0%** - `index.ts` <!-- src/plugins/map-explorer/server/src/services/pixel-forge/index.ts -->
- [ ] **0%** - `grid-utils.ts` <!-- src/plugins/map-explorer/server/src/services/pixel-forge/grid-utils.ts -->

### 📂 src/plugins/map-explorer/server/src/services/pixel-forge/generators

- [ ] **0%** - `item.ts` <!-- src/plugins/map-explorer/server/src/services/pixel-forge/generators/item.ts -->
- [ ] **0%** - `creature.ts` <!-- src/plugins/map-explorer/server/src/services/pixel-forge/generators/creature.ts -->

### 📂 src/plugins/map-explorer/server/src/utils

- [ ] **0%** - `pixel-math.ts` <!-- src/plugins/map-explorer/server/src/utils/pixel-math.ts -->
- [ ] **0%** - `entity-geometry.ts` <!-- src/plugins/map-explorer/server/src/utils/entity-geometry.ts -->
- [ ] **0%** - `EntityGeometry.ts` <!-- src/plugins/map-explorer/server/src/utils/EntityGeometry.ts -->

### 📂 src/plugins/map-explorer/server/src/utils/compositor

- [ ] **0%** - `visual-analysis.ts` <!-- src/plugins/map-explorer/server/src/utils/compositor/visual-analysis.ts -->
- [ ] **0%** - `smart-anchors.ts` <!-- src/plugins/map-explorer/server/src/utils/compositor/smart-anchors.ts -->
- [ ] **0%** - `layer-blending.ts` <!-- src/plugins/map-explorer/server/src/utils/compositor/layer-blending.ts -->

### 📂 src/plugins/queue-dashboard/admin/src

- [ ] **0%** - `pluginId.ts` <!-- src/plugins/queue-dashboard/admin/src/pluginId.ts -->
- [ ] **0%** - `index.ts` <!-- src/plugins/queue-dashboard/admin/src/index.ts -->

### 📂 src/plugins/queue-dashboard/admin/src/pages

- [ ] **0%** - `HomePage.tsx` <!-- src/plugins/queue-dashboard/admin/src/pages/HomePage.tsx -->
- [ ] **0%** - `App.tsx` <!-- src/plugins/queue-dashboard/admin/src/pages/App.tsx -->

### 📂 src/plugins/queue-dashboard/admin/src/utils

- [ ] **0%** - `getTranslation.ts` <!-- src/plugins/queue-dashboard/admin/src/utils/getTranslation.ts -->

### 📂 src/plugins/queue-dashboard/server/src

- [ ] **0%** - `register.ts` <!-- src/plugins/queue-dashboard/server/src/register.ts -->
- [ ] **0%** - `destroy.ts` <!-- src/plugins/queue-dashboard/server/src/destroy.ts -->
- [ ] **0%** - `constants.ts` <!-- src/plugins/queue-dashboard/server/src/constants.ts -->
- [ ] **0%** - `bootstrap.ts` <!-- src/plugins/queue-dashboard/server/src/bootstrap.ts -->

### 📂 src/plugins/queue-dashboard/server/src/controllers

- [ ] **0%** - `dashboard.ts` <!-- src/plugins/queue-dashboard/server/src/controllers/dashboard.ts -->
- [ ] **0%** - `controller.ts` <!-- src/plugins/queue-dashboard/server/src/controllers/controller.ts -->

### 📂 src/plugins/queue-dashboard/server/src/routes

- [ ] **0%** - `index.ts` <!-- src/plugins/queue-dashboard/server/src/routes/index.ts -->

### 📂 src/plugins/queue-dashboard/server/src/routes/admin

- [ ] **0%** - `index.ts` <!-- src/plugins/queue-dashboard/server/src/routes/admin/index.ts -->

### 📂 src/plugins/queue-dashboard/server/src/routes/content-api

- [ ] **0%** - `index.ts` <!-- src/plugins/queue-dashboard/server/src/routes/content-api/index.ts -->

### 📂 src/plugins/queue-dashboard/server/src/services

- [ ] **0%** - `service.ts` <!-- src/plugins/queue-dashboard/server/src/services/service.ts -->

### 📂 src/queues

- [ ] **0%** - `worker-manager.ts` <!-- src/queues/worker-manager.ts -->
- [ ] **0%** - `resource-guard.ts` <!-- src/queues/resource-guard.ts -->
- [ ] **0%** - `queue-manager.ts` <!-- src/queues/queue-manager.ts -->
- [ ] **0%** - `contract.ts` <!-- src/queues/contract.ts -->

### 📂 src/queues/definitions

- [ ] **0%** - `translate-entity.ts` <!-- src/queues/definitions/translate-entity.ts -->
- [ ] **0%** - `genesis.ts` <!-- src/queues/definitions/genesis.ts -->
- [ ] **0%** - `generate-text-remote.ts` <!-- src/queues/definitions/generate-text-remote.ts -->
- [ ] **0%** - `generate-text-local.ts` <!-- src/queues/definitions/generate-text-local.ts -->
- [ ] **0%** - `embedding.ts` <!-- src/queues/definitions/embedding.ts -->
- [ ] **0%** - `cron-maintenance.ts` <!-- src/queues/definitions/cron-maintenance.ts -->
- [ ] **0%** - `compile.ts` <!-- src/queues/definitions/compile.ts -->

### 📂 src/schemas

- [ ] **0%** - `dm-turn.ts` <!-- src/schemas/dm-turn.ts -->
- [ ] **0%** - `agent-responses.ts` <!-- src/schemas/agent-responses.ts -->

### 📂 src/services

- [ ] **0%** - `unified-search-service.ts` <!-- src/services/unified-search-service.ts -->
- [ ] **0%** - `llm-service.ts` <!-- src/services/llm-service.ts -->
- [ ] **0%** - `image-generation-service.ts` <!-- src/services/image-generation-service.ts -->
- [ ] **0%** - `entity-knowledge-service.ts` <!-- src/services/entity-knowledge-service.ts -->
- [ ] **0%** - `embedding-service.ts` <!-- src/services/embedding-service.ts -->

### 📂 src/services/mechanics

- [ ] **0%** - `feature-hydrator.ts` <!-- src/services/mechanics/feature-hydrator.ts -->

### 📂 src/services/utils

- [ ] **0%** - `entity-markdown.ts` <!-- src/services/utils/entity-markdown.ts -->

### 📂 src/shared/schemas

- [ ] **0%** - `events.ts` <!-- src/shared/schemas/events.ts -->
- [ ] **0%** - `entity.ts` <!-- src/shared/schemas/entity.ts -->
- [ ] **0%** - `common.ts` <!-- src/shared/schemas/common.ts -->
- [ ] **0%** - `actor.ts` <!-- src/shared/schemas/actor.ts -->
- [ ] **0%** - `actions.ts` <!-- src/shared/schemas/actions.ts -->

### 📂 src/shared/utils

- [ ] **0%** - `text-utils.ts` <!-- src/shared/utils/text-utils.ts -->
- [ ] **0%** - `markdown-chunker.ts` <!-- src/shared/utils/markdown-chunker.ts -->
- [ ] **52.77%** - `room-rune-generator.ts` <!-- src/shared/utils/room-rune-generator.ts -->

### 📂 src/subscribers

- [ ] **0%** - `auto-embed.ts` <!-- src/subscribers/auto-embed.ts -->

### 📂 src/tests

- [ ] **0%** - `vitest-setup.ts` <!-- src/tests/vitest-setup.ts -->
- [ ] **0%** - `setup-strapi.ts` <!-- src/tests/setup-strapi.ts -->
- [ ] **0%** - `harness-patches.ts` <!-- src/tests/harness-patches.ts -->
- [ ] **0%** - `factory.ts` <!-- src/tests/factory.ts -->

### 📂 src/types

- [ ] **0%** - `Inventory.ts` <!-- src/types/Inventory.ts -->

### 📂 src/utils

- [ ] **0%** - `upload.ts` <!-- src/utils/upload.ts -->
- [ ] **0%** - `room-code.ts` <!-- src/utils/room-code.ts -->
- [ ] **0%** - `prompt.ts` <!-- src/utils/prompt.ts -->
- [ ] **0%** - `error-handling.ts` <!-- src/utils/error-handling.ts -->
- [ ] **0%** - `entity-geometry.ts` <!-- src/utils/entity-geometry.ts -->
- [ ] **0%** - `dev-logger.ts` <!-- src/utils/dev-logger.ts -->

### 📂 src/utils/llm

- [ ] **0%** - `types.ts` <!-- src/utils/llm/types.ts -->
- [ ] **0%** - `text.ts` <!-- src/utils/llm/text.ts -->
- [ ] **0%** - `structured.ts` <!-- src/utils/llm/structured.ts -->
- [ ] **0%** - `local.ts` <!-- src/utils/llm/local.ts -->
- [ ] **0%** - `image.ts` <!-- src/utils/llm/image.ts -->
- [ ] **0%** - `gemini.ts` <!-- src/utils/llm/gemini.ts -->
