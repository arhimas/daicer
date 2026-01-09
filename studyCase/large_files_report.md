# Large Code File Analysis (> 200 Lines)

This report lists source files in both Backend and Frontend that exceed 200 lines of code. It excludes `node_modules`, `dist`, `generated` files, and `.json` data files.

> **Note:** Large files often indicate "God Objects" or mixed responsibilities. These are primary candidates for refactoring into smaller, single-purpose modules.

## 🔴 Critical Hotspots (> 400 Lines)

These files are the most complex and likely contain multiple responsibilities.

### Backend

| Lines   | File Path                                                      | Type                     |
| ------- | -------------------------------------------------------------- | ------------------------ |
| **710** | `backend/src/ai/tools/game/__tests__/combat-e2e.test.ts`       | Test                     |
| **560** | `backend/src/ai/tools/game/__tests__/direct-execution.test.ts` | Test                     |
| **543** | `backend/src/api/game/services/turn-processing.ts`             | **Service** (Core Logic) |
| **451** | `backend/src/api/game/services/character-lifecycle.ts`         | **Service** (Lifecycle)  |
| **442** | `backend/src/api/narrator/services/narrator.ts`                | **Service** (AI)         |
| **428** | `backend/src/api/game/services/game.ts`                        | **Service** (Controller) |
| **404** | `backend/src/engine/engine/action-dispatcher.ts`               | **Engine** (Core)        |

### Frontend

| Lines   | File Path                                                                          | Type                          |
| ------- | ---------------------------------------------------------------------------------- | ----------------------------- |
| **866** | `frontend/src/components/combat/SpellEffectOverlay.stories.tsx`                    | Story (DEPRECATED DELETE IT ) |
| **687** | `frontend/src/services/api.ts`                                                     | Service                       |
| **675** | `frontend/src/features/create-room/components/CampaignWizard.tsx`                  | Component (Complex UI)        |
| **627** | `frontend/src/services/game-data.ts`                                               | Service                       |
| **527** | `frontend/src/components/ui/dice-roll-animation/DiceRollAnimation.tsx`             | Component (Animation)         |
| **517** | `frontend/src/pages/GameRoom.tsx`                                                  | Page (Main Hub)               |
| **489** | `frontend/src/components/ui/dice-loader/DiceLoader.tsx`                            | Component                     |
| **470** | `frontend/src/components/game/GameplayScreen.tsx`                                  | Component                     |
| **452** | `frontend/src/features/debug/components/GameDebugView.tsx`                         | Debug Tool                    |
| **446** | `frontend/src/components/ui/dice-roll-animation/__tests__/faceOrientation.test.ts` | Test                          |
| **443** | `frontend/src/components/chat/UnifiedChatArea.tsx`                                 | Component                     |
| **428** | `frontend/src/types/contracts.ts`                                                  | Types (Monolith)              |

---

## 🟡 Watchlist (300 - 400 Lines)

These files are becoming large and should be monitored or split soon.

### Backend

| Lines   | File Path                                                                 |
| ------- | ------------------------------------------------------------------------- |
| **389** | `backend/src/engine/rules/combat.ts` (**Critical**: Logic Density)        |
| **381** | `backend/src/api/game/services/entity-adapter.ts` (**Refactor Priority**) |
| **349** | `backend/src/api/game/services/spawn-service.ts`                          |
| **331** | `backend/src/cli/commands/explore.ts`                                     |

### Frontend

