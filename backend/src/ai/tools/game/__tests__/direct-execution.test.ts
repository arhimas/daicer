import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moveEntityTool } from '../move-entity';
import { performActionTool } from '../perform-action';
import { summonMonsterTool } from '../summon-monster';
import { summonCharacterTool } from '../summon-character';
import { createMockStrapi } from './setup/harness';

// --- Test Matrices ---

// 1. Move Matrix
const MOVE_TEST_CASES = [
  // Basic Movement
  { name: 'Generic Move 5ft', speed: 30, start: { x: 0, y: 0, z: 0 }, end: { x: 5, y: 0, z: 0 }, success: true },
  { name: 'Generic Move 10ft', speed: 30, start: { x: 0, y: 0, z: 0 }, end: { x: 10, y: 0, z: 0 }, success: true },
  { name: 'Generic Move 15ft', speed: 30, start: { x: 0, y: 0, z: 0 }, end: { x: 15, y: 0, z: 0 }, success: true },
  {
    name: 'Generic Move 30ft (Max)',
    speed: 30,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 30, y: 0, z: 0 },
    success: true,
  },
  { name: 'Generic Move Diagonal', speed: 30, start: { x: 0, y: 0, z: 0 }, end: { x: 5, y: 5, z: 0 }, success: true },

  // Speed Limits
  {
    name: 'Exceed Speed (35ft/30ft)',
    speed: 30,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 35, y: 0, z: 0 },
    success: false,
    error: 'speed',
  },
  {
    name: 'Exceed Speed (60ft/30ft)',
    speed: 30,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 60, y: 0, z: 0 },
    success: false,
    error: 'speed',
  },
  {
    name: 'Exact Speed (Slow Entity)',
    speed: 20,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 20, y: 0, z: 0 },
    success: true,
  },
  {
    name: 'Exceed Speed (Slow Entity)',
    speed: 20,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 25, y: 0, z: 0 },
    success: false,
    error: 'speed',
  },

  // Vertical Movement (Flying vs Walking)
  {
    name: 'Vertical Move (Walking)',
    speed: 30,
    fly: false,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 0, y: 0, z: 10 },
    success: false,
    error: 'flying',
  },
  {
    name: 'Vertical Move (Flying)',
    speed: 30,
    fly: true,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 0, y: 0, z: 10 },
    success: true,
  },
  {
    name: 'Diagonal 3D Move (Flying)',
    speed: 30,
    fly: true,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 10, y: 10, z: 10 },
    success: true,
  },
  {
    name: 'Diagonal 3D Exceed (Flying)',
    speed: 30,
    fly: true,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 20, y: 20, z: 20 },
    success: false,
    error: 'speed',
  },

  // Obstacles & Collision
  {
    name: 'Move to Occupied Space',
    speed: 30,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 10, y: 0, z: 0 },
    occupied: { x: 10, y: 0, z: 0 },
    success: false,
    error: 'occupied',
  },
  {
    name: 'Move Through Occupied (Block)',
    speed: 30,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 10, y: 0, z: 0 },
    occupied: { x: 5, y: 0, z: 0 },
    success: false,
    error: 'blocked',
  },

  // Boundary / Nans
  {
    name: 'Negative Coordinates',
    speed: 30,
    start: { x: 10, y: 10, z: 0 },
    end: { x: -5, y: 10, z: 0 },
    success: true,
  },
  { name: 'Zero Move', speed: 30, start: { x: 5, y: 5, z: 0 }, end: { x: 5, y: 5, z: 0 }, success: true },

  // Large Coordinates
  {
    name: 'Large Coord Move',
    speed: 30,
    start: { x: 1000, y: 1000, z: 0 },
    end: { x: 1005, y: 1000, z: 0 },
    success: true,
  },

  // Precision
  {
    name: 'Decimal Coordinates Start',
    speed: 30,
    start: { x: 0.5, y: 0.5, z: 0 },
    end: { x: 5.5, y: 0.5, z: 0 },
    success: true,
  },
  {
    name: 'Decimal Coordinates End',
    speed: 30,
    start: { x: 0, y: 0, z: 0 },
    end: { x: 5.1, y: 0, z: 0 },
    success: true,
  },
];

