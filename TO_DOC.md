# Documentation Execution Plan (Deep-First)

> **Strategy**: Bottom-Up / Deep-First.
> We document the foundational 'leaf' nodes first, then move up to the consuming services and engines.
> This allows higher-level documentation to reference established lower-level docs.

// Remeber update JSDOCs and READMEs

## Phase 1: Foundation (Deepest)

### `src/api/voxel-engine/src/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/voxel-engine/src/utils/math.ts`

### `src/lifecycle/graphql`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/lifecycle/graphql/index.ts`
  - [ ] `src/lifecycle/graphql/mutation-resolvers.ts`
  - [ ] `src/lifecycle/graphql/resolvers.ts`
  - [ ] `src/lifecycle/graphql/tool-generator.ts`
  - [ ] `src/lifecycle/graphql/type-defs.ts`

### `src/plugins/map-explorer/admin/src/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/utils/getTranslation.ts`
  - [ ] `src/plugins/map-explorer/admin/src/utils/render-engine.ts`
  - [ ] `src/plugins/map-explorer/admin/src/utils/shape-tools.ts`

### `src/plugins/queue-dashboard/admin/src/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/admin/src/utils/getTranslation.ts`

### `src/schemas`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/schemas/agent-responses.ts`
  - [ ] `src/schemas/dm-turn.ts`

### `src/shared`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/shared/index.ts`

### `src/shared/events`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/shared/events/contract.ts`

### `src/shared/schemas`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/shared/schemas/actions.ts`
  - [ ] `src/shared/schemas/actor.ts`
  - [ ] `src/shared/schemas/common.ts`
  - [ ] `src/shared/schemas/entity.ts`
  - [ ] `src/shared/schemas/events.ts`
  - [ ] `src/shared/schemas/index.ts`

### `src/shared/utils`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/shared/utils/markdown-chunker.ts`
  - [ ] `src/shared/utils/room-rune-generator.ts`

### `src/types`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/types/ActionDefinition.ts`
  - [ ] `src/types/EntitySheet.ts`
  - [ ] `src/types/index.ts`

### `src/utils`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/utils/dev-logger.ts`
  - [ ] `src/utils/error-handling.ts`
  - [ ] `src/utils/prompt.ts`
  - [ ] `src/utils/room-code.ts`
  - [ ] `src/utils/upload.ts`

### `src/utils/exporters`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/utils/exporters/god-mode.ts`

### `src/utils/llm`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/utils/llm/gemini.ts`
  - [ ] `src/utils/llm/image.ts`
  - [ ] `src/utils/llm/index.ts`
  - [ ] `src/utils/llm/local.ts`
  - [ ] `src/utils/llm/python-bridge.ts`
  - [ ] `src/utils/llm/structured.ts`
  - [ ] `src/utils/llm/text.ts`
  - [ ] `src/utils/llm/types.ts`

## Phase 2: Core Engines (Complex Logic)

### `src/api/game/src/engine`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/api/game/src/engine/index.ts`

### `src/api/game/src/engine/compilation`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/compilation/CompilationOrchestrator.ts`
  - [ ] `src/api/game/src/engine/compilation/Compiler.ts`

### `src/api/game/src/engine/compilation/atoms`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/compilation/atoms/ConditionCompiler.ts`
  - [ ] `src/api/game/src/engine/compilation/atoms/DamageTypeCompiler.ts`

### `src/api/game/src/engine/compilation/blueprints`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/compilation/blueprints/EntityCompiler.ts`

### `src/api/game/src/engine/compilation/compounds`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/compilation/compounds/EquipmentCompiler.ts`

### `src/api/game/src/engine/compilation/molecules`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/compilation/molecules/FeatureCompiler.ts`
  - [ ] `src/api/game/src/engine/compilation/molecules/SpellCompiler.ts`

### `src/api/game/src/engine/constants`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/constants/physics.ts`

### `src/api/game/src/engine/core`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/core/deterministic-turn-processor.ts`
  - [ ] `src/api/game/src/engine/core/game-loop.ts`

### `src/api/game/src/engine/derivation`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/derivation/ActionHydrator.ts`
  - [ ] `src/api/game/src/engine/derivation/attributes.ts`
  - [ ] `src/api/game/src/engine/derivation/capabilities.ts`
  - [ ] `src/api/game/src/engine/derivation/defenses.ts`
  - [ ] `src/api/game/src/engine/derivation/index.ts`
  - [ ] `src/api/game/src/engine/derivation/skills.ts`
  - [ ] `src/api/game/src/engine/derivation/types.ts`

