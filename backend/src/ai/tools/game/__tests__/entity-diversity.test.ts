import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockStrapi, MOCK_MONSTERS, MOCK_CHARACTERS } from './setup/harness';
import { StrapiContext } from '../tool-factory';
import { ActionDispatcher } from '@daicer/engine';

vi.mock('../../../../engine', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual: any = await importOriginal();
  return { ...actual };
});

describe('Entity Diversity & Capabilities', () => {
  let mockContext: StrapiContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRoom: any; // Keep any for mock flexibility if structure is complex, or unknown
  let performActionTool: (context: StrapiContext) => {
    func: (args: Record<string, unknown>, context?: StrapiContext) => Promise<string>;
  };

  beforeEach(async () => {
    const harness = createMockStrapi();
    mockContext = { strapi: harness.mockStrapi, roomDocumentId: 'room-1' };
    mockRoom = harness.mockRoom;

    vi.spyOn(ActionDispatcher.prototype, 'dispatch').mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (state: Record<string, any>, command: Record<string, any>) => {
        const dispatcher = new ActionDispatcher();
        if (state.entities) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          state.entities.forEach((ent: Record<string, any>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sheet = mockRoom.entity_sheets.find((s: Record<string, any>) => s.documentId === ent.id);
            if (sheet) ent.sheet = sheet;

            // Patch Actions types
            if (ent.actions) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ent.actions.forEach((act: Record<string, any>) => {
                if (act.type === 'melee') act.type = 'melee_attack';
                if (act.type === 'ranged') act.type = 'ranged_attack';
              });
            }
            if (ent.sheet && ent.sheet.structuredActions) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ent.sheet.structuredActions.forEach((act: Record<string, any>) => {
                if (act.type === 'melee') act.type = 'melee_attack';
                if (act.type === 'ranged') act.type = 'ranged_attack';
              });
            }
          });
        }
        // Handle
        if (command.type === 'ATTACK')
          return (dispatcher as unknown as { handleAttack: unknown }).handleAttack(state, command);
        // Use Spell handler if implemented, else mock success
        if (command.type === 'CAST_SPELL') return { success: true, message: 'Spell Cast', events: [] };
        return { success: false, message: 'Unknown', events: [] };
      }
    );

    const module = await import('../perform-action');
    performActionTool = module.performActionTool;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spawn = (template: Record<string, any>) => {
    const instance = {
      documentId: `inst-${template.documentId}`,
      // ... copy props
      ...template,
      position: { x: 0, y: 0, z: 0 },
      currentHp: template.hp,
      maxHp: template.hp,

      ac: template.ac || 10,
      sheet: null as unknown,
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