// 2. Attack Matrix
const ATTACK_TEST_CASES = [
  // Melee - Success
  {
    name: 'Melee - Valid Range (5ft)',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 5, y: 0, z: 0 },
    success: true,
  },
  {
    name: 'Melee - Valid Range (Duplicate)',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 0, y: 5, z: 0 },
    success: true,
  },
  {
    name: 'Melee - Valid Diagonal',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 3, y: 3, z: 0 },
    success: true,
  },

  // Melee - Out of Range
  {
    name: 'Melee - Out of Range (10ft)',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 10, y: 0, z: 0 },
    success: false,
    error: 'range',
  },
  {
    name: 'Melee - Out of Range (Diagonal)',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 5, y: 5, z: 0 },
    success: false,
    error: 'range',
  },

  // Reach
  {
    name: 'Reach - Valid (10ft)',
    type: 'melee',
    range: 10,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 10, y: 0, z: 0 },
    success: true,
  },
  {
    name: 'Reach - Valid (Diagonal)',
    type: 'melee',
    range: 10,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 5, y: 5, z: 0 },
    success: true,
  },
  {
    name: 'Reach - Out of Range',
    type: 'melee',
    range: 10,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 15, y: 0, z: 0 },
    success: false,
    error: 'range',
  },

  // Ranged
  {
    name: 'Ranged - Short Range',
    type: 'ranged',
    range: 60,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 30, y: 0, z: 0 },
    success: true,
  },
  {
    name: 'Ranged - Max Range',
    type: 'ranged',
    range: 60,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 60, y: 0, z: 0 },
    success: true,
  },
  {
    name: 'Ranged - Vertical',
    type: 'ranged',
    range: 60,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 0, y: 0, z: 60 },
    success: true,
  },

  // Ranged - Out of Range
  {
    name: 'Ranged - Out of Range (65ft)',
    type: 'ranged',
    range: 60,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 65, y: 0, z: 0 },
    success: false,
    error: 'range',
  },
  {
    name: 'Ranged - Out of Range (Vertical)',
    type: 'ranged',
    range: 60,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 0, y: 0, z: 70 },
    success: false,
    error: 'range',
  },

  // Target Validity
  {
    name: 'Attack Self',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 0, y: 0, z: 0 },
    selfTarget: true,
    success: false,
    error: 'self',
  },
  {
    name: 'Attack Non-Existent',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 5, y: 0, z: 0 },
    noTarget: true,
    success: false,
    error: 'found',
  },

  // Action ID Validity
  {
    name: 'Invalid Action ID',
    type: 'melee',
    range: 5,
    pos: { x: 0, y: 0, z: 0 },
    targetPos: { x: 5, y: 0, z: 0 },
    invalidAction: true,
    success: false,
    error: 'action',
  },
];