### `src/api/game/src/engine/engine`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/engine/action-dispatcher.ts`

### `src/api/game/src/engine/entropy`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/entropy/index.ts`

### `src/api/game/src/engine/mechanics/damage`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/mechanics/damage/DamageInstance.ts`
  - [ ] `src/api/game/src/engine/mechanics/damage/DamageType.ts`

### `src/api/game/src/engine/mechanics/features`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/mechanics/features/rage.ts`
  - [ ] `src/api/game/src/engine/mechanics/features/sneak-attack.ts`

### `src/api/game/src/engine/mechanics/registry`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/mechanics/registry/ClassDefinition.ts`
  - [ ] `src/api/game/src/engine/mechanics/registry/ClassRegistry.ts`
  - [ ] `src/api/game/src/engine/mechanics/registry/FeatureRegistry.ts`

### `src/api/game/src/engine/resolution`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/resolution/ActionDispatcher.ts`

### `src/api/game/src/engine/rules`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/rules/actions.ts`
  - [ ] `src/api/game/src/engine/rules/combat.ts`
  - [ ] `src/api/game/src/engine/rules/conditions.ts`
  - [ ] `src/api/game/src/engine/rules/dice.ts`
  - [ ] `src/api/game/src/engine/rules/dnd5e.ts`
  - [ ] `src/api/game/src/engine/rules/leveling.ts`
  - [ ] `src/api/game/src/engine/rules/magic.ts`
  - [ ] `src/api/game/src/engine/rules/narrator.ts`
  - [ ] `src/api/game/src/engine/rules/resting.ts`
  - [ ] `src/api/game/src/engine/rules/spatial.ts`

### `src/api/game/src/engine/schemas`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/schemas/commands.ts`
  - [ ] `src/api/game/src/engine/schemas/entity-min.ts`
  - [ ] `src/api/game/src/engine/schemas/entity-sheet.ts`
  - [ ] `src/api/game/src/engine/schemas/game.ts`
  - [ ] `src/api/game/src/engine/schemas/index.ts`
  - [ ] `src/api/game/src/engine/schemas/voxel.ts`

### `src/api/game/src/engine/types`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/types/blueprint.ts`
  - [ ] `src/api/game/src/engine/types/engine.ts`
  - [ ] `src/api/game/src/engine/types/index.ts`
  - [ ] `src/api/game/src/engine/types/rules.ts`

### `src/api/game/src/engine/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/utils/geometry.ts`
  - [ ] `src/api/game/src/engine/utils/movement.ts`

### `src/api/game/src/engine/voxel`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/voxel/config.ts`
  - [ ] `src/api/game/src/engine/voxel/terrain-generator.ts`

### `src/api/game/src/engine/voxel/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/voxel/utils/math.ts`

### `src/api/game/src/engine/world`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/src/engine/world/index.ts`
  - [ ] `src/api/game/src/engine/world/world-atlas.ts`

### `src/api/voxel-engine/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/voxel-engine/controllers/voxel-engine.ts`

### `src/api/voxel-engine/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/voxel-engine/routes/voxel-engine.ts`

### `src/api/voxel-engine/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/voxel-engine/services/biome-service.ts`
  - [ ] `src/api/voxel-engine/services/chunk-builder.ts`
  - [ ] `src/api/voxel-engine/services/chunk-manager.ts`
  - [ ] `src/api/voxel-engine/services/chunk-worker-loader.js`
  - [ ] `src/api/voxel-engine/services/chunk-worker.ts`
  - [ ] `src/api/voxel-engine/services/road-service.ts`
  - [ ] `src/api/voxel-engine/services/structure-service.ts`
  - [ ] `src/api/voxel-engine/services/voxel-engine.ts`
  - [ ] `src/api/voxel-engine/services/world-generator-logic.ts`

### `src/api/voxel-engine/services/generators`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/voxel-engine/services/generators/advanced-structure-generator.ts`
  - [ ] `src/api/voxel-engine/services/generators/civilization-generator.ts`
  - [ ] `src/api/voxel-engine/services/generators/flora-generator.ts`
  - [ ] `src/api/voxel-engine/services/generators/structure-renderer.ts`

