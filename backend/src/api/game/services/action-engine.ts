/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Action Engine Service
 * Handles game action dispatching with direct Strapi persistence.
 * Replaces the in-memory ActionDispatcher.
 */

import { factories } from '@strapi/strapi';
import { Alea } from '../src/engine/voxel/utils/math';
import {
  Command,
  MoveCommand,
  AttackCommand,
  ModifyTerrainCommand,
  ActionCommand,
  DropItemCommand,
  PickupItemCommand,
  ThrowItemCommand,
} from '../src/engine/types';
import { ActionResult } from '../src/engine/types/engine';
import { findPath } from '../src/engine/rules/spatial';
import { TerrainGenerator } from '../src/engine/voxel/terrain-generator';
import { WorldConfig, ZLevel } from '../src/engine/types';
import { ChunkManager } from '../../voxel-engine/services/chunk-manager';

export default factories.createCoreService('api::game.action-engine', ({ strapi }) => ({
  rng: new Alea('default-seed'), // TODO: Persist seed per room/game?

  async dispatch(command: Command): Promise<ActionResult> {
    console.log(`[ActionEngine] Dispatching command: ${command.type}`, command.payload);

    try {
      switch (command.type) {
        case 'MOVE':
          return this.handleMove(command as MoveCommand);
        case 'ATTACK':
          return this.handleAttack(command as AttackCommand);
        // TODO: Implement other handlers
        case 'SKILL_CHECK':
        case 'DO_ACTION':
          // Legacy handling
          return this.handleAction(command as unknown as ActionCommand);
        // Deprecated / Specifics mapped below or generic fallbacks
        case 'CAST_SPELL':
        case 'INTERACT':
        case 'LONG_REST':
        case 'MODIFY_TERRAIN':
          return this.handleModifyTerrain(command as ModifyTerrainCommand);
        case 'DROP_ITEM':
          return this.handleDropItem(command as DropItemCommand);
        case 'PICKUP_ITEM':
          return this.handlePickupItem(command as PickupItemCommand);
        case 'THROW_ITEM':
          return this.handleThrowItem(command as ThrowItemCommand);
        default:
          return {
            success: false,
            message: `Unknown command type: ${(command as any).type}`,
            events: [],
          };
      }
    } catch (error) {
      console.error('[ActionEngine] Dispatch Error:', error);
      return {
        success: false,
        message: (error as Error).message || 'Internal Error',
        events: [],
      };
    }
  },

  async handleAction(command: ActionCommand): Promise<ActionResult> {
    const { actorId, actionId, targetId, options } = command.payload;

    // 1. Fetch Actor & Context
    // We need strict population to hydrate actions
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: [
        'inventory',
        'inventory.item',
        'inventory.item.equipment_data',
        'inventory.item.equipment_data.damage_type',
        'inventory.item.equipment_data.properties',
        'spellbook', // If spells
        'spellbook.spell',
        'stats',
        'room', // For event context
        'room.config',
      ],
    });

    if (!actor) throw new Error('Actor not found');

    // 2. Hydrate Actions
    // We import locally to avoid circular dependency issues at top level if any
    const { ActionHydrator } = await import('../src/engine/derivation/ActionHydrator');
    // Or direct usage of Hydrator if we want partial
    // For SOTA, we should use the Deriver to get the FULL list of available actions
    // const derived = EntityDeriver.derive(actor);
    // But `derive` might be expensive. Let's use ActionHydrator directly for now or re-use Deriver logic.
    // Actually, EntityDeriver is the standard way.

    // Mapping Strapi Actor to Context
    // We need a helper for this mapping because `Deriver` expects `DerivationContext`.
    // Let's assume we have a helper or do it inline.

    const context = {
      attributes: actor.stats,
      proficiencyBonus: 2, // Check level
      equipment: [], // We need to map inventory -> equipment
      // ... allow loose for now
    } as any;

    // Quick Map Inventory
    if (actor.inventory) {
      context.equipment = actor.inventory
        .filter((entry: any) => entry.isEquipped && entry.item)
        .map((entry: any) => {
          // Flatten for Hydrator (Legacy Shim logic reused)
          const item = entry.item;
          const eqData = item.equipment_data || {};
          return { ...item, ...eqData, equipment_category: { slug: item.type }, isEquipped: true };
        });
    }

    const allActions: any[] = [];

    // From Equipment
    context.equipment.forEach((item: any) => {
      allActions.push(...ActionHydrator.hydrateFromEquipment(item, context));
    });

    // From Spells (if implemented in hydrator)
    if (actor.spellbook) {
      actor.spellbook.forEach((entry: any) => {
        if (entry.spell) {
          // Mapping spell
          allActions.push(ActionHydrator.hydrateFromSpell(entry.spell, context));
        }
      });
    }

    // 3. Find specific Action
    const action = allActions.find((a) => a.id === actionId);

    if (!action) {
      // Fallback: Check if it is a raw WeaponID passed as actionId (Legacy compat)
      // or if it's a "feature" action.
      // For now, fail strict.
      return { success: false, message: `Action ${actionId} not found on actor`, events: [] };
    }

    // 4. Resolve Target
    let target: any = null;
    if (targetId) {
      target = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: targetId,
        populate: ['stats', 'armorClass'],
      });
    }

    // 5. Execute Effects
    const events: any[] = [];
    let resultMessage = `Executed ${action.name}`;

    // A. Costs
    // TODO: Deduct slots/resources

    // B. Logic Handling (Attack vs Save vs Utility)
    const outcomes: any[] = [];

    // 1. Attack Logic
    if (action.attack && target) {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + action.attack.bonus;
      const ac = target.armorClass || 10;
      const isHit = total >= ac || d20 === 20;

      outcomes.push({ type: 'attack', isHit, roll: d20, total });

      events.push({
        type: 'ATTACK_RESULT',
        room: actor.room.documentId,
        actor: actorId,
        payload: {
          actionId: action.id,
          targetId,
          roll: d20,
          total,
          isHit,
        },
        timestamp: Date.now(),
      });

      resultMessage = isHit ? `Hit ${target.name} with ${action.name}` : `Missed ${target.name}`;

      if (isHit) {
        // Proceed to Effects
      } else {
        return { success: true, message: resultMessage, events };
      }
    }

    // 2. Save Logic (Spells like Fireball)
    let saveResult = null;
    if (action.save && target) {
      const d20 = Math.floor(Math.random() * 20) + 1;
      const stat = action.save.attribute.toLowerCase(); // 'dex', 'wis'
      // Simplistic stat lookup (should use proper attribute bonus)
      const mod = Math.floor(((target.stats?.[stat] || 10) - 10) / 2);
      const saveTotal = d20 + mod; // TODO: Add proficiency if applicable
      const saved = saveTotal >= action.save.dc;

      saveResult = { saved, total: saveTotal };

      events.push({
        type: 'ROLL_RESULT', // Generic roll event
        room: actor.room.documentId,
        actor: targetId, // The target rolled the save
        payload: {
          rollType: 'save',
          ability: stat,
          total: saveTotal,
          dc: action.save.dc,
          success: saved,
        },
        timestamp: Date.now(),
      });

      resultMessage = saved
        ? `${target.name} saved against ${action.name}`
        : `${target.name} failed save against ${action.name}`;
    }

    // 3. Apply Effects (Damage/Healing)
    if (action.effects) {
      let damageTotal = 0;

      for (const effect of action.effects) {
        if (effect.type === 'damage') {
          // Parse Dice
          let roll = 0;
          if (effect.dice) {
            const [count, face] = effect.dice.toLowerCase().split('d').map(Number);
            for (let i = 0; i < (count || 1); i++) roll += Math.floor(Math.random() * (face || 6)) + 1;
          }
          roll += effect.flat || 0;

          // Handle Save Mitigation
          if (saveResult && saveResult.saved) {
            if (action.save?.effect === 'half') roll = Math.floor(roll / 2);
            else if (action.save?.effect === 'none') roll = 0;
          }

          damageTotal += roll;
        }
      }

      if (damageTotal > 0 && target) {
        const newHp = Math.max(0, (target.hp || 0) - damageTotal);
        await strapi.documents('api::entity-sheet.entity-sheet').update({
          documentId: targetId,
          data: { hp: newHp } as any,
        });

        // Piggyback damage on generic event if needed or create specific
        // If we had an attack event, we could update it.
        // If it was a save, we might want a DAMAGE event.
        events.push({
          type: 'DAMAGE_DEALT', // Assuming this type exists or we rely on UI parsing
          room: actor.room.documentId,
          actor: actorId,
          payload: {
            targetId,
            amount: damageTotal,
            source: action.name,
          },
          timestamp: Date.now(),
        });

        resultMessage += ` for ${damageTotal} damage`;
      }
    }

    // 6. Persist Events
    for (const evt of events) {
      await strapi.documents('api::game-event.game-event').create({
        data: evt,
      });
    }

    return {
      success: true,
      message: resultMessage,
      events,
    };
  },

  async handleMove(command: MoveCommand): Promise<ActionResult> {
    const { actorId, targetPosition } = command.payload;

    // 1. Fetch Actor
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room', 'room.config'],
    });

    if (!actor) throw new Error('Actor not found');
    if (!actor.room) throw new Error('Actor is not in a room');

    const roomId = actor.room.documentId;
    const targetPos = { ...targetPosition, z: targetPosition.z ?? 0 };

    // 2. Fetch Room Context (All entities for collision)
    // Optimization: Select only positions
    const roomEntities = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
      filters: { room: { documentId: roomId } },
      fields: ['position', 'documentId'],
    });

    // 3. Setup Collision Checker
    let checkCollision = (p: { x: number; y: number; z: number }): boolean => {
      const occupied = roomEntities.some(
        (e: any) =>
          e.documentId !== actorId &&
          Math.round(e.position?.x) === p.x &&
          Math.round(e.position?.y) === p.y &&
          Math.round(e.position?.z) === p.z
      );
      return occupied;
    };

    // Terrain Check
    if (actor.room.config) {
      const config = actor.room.config as WorldConfig;
      const generator = new TerrainGenerator(config);
      const baseCheck = checkCollision;
      checkCollision = (p: { x: number; y: number; z: number }) => {
        if (baseCheck(p)) return true;
        const tile = generator.getTileAt(p.x, p.y, Math.round(p.z) as ZLevel);
        return !tile.isWalkable;
      };
    }

    // 4. Find Path
    // Using current position from actor
    const startPos = actor.position || { x: 0, y: 0, z: 0 };
    const path = findPath(startPos, targetPos, checkCollision, 500);

    if (path.length === 0) {
      return { success: false, message: 'Path blocked or unreachable', events: [] };
    }

    // 5. Calculate Movement Cost
    // Assuming Speed is on actor sheet or defaulted
    const speed = typeof actor.speed === 'number' ? actor.speed : actor.speed?.walk || 30;

    let traveled = 0;
    let finalPos = path[0];

    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const next = path[i];
      const dist = Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2) + Math.pow(next.z - prev.z, 2)
      );
      if (traveled + dist > speed) break;
      traveled += dist;
      finalPos = next;
    }

    if (finalPos.x === startPos.x && finalPos.y === startPos.y && finalPos.z === startPos.z) {
      return { success: false, message: 'No movement possible', events: [] };
    }

    // 6. Update DB
    await strapi.documents('api::entity-sheet.entity-sheet').update({
      documentId: actorId,
      data: { position: finalPos } as any,
    });

    // 7. Persist Game Event
    await strapi.documents('api::game-event.game-event').create({
      data: {
        type: 'ENTITY_MOVED',
        room: roomId,
        actor: actorId,
        payload: {
          from: startPos,
          to: finalPos,
          path: path.map((p) => ({ x: p.x, y: p.y, z: p.z })),
          cost: traveled,
        },
        timestamp: Date.now(),
      },
    });

    return {
      success: true,
      message: `Moved to ${finalPos.x}, ${finalPos.y}, ${finalPos.z}`,
      events: [
        {
          type: 'ENTITY_MOVED',
          payload: {
            entityId: actorId,
            from: startPos,
            to: finalPos,
            path: path.map((p) => ({ x: p.x, y: p.y, z: p.z })),
            cost: traveled,
          },
          timestamp: Date.now(),
        },
      ],
      newStateDiff: {}, // Client should re-fetch
    };
  },

  async handleAttack(command: AttackCommand): Promise<ActionResult> {
    const { actorId, targetId, weaponId } = command.payload;

    // 1. Fetch Entities
    const [actor, target] = await Promise.all([
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: actorId,
        populate: ['actions', 'actions.damage_instances', 'inventory', 'stats'],
      }),
      strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: targetId,
        populate: ['stats', 'armorClass', 'position'], // Need AC and Position for drops
      }),
    ]);

    if (!actor || !target) throw new Error('Actor or Target not found');

    // 2. Identify Action/Weapon
    // Simplified: Find action by weaponID or default
    let actionId: string | undefined = weaponId;
    if (!actionId && actor.actions?.length > 0) {
      actionId = actor.actions[0].documentId;
    }

    // We need to construct a robust Entity object for resolveAttack
    // The resolveAttack utility expects an `Entity` interface (from types/index.ts)
    // We map the Strapi EntitySheet to the Engine Entity interface.

    // We map the Strapi EntitySheet to the Engine Entity interface.
    // (Mapping logic removed as it was unused and causing lint errors)

    // In `ActionDispatcher.ts`, it passed `actor` (GameState entity) to `resolveAttack`.
    // `resolveAttack` does: `const hit = d20 + action.attack.bonus >= target.armorClass`.
    // So we need to ensure the `action` object within the actor has the right shape.
    // Strapi `action` model likely has `attack_bonus`, `damage_dice` etc.
    // We need to map Strapi Action -> Engine ActionDefinition.

    // For this pass, we will do a manual resolution or simplistic one to prove the point,
    // as full mapping requires an Adapter.

    // FETCH Action Definition from Actor's actions
    const actionDef = actor.actions?.find((a: any) => a.documentId === actionId);
    if (!actionDef) return { success: false, message: 'Action not found', events: [] };

    const attackBonus = actionDef.attack_bonus || 0;
    const ac = target.armorClass || 10;

    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + attackBonus;
    const isHit = total >= ac;
    const isCrit = d20 === 20;

    // --- AMMUNITION & THROWN LOGIC ---
    // Check if weapon requires ammo or is thrown
    const itemProps: any[] = actionDef.properties || [];
    // Assuming 'properties' is the relation to 'game.property' or similar on the Item Component via the Action?
    // Wait, actionDef is the *Action Component*. It doesn't have the Item Properties directly unless mapped.
    // In `handleAction` we mapped Equipment -> Action.
    // Strapi `actions` on EntitySheet are explicit entries.
    // They might NOT be linked to the Item if manually added.
    // However, if they are derived from items, we need to find the source item.

    // Simplification for now: Use `weaponId` from payload if present to find the Item in Inventory.
    if (weaponId) {
      const inventoryItem = actor.inventory?.find(
        (i: any) => i.item?.documentId === weaponId || i.documentId === weaponId
      );
      if (inventoryItem) {
        const weaponData = inventoryItem.item?.equipment_data;
        const isThrown = weaponData?.properties?.some((p: any) => p.slug === 'thrown');
        const isRanged = weaponData?.properties?.some((p: any) => p.slug === 'ammunition');
        const ammoType = weaponData?.ammunition_type; // e.g. 'arrow'

        // Handle Thrown
        if (isThrown && !isRanged) {
          // Thrown Dagger
          // Remove weapon from inventory and spawn at target
          // We call dropItemAt but we must suppress the 'Item Dropped' message logic if we want silent?
          // No, let's just do it.
          // WARNING: If we drop it, we lose it from inventory.
          // Only do this if valid hit/miss.
          // We do it after damage calculation? No, physically it leaves hand.
          // We'll queue it.
          await strapi
            .service('api::game.inventory-service')
            .dropItemAt(actorId, inventoryItem.documentId, target.position);
        }

        // Handle Ammunition
        if (isRanged && ammoType) {
          // Find Ammo
          const ammoIndex = actor.inventory?.findIndex(
            (i: any) =>
              i.item?.equipment_data?.item_type === 'ammunition' && i.item?.equipment_data?.ammunition_type === ammoType
          );
          if (ammoIndex !== -1) {
            const ammoItem = actor.inventory[ammoIndex];
            // Consume (Decrement Quantity or Remove)
            // Assuming 'quantity' on inventory item? Or stackable?
            // Current ItemSchema: components often 1-1. Stackables logic might be separate.
            // If 1-1, we remove it.
            const recoverable = Math.random() > 0.5; // 50% chance

            // Remove from inventory
            // We use dropItemAt to "Simulate" firing entitity?
            // Or just delete and create new loot?
            // dropItemAt does: Create Loot, Remove from Inv.
            // Perfect.
            if (recoverable) {
              // Recoverable: Process as Drop at Target
              await strapi
                .service('api::game.inventory-service')
                .dropItemAt(actorId, ammoItem.documentId, target.position);
            } else {
              // Break: Just delete
              const newInv = [...actor.inventory];
              newInv.splice(ammoIndex, 1);
              await strapi.documents('api::entity-sheet.entity-sheet').update({
                documentId: actorId,
                data: { inventory: newInv } as any,
              });
            }
          } else {
            return { success: false, message: 'No Ammunition!', events: [] };
          }
        }
      }
    }

    let damageTotal = 0;
    if (isHit || isCrit) {
      // Calculate Damage
      // Assuming actionDef has `damage_instances` (Component)
      if (actionDef.damage_instances && Array.isArray(actionDef.damage_instances)) {
        for (const di of actionDef.damage_instances) {
          // di: { dice_count: 1, dice_value: 6, flat_bonus: 2 ... }
          const count = di.dice_count || 1;
          const face = di.dice_value || 6;
          const flat = di.flat_bonus || 0;

          let roll = 0;
          for (let i = 0; i < count; i++) roll += Math.floor(Math.random() * face) + 1;
          if (isCrit) {
            for (let i = 0; i < count; i++) roll += Math.floor(Math.random() * face) + 1;
          }
          damageTotal += roll + flat;
        }
      }
    }

    // 3. Update DB (Target HP)
    if (damageTotal > 0) {
      const newHp = Math.max(0, target.hp - damageTotal);
      await strapi.documents('api::entity-sheet.entity-sheet').update({
        documentId: targetId,
        data: { hp: newHp } as any,
      });

      // Death Logic Injection
      if (typeof newHp === 'number' && newHp <= 0) {
        if (target.type === 'monster' || target.type === 'npc') {
          try {
            // 1. Drop Items (Loot Pile)
            await strapi.service('api::game.inventory-service').dropAll(targetId);

            // 2. Log Death Event
            await strapi.documents('api::game-event.game-event').create({
              data: {
                type: 'ENTITY_DEATH',
                room: actor.room.documentId,
                actor: targetId,
                payload: {
                  killerId: actorId,
                  position: target.position,
                },
                timestamp: Date.now(),
              },
            });

            // 3. Create Persistent Terrain Marker
            const { x, y, z } = target.position;
            const chunkSize = 16;
            const chunkX = Math.floor(x / chunkSize);
            const chunkY = Math.floor(y / chunkSize);
            const voxelX = ((x % chunkSize) + chunkSize) % chunkSize;
            const voxelY = ((y % chunkSize) + chunkSize) % chunkSize;

            // Import ChunkManager or use service
            // Using service pattern to avoid circular imports if possible, or direct class usage if service not registered yet (common in tests)
            // BUT ChunkManager is a singleton service class.
            // We'll try to get the service instance from Strapi.
            // Assuming 'api::voxel-engine.chunk-manager' is registered (it is a service).
            // Actually the service file is `chunk-manager.ts` but Strapi might name it differently?
            // `src/api/voxel-engine/services/chunk-manager.ts` -> `api::voxel-engine.chunk-manager`

            // We will use the `ChunkManager` class directly if possible, or strapi service.
            // Since this is a core service, `strapi.service(...)` is safer for globals.

            // However, editVoxel is on the CLASS instance.
            // Let's assume we can resolve it.
            // Note: The previous code I wrote in the plan used `ChunkManager.getInstance()`.
            // I'll stick to `strapi.service` if strictly following Strapi, BUT `ChunkManager` in this codebase seems to be a custom singleton Class?
            // `export class ChunkManager`. It's not a standard Strapi service factory?
            // Actually `chunk-manager.ts` defined `export class ChunkManager`.
            // It is NOT a strapi service factory `createCoreService`.
            // So `strapi.service('...').editVoxel` might NOT work unless I wrapped it in a service factory elsewhere?
            // Checking `src/api/voxel-engine/services/voxel-engine.ts` might reveal it wraps it?
            // The `handleModifyTerrain` used `strapi.service('api::voxel-engine.voxel-engine').editTerrain`.
            // Logic check: `editTerrain` likely calls `ChunkManager`.
            // So I should validly call `strapi.service('api::voxel-engine.voxel-engine').editTerrain`.

            // Let's check `voxel-engine.ts` (service) to see if it exposes `editTerrain` with metadata.
            // If not, I should update VoxelEngine service too?
            // Refactoring: `ActionEngine` calls `VoxelEngine` service. `VoxelEngine` service calls `ChunkManager`.
            // This is cleaner.

            // Let's assume `VoxelEngine` service has `editTerrain`. I will use that.
            // I need to update `VoxelEngine.editTerrain` signature?
            // Or I can call `ChunkManager.getInstance().editVoxel` directly?
            // `ChunkManager` is a singleton. Direct call is fine and bypasses Strapi service layer overhead if `VoxelEngine` service is just a wrapper.

            const chunkManager = ChunkManager.getInstance();
            await chunkManager.editVoxel(chunkX, chunkY, voxelX, voxelY, z, undefined, 'Entity Death', {
              type: 'death_marker',
              description: `Remains of ${target.name}`,
              victim: target.name,
              // loot: target.inventory, // Inventory dropped via dropAll, so maybe we reference the Loot Pile ID?
              // The Loot Pile created by dropAll has a temp_id or documentId.
              // Ideally we link them.
              // But for now, just marking the spot is enough.
              timestamp: Date.now(),
            });
          } catch (err) {
            console.error('Failed to create death marker:', err);
          }
        }
      }
    }

    const resultMsg = isHit ? `Hit for ${damageTotal} damage` : `Missed (Rolled ${total} vs AC ${ac})`;

    // 4. Persist Event
    await strapi.documents('api::game-event.game-event').create({
      data: {
        type: 'ATTACK_RESULT',
        room: actor.room.documentId,
        actor: actorId,
        payload: {
          targetId,
          roll: d20,
          total,
          isHit,
          isCrit,
          damage: damageTotal,
        },
        timestamp: Date.now(),
      },
    });

    return {
      success: true,
      message: resultMsg,
      events: [
        {
          type: 'ATTACK_RESULT',
          payload: {
            actorId,
            targetId,
            roll: d20,
            total,
            isHit,
            isCrit,
            damage: damageTotal,
            trace: [],
          },
          timestamp: Date.now(),
        },
      ],
      newStateDiff: {},
    };
  },

  async handleModifyTerrain(command: ModifyTerrainCommand): Promise<ActionResult> {
    const p = command.payload as any;
    const actorId = p.actorId;
    const center = p.center;
    const radius = p.radius || 0;
    const blockType = p.type || p.blockType || 'Stone';

    // 1. Validation
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room', 'room.config'],
    });

    if (!actor || !actor.room) throw new Error('Actor must be in a room to modify terrain.');

    // 2. Resolve Config & Chunk Size
    const worldConfig = (actor.room.config as WorldConfig) || { chunkSize: 16 };
    const chunkSize = worldConfig.chunkSize || 16;

    // 3. Iterate Radius
    // Convert center {x,y} to range.
    const startX = Math.floor(center.x - radius);
    const endX = Math.ceil(center.x + radius);
    const startY = Math.floor(center.y - radius);
    const endY = Math.ceil(center.y + radius);

    let modifications = 0;

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        // Check distance
        const dist = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
        if (dist <= radius + 0.5) {
          // inclusive radius
          // Convert to Chunk Coordinates
          const chunkX = Math.floor(x / chunkSize);
          const chunkY = Math.floor(y / chunkSize);
          const localX = ((x % chunkSize) + chunkSize) % chunkSize;
          const localY = ((y % chunkSize) + chunkSize) % chunkSize;

          // Call Voxel Engine
          await strapi
            .service('api::voxel-engine.voxel-engine')
            .editTerrain(chunkX, chunkY, localX, localY, Math.round(center.z), blockType, 'Tool Modification');
          modifications++;
        }
      }
    }

    // 4. Emit Event
    const eventPayload = {
      type: 'TERRAIN_MODIFIED',
      center,
      radius,
      blockType,
      count: modifications,
    };

    await strapi.documents('api::game-event.game-event').create({
      data: {
        type: 'TERRAIN_MODIFIED',
        room: actor.room.documentId,
        actor: actorId,
        payload: eventPayload,
        timestamp: Date.now(),
      },
    });

    return {
      success: true,
      message: `Modified ${modifications} voxels to ${blockType}`,
      events: [
        {
          type: 'TERRAIN_MODIFIED',
          payload: eventPayload,
          timestamp: Date.now(),
        },
      ],
    };
  },

  async handleDropItem(command: DropItemCommand): Promise<ActionResult> {
    const { actorId, itemComponentId } = command.payload;
    const inventoryService = strapi.service('api::game.inventory-service');

    // Delegate to InventoryService
    const result = await inventoryService.dropItem(actorId, itemComponentId);

    // Fetch actor room for event
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room'],
    });

    if (result.success && actor?.room) {
      // Emit Event
      await strapi.documents('api::game-event.game-event').create({
        data: {
          type: 'ITEM_DROPPED',
          room: actor.room.documentId,
          actor: actorId,
          payload: { itemComponentId },
          timestamp: Date.now(),
        },
      });
    }

    return {
      success: result.success,
      message: result.message,
      events: [], // Already persisted above
    };
  },

  async handlePickupItem(command: PickupItemCommand): Promise<ActionResult> {
    const { actorId, targetId } = command.payload;
    const inventoryService = strapi.service('api::game.inventory-service');

    const result = await inventoryService.pickupItem(actorId, targetId);

    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room'],
    });

    if (result.success && actor?.room) {
      await strapi.documents('api::game-event.game-event').create({
        data: {
          type: 'ITEM_PICKED_UP',
          room: actor.room.documentId,
          actor: actorId,
          payload: { targetId },
          timestamp: Date.now(),
        },
      });
    }

    return {
      success: result.success,
      message: result.message,
      events: [],
    };
  },

  async handleThrowItem(command: ThrowItemCommand): Promise<ActionResult> {
    const { actorId, itemComponentId, targetPosition, targetEntityId } = command.payload;
    const inventoryService = strapi.service('api::game.inventory-service');

    // 1. Fetch Actor
    const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
      documentId: actorId,
      populate: ['room', 'inventory', 'stats', 'inventory.item'], // populate inventory to get item name/stats
    });

    if (!actor) return { success: false, message: 'Actor not found', events: [] };

    // 2. Resolve Hit Logic if Entity Targeted
    let hitEntity = false;
    let finalPos = targetPosition;
    let resultMessage = `Threw item at ${targetPosition.x}, ${targetPosition.y}`;
    const events = [];

    if (targetEntityId) {
      const target = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
        documentId: targetEntityId,
        populate: ['armorClass', 'position'],
      });

      if (target) {
        // Simple Attack Roll: Dex + Prof (if improvised/thrown) vs AC
        // Start with Dex check
        const dexMod = Math.floor(((actor.stats?.dexterity || 10) - 10) / 2);
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + dexMod;

        const ac = target.armorClass || 10;
        hitEntity = total >= ac;

        if (hitEntity) {
          finalPos = target.position; // It lands at entity feet
          resultMessage = `Hit ${target.name} with thrown item! (Rolled ${total})`;

          // Apply Damage? (1d4 + Dex for improvised)
          const damage = Math.floor(Math.random() * 4) + 1 + dexMod;
          const newHp = Math.max(0, (target.hp || 0) - damage);

          await strapi.documents('api::entity-sheet.entity-sheet').update({
            documentId: targetEntityId,
            data: { hp: newHp } as any,
          });

          events.push({
            type: 'DAMAGE_DEALT',
            room: actor.room.documentId,
            actor: actorId,
            payload: { targetId: targetEntityId, amount: damage, source: 'Thrown Item' },
            timestamp: Date.now(),
          });
        } else {
          resultMessage = `Missed ${target.name} (Rolled ${total})`;
          // Scatter? For now land at target pos.
        }
      }
    }

    // 3. Drop Item At Destination
    // We execute the drop logic regardless of hit/miss (physics)
    const dropResult = await inventoryService.dropItemAt(actorId, itemComponentId, finalPos);

    if (dropResult.success) {
      events.push({
        type: 'ITEM_THROWN',
        room: actor.room?.documentId,
        actor: actorId,
        payload: { itemComponentId, targetPosition: finalPos, hit: hitEntity },
        timestamp: Date.now(),
      });
    }

    // Save events
    for (const evt of events) {
      await strapi.documents('api::game-event.game-event').create({ data: evt });
    }

    return {
      success: true,
      message: resultMessage,
      events,
    };
  },
}));