// 3. Spawn Matrix
const SPAWN_TEST_CASES = [
  // Monsters
  { name: 'Spawn Goblin', tool: 'monster', template: 'Goblin', pos: { x: 0, y: 0, z: 0 }, success: true },
  { name: 'Spawn Orc', tool: 'monster', template: 'Orc', pos: { x: 5, y: 5, z: 0 }, success: true },
  { name: 'Spawn Dragon (Large)', tool: 'monster', template: 'Red Dragon', pos: { x: 10, y: 10, z: 0 }, success: true },

  // Invalid Monster
  {
    name: 'Spawn Invalid Monster',
    tool: 'monster',
    template: 'InvalidName',
    pos: { x: 0, y: 0, z: 0 },
    success: false,
    error: 'found',
  },

  // Characters
  { name: 'Spawn Fighter', tool: 'character', template: 'Fighter', pos: { x: 20, y: 20, z: 0 }, success: true },
  { name: 'Spawn Wizard', tool: 'character', template: 'Wizard', pos: { x: 25, y: 25, z: 0 }, success: true },

  // Collision
  {
    name: 'Spawn Collision (Monster on Monster)',
    tool: 'monster',
    template: 'Goblin',
    pos: { x: 0, y: 0, z: 0 },
    occupied: true,
    success: false,
    error: 'occupied',
  },
  {
    name: 'Spawn Collision (Char on Monster)',
    tool: 'character',
    template: 'Fighter',
    pos: { x: 0, y: 0, z: 0 },
    occupied: true,
    success: false,
    error: 'occupied',
  },

  // Coordinate Limits
  { name: 'Spawn Negative Coords', tool: 'monster', template: 'Goblin', pos: { x: -5, y: -5, z: 0 }, success: true },
  { name: 'Spawn High Coords', tool: 'monster', template: 'Goblin', pos: { x: 100, y: 100, z: 0 }, success: true },
];