### `src/api/voxel-engine/services/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/voxel-engine/services/utils/constants.ts`
  - [ ] `src/api/voxel-engine/services/utils/physics.ts`
  - [ ] `src/api/voxel-engine/services/utils/tile-helper.ts`

### `src/api/voxel-engine/src`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/voxel-engine/src/config.ts`
  - [ ] `src/api/voxel-engine/src/terrain-generator.ts`

## Phase 3: Global Services

### `src/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/services/code-ingestion-service.ts`
  - [ ] `src/services/embedding-service.ts`
  - [ ] `src/services/entity-knowledge-service.ts`
  - [ ] `src/services/image-generation-service.ts`
  - [ ] `src/services/llm-service.ts`
  - [ ] `src/services/unified-search-service.ts`

### `src/services/mechanics`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/services/mechanics/action-generator.ts`
  - [ ] `src/services/mechanics/feature-hydrator.ts`

## Phase 4: Feature Domains (Services)

### `src/api/action/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/action/services/action.ts`

### `src/api/agent/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/agent/services/agent.ts`
  - [ ] `src/api/agent/services/tool-registry.ts`

### `src/api/assets/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/assets/services/assets.ts`

### `src/api/class/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/class/services/class.ts`

### `src/api/damage-type/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/damage-type/services/damage-type.ts`

### `src/api/dm-setting/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/dm-setting/services/dm-setting.ts`

### `src/api/entity-sheet/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/entity-sheet/services/entity-sheet.ts`

### `src/api/entity/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/entity/services/entity.ts`

### `src/api/equipment-category/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/equipment-category/services/equipment-category.ts`

### `src/api/feature/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/feature/services/feature.ts`

### `src/api/game-data/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game-data/services/game-data.ts`

### `src/api/game-event/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game-event/services/game-event.ts`

### `src/api/game/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/services/action-engine.ts`
  - [ ] `src/api/game/services/biome-spawn-service.ts`
  - [ ] `src/api/game/services/entity-derivation.ts`
  - [ ] `src/api/game/services/entity-lifecycle.ts`
  - [ ] `src/api/game/services/game-ledger.ts`
  - [ ] `src/api/game/services/game.ts`
  - [ ] `src/api/game/services/history-service.ts`
  - [ ] `src/api/game/services/inventory-service.ts`
  - [ ] `src/api/game/services/llm-gateway.ts`
  - [ ] `src/api/game/services/lock-service.ts`
  - [ ] `src/api/game/services/map-visualization.ts`
  - [ ] `src/api/game/services/narrative-engine.ts`
  - [ ] `src/api/game/services/spawn-service.ts`
  - [ ] `src/api/game/services/terrain-feature-service.ts`
  - [ ] `src/api/game/services/tool-executor.ts`
  - [ ] `src/api/game/services/translation.ts`
  - [ ] `src/api/game/services/turn-persistence.ts`
  - [ ] `src/api/game/services/turn-pipeline.ts`
  - [ ] `src/api/game/services/turn-processing.ts`
  - [ ] `src/api/game/services/visibility-service.ts`
  - [ ] `src/api/game/services/world-generation.ts`

### `src/api/game/services/blueprints`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/services/blueprints/entity.ts`
  - [ ] `src/api/game/services/blueprints/index.ts`

### `src/api/item/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/item/services/item.ts`

### `src/api/knowledge-snippet/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/knowledge-snippet/services/knowledge-snippet.ts`

### `src/api/knowledge-source/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/knowledge-source/services/knowledge-source.ts`

### `src/api/language/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/language/services/language.ts`

### `src/api/magic-school/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/magic-school/services/magic-school.ts`

### `src/api/message/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/message/services/message.ts`

### `src/api/narrator/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/narrator/services/narrator.ts`
  - [ ] `src/api/narrator/services/schemas.ts`
  - [ ] `src/api/narrator/services/tool-registry.ts`
  - [ ] `src/api/narrator/services/tools.ts`

### `src/api/proficiency/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/proficiency/services/proficiency.ts`

### `src/api/prompt/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/prompt/services/prompt.ts`

### `src/api/race/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/race/services/race.ts`

### `src/api/room/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/room/services/action-registry.ts`
  - [ ] `src/api/room/services/room.ts`
  - [ ] `src/api/room/services/turn-service.ts`