| Lines   | File Path                                                                      |
| ------- | ------------------------------------------------------------------------------ |
| **396** | `frontend/src/features/debug/components/MapRenderer.tsx`                       |
| **396** | `frontend/src/components/chat/ChatActionToolbar.tsx`                           |
| **378** | `frontend/src/components/ai/Actions.stories.tsx`                               |
| **370** | `frontend/src/hooks/useStreamingSocket.tsx`                                    |
| **355** | `frontend/src/components/layout/Navbar.tsx`                                    |
| **350** | `frontend/src/models/rules/queries.ts`                                         |
| **345** | `frontend/src/components/ui/dice-roll-animation/DiceRollAnimation.stories.tsx` |
| **340** | `frontend/src/pages/OpenedRoom.tsx`                                            |
| **318** | `frontend/src/components/ui/dice-loader/createDie.ts`                          |
| **313** | `frontend/src/pages/Rooms.tsx`                                                 |
| **312** | `frontend/src/components/ai/Message.stories.tsx`                               |
| **308** | `frontend/src/services/socket.ts`                                              |
| **307** | `frontend/src/components/room/EntityListModal.tsx`                             |
| **304** | `frontend/src/features/debug/components/GameDebugMap.tsx`                      |
| **300** | `frontend/src/components/game/UniversalEntitySheet.tsx`                        |

---

## 🔵 Standard Heavy (200 - 300 Lines)

Normal for complex Logic/UI, but candidates for sub-component extraction.

### Backend

| Lines   | File Path                                                                    |
| ------- | ---------------------------------------------------------------------------- |
| **297** | `backend/src/engine/types/index.ts`                                          |
| **271** | `backend/src/lifecycle/graphql/mutation-resolvers.ts`                        |
| **271** | `backend/src/api/game/services/__tests__/turn-processing.test.ts`            |
| **271** | `backend/src/api/game-event/services/__tests__/game-event-state.test.ts`     |
| **266** | `backend/src/shared/schemas/entity.ts`                                       |
| **266** | `backend/src/api/room/services/turn-service.ts`                              |
| **258** | `backend/src/engine/entropy/index.ts`                                        |
| **252** | `backend/src/api/game/services/__tests__/entity-adapter.spec.ts`             |
| **251** | `backend/src/ai/tools/game/__tests__/perform-action-normalization.test.ts`   |
| **245** | `backend/src/api/voxel-engine/services/generators/civilization-generator.ts` |
| **245** | `backend/src/api/game/controllers/game.ts`                                   |
| **242** | `backend/src/lifecycle/graphql/__tests__/graphql-room-management.test.ts`    |
| **241** | `backend/src/api/narrator/services/__tests__/narrator-integration.test.ts`   |
| **239** | `backend/src/api/voxel-engine/services/structure-service.ts`                 |
| **221** | `backend/src/engine/derivation/ActionHydrator.ts`                            |
| **214** | `backend/src/api/game-event/services/game-event.ts`                          |
| **213** | `backend/src/engine/schemas/game.ts`                                         |
| **213** | `backend/src/ai/tools/game/perform-action.ts`                                |
| **212** | `backend/src/cli/commands/knowledge.ts`                                      |
| **212** | `backend/src/api/voxel-engine/services/utils/physics.ts`                     |
| **209** | `backend/src/api/entity-sheet/content-types/entity-sheet/lifecycles.ts`      |
| **207** | `backend/src/engine/world/world-atlas.ts`                                    |
| **202** | `backend/src/engine/voxel/terrain-generator.ts`                              |

### Frontend (Selected top 10 in this range)

| Lines   | File Path                                                             |
| ------- | --------------------------------------------------------------------- |
| **299** | `frontend/src/features/create-room/pages/DmSettingsPage.tsx`          |
| **299** | `frontend/src/components/room/RoomSettingsTab.tsx`                    |
| **293** | `frontend/src/components/room/CharacterCreationModal.tsx`             |
| **285** | `frontend/src/components/ui/FormWizard.tsx`                           |
| **276** | `frontend/src/pages/Landing.tsx`                                      |
| **276** | `frontend/src/hooks/useRoomWizard.ts`                                 |
| **275** | `frontend/src/components/room/CharacterCreation.tsx`                  |
| **271** | `frontend/src/components/ui/spotlight-carousel/SpotlightCarousel.tsx` |
| **270** | `frontend/src/hooks/useSocket.tsx`                                    |
| **265** | `frontend/src/components/room/character-creation/avatarHelpers.ts`    |