describe('Direct Tool Execution Suite (Fresh)', () => {
  let strapi: unknown;
  let mockRoom: unknown;

  beforeEach(() => {
    const harness = createMockStrapi();
    strapi = harness.mockStrapi;
    mockRoom = harness.mockRoom;
    vi.clearAllMocks();
  });

  describe('Move Entity Tool', () => {
    MOVE_TEST_CASES.forEach((testCase) => {
      it(`should handle ${testCase.name}`, async () => {
        // Setup Actor
        const actor = {
          documentId: 'actor-1',
          name: 'Hero',
          position: testCase.start,
          stats: { dexterity: 10 },
          speed: testCase.speed,
          features: testCase.fly ? [{ name: 'Fly' }] : [],
        };

        // Setup Obstacles
        if (testCase.occupied) {
          mockRoom.entity_sheets.push({
            documentId: 'obstacle-1',
            name: 'Rock',
            position: testCase.occupied,
            currentHp: 10,
          });
          mockRoom.entities.push({ id: 'obstacle-1', position: testCase.occupied });
        }

        mockRoom.entity_sheets.push(actor);
        mockRoom.entities.push({ id: actor.documentId, position: actor.position });

        const tool = moveEntityTool({ strapi });
        try {
          // Fix: flattened args
          const result = await tool.func({
            entityId: 'actor-1',
            x: testCase.end.x,
            y: testCase.end.y,
            z: testCase.end.z,
          });

          if (testCase.success) {
            expect(result).toBeDefined();
            // Move tool returns string. Check it doesn't start with Error
            expect(result).not.toMatch(/^Error/);
          } else {
            expect(result.toString()).toMatch(/Error|Failed|Occupied|Speed/i);
          }
        } catch (e: unknown) {
          if (testCase.success) {
            throw new Error(`Expected success but failed: ${(e as Error).message}`);
          }
          if (testCase.error === 'speed') expect((e as Error).message).toMatch(/speed|range|movement/i);
          if (testCase.error === 'occupied') expect((e as Error).message).toMatch(/occupied|collision/i);
          if (testCase.error === 'blocked') expect((e as Error).message).toMatch(/blocked|path/i);
          if (testCase.error === 'flying') expect((e as Error).message).toMatch(/flying|vertical/i);
        }
      });
    });
  });

  describe('Perform Action Tool (Attack)', () => {
    ATTACK_TEST_CASES.forEach((testCase) => {
      it(`should handle ${testCase.name}`, async () => {
        const schemaType = testCase.type === 'melee' ? 'melee_attack' : 'ranged_attack';
        const actionDef = {
          documentId: 'act-1',
          name: 'Strike',
          type: schemaType,
          description: 'A test strike',
          toHit: 5,
          damage: [{ dice: '1d6', bonus: 2, type: 'slashing' }],
          // Schema specifics
          range: testCase.range,
        };

        const attacker = {
          documentId: 'attacker-1',
          name: 'Attacker',
          position: testCase.pos,
          structuredActions: [actionDef],
          actions: [actionDef], // Legacy support if needed
        };

        const target = {
          documentId: 'target-1',
          name: 'Dummy',
          position: testCase.targetPos,
          currentHp: 10,
        };

        mockRoom.entity_sheets.push(attacker);
        if (!testCase.noTarget && !testCase.selfTarget) mockRoom.entity_sheets.push(target);

        const tool = performActionTool({ strapi });

        const payload = {
          actorId: 'attacker-1',
          targetId: testCase.selfTarget ? 'attacker-1' : testCase.noTarget ? 'target-999' : 'target-1',
          actionId: testCase.invalidAction ? 'act-999' : 'act-1',
          weaponId: testCase.invalidAction ? 'act-999' : 'act-1',
        };

        try {
          const rawResult = await tool.func({
            commandType: 'ATTACK',
            payload: JSON.stringify(payload),
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let result: any = rawResult;
          try {
            result = JSON.parse(rawResult as string);
          } catch {
            // expected
          }

          if (testCase.success) {
            expect(result).toBeDefined();
            if (typeof result === 'object') {
              if (!result.success) throw new Error(`Tool returned success:false - ${result.message}`);
              expect(result.success).toBe(true);
            } else {
              // If string, ensure it's not Error
              expect(result).not.toMatch(/^Error/);
            }
          } else {
            const str = typeof result === 'string' ? result : JSON.stringify(result);
            expect(str).toMatch(/Error|Invalid|Range|Target|found|action|self/i);
          }
        } catch (e: unknown) {
          if (testCase.success) throw new Error(`Expected success but failed: ${(e as Error).message}`);
          if (testCase.error === 'range') expect((e as Error).message).toMatch(/range|distance/i);
          if (testCase.error === 'found') expect((e as Error).message).toMatch(/found/i);
          if (testCase.error === 'action') expect((e as Error).message).toMatch(/action/i);
          if (testCase.error === 'self') expect((e as Error).message).toMatch(/self/i);
        }
      });
    });
  });

  describe('Spawn Tools', () => {
    SPAWN_TEST_CASES.forEach((testCase) => {
      it(`should handle ${testCase.name}`, async () => {
        if (testCase.occupied) {
          mockRoom.entity_sheets.push({
            documentId: 'blocker',
            position: testCase.pos,
            name: 'Blocker',
          });
        }

        if (testCase.template === 'InvalidName') {
          vi.spyOn(strapi.documents('api::monster.monster'), 'findOne').mockResolvedValue(null);
        }

        const tool = testCase.tool === 'monster' ? summonMonsterTool({ strapi }) : summonCharacterTool({ strapi });

        const args =
          testCase.tool === 'monster'
            ? {
                templateId: 'mon-' + testCase.template.toLowerCase(), // Direct ID
                x: testCase.pos.x,
                y: testCase.pos.y,
                z: testCase.pos.z,
              }
            : {
                templateId: 'char-' + testCase.template.toLowerCase(), // Direct ID
                x: testCase.pos.x,
                y: testCase.pos.y,
                z: testCase.pos.z,
              };

        // Fix for InvalidName
        if (testCase.template === 'InvalidName') {
          args.templateId = 'mon-invalid';
        }
        // Fix for Dragon
        if (testCase.template === 'Red Dragon') {
          args.templateId = 'mon-dragon';
        }

        try {
          const result = await tool.func(args as Record<string, unknown>);

          if (testCase.success) {
            expect(result).toBeDefined();
            expect(result).not.toMatch(/^Error/);
          } else {
            expect(result.toString()).toMatch(/Error|Occupied|Found/i);
          }
        } catch (e: unknown) {
          if (testCase.success) throw new Error(`Expected success but failed: ${(e as Error).message}`);
          if (testCase.error === 'occupied') expect((e as Error).message).toMatch(/occupied/i);
          if (testCase.error === 'found') expect((e as Error).message).toMatch(/found/i);
        }
      });
    });
  });
});