### `src/api/spell/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/spell/services/spell.ts`

### `src/api/status-effect/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/status-effect/services/status-effect.ts`

### `src/api/subclass/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/subclass/services/subclass.ts`

### `src/api/time-frame/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/time-frame/services/time-frame.ts`

### `src/api/trait/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/trait/services/trait.ts`

### `src/api/turn/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/turn/services/turn.ts`

### `src/api/weapon-property/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/weapon-property/services/weapon-property.ts`

### `src/api/world/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/world/services/world.ts`

## Phase 5: API Surface (Controllers & Routes)

### `src/api/action/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/action/controllers/action.ts`

### `src/api/action/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/action/routes/action.ts`

### `src/api/agent/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/agent/controllers/agent.ts`

### `src/api/agent/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/agent/routes/agent.ts`

### `src/api/class/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/class/controllers/class.ts`

### `src/api/class/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/class/routes/class.ts`

### `src/api/damage-type/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/damage-type/controllers/damage-type.ts`

### `src/api/damage-type/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/damage-type/routes/damage-type.ts`

### `src/api/dm-setting/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/dm-setting/controllers/dm-setting.ts`

### `src/api/dm-setting/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/dm-setting/routes/dm-setting.ts`

### `src/api/entity-sheet/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/entity-sheet/controllers/entity-sheet.ts`

### `src/api/entity-sheet/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/entity-sheet/routes/entity-sheet.ts`

### `src/api/entity/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/entity/controllers/entity.ts`

### `src/api/entity/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/entity/routes/entity.ts`

### `src/api/equipment-category/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/equipment-category/controllers/equipment-category.ts`

### `src/api/equipment-category/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/equipment-category/routes/equipment-category.ts`

### `src/api/feature/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/feature/controllers/feature.ts`

### `src/api/feature/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/feature/routes/feature.ts`

### `src/api/game-data/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game-data/controllers/game-data.ts`

### `src/api/game-data/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game-data/routes/game-data.ts`

### `src/api/game-event/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game-event/controllers/game-event.ts`

### `src/api/game-event/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game-event/routes/game-event.ts`

### `src/api/game/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/controllers/engine.ts`
  - [ ] `src/api/game/controllers/god-mode.ts`
  - [ ] `src/api/game/controllers/locales.ts`

### `src/api/game/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/routes/custom-admin.ts`
  - [ ] `src/api/game/routes/engine.ts`
  - [ ] `src/api/game/routes/god-mode.ts`

### `src/api/item/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/item/controllers/item.ts`

### `src/api/item/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/item/routes/item.ts`

### `src/api/knowledge-snippet/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/knowledge-snippet/controllers/knowledge-snippet.ts`

### `src/api/knowledge-snippet/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/knowledge-snippet/routes/01-custom.ts`
  - [ ] `src/api/knowledge-snippet/routes/knowledge-snippet.ts`

### `src/api/knowledge-source/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/knowledge-source/controllers/knowledge-source.ts`

### `src/api/knowledge-source/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/knowledge-source/routes/knowledge-source.ts`

### `src/api/language/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/language/controllers/language.ts`

### `src/api/language/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/language/routes/language.ts`

### `src/api/magic-school/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/magic-school/controllers/magic-school.ts`

### `src/api/magic-school/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/magic-school/routes/magic-school.ts`

### `src/api/message/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/message/controllers/message.ts`

### `src/api/message/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/message/routes/message.ts`

### `src/api/narrator/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/narrator/controllers/narrator.ts`

### `src/api/narrator/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/narrator/routes/narrator.ts`

### `src/api/proficiency/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/proficiency/controllers/proficiency.ts`

### `src/api/proficiency/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/proficiency/routes/proficiency.ts`

### `src/api/prompt/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/prompt/controllers/prompt.ts`

### `src/api/prompt/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/prompt/routes/prompt.ts`

### `src/api/race/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/race/controllers/race.ts`

### `src/api/race/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/race/routes/race.ts`

### `src/api/room/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/room/controllers/room.ts`

### `src/api/room/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/room/routes/01-custom-room.ts`
  - [ ] `src/api/room/routes/room.ts`

### `src/api/spell/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/spell/controllers/spell.ts`

### `src/api/spell/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/spell/routes/spell.ts`

### `src/api/status-effect/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/status-effect/controllers/status-effect.ts`

