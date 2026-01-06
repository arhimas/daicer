import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockStrapi, MOCK_MONSTERS, MOCK_CHARACTERS } from './setup/harness';
import { ActionDispatcher } from '../../../../engine';

vi.mock('../../../../engine', async (importOriginal) => {
  const actual: any = await importOriginal();
  return { ...actual };
});

describe('Entity Diversity & Capabilities', () => {
  let mockContext: any;
  let mockRoom: any;
  let performActionTool: any;

  beforeEach(async () => {
    const harness = createMockStrapi();
    mockContext = { strapi: harness.mockStrapi, roomDocumentId: 'room-1' };
    mockRoom = harness.mockRoom;

    vi.spyOn(ActionDispatcher.prototype, 'dispatch').mockImplementation((state: any, command: any) => {
      const dispatcher = new ActionDispatcher();
      if (state.entities) {
        state.entities.forEach((ent: any) => {
          const sheet = mockRoom.entity_sheets.find((s: any) => s.documentId === ent.id);
          if (sheet) ent.sheet = sheet;

          // Patch Actions types
          if (ent.actions) {
            ent.actions.forEach((act: any) => {
              if (act.type === 'melee') act.type = 'melee_attack';
              if (act.type === 'ranged') act.type = 'ranged_attack';
            });
          }
          if (ent.sheet && ent.sheet.structuredActions) {
            ent.sheet.structuredActions.forEach((act: any) => {
              if (act.type === 'melee') act.type = 'melee_attack';
              if (act.type === 'ranged') act.type = 'ranged_attack';
            });
          }
        });
      }
      // Handle
      if (command.type === 'ATTACK') return (dispatcher as any).handleAttack(state, command);
      // Use Spell handler if implemented, else mock success
      if (command.type === 'CAST_SPELL') return { success: true, message: 'Spell Cast', events: [] };
      return { success: false, message: 'Unknown', events: [] };
    });

    const module = await import('../perform-action');
    performActionTool = module.performActionTool;
  });

  const spawn = (template: any) => {
    const instance = {
      documentId: `inst-${template.documentId}`,
      // ... copy props
      ...template,
      position: { x: 0, y: 0, z: 0 },
      currentHp: template.hp,
      maxHp: template.hp,
      ac: template.ac || 10,
      sheet: null as any,
    };
    instance.sheet = instance;
    mockRoom.entity_sheets.push(instance);
    return instance;
  };

  // Test Monsters
  MOCK_MONSTERS.forEach((mon) => {
    it(`Monster Ability: ${mon.name} uses ${mon.structuredActions[0].name}`, async () => {
      const actor = spawn(mon);
      const target = spawn(MOCK_CHARACTERS[0]); // Dummy target

      const res = await performActionTool(mockContext).func(
        {
          roomId: 'room-1',
          commandType: 'ATTACK',
          payload: JSON.stringify({
            actorId: actor.documentId,
            targetId: target.documentId,
            actionName: mon.structuredActions[0].name,
          }),
        },
        mockContext
      );

      const result = JSON.parse(res);
      expect(result.success).toBe(true);
    });
  });

  // Test Characters
  MOCK_CHARACTERS.forEach((char) => {
    it(`Character Action: ${char.name} uses ${char.structuredActions[0].name}`, async () => {
      const actor = spawn(char);
      const target = spawn(MOCK_MONSTERS[0]); // Dummy target

      const res = await performActionTool(mockContext).func(
        {
          roomId: 'room-1',
          commandType: 'ATTACK',
          payload: JSON.stringify({
            actorId: actor.documentId,
            targetId: target.documentId,
            actionName: char.structuredActions[0].name,
          }),
        },
        mockContext
      );

      const result = JSON.parse(res);
      expect(result.success).toBe(true);
    });
  });
});