### `src/api/status-effect/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/status-effect/routes/status-effect.ts`

### `src/api/subclass/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/subclass/controllers/subclass.ts`

### `src/api/subclass/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/subclass/routes/subclass.ts`

### `src/api/time-frame/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/time-frame/controllers/time-frame.ts`

### `src/api/time-frame/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/time-frame/routes/time-frame.ts`

### `src/api/trait/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/trait/controllers/trait.ts`

### `src/api/trait/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/trait/routes/trait.ts`

### `src/api/turn/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/turn/controllers/turn.ts`

### `src/api/turn/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/turn/routes/turn.ts`

### `src/api/weapon-property/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/weapon-property/controllers/weapon-property.ts`

### `src/api/weapon-property/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/weapon-property/routes/weapon-property.ts`

### `src/api/world/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/world/controllers/world.ts`

### `src/api/world/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/world/routes/world.ts`

## Phase 6: Plugins

### `src/plugins/map-explorer/admin`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/custom.d.ts`

### `src/plugins/map-explorer/admin/src`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/constants.ts`
  - [ ] `src/plugins/map-explorer/admin/src/index.ts`
  - [ ] `src/plugins/map-explorer/admin/src/pluginId.ts`
  - [ ] `src/plugins/map-explorer/admin/src/types.ts`

### `src/plugins/map-explorer/admin/src/components`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/components/Initializer.tsx`
  - [ ] `src/plugins/map-explorer/admin/src/components/PluginIcon.tsx`

### `src/plugins/map-explorer/admin/src/components/PixelEditor`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/components/PixelEditor/index.tsx`

### `src/plugins/map-explorer/admin/src/components/TextureInput`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/components/TextureInput/index.tsx`

### `src/plugins/map-explorer/admin/src/components/VoxelInput`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/components/VoxelInput/Icon.tsx`
  - [ ] `src/plugins/map-explorer/admin/src/components/VoxelInput/index.tsx`

### `src/plugins/map-explorer/admin/src/components/WorldVoxelInput`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/components/WorldVoxelInput/index.tsx`

### `src/plugins/map-explorer/admin/src/pages`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/admin/src/pages/App.tsx`
  - [ ] `src/plugins/map-explorer/admin/src/pages/HomePage.tsx`

### `src/plugins/map-explorer/server/src`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/bootstrap.ts`
  - [ ] `src/plugins/map-explorer/server/src/destroy.ts`
  - [ ] `src/plugins/map-explorer/server/src/index.ts`
  - [ ] `src/plugins/map-explorer/server/src/register.ts`

### `src/plugins/map-explorer/server/src/config`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/config/index.ts`

### `src/plugins/map-explorer/server/src/content-types`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/content-types/index.ts`

### `src/plugins/map-explorer/server/src/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/controllers/index.ts`
  - [ ] `src/plugins/map-explorer/server/src/controllers/map-controller.ts`

### `src/plugins/map-explorer/server/src/middlewares`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/middlewares/index.ts`

### `src/plugins/map-explorer/server/src/policies`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/policies/index.ts`

### `src/plugins/map-explorer/server/src/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/routes/index.ts`

### `src/plugins/map-explorer/server/src/routes/admin`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/routes/admin/index.ts`

### `src/plugins/map-explorer/server/src/routes/content-api`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/routes/content-api/index.ts`

### `src/plugins/map-explorer/server/src/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/map-explorer/server/src/services/index.ts`
  - [ ] `src/plugins/map-explorer/server/src/services/map-service.ts`
  - [ ] `src/plugins/map-explorer/server/src/services/pixel-forge-service.ts`

### `src/plugins/queue-dashboard/admin`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/admin/custom.d.ts`

### `src/plugins/queue-dashboard/admin/src`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/admin/src/index.ts`
  - [ ] `src/plugins/queue-dashboard/admin/src/pluginId.ts`

### `src/plugins/queue-dashboard/admin/src/components`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/admin/src/components/Initializer.tsx`
  - [ ] `src/plugins/queue-dashboard/admin/src/components/PluginIcon.tsx`

### `src/plugins/queue-dashboard/admin/src/components/QueueWidget`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/admin/src/components/QueueWidget/index.tsx`

### `src/plugins/queue-dashboard/admin/src/components/Widget`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/admin/src/components/Widget/index.tsx`

### `src/plugins/queue-dashboard/admin/src/pages`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/admin/src/pages/App.tsx`
  - [ ] `src/plugins/queue-dashboard/admin/src/pages/HomePage.tsx`

### `src/plugins/queue-dashboard/server/src`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/bootstrap.ts`
  - [ ] `src/plugins/queue-dashboard/server/src/constants.ts`
  - [ ] `src/plugins/queue-dashboard/server/src/destroy.ts`
  - [ ] `src/plugins/queue-dashboard/server/src/index.ts`
  - [ ] `src/plugins/queue-dashboard/server/src/register.ts`

### `src/plugins/queue-dashboard/server/src/config`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/config/index.ts`

### `src/plugins/queue-dashboard/server/src/content-types`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/content-types/index.ts`

### `src/plugins/queue-dashboard/server/src/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/controllers/controller.ts`
  - [ ] `src/plugins/queue-dashboard/server/src/controllers/dashboard.ts`
  - [ ] `src/plugins/queue-dashboard/server/src/controllers/index.ts`

### `src/plugins/queue-dashboard/server/src/middlewares`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/middlewares/index.ts`

### `src/plugins/queue-dashboard/server/src/policies`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/policies/index.ts`

### `src/plugins/queue-dashboard/server/src/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/routes/index.ts`

### `src/plugins/queue-dashboard/server/src/routes/admin`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/routes/admin/index.ts`

### `src/plugins/queue-dashboard/server/src/routes/content-api`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/routes/content-api/index.ts`

### `src/plugins/queue-dashboard/server/src/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/queue-dashboard/server/src/services/index.ts`
  - [ ] `src/plugins/queue-dashboard/server/src/services/service.ts`

### `src/plugins/semantic-search`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/plugins/semantic-search/strapi-server.js`

### `src/plugins/semantic-search/server`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/semantic-search/server/index.js`

### `src/plugins/semantic-search/server/src/config`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/semantic-search/server/src/config/index.js`

### `src/plugins/semantic-search/server/src/controllers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/semantic-search/server/src/controllers/index.js`
  - [ ] `src/plugins/semantic-search/server/src/controllers/search-controller.js`

### `src/plugins/semantic-search/server/src/routes`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/semantic-search/server/src/routes/index.js`

### `src/plugins/semantic-search/server/src/services`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/plugins/semantic-search/server/src/services/embedding-service.js`
  - [ ] `src/plugins/semantic-search/server/src/services/index.js`
  - [ ] `src/plugins/semantic-search/server/src/services/search-service.js`
  - [ ] `src/plugins/semantic-search/server/src/services/vector-service.js`

## Phase 7: CLI & Genesis Scripts

### `src/cli`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/cli/index.ts`

### `src/cli/commands`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/cli/commands/compile.ts`
  - [ ] `src/cli/commands/embed.ts`
  - [ ] `src/cli/commands/explore.ts`
  - [ ] `src/cli/commands/genesis.ts`
  - [ ] `src/cli/commands/knowledge.ts`
  - [ ] `src/cli/commands/logs.ts`
  - [ ] `src/cli/commands/schema.ts`
  - [ ] `src/cli/commands/status.ts`

### `src/cli/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/cli/utils/bootstrap.ts`
  - [ ] `src/cli/utils/client.ts`
  - [ ] `src/cli/utils/schema.ts`

### `src/scripts`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/scripts/analyze-legacy-db.ts`
  - [ ] `src/scripts/check-monsters.ts`
  - [ ] `src/scripts/clean-queue.ts`
  - [ ] `src/scripts/compile.ts`
  - [ ] `src/scripts/debug-db.ts`
  - [ ] `src/scripts/debug-gemma.ts`
  - [ ] `src/scripts/debug-schema.ts`
  - [ ] `src/scripts/download-models.ts`
  - [ ] `src/scripts/embed-source-code.ts`
  - [ ] `src/scripts/fix-terrain-textures.ts`
  - [ ] `src/scripts/ingest-codebase.ts`
  - [ ] `src/scripts/ingest-engine-rules.ts`
  - [ ] `src/scripts/ingest-game-entities.ts`
  - [ ] `src/scripts/ingest-manuals.ts`
  - [ ] `src/scripts/ingest-schemas.ts`
  - [ ] `src/scripts/list-knowledge-tables.ts`
  - [ ] `src/scripts/plugin-tools.ts`
  - [ ] `src/scripts/send-code.ts`
  - [ ] `src/scripts/snapshot-to-sqlite.ts`
  - [ ] `src/scripts/typecheck-all.ts`
  - [ ] `src/scripts/verify-entity-rag.ts`
  - [ ] `src/scripts/verify-granular-rag.ts`
  - [ ] `src/scripts/verify-local-queue.ts`
  - [ ] `src/scripts/verify-locale-gen.ts`
  - [ ] `src/scripts/verify-sqlite-vector.js`
  - [ ] `src/scripts/verify-translation.ts`
  - [ ] `src/scripts/wipe-embeddings.ts`
  - [ ] `src/scripts/wipe-knowledge.ts`

### `src/scripts/genesis`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/scripts/genesis/atoms-loader.ts`
  - [ ] `src/scripts/genesis/audit-content.ts`
  - [ ] `src/scripts/genesis/batch-polish.ts`
  - [ ] `src/scripts/genesis/check-batch.ts`
  - [ ] `src/scripts/genesis/class-loader.ts`
  - [ ] `src/scripts/genesis/feature-loader.ts`
  - [ ] `src/scripts/genesis/ingest-polished-items.ts`
  - [ ] `src/scripts/genesis/item-loader.ts`
  - [ ] `src/scripts/genesis/items-loader.ts`
  - [ ] `src/scripts/genesis/magic-item-loader.ts`
  - [ ] `src/scripts/genesis/molecules-loader.ts`
  - [ ] `src/scripts/genesis/monster-loader.ts`
  - [ ] `src/scripts/genesis/polish-library.ts`
  - [ ] `src/scripts/genesis/postgres-nuke.ts`
  - [ ] `src/scripts/genesis/race-loader.ts`
  - [ ] `src/scripts/genesis/spell-loader-v2.ts`
  - [ ] `src/scripts/genesis/srd-magic-items-loader.ts`
  - [ ] `src/scripts/genesis/tag-loader.ts`

### `src/scripts/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/scripts/utils/progressBar.ts`

## Phase 8: Frontend & Misc

### `src`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/index.ts`
  - [ ] `src/types.d.ts`

### `src/admin`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/admin/app.tsx`
  - [ ] `src/admin/vite.config.example.ts`

### `src/api/entity-sheet/content-types/entity-sheet`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/entity-sheet/content-types/entity-sheet/lifecycles.ts`

### `src/api/game/schemas`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/schemas/commands.ts`
  - [ ] `src/api/game/schemas/events.ts`
  - [ ] `src/api/game/schemas/gateway-schemas.ts`

### `src/api/game/scripts`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/scripts/list-monsters.ts`

### `src/api/game/types`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/game/types/resolved-action.ts`

### `src/api/knowledge-source/content-types/knowledge-source`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/knowledge-source/content-types/knowledge-source/lifecycles.ts`

### `src/api/room`
- [x] README.md (**HAS README**)
- Files:
  - [ ] `src/api/room/types.ts`

### `src/api/room/content-types/room`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/room/content-types/room/lifecycles.ts`

### `src/api/turn/content-types/turn`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/turn/content-types/turn/lifecycles.ts`

### `src/api/world/content-types/world`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/api/world/content-types/world/lifecycles.ts`

### `src/config`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/config/embedding.ts`
  - [ ] `src/config/langchain.ts`

### `src/cron`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/cron/deadlock-watchdog.ts`

### `src/engine/debug`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/engine/debug/recorder.ts`

### `src/queues`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/queues/contract.ts`
  - [ ] `src/queues/queue-manager.ts`
  - [ ] `src/queues/worker-manager.ts`

### `src/queues/definitions`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/queues/definitions/compile.ts`
  - [ ] `src/queues/definitions/cron-maintenance.ts`
  - [ ] `src/queues/definitions/embedding.ts`
  - [ ] `src/queues/definitions/generate-text-local.ts`
  - [ ] `src/queues/definitions/generate-text-remote.ts`
  - [ ] `src/queues/definitions/genesis.ts`
  - [ ] `src/queues/definitions/translate-entity.ts`

### `src/services/utils`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/services/utils/entity-markdown.ts`

### `src/subscribers`
- [ ] README.md (NO README)
- Files:
  - [ ] `src/subscribers/auto-embed.ts`
